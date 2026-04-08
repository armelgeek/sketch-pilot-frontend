"use client";

import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Sparkles, RefreshCw, Copy, Trash2, Zap } from "lucide-react";
import { useStudioStore } from "../store";
import { CREDIT_COSTS } from "@/src/lib/credit-costs";

interface StoryboardSidebarProps {
    onRegenerateImage: (sceneId: string, index: number, prompt?: string) => void;
}

export function StoryboardSidebar({ onRegenerateImage }: StoryboardSidebarProps) {
    const {
        activeVideo,
        selectedSceneId,
        sceneEdits,
        updateSceneEdit,
        regeneratingSceneId,
        generating,
    } = useStudioStore();

    const displayScenes = (activeVideo?.scenes?.length ? activeVideo.scenes : activeVideo?.script?.scenes) || [];
    const activeSceneIndex = displayScenes.findIndex((s: any, i: number) => (s.id || `s${i + 1}`) === selectedSceneId);
    const activeScene = displayScenes[activeSceneIndex];

    if (!activeScene) return null;

    const currentImagePrompt = sceneEdits[selectedSceneId]?.imagePrompt ?? (activeScene.imagePrompt || activeScene.prompt || "");

    return (
        <div className="flex flex-col h-full gap-6 overflow-hidden">
            {/* 1. Script / Narration */}
            <div className="shrink-0 bg-white border border-zinc-200/60 rounded-xl flex flex-col shadow-sm overflow-hidden text-zinc-900">
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/30">
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest leading-none">Narration</span>
                </div>
                <div className="p-4 italic text-[15px] font-medium text-zinc-700 leading-relaxed bg-gradient-to-br from-white to-zinc-50/20">
                    "{activeScene?.narration || activeScene?.prompt || "Aucune narration disponible"}"
                </div>
            </div>

            {/* 2. Visual Prompt */}
            <div className="flex-1 min-h-0 bg-white border border-zinc-200/60 rounded-xl flex flex-col shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-100 bg-zinc-50/30">
                    <span className="text-[11px] font-black text-zinc-400 uppercase tracking-widest leading-none">Visual Prompt</span>
                    <span className="text-zinc-400 text-[10px] tabular-nums font-bold">{currentImagePrompt.length}/1000</span>
                </div>
                <div className="p-4 flex flex-col flex-1 gap-4 overflow-hidden">
                    <Textarea
                        value={currentImagePrompt}
                        onChange={(e) => updateSceneEdit(selectedSceneId, "imagePrompt", e.target.value)}
                        className="flex-1 min-h-0 bg-zinc-50/20 border-zinc-100 text-zinc-800 focus:border-zinc-300 focus:ring-0 text-[14px] resize-none rounded-lg leading-relaxed pt-3 transition-all placeholder:text-zinc-300 border-dashed"
                        placeholder="Décrivez l'image..." />

                    <Button
                        onClick={() => onRegenerateImage(selectedSceneId, activeSceneIndex, currentImagePrompt)}
                        disabled={!!regeneratingSceneId || generating}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black rounded-lg h-11 text-[11px] gap-2 uppercase tracking-tight shadow-md transition-all active:scale-95 shrink-0">
                        {regeneratingSceneId === selectedSceneId
                            ? <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                            : <Sparkles className="h-4 w-4 text-emerald-400" />}
                        Régénérer
                        <span className="flex items-center gap-0.5 bg-white/10 border border-white/20 rounded-md px-1.5 py-0.5 text-[9px] font-black text-white/70 ml-auto">
                            <Zap className="h-2.5 w-2.5 fill-amber-400 text-amber-400" />
                            {CREDIT_COSTS.IMAGE_REPROMPT}
                        </span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
