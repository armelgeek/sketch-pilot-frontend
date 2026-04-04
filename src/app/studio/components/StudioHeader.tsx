"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Play, Wand2, Film, Check, FileJson, History, ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { useStudioStore, StudioTab } from "../store";

interface StudioHeaderProps {
    onNext: () => void;
    promptsUrl?: string;
    onAssemble: () => void;
}

const STEPS: { id: StudioTab; label: string }[] = [
    { id: "script", label: "Contenu" },
    { id: "storyboard", label: "Storyboard" },
    { id: "production", label: "Vidéo" },
];

export function StudioHeader({ onNext, promptsUrl, onAssemble }: StudioHeaderProps) {
    const router = useRouter();
    const {
        activeTab,
        setTab,
        setShowProductionModal,
        showProductionModal,
        visualsGenerated,
        generating,
        assembling,
        activeVideo
    } = useStudioStore();

    const effectiveStepId: StudioTab = showProductionModal ? "production" : activeTab;
    const effectiveStepIndex = STEPS.findIndex(s => s.id === effectiveStepId);

    const handleStepClick = (id: StudioTab, locked: boolean) => {
        if (locked) return;
        if (id === "production") setShowProductionModal(true);
        else { setTab(id); setShowProductionModal(false); }
    };

    return (
        <header className="flex items-center justify-between px-6 h-16 border-b border-zinc-200/80 bg-white/95 backdrop-blur-md shrink-0 relative z-50 shadow-sm overflow-hidden">
            {/* Left: Brand & Metadata */}
            <div className="flex items-center gap-5 min-w-[320px]">
                <div className="flex flex-col min-w-0">
                    <h1 className="text-[15px] font-black text-zinc-900 truncate">

                    </h1>
                    <div className="flex items-center gap-2">
                        <span className="text-[9px] font-black text-zinc-400 uppercase tracking-widest opacity-60">#{activeVideo?.id?.slice(0, 8)}</span>
                        <div className="h-1 w-1 rounded-full bg-zinc-200" />
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">Studio Workspace</span>
                    </div>
                </div>
            </div>

            {/* Center: Stepper (Integrated Flex) */}
            <div className="flex items-center bg-zinc-100/50 px-5 py-2 rounded-2xl border border-zinc-100/80">
                {STEPS.map(({ id, label }, index) => {
                    const isActive = effectiveStepId === id;
                    const isCompleted = effectiveStepIndex > index;
                    const locked = (id === "storyboard" && !visualsGenerated && !generating) || (id === "production" && !visualsGenerated);

                    return (
                        <div key={id} className="flex items-center">
                            {index > 0 && (
                                <div className={cn(
                                    "h-px w-6 mx-2 transition-colors duration-500",
                                    isCompleted ? "bg-emerald-400" : "bg-zinc-200"
                                )} />
                            )}
                            <button
                                onClick={() => handleStepClick(id, locked)}
                                disabled={locked}
                                className="flex items-center gap-2.5 outline-none">
                                <div className={cn(
                                    "h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-black transition-all duration-500 shadow-sm",
                                    isActive ? "bg-zinc-900 text-white scale-110 shadow-zinc-200" :
                                        isCompleted ? "bg-emerald-500 text-white" : "bg-zinc-100 text-zinc-400"
                                )}>
                                    {isCompleted ? <Check className="h-3 w-3" /> : index + 1}
                                </div>
                                <span className={cn(
                                    "text-[9px] font-black uppercase tracking-[0.15em] transition-all duration-500",
                                    isActive ? "text-zinc-900 opacity-100" : "text-zinc-300"
                                )}>
                                    {label}
                                </span>
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Right: Actions */}
            <div className="flex items-center justify-end min-w-[320px] gap-3">
                <Button
                    variant="ghost"
                    className="h-10 text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100/50 rounded-xl px-2 transition-all"
                    onClick={() => { }} // Could be JSON view or something else
                >
                    <FileJson className="h-4 w-4" />
                </Button>

                <div className="h-6 w-px bg-zinc-200/60 mx-1" />

                {/* Contextual Primary Action */}
                <Button
                    onClick={onNext}
                    disabled={generating || assembling}
                    className={cn(
                        "h-10 px-5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center gap-2",
                        activeTab === "script"
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-100"
                            : "bg-zinc-100 hover:bg-zinc-200 text-zinc-600 border border-zinc-200/50"
                    )}
                >
                    {activeTab === "script" ? (
                        visualsGenerated ? <><Film className="h-3.5 w-3.5" /> Storyboard</> : <><Wand2 className="h-3.5 w-3.5" /> Générer</>
                    ) : (
                        <><History className="h-3.5 w-3.5 opacity-60" /> Historique</>
                    )}
                </Button>

                <Button
                    onClick={() => onAssemble()}
                    disabled={assembling || (activeTab === "storyboard" && !visualsGenerated)}
                    className="h-10 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-black text-[10px] px-6 shadow-xl shadow-zinc-300 flex items-center gap-2 group transition-all uppercase tracking-widest">
                    <span>Partager</span>
                    <ArrowRight className="h-4 w-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                </Button>
            </div>
        </header>
    );
}
