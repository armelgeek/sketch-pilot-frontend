import { useState, useEffect, useCallback } from "react";

export interface ProgressState {
    progress: number;
    message: string;
    step: string;
    status: "draft" | "queued" | "processing" | "completed" | "failed" | "cancelled" | "narration_generated" | "scenes_generated";
    videoId?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    lastScene?: any;
    lastSceneIndex?: number;
    currentSceneIndex?: number;
    error?: string;
    promptsUrl?: string;
    options?: any; // Added
    totalScenes?: number; // Number of scenes from script
}

const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000") + "/api";

export function useVideoProgress(jobId?: string) {
    const [state, setState] = useState<ProgressState>({
        progress: 0,
        message: "Initializing...",
        step: "idle",
        status: "queued",
    });

    const [isFinished, setIsFinished] = useState(false);
    const [isReconnecting, setIsReconnecting] = useState(false);
    const [retryCountState, setRetryCountState] = useState(0);

    useEffect(() => {
        if (!jobId) return;

        // Reset state for new job tracking
        setState({
            progress: 0,
            message: "Initializing...",
            step: "idle",
            status: "queued",
        });
        setIsFinished(false);
        setIsReconnecting(false);
        setRetryCountState(0);

        let eventSource: EventSource | null = null;
        let reconnectTimeout: any = null;
        let explicitlyClosed = false;
        let retryCount = 0;

        const connect = () => {
            if (explicitlyClosed) return;

            // ABANDON after too many failures
            const MAX_RETRIES = 12;
            if (retryCount >= MAX_RETRIES) {
                console.error(`[SSE] Max retries (${MAX_RETRIES}) reached for job: ${jobId}. Abandoning.`);
                setState((prev) => ({
                    ...prev,
                    status: "failed",
                    error: "Connexion perdue. La génération a peut-être échoué ou met trop de temps à répondre.",
                    message: "Le serveur ne répond plus. Veuillez vérifier vos vidéos ou réessayer.",
                }));
                setIsFinished(true);
                explicitlyClosed = true;
                return;
            }

            console.log(`[SSE] Connecting to job: ${jobId} (Attempt: ${retryCount})`);
            eventSource = new EventSource(`${BASE_URL}/v1/videos/jobs/${jobId}/stream`, {
                withCredentials: true,
            });

            eventSource.addEventListener("connected", (event: any) => {
                const data = JSON.parse(event.data);
                console.log("[SSE] Connected:", data);
                retryCount = 0;
                setIsReconnecting(false);
                setRetryCountState(0);
                setState((prev) => ({ ...prev, status: data.status, progress: data.progress || 0 }));
            });

            eventSource.addEventListener("progress", (event: any) => {
                const data = JSON.parse(event.data);
                const msgCurrentIdx = data.currentSceneIndex !== undefined ? data.currentSceneIndex : data.sceneIndex;

                setState((prev) => {
                    const isNewScene = !!data.scene;
                    const lastIdx = data.lastSceneIndex !== undefined ? data.lastSceneIndex :
                        (isNewScene && msgCurrentIdx !== undefined ? msgCurrentIdx : prev.lastSceneIndex);

                    return {
                        ...prev,
                        progress: data.progress !== undefined ? data.progress : prev.progress,
                        message: data.message || data.step || prev.message,
                        step: data.step || prev.step,
                        status: data.status || prev.status,
                        videoId: data.videoId || prev.videoId,
                        lastScene: isNewScene ? data.scene : prev.lastScene,
                        lastSceneIndex: lastIdx,
                        currentSceneIndex: msgCurrentIdx !== undefined ? msgCurrentIdx : prev.currentSceneIndex,
                        promptsUrl: data.promptsUrl || prev.promptsUrl,
                        options: data.options || prev.options, // Added
                        totalScenes: data.totalScenes || prev.totalScenes, // Added
                    };
                });
            });

            eventSource.addEventListener("completed", (event: any) => {
                const data = JSON.parse(event.data);
                setState((prev) => ({
                    ...prev,
                    progress: data.progress || 100,
                    status: "completed",
                    message: "Generation finished!",
                    videoUrl: data.videoUrl,
                    thumbnailUrl: data.thumbnailUrl,
                    videoId: data.videoId,
                }));
                setIsFinished(true);
                explicitlyClosed = true;
                eventSource?.close();
            });

            eventSource.addEventListener("error", (event: any) => {
                if (event.data) {
                    try {
                        const data = JSON.parse(event.data);
                        setState((prev) => ({
                            ...prev,
                            status: "failed",
                            error: data.error || "Generation failed",
                            message: data.error || "An error occurred",
                        }));

                        if (data.retryable === false) {
                            setIsFinished(true);
                            explicitlyClosed = true;
                            eventSource?.close();
                            return;
                        }
                    } catch { }
                }

                eventSource?.close();
                if (!explicitlyClosed) {
                    retryCount++;
                    setRetryCountState(retryCount);
                    setIsReconnecting(true);
                    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
                    reconnectTimeout = setTimeout(connect, delay);
                }
            });
        };

        connect();

        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && !explicitlyClosed) {
                if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
                    if (reconnectTimeout) clearTimeout(reconnectTimeout);
                    connect();
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            explicitlyClosed = true;
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (eventSource) eventSource.close();
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
        };
    }, [jobId]);

    const reset = useCallback(() => {
        setState({
            progress: 0,
            message: "Initializing...",
            step: "idle",
            status: "queued",
        });
        setIsFinished(false);
        setIsReconnecting(false);
        setRetryCountState(0);
    }, []);

    const cancelVideo = useCallback(async (videoId: string) => {
        if (!videoId) return;
        try {
            const response = await fetch(`${BASE_URL}/v1/videos/${videoId}/cancel`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (response.ok) {
                setState((prev) => ({ ...prev, status: "draft", message: "Generation cancelled by user, saved as draft." }));
                setIsFinished(true);
            }
        } catch (error) {
            console.error("Failed to cancel video:", error);
        }
    }, [jobId]);

    const restartVideo = useCallback(async (videoId: string) => {
        if (!videoId) return;
        try {
            const response = await fetch(`${BASE_URL}/v1/videos/${videoId}/restart`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                console.info("Pipeline restarted with new JobID:", data.jobId);
                return data.jobId;
            }
        } catch (error) {
            console.error("Failed to restart video:", error);
        }
    }, [jobId]);

    const resumeVideo = useCallback(async (videoId: string) => {
        if (!videoId) return;
        try {
            const response = await fetch(`${BASE_URL}/v1/videos/${videoId}/resume`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                console.info("Pipeline resumed with new JobID:", data.jobId);
                return data.jobId;
            }
        } catch (error) {
            console.error("Failed to resume video:", error);
        }
    }, [jobId]);

    const rescriptVideo = useCallback(async (videoId: string) => {
        if (!videoId) return;
        try {
            const response = await fetch(`${BASE_URL}/v1/videos/${videoId}/rescript`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
            });
            if (response.ok) {
                const data = await response.json();
                console.info("Pipeline rescripted with new JobID:", data.jobId);
                return data.jobId;
            }
        } catch (error) {
            console.error("Failed to rescript video:", error);
        }
    }, [jobId]);

    const insertScene = useCallback(async (videoId: string, index: number, narration: string) => {
        try {
            const response = await fetch(`${BASE_URL}/v1/videos/${videoId}/scenes/insert`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ index, narration }),
            });
            if (response.ok) {
                const data = await response.json();
                return data.script;
            }
        } catch (error) {
            console.error("Failed to insert scene:", error);
        }
    }, []);

    const [displayProgress, setDisplayProgress] = useState(0);

    // ── Interpolation & Crawling Logic ──────────────────────────────────────────
    useEffect(() => {
        if (isFinished || state.status === "completed") {
            setDisplayProgress(100);
            return;
        }

        const interval = setInterval(() => {
            setDisplayProgress((prev) => {
                const target = state.progress;

                // 1. CATCH-UP LOGIC (Strictly follow backend)
                if (prev < target) {
                    const diff = target - prev;
                    // Faster easing (10% per 100ms) for better reactivity
                    const step = Math.max(0.1, diff * 0.1);
                    return Math.min(target, prev + step);
                }

                // 2. CRAWLING LOGIC (Subtle "alive" feeling)
                // Only crawl if we've passed the initial script phase
                if (prev >= target && target < 100 && target > 15) {
                    const remaining = 99 - prev;
                    if (remaining > 0) {
                        // Extremely subtle crawl (0.01% max) to avoid outrunning reality
                        const crawlStep = Math.max(0.001, remaining * 0.001);
                        return Math.min(99, prev + crawlStep);
                    }
                }

                return prev;
            });
        }, 100);

        return () => clearInterval(interval);
    }, [state.progress, state.status, isFinished]);

    return {
        ...state,
        progress: Math.floor(displayProgress), // Expose interpolated progress instead of raw
        rawProgress: state.progress,
        isFinished,
        isReconnecting,
        retryCount: retryCountState,
        reset,
        cancelVideo,
        restartVideo,
        resumeVideo,
        rescriptVideo,
        insertScene
    };
}
