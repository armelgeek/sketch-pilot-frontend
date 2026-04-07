"use client";

import { StoryboardCanvas } from "./StoryboardCanvas";
import { StoryboardFilmstrip } from "./StoryboardFilmstrip";
import { StoryboardSceneControls } from "./StoryboardSceneControls";
import { StoryboardSidebar } from "./StoryboardSidebar";
import { useStudioStore } from "../store";
import { useEffect } from "react";

interface StoryboardTabContentProps {
    currentSceneIndex?: number;
    repromptIndex?: number;
    onRegenerateImage: (sceneId: string, index: number, prompt?: string) => void;
}

export function StoryboardTabContent({
    currentSceneIndex,
    repromptIndex,
    onRegenerateImage
}: StoryboardTabContentProps) {
    const { activeTab, selectedSceneId, setSelectedSceneId, activeVideo } = useStudioStore();

    if (activeTab !== "storyboard") return null;

    const displayScenes = (activeVideo?.scenes?.length ? activeVideo.scenes : activeVideo?.script?.scenes) || [];

    // Auto-select first scene if nothing is selected or if current selection is invalid
    useEffect(() => {
        if (displayScenes.length > 0) {
            const currentSelectedExists = displayScenes.some((s: any, i: number) => (s.id || `s${i + 1}`) === selectedSceneId);
            if (!currentSelectedExists) {
                const firstId = displayScenes[0].id || "s1";
                setSelectedSceneId(firstId);
            }
        }
    }, [displayScenes, selectedSceneId, setSelectedSceneId]);

    const activeScene = displayScenes.find((s: any, i: number) => (s.id || `s${i + 1}`) === selectedSceneId);

    return (
        <div className="flex flex-1 overflow-hidden h-full px-12 pt-12 gap-6">
            {/* ── Vertical Filmstrip (Left Navigation) ── */}
            <div className="w-[110px] lg:w-[140px] shrink-0 bg-white border border-zinc-200/50 rounded-md flex flex-col h-[600px] max-h-[600px] overflow-y-auto scroll-m-0  shadow-sm">
                <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/40">
                    <h3 className="text-[11px] font-black text-zinc-400 uppercase tracking-[0.2em] opacity-80">Scenes</h3>
                    <span className="text-[11px] font-black text-zinc-300 tabular-nums">{displayScenes.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-6 space-y-4 scrollbar-hide">
                    <StoryboardFilmstrip vertical />
                </div>
            </div>

            {/* ── Main Work Area ── */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <div
                    className="flex-1 flex flex-col overflow-hidden relative"
                >
                    {activeScene ? (
                        <div className="flex flex-1 gap-6 min-h-0 overflow-hidden">
                            {/* Left Column: Adaptive Preview & Controls */}
                            <div className="flex-1 flex flex-col gap-6 min-w-0 relative z-10">
                                {/* Technical Controls ABOVE preview */}
                                <div className="max-w-3xl mx-auto w-full mb-6">
                                    <StoryboardSceneControls />
                                </div>

                                <div className="flex-1 flex min-h-0 bg-white  border border-zinc-200/50 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.12)] rounded-md">
                                    <div className="max-w-full max-h-full transition-all duration-300 relative group">
                                        <StoryboardCanvas
                                            currentSceneIndex={currentSceneIndex}
                                            repromptIndex={repromptIndex}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Right Column: Narrower Sidebar */}
                            <div className="w-[300px] xl:w-[320px] shrink-0 flex flex-col overflow-hidden">
                                <StoryboardSidebar onRegenerateImage={onRegenerateImage} />
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-center flex-1">
                            <p className="text-zinc-300 font-black uppercase text-[10px] tracking-widest italic">Sélectionnez une scène à gauche</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
