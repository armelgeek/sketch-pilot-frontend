import { useState, useEffect, useCallback } from "react";

export interface ProgressState {
    progress: number;
    message: string;
    step: string;
    status: "queued" | "processing" | "completed" | "failed" | "cancelled" | "narration_generated" | "scenes_generated";
    videoId?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
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

    useEffect(() => {
        if (!jobId) return;

        let eventSource: EventSource | null = null;
        let reconnectTimeout: any = null;
        let explicitlyClosed = false;

        const connect = () => {
            if (explicitlyClosed) return;

            console.log(`[SSE] Connecting to job: ${jobId}`);
            // Using withCredentials for auth session cookies
            eventSource = new EventSource(`${BASE_URL}/v1/videos/jobs/${jobId}/stream`, {
                withCredentials: true,
            });

            eventSource.addEventListener("connected", (event: any) => {
                const data = JSON.parse(event.data);
                console.log("[SSE] Connected:", data);
                setState((prev) => ({ ...prev, status: data.status, progress: data.progress || 0 }));
            });

            eventSource.addEventListener("progress", (event: any) => {
                const data = JSON.parse(event.data);
                console.log("[SSE] Progress:", data);
                setState({
                    progress: data.progress,
                    message: data.message || data.step || "Processing...",
                    step: data.step,
                    status: data.status || "processing",
                    videoId: data.videoId,
                });
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
                try {
                    const data = JSON.parse(event.data);
                    console.error("[SSE] Error Data:", data);
                    setState((prev) => ({
                        ...prev,
                        status: "failed",
                        error: data.error || "Generation failed",
                        message: data.error || "An error occurred",
                    }));
                    setIsFinished(true);
                    explicitlyClosed = true;
                    eventSource?.close();
                } catch {
                    console.error("[SSE] Connection Error");
                    eventSource?.close();
                    // Handle transparent connection errors / timeouts
                    if (!explicitlyClosed) {
                        console.log("[SSE] Attempting to reconnect in 3s...");
                        reconnectTimeout = setTimeout(connect, 3000);
                    }
                }
            });
        };

        connect();

        return () => {
            explicitlyClosed = true;
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
    }, []);

    return { ...state, isFinished, reset };
}
