"use client";

import { useSSEProgress } from "@/src/contexts/sse-progress-context";
import { cn } from "@/src/lib/utils";
import { Loader2 } from "lucide-react";
import { useMemo } from "react";

export function BackgroundProgressBadge({ collapsed = false }: { collapsed?: boolean }) {
    const { state } = useSSEProgress();

    if (!state.active || state.progress >= 100) return null;

    return (
        <div className={cn(
            "mt-2 mb-4 px-3 flex flex-col gap-2 transition-all duration-500",
            collapsed ? "items-center" : "items-start"
        )}>
            {!collapsed && (
                <div className="flex items-center justify-between w-full mb-0.5">
                    <span className="text-[10px] font-black text-violet-500 uppercase tracking-widest animate-pulse">
                        Génération...
                    </span>
                    <span className="text-[11px] font-bold text-zinc-900 leading-none tabular-nums">
                        {Math.round(state.progress)}%
                    </span>
                </div>
            )}

            <div className={cn(
                "relative h-1 w-full bg-zinc-200 rounded-full overflow-hidden",
                collapsed && "w-8 h-1"
            )}>
                <div
                    className="absolute inset-y-0 left-0 bg-violet-500 transition-all duration-1000 ease-out shadow-[0_0_8px_rgba(139,92,246,0.5)]"
                    style={{ width: `${state.progress}%` }}
                />
            </div>

            {collapsed && (
                <div className="text-[9px] font-bold text-violet-500 tabular-nums">
                    {Math.round(state.progress)}%
                </div>
            )}
        </div>
    );
}
