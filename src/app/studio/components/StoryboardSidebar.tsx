"use client";

import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Sparkles, RefreshCw, Copy, Trash2 } from "lucide-react";
import { useStudioStore } from "../store";

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
        <div className="flex flex-col h-full gap-5 overflow-hidden">
            {/* 1. Script / Narration */}
            <div className="shrink-0 bg-white border border-zinc-200/80 rounded-2xl flex flex-col shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 bg-zinc-50/50">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Script / Narration</span>
                </div>
                <div className="p-5 italic text-[15px] font-medium text-zinc-800 leading-relaxed bg-gradient-to-br from-white to-zinc-50/30">
                    "{activeScene?.narration || activeScene?.prompt || "Aucune narration disponible"}"
                </div>
            </div>

            {/* 2. Visual Prompt */}
            <div className="flex-1 min-h-0 bg-white border border-zinc-200/80 rounded-2xl flex flex-col shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-100 bg-zinc-50/50">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest leading-none">Visual Prompt (IA)</span>
                    <span className="text-zinc-300 text-[10px] tabular-nums font-black">{currentImagePrompt.length}/1000</span>
                </div>
                <div className="p-4 flex flex-col flex-1 gap-4 overflow-hidden">
                    <Textarea
                        value={currentImagePrompt}
                        onChange={(e) => updateSceneEdit(selectedSceneId, "imagePrompt", e.target.value)}
                        className="flex-1 min-h-0 bg-zinc-50/50 border-zinc-100 text-zinc-800 focus:border-emerald-500/50 focus:ring-4 focus:ring-emerald-500/5 text-sm resize-none rounded-xl leading-relaxed pt-3 transition-all placeholder:text-zinc-300 border-dashed"
                        placeholder="Décrivez l'image..." />

                    <Button
                        onClick={() => onRegenerateImage(selectedSceneId, activeSceneIndex, currentImagePrompt)}
                        disabled={!!regeneratingSceneId || generating}
                        className="w-full bg-zinc-900 hover:bg-zinc-800 text-white font-black rounded-xl h-11 text-[11px] gap-2 uppercase tracking-tight shadow-lg shadow-zinc-200 transition-all active:scale-95 shrink-0">
                        {regeneratingSceneId === selectedSceneId
                            ? <RefreshCw className="h-4 w-4 animate-spin text-emerald-400" />
                            : <Sparkles className="h-4 w-4 text-emerald-400" />}
                        Régénérer le visuel
                    </Button>
                </div>
            </div>

            {/* 3. Bottom Actions */}
            <div className="grid grid-cols-2 gap-3 shrink-0">
                <Button variant="outline" className="h-10 font-black text-[10px] uppercase tracking-widest border-zinc-200 text-zinc-500 hover:bg-zinc-50 rounded-xl active:scale-95">
                    <Copy className="h-4 w-4 mr-2 opacity-50" /> Dupliquer
                </Button>
                <Button variant="outline" className="h-10 font-black text-[10px] uppercase tracking-widest border-red-100 text-red-500 hover:bg-red-50 rounded-xl active:scale-95">
                    <Trash2 className="h-4 w-4 mr-2 opacity-50" /> Supprimer
                </Button>
            </div>
        </div>
    );
}
