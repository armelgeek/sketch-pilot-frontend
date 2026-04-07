"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { useVideoProgress } from "@/src/hooks/use-video-progress";

export interface SSEProgressOptions {
    title?: string;
    jobId?: string; // Add jobId to trigger SSE tracking
    onCancel?: () => void;
}

interface SSEProgressState {
    active: boolean;
    progress: number;
    message: string;
    title?: string;
    jobId?: string; // Track jobId for useVideoProgress
    onCancel?: () => void;
}

interface SSEProgressContextValue {
    state: SSEProgressState;
    startProgress: (options?: SSEProgressOptions) => void;
    updateProgress: (progress: number, message: string, jobId?: string) => void;
    stopProgress: () => void;
}

const SSEProgressContext = createContext<SSEProgressContextValue | null>(null);

export function SSEProgressProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<SSEProgressState>({
        active: false,
        progress: 0,
        message: "",
        title: undefined,
        onCancel: undefined,
    });

    const startProgress = useCallback((options?: SSEProgressOptions) => {
        setState({
            active: true,
            progress: 0,
            message: "Initialisation…",
            title: options?.title,
            jobId: options?.jobId,
            onCancel: options?.onCancel,
        });
    }, []);

    const updateProgress = useCallback((progress: number, message: string, jobId?: string) => {
        setState((prev) => ({ ...prev, progress, message, jobId: jobId || prev.jobId }));
    }, []);

    const stopProgress = useCallback(() => {
        setState({ active: false, progress: 0, message: "", title: undefined, jobId: undefined, onCancel: undefined });
    }, []);

    // ── SSE Synchronization Logic ─────────────────────────────────────────────
    // We use the useVideoProgress hook internally to drive the state when a jobId is present.
    const sse = useVideoProgress(state.jobId);

    useEffect(() => {
        if (!state.active || !state.jobId) return;

        // Sync SSE progress to context state
        if (sse.progress !== state.progress || sse.message !== state.message) {
            updateProgress(sse.progress, sse.message);
        }

        // Handle auto-completion
        if (sse.status === "completed" && state.active) {
            // Give it a small delay so user sees 100%
            const t = setTimeout(() => {
                stopProgress();
            }, 2000);
            return () => clearTimeout(t);
        }

        // Handle failure
        if (sse.status === "failed" && state.active) {
            // We keep it active so the error message is visible, 
            // but the dots stop animating (isDone check in overlay)
        }
    }, [sse.progress, sse.message, sse.status, state.active, state.jobId, updateProgress, stopProgress]);

    return (
        <SSEProgressContext.Provider value={{ state, startProgress, updateProgress, stopProgress }}>
            {children}
        </SSEProgressContext.Provider>
    );
}

export function useSSEProgress() {
    const ctx = useContext(SSEProgressContext);
    if (!ctx) throw new Error(
        "useSSEProgress must be used within an SSEProgressProvider. " +
        "Ensure SSEProgressProvider wraps your component tree."
    );
    return ctx;
}
