"use client";
import { X, Sparkles, Wand2, Calculator, Film, Volume2 } from "lucide-react";
import { useSSEProgress } from "@/src/contexts/sse-progress-context";
import { useEffect, useState, useMemo } from "react";

function getPhase(progress: number, isDone: boolean) {
    if (isDone) return "Vidéo prête";
    if (progress < 15) return "Analyse du script";
    if (progress < 70) return "Génération du storyboard";
    if (progress < 85) return "Synthèse vocale & Musique";
    return "Rendu final";
}

function getPhaseIcon(progress: number, isDone: boolean) {
    const cls = "h-4 w-4";
    if (isDone) return <Sparkles className={cls} />;
    if (progress < 15) return <Calculator className={cls} />;
    if (progress < 70) return <Wand2 className={cls} />;
    if (progress < 85) return <Volume2 className={cls} />;
    return <Film className={cls} />;
}

export function SSEProgressOverlay() {
    const { state, stopProgress } = useSSEProgress();
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        if (state.active) {
            setMounted(true);
            requestAnimationFrame(() => setVisible(true));
        } else {
            setVisible(false);
            const t = setTimeout(() => setMounted(false), 300);
            return () => clearTimeout(t);
        }
    }, [state.active]);

    const isDone = state.progress >= 100;
    const phase = useMemo(() => getPhase(state.progress, isDone), [state.progress, isDone]);
    const icon = useMemo(() => getPhaseIcon(state.progress, isDone), [state.progress, isDone]);

    if (!mounted) return null;

    const handleCancel = () => {
        state.onCancel?.();
        stopProgress();
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{
                backdropFilter: "blur(8px)",
                WebkitBackdropFilter: "blur(8px)",
                backgroundColor: `rgba(0,0,0,${visible ? 0.6 : 0})`,
                transition: "background-color 0.3s ease",
            }}
        >
            <div
                className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-900 p-8"
                style={{
                    transform: visible ? "translateY(0) scale(1)" : "translateY(16px) scale(0.97)",
                    opacity: visible ? 1 : 0,
                    transition: "transform 0.35s cubic-bezier(0.2,1,0.3,1), opacity 0.3s ease",
                }}
            >
                {/* Phase label */}
                <div className="flex items-center gap-2.5 mb-6">
                    <span className="text-violet-400">{icon}</span>
                    <span className="text-sm font-semibold text-white">{phase}</span>
                    {!isDone && (
                        <span className="ml-auto flex h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                    )}
                </div>

                {/* Progress bar */}
                <div className="h-1 w-full bg-white/8 rounded-full overflow-hidden mb-3">
                    <div
                        className="h-full rounded-full bg-violet-500"
                        style={{
                            width: `${state.progress}%`,
                            transition: "width 0.8s cubic-bezier(0.4,0,0.2,1)",
                        }}
                    />
                </div>

                {/* Message + percentage */}
                <div className="flex items-center justify-between mb-8">
                    <p className="text-xs text-white/40 truncate">
                        {state.message || "Préparation en cours..."}
                    </p>
                    <span className="text-xs font-bold text-white/60 tabular-nums ml-4 shrink-0">
                        {Math.round(state.progress)}%
                    </span>
                </div>

                {/* Actions */}
                {isDone ? (
                    <div className="flex items-center justify-center gap-2 text-xs font-semibold text-violet-400">
                        <Sparkles className="h-3.5 w-3.5" />
                        Prêt pour visualisation
                    </div>
                ) : state.onCancel ? (
                    <button
                        onClick={handleCancel}
                        className="w-full flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold text-white/40 hover:text-white/70 hover:bg-white/5 transition-all border border-white/8"
                    >
                        <X className="h-3.5 w-3.5" />
                        Annuler
                    </button>
                ) : null}
            </div>
        </div>
    );
}