"use client";

import { X, Sparkles, Wand2, Calculator, Film, Check } from "lucide-react";
import { useSSEProgress } from "@/src/contexts/sse-progress-context";
import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import confetti from "canvas-confetti";

function getIcon(step: string | undefined, isDone: boolean) {
    const cls = "h-4 w-4";
    if (isDone) return <Check className={cls} />;
    if (step === "script_generation" || step?.startsWith("step.step_1")) return <Calculator className={cls} />;
    if (step === "composing_scene" || step?.startsWith("step.step_2")) return <Wand2 className={cls} />;
    if (step === "audio_generation" || step === "rendering" || step?.startsWith("step.step_3")) {
        if (step?.includes("audio")) return <Film className={cls} />;
        return <Sparkles className={cls} />;
    }
    return <Sparkles className={cls} />;
}

export function SSEProgressOverlay() {
    const { state, stopProgress, hideOverlay, cancelCurrentJob } = useSSEProgress();
    const t = useTranslations("overlay");
    const tProgress = useTranslations("progress");

    const [visible, setVisible] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [displayProgress, setDisplayProgress] = useState(0);

    const isDone = state.status === "completed";

    const icon = useMemo(
        () => getIcon(state.step, isDone),
        [state.step, isDone]
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
            const timer = setTimeout(() => setMounted(false), 250);
            return () => clearTimeout(timer);
        }
    }, [state.overlayVisible]);

    if (!mounted) return null;

    const cancel = async () => {
        await cancelCurrentJob();
    };

    const statusLabel = state.status === "failed"
        ? t("status_failed")
        : state.isReconnecting
            ? t("status_reconnecting")
            : isDone
                ? t("status_done")
                : t("status_in_progress");

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

                    {/* ICON & MESSAGE */}
                    <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-xl ${isDone ? 'bg-[#1D9E75]/10 text-[#1D9E75]' : 'bg-zinc-100 text-zinc-500'}`}>
                            {icon}
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">

                            <p className="text-[11px] text-zinc-400 font-medium truncate">
                                {state.message || tProgress("preparing")}
                            </p>
                        </div>
                    </div>

                    {!isDone && (
                        <span className="h-2 w-2 rounded-full bg-[#1D9E75] animate-pulse shrink-0" />
                    )}

                    {/* CLOSE BUTTON */}
                    <button
                        onClick={hideOverlay}
                        className="p-1 rounded-full hover:bg-zinc-100 text-zinc-300 hover:text-zinc-500 transition shrink-0"
                        title={t("close_hint")}
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
                        {statusLabel}
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

                {/* PROJECT SEQUEL: CREDIT INFO & BACKGROUND SYNC VALUE */}
                {state.credits && (
                    <div className="mb-6 p-4 rounded-2xl bg-zinc-50 border border-zinc-100/50">
                        <div className="flex items-center justify-between mb-3">
                            <div className="flex items-center gap-2">
                                <Calculator className="h-3.5 w-3.5 text-zinc-400" />
                                <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">{t("credit_total_label") || "Coût de génération"}</span>
                            </div>
                            <span className="text-xs font-bold text-zinc-600 tabular-nums">{state.credits.totalCost} crédits</span>
                        </div>

                        {state.credits.includedBackgroundServices && state.credits.includedBackgroundServices.length > 0 && (
                            <div className="space-y-1.5 border-t border-zinc-200/50 pt-3">
                                <p className="text-[9px] text-zinc-400 font-medium uppercase tracking-tight mb-1">{t("included_services_label") || "Synchronisations offertes"}</p>
                                <div className="grid grid-cols-1 gap-1.5">
                                    {state.credits.includedBackgroundServices.map((service) => (
                                        <div key={service} className="flex items-center gap-2 text-[10px] text-zinc-500">
                                            <div className="h-1 w-1 rounded-full bg-[#1D9E75]" />
                                            <span className="capitalize">{service.replace(/_/g, ' ')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* ACTION */}
                <div className="border-t border-zinc-100 pt-4">
                    {isDone ? (
                        <div className="flex items-center justify-center gap-2 text-xs text-[#1D9E75] animate-fadeIn">
                            <Check className="h-3 w-3" />
                            {t("ready")}
                        </div>
                    ) : state.active ? (
                        <button
                            onClick={cancel}
                            className="w-full flex items-center justify-center gap-2 rounded-xl py-1.5 text-xs text-zinc-400 hover:text-zinc-700 hover:bg-zinc-50 transition"
                        >
                            <X className="h-3 w-3" />
                            {t("cancel")}
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