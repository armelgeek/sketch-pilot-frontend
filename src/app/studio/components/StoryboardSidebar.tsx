"use client";

import { Textarea } from "@/src/components/ui/textarea";
import { Button } from "@/src/components/ui/button";
import { Sparkles, RefreshCw, Zap, BookOpen, ChevronUp, ChevronDown, Crown } from "lucide-react";
import { useStudioStore } from "../store";
import { useEffect, useState } from "react";
import { seriesService, type Series } from "@/src/services/series-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { cn } from "@/src/lib/utils";

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

    const [series, setSeries] = useState<Series | null>(null);
    const [showBible, setShowBible] = useState(false);
    const [regeneratingChar, setRegeneratingChar] = useState<string | null>(null);

    const refreshSeries = async () => {
        if (activeVideo?.seriesId) {
            const fresh = await seriesService.getById(activeVideo.seriesId);
            setSeries(fresh);
        }
    };

    useEffect(() => {
        refreshSeries();
    }, [activeVideo?.seriesId]);

    const handleRegenerateChar = async (name: string) => {
        if (!series?.id) return;
        setRegeneratingChar(name);
        try {
            await seriesService.regenerateCharacterImage(series.id, name);
            await refreshSeries();
        } catch (error) {
            console.error("Failed to regenerate character image:", error);
        } finally {
            setRegeneratingChar(null);
        }
    };

    const [promoting, setPromoting] = useState<string | null>(null);

    const handlePromote = async (name: string, type: 'character' | 'location') => {
        if (!series?.id || !activeScene?.thumbnailUrl) return;
        setPromoting(name);
        try {
            await seriesService.promote(series.id, {
                type,
                name,
                thumbnailUrl: activeScene.thumbnailUrl
            });
            await refreshSeries();
            alert(`"${name}" a été promu avec cette image.`);
        } catch (error) {
            console.error("Failed to promote item:", error);
            alert("Erreur lors de la promotion.");
        } finally {
            setPromoting(null);
        }
    };

    const displayScenes = (activeVideo?.scenes?.length ? activeVideo.scenes : activeVideo?.script?.scenes) || [];
    const activeSceneIndex = displayScenes.findIndex((s: any, i: number) => (s.id || `s${i + 1}`) === selectedSceneId);
    const activeScene = displayScenes[activeSceneIndex];

    if (!activeScene) return null;

    const currentImagePrompt = sceneEdits[selectedSceneId]?.imagePrompt ?? (activeScene.imagePrompt || activeScene.prompt || "");

    return (
        <div className="flex flex-col h-full gap-6 overflow-y-auto scrollbar-hide pb-8">
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

            {/* 3. Series Context (Always show if it's a series video) */}
            {(series || activeVideo?.seriesId) && (
                <div className="shrink-0 flex flex-col gap-3 pb-6 border-t border-zinc-100 pt-6 mt-2">
                    <div className="flex items-center gap-2 px-1">
                        <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Saga Continuity</div>
                    </div>

                    {series ? (
                        <>
                            {/* Bible Collapsible */}
                            <div className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden shadow-sm">
                                <button
                                    onClick={() => setShowBible(!showBible)}
                                    className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-zinc-50/50 transition-colors"
                                >
                                    <div className="flex items-center gap-2">
                                        <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                                        <span className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">Bible Narrative</span>
                                    </div>
                                    {showBible ? <ChevronUp className="h-3.5 w-3.5 text-zinc-300" /> : <ChevronDown className="h-3.5 w-3.5 text-zinc-300" />}
                                </button>
                                {showBible && (
                                    <div className="px-4 pb-4 pt-0">
                                        <p className="text-[12px] text-zinc-500 leading-relaxed font-medium">
                                            {series.globalContext || "Aucune bible définie pour cette saga."}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Casting List */}
                            <div className="bg-white border border-zinc-200/60 rounded-xl overflow-hidden shadow-sm">
                                <div className="px-4 py-2.5 border-b border-zinc-50 flex items-center gap-2 bg-zinc-50/30">
                                    <Sparkles className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="text-[11px] font-black text-zinc-900 uppercase tracking-tight">Casting</span>
                                </div>
                                <div className="p-2 space-y-1">
                                    {series.characterRegistry && Object.keys(series.characterRegistry).length > 0 ? (
                                        Object.entries(series.characterRegistry).map(([name, char]: [string, any]) => (
                                            <div key={name} className="flex items-center gap-3 p-2 rounded-lg hover:bg-zinc-50 transition-colors group">
                                                <div className="relative shrink-0">
                                                    <Avatar className="h-10 w-10 rounded-lg border border-zinc-200">
                                                        <AvatarImage src={char.thumbnailUrl} className="object-cover" />
                                                        <AvatarFallback className="text-[10px] font-bold bg-zinc-100 text-zinc-400">
                                                            {name.slice(0, 2).toUpperCase()}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    {regeneratingChar === name && (
                                                        <div className="absolute inset-0 bg-white/60 flex items-center justify-center rounded-lg">
                                                            <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex flex-col min-w-0 flex-1">
                                                    <span className="text-[13px] font-bold text-zinc-900 truncate tracking-tight">{name}</span>
                                                    <span className="text-[11px] text-zinc-400 line-clamp-1 italic">{char.description}</span>
                                                </div>
                                                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handlePromote(name, 'character')}
                                                        disabled={!!promoting || !activeScene?.thumbnailUrl}
                                                        title="Promouvoir l'image actuelle comme portrait"
                                                        className="h-8 w-8 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-amber-500"
                                                    >
                                                        {promoting === name ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Crown className="h-3.5 w-3.5" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleRegenerateChar(name)}
                                                        disabled={!!regeneratingChar}
                                                        title="Régénérer le portrait (IA)"
                                                        className="h-8 w-8 rounded-lg hover:bg-zinc-100 text-zinc-400 hover:text-emerald-500"
                                                    >
                                                        <RefreshCw className={cn("h-3.5 w-3.5", regeneratingChar === name && "animate-spin")} />
                                                    </Button>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-4 text-center">
                                            <p className="text-[10px] text-zinc-400 font-bold uppercase italic">Aucun personnage récurrent</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="bg-zinc-50 border border-dashed border-zinc-200 rounded-xl p-4 flex items-center justify-center">
                            <RefreshCw className="h-4 w-4 animate-spin text-zinc-300" />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
