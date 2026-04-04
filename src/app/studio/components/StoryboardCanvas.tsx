"use client";

import { Wand2, RefreshCw, Film, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useStudioStore } from "../store";

interface StoryboardCanvasProps {
    currentSceneIndex?: number;
    repromptIndex?: number;
}

export function StoryboardCanvas({ currentSceneIndex, repromptIndex }: StoryboardCanvasProps) {
    const {
        activeVideo,
        selectedSceneId,
        regeneratingSceneId,
    } = useStudioStore();

    const displayScenes = (activeVideo?.scenes?.length ? activeVideo.scenes : activeVideo?.script?.scenes) || [];
    const activeSceneIndex = displayScenes.findIndex((s: any, i: number) => (s.id || `s${i + 1}`) === selectedSceneId);
    const activeScene = displayScenes[activeSceneIndex];

    if (!activeScene) {
        return (
            <div className="flex items-center justify-center flex-1 bg-[#F8F8F7]">
                <p className="text-zinc-400 text-sm">Sélectionnez une scène ci-dessous</p>
            </div>
        );
    }

    const isGenerating = currentSceneIndex === activeSceneIndex || repromptIndex === activeSceneIndex;
    const isRegenerating = regeneratingSceneId === selectedSceneId;

    const goToPrev = () => {
        if (activeSceneIndex > 0) {
            const prevScene = displayScenes[activeSceneIndex - 1];
            useStudioStore.getState().setSelectedSceneId(prevScene.id || `s${activeSceneIndex}`);
        }
    };

    const goToNext = () => {
        if (activeSceneIndex < displayScenes.length - 1) {
            const nextScene = displayScenes[activeSceneIndex + 1];
            useStudioStore.getState().setSelectedSceneId(nextScene.id || `s${activeSceneIndex + 2}`);
        }
    };

    return (
        <div className="flex flex-col justify-center h-full w-full">
            <div className="relative group max-w-full max-h-full  rounded-xl overflow-hidden">
                {/* Generation overlay */}
                {(isGenerating || isRegenerating) && (
                    <div className="absolute inset-0 bg-white/80 flex flex-col items-center justify-center gap-4 z-40 animate-in fade-in duration-500">
                        <Wand2 className="h-8 w-8 text-emerald-500 animate-pulse" />
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Génération...</p>
                    </div>
                )}

                {/* Reprompt overlay */}
                {isRegenerating && (
                    <div className="absolute inset-0 bg-white/50 backdrop-blur-sm flex items-center justify-center z-20">
                        <RefreshCw className="h-8 w-8 text-emerald-500 animate-spin" />
                    </div>
                )}

                {activeScene.imageUrl ? (
                    <img
                        src={activeScene.imageUrl}
                        className="max-w-full max-h-[70vh] w-auto h-auto object-contain block ring-1 ring-zinc-100"
                        alt={`Scène ${activeSceneIndex + 1}`}
                    />
                ) : (
                    <div className="w-[600px] aspect-video flex flex-col items-center justify-center bg-zinc-50">
                        <Film className="h-12 w-12 mb-3 text-zinc-200" />
                        <p className="text-xs text-zinc-400">Aucun visuel</p>
                    </div>
                )}

                {/* Simple Badge */}
                <div className="absolute top-4 left-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest z-30">
                    {activeSceneIndex + 1} / {displayScenes.length}
                </div>

                {/* Navigation Chevrons (Refined) */}
                <div className="absolute inset-y-0 left-4 flex items-center z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-x-1 group-hover:translate-x-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); goToPrev(); }}
                        disabled={activeSceneIndex === 0}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-zinc-900 border border-zinc-200/50 hover:bg-white shadow-xl transition-all disabled:opacity-0 active:scale-90">
                        <ChevronLeft className="h-5 w-5" />
                    </button>
                </div>
                <div className="absolute inset-y-0 right-4 flex items-center z-30 opacity-0 group-hover:opacity-100 transition-all duration-300 -translate-x-1 group-hover:translate-x-0">
                    <button
                        onClick={(e) => { e.stopPropagation(); goToNext(); }}
                        disabled={activeSceneIndex === displayScenes.length - 1}
                        className="h-10 w-10 flex items-center justify-center rounded-full bg-white/80 backdrop-blur-md text-zinc-900 border border-zinc-200/50 hover:bg-white shadow-xl transition-all disabled:opacity-0 active:scale-90">
                        <ChevronRight className="h-5 w-5" />
                    </button>
                </div>
            </div>
        </div>
    );
}
