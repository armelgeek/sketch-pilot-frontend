"use client";

import { X, Sparkles, Wand2, Calculator, Film, Check } from "lucide-react";
import { useSSEProgress } from "@/src/contexts/sse-progress-context";
import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";

function getIcon(progress: number, isDone: boolean, options?: any) {
    const cls = "h-3.5 w-3.5";
    if (isDone) return <Check className={cls} />;
    if (options?.scriptOnly || progress < 15) return <Calculator className={cls} />;
    if (progress < 70) return <Wand2 className={cls} />;
    if (progress < 85) return <Film className={cls} />;
    return <Sparkles className={cls} />;
}

export function SSEProgressOverlay() {
    const { state, stopProgress, hideOverlay, cancelCurrentJob } = useSSEProgress();

    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [displayProgress, setDisplayProgress] = useState(0);

    const isDone = state.progress >= 100;

    const icon = useMemo(
        () => getIcon(state.progress, isDone, state.options),
        [state.progress, isDone, state.options]
    );

    useEffect(() => {
        let raf: number;
        const animate = () => {
            setDisplayProgress((prev) => {
                const diff = state.progress - prev;
                if (Math.abs(diff) < 0.1) return state.progress;
                return prev + diff * 0.08;
            });
            raf = requestAnimationFrame(animate);
        };
        animate();
        return () => cancelAnimationFrame(raf);
    }, [state.progress]);

    useEffect(() => {
        if (isDone && state.active && window.innerWidth > 768) {
            confetti({ particleCount: 100, spread: 55, colors: ["#1D9E75", "#0F6E56", "#9FE1CB"] });
        }
    }, [isDone, state.active]);

    useEffect(() => {
        if (state.overlayVisible) {
            setMounted(true);
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
            const t = setTimeout(() => setMounted(false), 250);
            return () => clearTimeout(t);
        }
    }, [state.overlayVisible]);

    if (!mounted) return null;

    const cancel = async () => {
        await cancelCurrentJob();
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{
                backgroundColor: `rgba(0,0,0,${visible ? 0.18 : 0})`,
                backdropFilter: visible ? "blur(4px)" : "none",
                transition: "background-color 0.25s ease, backdrop-filter 0.25s ease",
            }}
        >
            {/* CARD */}
            <div
                className="w-full max-w-sm rounded-2xl border border-zinc-200 bg-white p-7 shadow-sm will-change-transform"
                style={{
                    transform: visible
                        ? "translateY(0) scale(1)"
                        : "translateY(10px) scale(0.97)",
                    opacity: visible ? 1 : 0,
                    transition: "transform 0.35s cubic-bezier(0.2,1,0.3,1), opacity 0.25s ease",
                }}
            >
                {/* HEADER */}
                <div className="flex items-center gap-2 mb-6">

                    {!isDone && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[#1D9E75] animate-pulse" />
                    )}

                    {/* CLOSE BUTTON */}
                    <button
                        onClick={hideOverlay}
                        className="ml-2 p-1 rounded-full hover:bg-zinc-100 text-zinc-300 hover:text-zinc-500 transition"
                        title="Fermer (laisse la génération tourner en arrière-plan)"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                {/* PROGRESS */}
                <div className="h-px w-full bg-zinc-200 rounded-full overflow-hidden mb-4 relative">
                    <div
                        className="absolute left-0 top-0 h-full bg-[#1D9E75] rounded-full"
                        style={{
                            width: `${displayProgress}%`,
                            transition: "width 0.2s linear",
                        }}
                    />
                </div>

                {/* STATUS */}
                <div className="flex justify-between items-center mb-6">
                    <span className="text-[10px] uppercase tracking-widest text-zinc-400">
                        {state.status === "failed"
                            ? "Échec"
                            : state.isReconnecting
                                ? "Reconnexion..."
                                : isDone
                                    ? "Terminé"
                                    : "En cours"}
                    </span>
                    <span className="text-xs font-medium text-zinc-500 tabular-nums">
                        {Math.round(displayProgress)}%
                    </span>
                </div>

                {state.status === "failed" && state.message && (
                    <div className="mb-4 p-3 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-[11px] text-red-600 leading-normal font-medium">
                            {state.message}
                        </p>
                    </div>
                )}

                {/* ACTION */}
                <div className="border-t border-zinc-100 pt-4">
                    {isDone ? (
                        <div className="flex items-center justify-center gap-2 text-xs text-[#1D9E75] animate-fadeIn">
                            <Check className="h-3 w-3" />
                            Prêt pour visualisation
                        </div>
                    ) : state.active ? (
                        <button
                            onClick={cancel}
                            className="w-full flex items-center justify-center gap-2 rounded-xl py-1.5 text-xs text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition"
                        >
                            <X className="h-3 w-3" />
                            Annuler la génération
                        </button>
                    ) : null}
                </div>
            </div>

            {/* ANIMATIONS */}
            <style jsx>{`
                .animate-fadeIn {
                    animation: fadeIn 0.4s ease;
                }
                @keyframes fadeIn {
                    from { opacity: 0; }
                    to   { opacity: 1; }
                }
            `}</style>
        </div>
    );
}