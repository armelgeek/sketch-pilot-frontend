"use client";

import { useStudioStore } from "../store";
import { Slider } from "@/src/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Timer, Wind, Layers } from "lucide-react";

export function StoryboardSceneControls() {
    const {
        selectedSceneId,
        sceneEdits,
        updateSceneEdit,
        activeVideo,
    } = useStudioStore();

    const displayScenes = (activeVideo?.scenes?.length ? activeVideo.scenes : activeVideo?.script?.scenes) || [];
    const activeScene = displayScenes.find((s: any, i: number) => (s.id || `s${i + 1}`) === selectedSceneId);

    if (!activeScene) return null;

    const currentDuration = sceneEdits[selectedSceneId]?.duration ?? activeScene.duration ?? 5;
    const currentAnimation = sceneEdits[selectedSceneId]?.animation ?? "ken-burns";
    const currentTransition = sceneEdits[selectedSceneId]?.transition ?? "fade";

    return (
        <div className="bg-white/80 backdrop-blur-sm border border-zinc-200/50 rounded-xl px-6 py-3 flex items-center justify-center gap-10 shadow-sm shrink-0 mx-auto w-fit">
            {/* Animation */}
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1.5 opacity-40">
                        <Wind className="h-3 w-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Animation</span>
                    </div>
                    <Select
                        value={currentAnimation}
                        onValueChange={(v) => updateSceneEdit(selectedSceneId, "animation", v)}>
                        <SelectTrigger className="h-8 min-w-[140px] bg-zinc-50/50 border-zinc-100 text-[11px] font-bold rounded-lg focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-zinc-200">
                            <SelectItem value="ken-burns" className="text-xs font-bold">Ken Burns (Auto)</SelectItem>
                            <SelectItem value="zoom-in" className="text-xs font-bold">Zoom In</SelectItem>
                            <SelectItem value="pan-right" className="text-xs font-bold">Pan Droite</SelectItem>
                            <SelectItem value="static" className="text-xs font-bold">Statique</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="h-8 w-px bg-zinc-100/50" />

            {/* Transition */}
            <div className="flex items-center gap-3">
                <div className="flex flex-col items-start gap-1">
                    <div className="flex items-center gap-1.5 opacity-40">
                        <Layers className="h-3 w-3" />
                        <span className="text-[9px] font-black uppercase tracking-widest">Transition</span>
                    </div>
                    <Select
                        value={currentTransition}
                        onValueChange={(v) => updateSceneEdit(selectedSceneId, "transition", v)}>
                        <SelectTrigger className="h-8 min-w-[140px] bg-zinc-50/50 border-zinc-100 text-[11px] font-bold rounded-lg focus:ring-0">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl border-zinc-200">
                            <SelectItem value="fade" className="text-xs font-bold">Fondu</SelectItem>
                            <SelectItem value="crossfade" className="text-xs font-bold">Crossfade</SelectItem>
                            <SelectItem value="none" className="text-xs font-bold">Coupure brute</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="h-8 w-px bg-zinc-100/50" />

            {/* Orientation Info */}
            <div className="flex flex-col items-end gap-1 px-4 py-1.5 border-l border-zinc-100/50">
                <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-tighter">Orientation</span>
                <span className="text-[11px] font-black text-emerald-600 uppercase tracking-[0.1em]">Optimisée</span>
            </div>
        </div>
    );
}
