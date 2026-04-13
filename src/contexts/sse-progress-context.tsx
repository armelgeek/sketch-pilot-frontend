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
    options?: any;
    totalScenes?: number;
    jobId?: string;
    onCancel?: () => void;
    isReconnecting?: boolean;
    step?: string;
    // Scene stream data (for real-time storyboard updates)
    lastScene?: any;
    lastSceneIndex?: number;
    status?: string;
    videoId?: string;
    overlayVisible: boolean;
    credits?: {
        totalCost: number;
        isSaga: boolean;
        includedBackgroundServices: string[];
    };
}

interface SSEProgressContextValue {
    state: SSEProgressState;
    startProgress: (options?: SSEProgressOptions) => void;
    updateProgress: (progress: number, message: string, jobId?: string, options?: any, totalScenes?: number) => void;
    stopProgress: () => void;
    hideOverlay: () => void;
    showOverlay: () => void;
    cancelCurrentJob: () => Promise<void>;
}

const SSEProgressContext = createContext<SSEProgressContextValue | null>(null);

export function SSEProgressProvider({ children }: { children: React.ReactNode }) {
    const [state, setState] = useState<SSEProgressState>({
        active: false,
        progress: 0,
        message: "",
        title: undefined,
        onCancel: undefined,
        isReconnecting: false,
        overlayVisible: false,
    });

    const startProgress = useCallback((options?: SSEProgressOptions) => {
        setState({
            active: true,
            progress: 0,
            message: "Initialisation…",
            title: options?.title,
            jobId: options?.jobId,
            onCancel: options?.onCancel,
            overlayVisible: true,
        });
    }, []);

    const updateProgress = useCallback((progress: number, message: string, jobId?: string, options?: any, totalScenes?: number) => {
        setState((prev) => ({
            ...prev,
            progress,
            message,
            jobId: jobId || prev.jobId,
            options: options || prev.options,
            totalScenes: totalScenes !== undefined ? totalScenes : prev.totalScenes
        }));
    }, []);

    const stopProgress = useCallback(() => {
        setState({
            active: false,
            progress: 0,
            message: "",
            title: undefined,
            jobId: undefined,
            onCancel: undefined,
            isReconnecting: false,
            options: undefined,
            totalScenes: undefined,
            overlayVisible: false,
        });
    }, []);

    const hideOverlay = useCallback(() => {
        setState(prev => ({ ...prev, overlayVisible: false }));
    }, []);

    const showOverlay = useCallback(() => {
        setState(prev => ({ ...prev, overlayVisible: true }));
    }, []);

    // ── SSE Synchronization Logic ─────────────────────────────────────────────
    // We use the useVideoProgress hook internally to drive the state when a jobId is present.
    const sse = useVideoProgress(state.jobId);

    useEffect(() => {
        if (!state.active || !state.jobId) return;

        // Sync progress + scene data from SSE stream
        const progressChanged = sse.progress !== state.progress || sse.message !== state.message || sse.totalScenes !== state.totalScenes;
        const sceneChanged = sse.lastScene !== state.lastScene || sse.lastSceneIndex !== state.lastSceneIndex;

        if (progressChanged || sceneChanged) {
            setState(prev => ({
                ...prev,
                progress: sse.progress,
                message: sse.message,
                step: sse.step,
                jobId: state.jobId,
                options: sse.options || prev.options,
                totalScenes: sse.totalScenes || prev.totalScenes,
                lastScene: sse.lastScene || prev.lastScene,
                lastSceneIndex: sse.lastSceneIndex,
                status: sse.status,
                videoId: sse.videoId || prev.videoId,
                credits: sse.credits || prev.credits,
            }));
        }

        if (sse.isReconnecting !== state.isReconnecting) {
            setState(prev => ({ ...prev, isReconnecting: sse.isReconnecting }));
        }

        // Handle auto-completion
        if (sse.status === "completed" && state.active) {
            const t = setTimeout(() => {
                stopProgress();
            }, 2000);
            return () => clearTimeout(t);
        }
    }, [sse.progress, sse.message, sse.status, sse.lastScene, sse.lastSceneIndex, sse.totalScenes, state.active, state.jobId, stopProgress]);

    const cancelCurrentJob = useCallback(async () => {
        if (state.onCancel) {
            state.onCancel();
        } else if (state.videoId) {
            await sse.cancelVideo(state.videoId);
        }
        stopProgress();
    }, [state.onCancel, state.videoId, sse.cancelVideo, stopProgress]);

    return (
        <SSEProgressContext.Provider value={{
            state,
            startProgress,
            updateProgress,
            stopProgress,
            hideOverlay,
            showOverlay,
            cancelCurrentJob
        }}>
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
