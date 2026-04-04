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
        <div className="bg-white border border-zinc-200/80 rounded-xl p-4 flex items-center gap-8 shadow-sm shrink-0 overflow-x-auto scrollbar-hide">


            {/* Animation */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                    <Wind className="h-3 w-3 text-zinc-400" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Animation</span>
                </div>
                <Select
                    value={currentAnimation}
                    onValueChange={(v) => updateSceneEdit(selectedSceneId, "animation", v)}>
                    <SelectTrigger className="h-8 bg-zinc-50 border-zinc-200 text-[11px] font-bold rounded-lg focus:ring-0">
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

            {/* Transition */}
            <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1.5">
                    <Layers className="h-3 w-3 text-zinc-400" />
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Transition</span>
                </div>
                <Select
                    value={currentTransition}
                    onValueChange={(v) => updateSceneEdit(selectedSceneId, "transition", v)}>
                    <SelectTrigger className="h-8 bg-zinc-50 border-zinc-200 text-[11px] font-bold rounded-lg focus:ring-0">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl border-zinc-200">
                        <SelectItem value="fade" className="text-xs font-bold">Fondu</SelectItem>
                        <SelectItem value="crossfade" className="text-xs font-bold">Crossfade</SelectItem>
                        <SelectItem value="none" className="text-xs font-bold">Coupure brute</SelectItem>
                    </SelectContent>
                </Select>
            </div>


            {/* Scene Info */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-50 rounded-lg border border-zinc-100">
                <div className="flex flex-col items-end">
                    <span className="text-[8px] font-black text-zinc-400 uppercase">Orientation</span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">Optimisée</span>
                </div>
            </div>
        </div>
    );
}
