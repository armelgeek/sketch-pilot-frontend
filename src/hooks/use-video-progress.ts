import { useState, useEffect, useCallback } from "react";

export interface ProgressState {
    progress: number;
    message: string;
    step: string;
    status: "queued" | "processing" | "completed" | "failed" | "cancelled" | "narration_generated" | "scenes_generated";
    videoId?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    lastScene?: any;
    lastSceneIndex?: number;
    currentSceneIndex?: number;
    error?: string;
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

            console.log(`[SSE] Connecting to job: ${jobId} (Attempt: ${retryCount})`);
            // Using withCredentials for auth session cookies
            eventSource = new EventSource(`${BASE_URL}/v1/videos/jobs/${jobId}/stream`, {
                withCredentials: true,
            });

            eventSource.addEventListener("connected", (event: any) => {
                const data = JSON.parse(event.data);
                console.log("[SSE] Connected:", data);
                retryCount = 0; // Reset retry count on successful connection
                setIsReconnecting(false);
                setRetryCountState(0);
                setState((prev) => ({ ...prev, status: data.status, progress: data.progress || 0 }));
            });

            eventSource.addEventListener("progress", (event: any) => {
                const data = JSON.parse(event.data);
                console.log("[SSE] Progress:", data);

                // Robust key handling for scene indices
                // If a scene object is present, it's a new generated scene
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
                        // Persistence: only update scene info if a new one arrives
                        lastScene: isNewScene ? data.scene : prev.lastScene,
                        lastSceneIndex: lastIdx,
                        currentSceneIndex: msgCurrentIdx !== undefined ? msgCurrentIdx : prev.currentSceneIndex,
                    };
                });
            });

            eventSource.addEventListener("ping", () => {
                // Silently ignore keep-alive heartbeats to prevent idle timeout
            });

            eventSource.addEventListener("completed", (event: any) => {
                const data = JSON.parse(event.data);
                console.log("[SSE] Completed:", data);
                setState((prev) => ({
                    ...prev,
                    progress: 100,
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
                // SSE errors are often actually completion or failure data in this specific API design
                // But it can also be a network failure event without data
                if (event.data) {
                    try {
                        const data = JSON.parse(event.data);
                        console.error("[SSE] Error Data:", data);
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
                    } catch {
                        // ignored json parsing error
                    }
                }

                // If it's a network-level error or retryable application error
                console.error("[SSE] Connection Error or Drop");
                eventSource?.close();

                if (!explicitlyClosed) {
                    retryCount++;
                    setRetryCountState(retryCount);
                    setIsReconnecting(true);

                    // Exponential backoff: starting at 2s, 4s, 8s, up to strictly 30s
                    const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);
                    console.log(`[SSE] Attempting to reconnect in ${delay / 1000}s...`);
                    reconnectTimeout = setTimeout(connect, delay);
                }
            });
        };

        connect();

        // Mobile / Background Tab asleep recovery
        const handleVisibilityChange = () => {
            if (document.visibilityState === "visible" && !explicitlyClosed) {
                // Browsers often silently disconnect SSE when tab goes to background / sleep
                if (!eventSource || eventSource.readyState === EventSource.CLOSED) {
                    console.log("[SSE] Tab became visible, connection appears closed. Forcing reconnection...");
                    if (reconnectTimeout) clearTimeout(reconnectTimeout);
                    connect();
                }
            }
        };

        document.addEventListener("visibilitychange", handleVisibilityChange);

        return () => {
            explicitlyClosed = true;
            document.removeEventListener("visibilitychange", handleVisibilityChange);
            if (eventSource) {
                eventSource.close();
            }
            if (reconnectTimeout) {
                clearTimeout(reconnectTimeout);
            }
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

    return { ...state, isFinished, isReconnecting, retryCount: retryCountState, reset };
}
