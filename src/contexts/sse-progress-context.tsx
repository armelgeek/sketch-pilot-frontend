"use client";

import { createContext, useCallback, useContext, useState } from "react";

export interface SSEProgressOptions {
    title?: string;
    onCancel?: () => void;
}

interface SSEProgressState {
    active: boolean;
    progress: number;
    message: string;
    title?: string;
    onCancel?: () => void;
}

interface SSEProgressContextValue {
    state: SSEProgressState;
    startProgress: (options?: SSEProgressOptions) => void;
    updateProgress: (progress: number, message: string) => void;
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
            onCancel: options?.onCancel,
        });
    }, []);

    const updateProgress = useCallback((progress: number, message: string) => {
        setState((prev) => ({ ...prev, progress, message }));
    }, []);

    const stopProgress = useCallback(() => {
        setState({ active: false, progress: 0, message: "", title: undefined, onCancel: undefined });
    }, []);

    return (
        <SSEProgressContext.Provider value={{ state, startProgress, updateProgress, stopProgress }}>
            {children}
        </SSEProgressContext.Provider>
    );
}

export function useSSEProgress() {
    const ctx = useContext(SSEProgressContext);
    if (!ctx) throw new Error("useSSEProgress must be used within SSEProgressProvider");
    return ctx;
}
