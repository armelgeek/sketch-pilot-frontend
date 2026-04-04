"use client";

import { StoryboardCanvas } from "./StoryboardCanvas";
import { StoryboardFilmstrip } from "./StoryboardFilmstrip";
import { StoryboardSceneControls } from "./StoryboardSceneControls";
import { StoryboardSidebar } from "./StoryboardSidebar";
import { useStudioStore } from "../store";

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
    const { activeTab, selectedSceneId, activeVideo } = useStudioStore();

    if (activeTab !== "storyboard") return null;

    const displayScenes = (activeVideo?.scenes?.length ? activeVideo.scenes : activeVideo?.script?.scenes) || [];
    const activeScene = displayScenes.find((s: any, i: number) => (s.id || `s${i + 1}`) === selectedSceneId);

    return (
        <div className="flex flex-1 overflow-hidden h-full">
            {/* ── Vertical Filmstrip (Left Navigation) ── */}
            <div className="w-[100px] lg:w-[140px] shrink-0 bg-white border-r border-zinc-200/80 mt-3 flex flex-col h-full overflow-hidden">
                <div className="p-5 border-b border-zinc-100 flex items-center justify-between bg-zinc-50/40">
                    <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] opacity-80">Scenes</h3>
                    <span className="text-[10px] font-black text-zinc-300 tabular-nums">{displayScenes.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto px-3 py-6 space-y-4 scrollbar-hide">
                    <StoryboardFilmstrip vertical />
                </div>
            </div>

            {/* ── Main Work Area ── */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0">
                <div
                    className="flex-1 flex flex-col overflow-hidden bg-[#F8F8F7] relative"
                >
                    {activeScene ? (
                        <div className="flex flex-1 gap-8 min-h-0 overflow-hidden px-8 py-6">
                            {/* Left Column: Adaptive Preview & Controls */}
                            <div className="flex-1 flex flex-col gap-8 min-w-0 relative z-10">
                                <div className="flex-1 flex items-center justify-center min-h-0">
                                    <div className="max-w-full max-h-full transition-all duration-500 relative group">
                                        <StoryboardCanvas
                                            currentSceneIndex={currentSceneIndex}
                                            repromptIndex={repromptIndex}
                                        />
                                    </div>
                                </div>

                                {/* Restored Technical Controls below preview */}
                                <div className="max-w-4xl mx-auto w-full">
                                    <StoryboardSceneControls />
                                </div>
                            </div>

                            {/* Right Column: Narrower Sidebar */}
                            <div className="w-[340px] xl:w-[380px] shrink-0 flex flex-col overflow-hidden bg-white/40 backdrop-blur-sm rounded-3xl border border-zinc-200/50 p-1">
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
