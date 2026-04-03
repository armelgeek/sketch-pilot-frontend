"use client";

import { X } from "lucide-react";
import { useSSEProgress } from "@/src/contexts/sse-progress-context";

export function SSEProgressOverlay() {
    const { state, stopProgress } = useSSEProgress();

    if (!state.active) return null;

    const handleCancel = () => {
        state.onCancel?.();
        stopProgress();
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true"
            aria-label={state.title ?? "Génération en cours"}
        >
            <div className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden">
                {/* Animated accent line at top */}
                <div className="h-1 w-full bg-zinc-100">
                    <div
                        className="h-full bg-emerald-500 transition-all duration-700 ease-out rounded-full"
                        style={{ width: `${state.progress}%` }}
                    />
                </div>

                {/* Content */}
                <div className="px-5 py-4">
                    {/* Title row */}
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2.5">
                            <span className="relative flex h-2.5 w-2.5">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500" />
                            </span>
                            <p className="text-sm font-bold text-zinc-900">
                                {state.title ?? "Génération en cours"}
                            </p>
                        </div>
                        {state.onCancel && (
                            <button
                                onClick={handleCancel}
                                aria-label="Annuler"
                                className="h-7 w-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden mb-3">
                        <div
                            className="h-full bg-emerald-500 rounded-full transition-all duration-700 ease-out"
                            style={{ width: `${state.progress}%` }}
                        />
                    </div>

                    {/* Footer: message + percentage */}
                    <div className="flex items-center justify-between">
                        <p className="text-xs text-zinc-400 truncate max-w-[210px]">
                            {state.message || "Veuillez patienter…"}
                        </p>
                        <span className="text-xs font-black text-emerald-600 tabular-nums ml-3">
                            {state.progress}%
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
