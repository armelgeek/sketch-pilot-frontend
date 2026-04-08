"use client";
import { ScriptEditor } from "@/src/components/organisms/script-editor";

import { useStudioStore } from "../store";
import { useStudioActions } from "../hooks/use-studio-actions";
import { Save, Wand2, Check, ChevronLeft, Zap } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { estimateStoryboardCost } from "@/src/lib/credit-costs";

interface ScriptTabContentProps {
    onScenesChange: (newScenes: any[]) => void;
    onSaveScript: () => void;
    onAnimate?: () => void;
    onShare?: () => void;
}

export function ScriptTabContent({ onScenesChange, onSaveScript, onAnimate, onShare }: ScriptTabContentProps) {
    const router = useRouter();
    const pathname = usePathname();
    const { activeTab, activeVideo, generating, visualsGenerated } = useStudioStore();
    const { handleRegenerateImage } = useStudioActions();

    if (activeTab !== "script") return null;

    const displayScenes = activeVideo
        ? (activeVideo.scenes?.length ? activeVideo.scenes : activeVideo.script?.scenes) ?? []
        : [];

    const storyboardCost = estimateStoryboardCost(displayScenes.length);

    return (
        <div className="flex flex-col flex-1 h-full bg-[#F9F8F5] overflow-hidden relative">
            {/* Custom Validation Header */}
            <header className="shrink-0 flex items-center justify-between px-6 h-16 border-b border-zinc-100 bg-white  shadow-sm shadow-zinc-100/50">
                <div className="flex items-center gap-4 min-w-[320px]">
                    <button
                        onClick={() => router.push("/videos")}
                        className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-zinc-100 transition-all text-zinc-400 hover:text-zinc-900"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>

                    <div className="flex flex-col min-w-0">
                        <h1 className="text-[14px] font-black text-zinc-900 truncate tracking-tight">
                            {activeVideo?.title || activeVideo?.topic || "Projet sans titre"}
                        </h1>
                        <div className="flex items-center gap-2 mt-[-2px]">
                            <span className="text-[9px] font-black text-amber-500 uppercase tracking-widest bg-amber-50/50 px-1.5 py-0.5 rounded border border-amber-100/50 leading-none">
                                Validation Narrative
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    {onAnimate && (
                        <button
                            onClick={visualsGenerated ? () => {
                                useStudioStore.getState().setTab("storyboard");
                                router.push(pathname.replace("/script", "/storyboard"));
                            } : onAnimate}
                            disabled={generating}
                            className="flex items-center gap-3 h-10 px-6 rounded-xl bg-zinc-900 text-white text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-800 transition-all shadow-lg shadow-zinc-200 disabled:opacity-50 group shrink-0"
                        >
                            {generating ? (
                                <div className="h-3.5 w-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                            ) : visualsGenerated ? (
                                <Check className="h-3.5 w-3.5 text-emerald-400" />
                            ) : (
                                <Wand2 className="h-3.5 w-3.5 group-hover:rotate-12 transition-transform" />
                            )}
                            <span>{visualsGenerated ? "Suivant" : "Générer le storyboard"}</span>
                            {!visualsGenerated && !generating && storyboardCost > 0 && (
                                <span className="flex items-center gap-0.5 bg-white/10 border border-white/20 rounded-md px-1.5 py-0.5 text-[9px] font-black text-white/70 ml-1">
                                    <Zap className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                                    {storyboardCost}
                                </span>
                            )}
                        </button>
                    )}

                    {onShare && (
                        <button
                            onClick={onShare}
                            className="flex items-center gap-3 h-10 px-6 rounded-xl border border-zinc-200 bg-white text-zinc-900 text-[11px] font-bold uppercase tracking-widest hover:bg-zinc-50 transition-all shadow-sm shrink-0"
                        >
                            Partager
                        </button>
                    )}
                </div>
            </header>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-10 pt-12 pb-20 scrollbar-hide flex flex-col min-h-0">
                <div className="max-w-2xl mx-auto w-full flex-1">
                    {/* Discreet mention above editor */}
                    <div className="text-center">
                        <p className="text-[14px] text-zinc-400 font-medium leading-relaxed italic">
                            Vérifiez vos textes et prompts visuels avant de générer le storyboard.
                        </p>
                    </div>

                    <ScriptEditor
                        scenes={displayScenes}
                        onScenesChange={onScenesChange}
                        showImagePrompt={true}
                        onRegenerateImage={handleRegenerateImage}
                    />
                </div>
            </div>
        </div>
    );
}