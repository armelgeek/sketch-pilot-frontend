"use client";

import { X, Sparkles } from "lucide-react";
import { useSSEProgress } from "@/src/contexts/sse-progress-context";
import { useEffect, useState } from "react";

// ── Animated dots ──────────────────────────────────────────────────────────────

function AnimatedDots() {
    return (
        <span className="inline-flex gap-[3px] items-end h-3 ml-0.5">
            {[0, 1, 2].map((i) => (
                <span
                    key={i}
                    className="inline-block w-[3px] h-[3px] rounded-full bg-zinc-400"
                    style={{
                        animation: "dotBounce 1.4s ease-in-out infinite",
                        animationDelay: `${i * 0.2}s`,
                    }}
                />
            ))}
            <style>{`
        @keyframes dotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.4; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
        </span>
    );
}

// ── Circular progress ring ─────────────────────────────────────────────────────

function CircularRing({ progress }: { progress: number }) {
    const r = 20;
    const circ = 2 * Math.PI * r;
    const offset = circ - (progress / 100) * circ;

    return (
        <svg width="52" height="52" className="rotate-[-90deg]">
            {/* Track */}
            <circle cx="26" cy="26" r={r} fill="none" stroke="#f4f4f5" strokeWidth="3" />
            {/* Progress */}
            <circle
                cx="26"
                cy="26"
                r={r}
                fill="none"
                stroke="#10b981"
                strokeWidth="3"
                strokeLinecap="round"
                strokeDasharray={circ}
                strokeDashoffset={offset}
                style={{ transition: "stroke-dashoffset 0.7s cubic-bezier(0.4,0,0.2,1)" }}
            />
        </svg>
    );
}

// ── Step indicator dots ────────────────────────────────────────────────────────

function StepDots({ progress }: { progress: number }) {
    const steps = [0, 25, 50, 75, 100];
    return (
        <div className="flex items-center gap-1">
            {steps.map((step, i) => (
                <span
                    key={i}
                    className="inline-block rounded-full transition-all duration-500"
                    style={{
                        width: progress >= step ? "16px" : "4px",
                        height: "4px",
                        background: progress >= step ? "#10b981" : "#e4e4e7",
                    }}
                />
            ))}
        </div>
    );
}

// ── Main overlay ───────────────────────────────────────────────────────────────

export function SSEProgressOverlay() {
    const { state, stopProgress } = useSSEProgress();
    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);

    // Mount/unmount with animation
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

    if (!mounted) return null;

    const handleCancel = () => {
        state.onCancel?.();
        stopProgress();
    };

    const isDone = state.progress >= 100;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center"
            role="dialog"
            aria-modal="true"
            aria-label={state.title ?? "Génération en cours"}
            style={{
                backdropFilter: "blur(6px)",
                WebkitBackdropFilter: "blur(6px)",
                backgroundColor: `rgba(0,0,0,${visible ? 0.45 : 0})`,
                transition: "background-color 0.3s ease",
            }}
        >
            <div
                className="w-full max-w-[360px] mx-4 bg-white rounded-2xl shadow-2xl overflow-hidden"
                style={{
                    border: "1px solid rgba(0,0,0,0.06)",
                    transform: visible ? "translateY(0) scale(1)" : "translateY(12px) scale(0.97)",
                    opacity: visible ? 1 : 0,
                    transition: "transform 0.3s cubic-bezier(0.34,1.56,0.64,1), opacity 0.25s ease",
                }}
            >
                {/* ── Top accent bar ── */}
                <div className="h-[3px] w-full bg-zinc-100 relative overflow-hidden">
                    <div
                        className="absolute inset-y-0 left-0 rounded-full"
                        style={{
                            width: `${state.progress}%`,
                            background: "linear-gradient(90deg, #34d399, #10b981)",
                            transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
                            boxShadow: "0 0 8px rgba(16,185,129,0.5)",
                        }}
                    />
                    {/* Shimmer */}
                    <div
                        className="absolute inset-y-0 w-24 pointer-events-none"
                        style={{
                            left: `${state.progress - 15}%`,
                            background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.6), transparent)",
                            transition: "left 0.7s cubic-bezier(0.4,0,0.2,1)",
                        }}
                    />
                </div>

                {/* ── Body ── */}
                <div className="px-5 py-5">

                    {/* Title row */}
                    <div className="flex items-start justify-between mb-5">
                        <div className="flex items-center gap-3">
                            {/* Circular ring + percentage */}
                            <div className="relative flex items-center justify-center shrink-0">
                                <CircularRing progress={state.progress} />
                                <span className="absolute text-[10px] font-black text-zinc-900 tabular-nums leading-none">
                                    {state.progress}<span className="text-[8px] font-bold text-zinc-400">%</span>
                                </span>
                            </div>

                            <div>
                                <p className="text-[13px] font-bold text-zinc-900 leading-tight">
                                    {isDone ? "Génération terminée" : (state.title ?? "Génération en cours")}
                                    {!isDone && <AnimatedDots />}
                                </p>
                                <div className="mt-1.5">
                                    <StepDots progress={state.progress} />
                                </div>
                            </div>
                        </div>

                        {state.onCancel && !isDone && (
                            <button
                                onClick={handleCancel}
                                aria-label="Annuler la génération"
                                className="h-7 w-7 flex items-center justify-center rounded-lg text-zinc-300 hover:text-red-500 hover:bg-red-50 transition-all duration-150 shrink-0 ml-2"
                            >
                                <X className="h-3.5 w-3.5" />
                            </button>
                        )}
                    </div>

                    {/* Progress bar */}
                    <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden mb-3 relative">
                        <div
                            className="h-full rounded-full relative overflow-hidden"
                            style={{
                                width: `${state.progress}%`,
                                background: isDone
                                    ? "linear-gradient(90deg, #34d399, #10b981)"
                                    : "linear-gradient(90deg, #6ee7b7, #10b981)",
                                transition: "width 0.7s cubic-bezier(0.4,0,0.2,1)",
                            }}
                        >
                            {/* Inner shimmer */}
                            {!isDone && (
                                <span
                                    className="absolute inset-0 opacity-40"
                                    style={{
                                        background: "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.8) 50%, transparent 100%)",
                                        animation: "shimmer 1.8s ease-in-out infinite",
                                    }}
                                />
                            )}
                        </div>
                        <style>{`
              @keyframes shimmer {
                0% { transform: translateX(-100%); }
                100% { transform: translateX(400%); }
              }
            `}</style>
                    </div>

                    {/* Footer */}
                    <div className="flex items-center justify-between mt-3">
                        <div className="flex items-center gap-1.5 min-w-0">
                            {!isDone && (
                                <span className="relative flex h-1.5 w-1.5 shrink-0">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
                                    <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
                                </span>
                            )}
                            {isDone && (
                                <Sparkles className="h-3 w-3 text-emerald-500 shrink-0" />
                            )}
                            <p className="text-[11px] text-zinc-400 truncate">
                                {state.message || "Veuillez patienter…"}
                            </p>
                        </div>

                        {state.onCancel && !isDone && (
                            <button
                                onClick={handleCancel}
                                className="text-[11px] font-medium text-zinc-400 hover:text-red-500 transition-colors whitespace-nowrap ml-3 shrink-0"
                            >
                                Annuler
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}