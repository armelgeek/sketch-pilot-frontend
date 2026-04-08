"use client";

import { useEffect, useRef } from "react";
import { useSSEProgress } from "@/src/contexts/sse-progress-context";
import { useStudioStore } from "../store";

/**
 * Bridges the SSE progress stream to the Studio Zustand store.
 * Whenever a new scene visual arrives from the backend, it immediately
 * updates the storyboard so the user sees images appear in real-time
 * without needing to reload the page.
 */
export function useStoryboardSSESync() {
    const { state } = useSSEProgress();
    const { updateSceneInStore, setVisualsGenerated, setGenerating } = useStudioStore();

    // Track the last processed scene index to avoid double-updates
    const lastProcessedIndex = useRef<number>(-1);

    // Reset the pointer when a new job starts
    useEffect(() => {
        if (state.active && state.jobId) {
            lastProcessedIndex.current = -1;
        }
    }, [state.jobId]);

    // Sync scene visuals to the store in real-time
    useEffect(() => {
        if (!state.active || !state.jobId) return;
        if (!state.lastScene || state.lastSceneIndex === undefined || state.lastSceneIndex === null) return;
        if (state.lastSceneIndex === lastProcessedIndex.current) return;

        lastProcessedIndex.current = state.lastSceneIndex;
        updateSceneInStore(state.lastScene, state.lastSceneIndex);
    }, [state.lastScene, state.lastSceneIndex, state.active, state.jobId, updateSceneInStore]);

    // Mark visuals as generated when generation completes
    useEffect(() => {
        if (state.status === "completed" && state.active) {
            setVisualsGenerated(true);
            setGenerating(false);
        }
    }, [state.status, state.active, setVisualsGenerated, setGenerating]);
}
