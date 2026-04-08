"use client";

import { X, Sparkles, Wand2, Calculator, Film } from "lucide-react";
import { useSSEProgress } from "@/src/contexts/sse-progress-context";
import { useEffect, useMemo, useState } from "react";
import confetti from "canvas-confetti";

function getPhase(progress: number, isDone: boolean, options?: any) {
    if (isDone) return options?.scriptOnly ? "Script prêt" : "Vidéo prête";
    if (options?.scriptOnly) return "Rédaction du script...";
    if (progress < 15) return "Analyse du script";
    if (progress < 70) return "Génération du storyboard";
    if (progress < 85) return "Synthèse audio";
    return "Rendu final";
}

function getIcon(progress: number, isDone: boolean, options?: any) {
    const cls = "h-4 w-4";
    if (isDone) return <Sparkles className={cls} />;
    if (options?.scriptOnly || progress < 15) return <Calculator className={cls} />;
    if (progress < 70) return <Wand2 className={cls} />;
    return <Film className={cls} />;
}

export function SSEProgressOverlay() {
    const { state, stopProgress } = useSSEProgress();

    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [displayProgress, setDisplayProgress] = useState(0);

    const isDone = state.progress >= 100;

    const phase = useMemo(
        () => getPhase(state.progress, isDone, state.options),
        [state.progress, isDone]
    );

    const icon = useMemo(
        () => getIcon(state.progress, isDone, state.options),
        [state.progress, isDone]
    );

    // 🎯 Smooth progress (anti-jump SSE)
    useEffect(() => {
        let raf: number;

        const animate = () => {
            setDisplayProgress((prev) => {
                const diff = state.progress - prev;
                if (Math.abs(diff) < 0.1) return state.progress;
                return prev + diff * 0.08; // easing
            });
            raf = requestAnimationFrame(animate);
        };

        animate();
        return () => cancelAnimationFrame(raf);
    }, [state.progress]);

    // 🎉 confetti safe
    useEffect(() => {
        if (isDone && state.active && window.innerWidth > 768) {
            confetti({ particleCount: 120, spread: 60 });
        }
    }, [isDone, state.active]);

    // mount animation
    useEffect(() => {
        if (state.active) {
            setMounted(true);
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
            const t = setTimeout(() => setMounted(false), 250);
            return () => clearTimeout(t);
        }
    }, [state.active]);

    if (!mounted) return null;

    const cancel = () => {
        state.onCancel?.();
        stopProgress();
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 backdrop-blur-md"
            style={{
                backgroundColor: `rgba(0,0,0,${visible ? 0.55 : 0})`,
                transition: "background-color 0.25s ease",
            }}
        >
            {/* CARD */}
            <div
                className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-7 shadow-2xl will-change-transform"
                style={{
                    transform: visible
                        ? "translateY(0) scale(1)"
                        : "translateY(12px) scale(0.96)",
                    opacity: visible ? 1 : 0,
                    transition:
                        "transform 0.35s cubic-bezier(0.2,1,0.3,1), opacity 0.25s ease",
                }}
            >
                {/* HEADER */}
                <div className="flex items-center gap-2 mb-6">
                    <span className="text-violet-400 transition-transform duration-300">
                        {icon}
                    </span>

                    <span
                        key={phase}
                        className="text-sm font-semibold text-white animate-fadeSlide"
                    >
                        {phase}
                    </span>

                    {!isDone && (
                        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                    )}
                </div>

                {/* PROGRESS */}
                <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden mb-4">
                    <div
                        className="h-full bg-violet-500 will-change-transform"
                        style={{
                            transform: `translateX(${displayProgress - 100}%)`,
                            transition: "transform 0.2s linear",
                        }}
                    />
                </div>

                {/* STATUS */}
                <div className="flex justify-between text-xs mb-6">
                    <span className="text-white/30 uppercase tracking-wider">
                        {state.isReconnecting
                            ? "Reconnexion..."
                            : isDone
                                ? "Terminé"
                                : "En cours"}
                    </span>

                    <span className="font-bold text-white/60 tabular-nums">
                        {Math.round(displayProgress)}%
                    </span>
                </div>

                {/* ACTION */}
                {isDone ? (
                    <div className="flex justify-center text-xs text-violet-400 gap-2 animate-fadeIn">
                        <Sparkles className="h-3.5 w-3.5" />
                        Prêt pour visualisation
                    </div>
                ) : state.onCancel ? (
                    <button
                        onClick={cancel}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-2 text-xs text-white/40 hover:text-white hover:bg-white/5 transition"
                    >
                        <X className="h-3.5 w-3.5" />
                        Annuler
                    </button>
                ) : null}
            </div>

            {/* ANIMATIONS */}
            <style jsx>{`
        .animate-fadeSlide {
          animation: fadeSlide 0.35s cubic-bezier(0.2, 1, 0.3, 1);
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s ease;
        }

        @keyframes fadeSlide {
          from {
            opacity: 0;
            transform: translateY(6px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
      `}</style>
        </div>
    );
}