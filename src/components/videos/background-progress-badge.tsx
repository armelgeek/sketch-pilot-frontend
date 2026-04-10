"use client";

import { useSSEProgress } from "@/src/contexts/sse-progress-context";
import { cn } from "@/src/lib/utils";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export function BackgroundProgressBadge({ collapsed = false }: { collapsed?: boolean }) {
    const { state, showOverlay } = useSSEProgress();

    // Hide if not tracking, done, or if the main overlay is already shown
    if (!state.active || state.progress >= 100 || state.overlayVisible) return null;

    return (
        <div
            onClick={showOverlay}
            className={cn(
                "mt-2 mb-4 px-3 flex flex-col gap-2 transition-all duration-500 cursor-pointer hover:bg-zinc-50 rounded-lg py-2 group",
                collapsed ? "items-center" : "items-start"
            )}
            title="Cliquez pour voir les détails de la génération"
        >
            {!collapsed && (
                <div className="flex items-center justify-between w-full mb-0.5">
                    <span className="text-[10px] font-bold text-[#1D9E75] uppercase tracking-widest animate-pulse">
                        Génération...
                    </span>
                    <span className="text-[11px] font-medium text-zinc-500 leading-none tabular-nums">
                        {Math.round(state.progress)}%
                    </span>
                </div>
            )}

            <div className={cn(
                "relative h-[2px] w-full bg-zinc-100 rounded-full overflow-hidden",
                collapsed && "w-8 h-[2px]"
            )}>
                <div
                    className="absolute inset-y-0 left-0 bg-[#1D9E75] transition-all duration-500 ease-out"
                    style={{ width: `${state.progress}%` }}
                />
            </div>

            {collapsed && (
                <div className="text-[9px] font-bold text-[#1D9E75] tabular-nums">
                    {Math.round(state.progress)}%
                </div>
            )}
        </div>
    );
}
