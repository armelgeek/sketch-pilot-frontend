"use client";

import { useRouter } from "next/navigation";
import { ChevronRight, Play, Wand2, Film, Check, FileJson, History, ArrowRight, ChevronLeft } from "lucide-react";
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
        <header className="flex items-center justify-between px-6 h-14 border-b border-zinc-100 bg-white shrink-0 relative z-50 overflow-hidden">
            {/* Left: Brand & Metadata */}
            <div className="flex items-center gap-4 min-w-[320px]">
                <div
                    className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-zinc-100 cursor-pointer transition-all shrink-0 text-zinc-400 hover:text-zinc-900"
                    onClick={() => router.push("/videos")}>
                    <ChevronLeft className="h-4 w-4" />
                </div>

                <div className="flex flex-col min-w-0">
                    <h1 className="text-[14px] font-black text-zinc-900 truncate tracking-tight">
                        {activeVideo?.title || "Projet sans titre"}
                    </h1>
                    <div className="flex items-center gap-2 mt-[-2px]">
                        <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest bg-emerald-50/50 px-1.5 py-0.5 rounded border border-emerald-100/50 leading-none">Studio Workspace</span>
                    </div>
                </div>
            </div>

            {/* Center: Stepper (Integrated Flex) */}


            {/* Right: Actions */}
            <div className="flex items-center justify-end min-w-[320px] gap-3">


                <div>
                    <div className="flex items-center bg-zinc-50/80 px-4 py-1.5 rounded-xl border border-zinc-100">
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
                </div>
                <div>
                    <Button
                        onClick={() => onAssemble()}
                        disabled={assembling || (activeTab === "storyboard" && !visualsGenerated)}
                        className="h-10 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-black text-[10px] px-6 shadow-xl shadow-zinc-300 flex items-center gap-2 group transition-all uppercase tracking-widest">
                        <span>Partager</span>
                        <ArrowRight className="h-4 w-4 opacity-50 group-hover:translate-x-0.5 transition-transform" />
                    </Button>
                </div>
            </div>
        </header>
    );
}
