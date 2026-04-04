"use client";

import { Plus } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface CreditsWidgetProps {
    credits: number;
    totalCredits: number;
    isStudio?: boolean;
    subLoading?: boolean;
    onTopUp?: () => void;
}

export function CreditsWidget({
    credits,
    totalCredits,
    isStudio = false,
    subLoading = false,
    onTopUp,
}: CreditsWidgetProps) {
    const pct = totalCredits > 0 ? (credits / totalCredits) * 100 : 0;

    return (
        <button
            onClick={onTopUp}
            className={cn(
                "group relative flex h-10 items-center gap-3 px-4 rounded-xl border transition-all duration-300 overflow-hidden",
                isStudio
                    ? "bg-zinc-950/40 border-zinc-800/50 backdrop-blur-md hover:border-amber-500/30"
                    : "bg-white border-zinc-100 shadow-sm hover:shadow-md hover:border-amber-200"
            )}
        >
            {/* Shimmer effect */}
            <div className="absolute inset-x-0 h-px top-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />

            <div className="relative flex items-center gap-2.5">
                <div className="relative flex h-5 w-5 items-center justify-center shrink-0">
                    <span className="absolute inset-0 animate-pulse rounded-full bg-amber-400/20 blur-sm" />
                    <span className="relative text-sm group-hover:scale-110 transition-all">🪙</span>
                </div>

                <div className="flex items-baseline gap-1.5 leading-none">
                    <span className={cn(
                        "text-[12px] font-black tracking-tight",
                        isStudio ? "text-white" : "text-zinc-900"
                    )}>
                        {subLoading ? "···" : credits.toLocaleString()}
                    </span>
                    <span className="text-[11px] text-amber-500/60 font-bold">/</span>
                    <span className={cn(
                        "text-[11px] font-bold opacity-30",
                        isStudio ? "text-zinc-400" : "text-zinc-500"
                    )}>
                        {totalCredits.toLocaleString()}
                    </span>
                </div>
            </div>

            <div className={cn(
                "w-4 h-4 flex items-center justify-center rounded-md transition-all duration-300",
                isStudio ? "bg-zinc-900 text-zinc-500" : "bg-zinc-50 text-zinc-300 group-hover:text-amber-500 group-hover:bg-amber-50"
            )}>
                <Plus className="h-3 w-3 group-hover:rotate-90 transition-transform" />
            </div>

            {/* Subtle Progress Underline */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-zinc-100/30 dark:bg-zinc-900/50">
                <div
                    className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-1000 ease-out shadow-[0_-2px_8px_rgba(245,158,11,0.4)]"
                    style={{ width: `${Math.max(3, pct)}%` }}
                />
            </div>
        </button>
    );
}
