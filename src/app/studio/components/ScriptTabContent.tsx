"use client";

import { ScriptEditor } from "@/src/components/organisms/script-editor";
import { useStudioStore } from "../store";

interface ScriptTabContentProps {
    onScenesChange: (newScenes: any[]) => void;
    onSaveScript: () => void;
}

export function ScriptTabContent({ onScenesChange, onSaveScript }: ScriptTabContentProps) {
    const { activeTab, activeVideo } = useStudioStore();

    if (activeTab !== "script") return null;

    const displayScenes = activeVideo
        ? ((activeVideo.scenes?.length ? activeVideo.scenes : activeVideo.script?.scenes) || [])
        : [];

    return (
        <div className="flex flex-col h-full bg-[#0E0E10]">
            {/* Sub-header */}
            <div className="flex items-center justify-between px-5 py-3 border-b border-zinc-800 shrink-0">
                <div>
                    <p className="text-xs font-bold text-zinc-200 leading-none">Script & Prompts visuels</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">
                        {displayScenes.length} scène{displayScenes.length !== 1 ? "s" : ""}
                        {" · "}Éditez la narration et les prompts avant de générer les visuels
                    </p>
                </div>
                <button
                    onClick={onSaveScript}
                    className="text-[10px] text-zinc-500 hover:text-emerald-400 transition-colors font-bold uppercase tracking-widest">
                    Sauvegarder
                </button>
            </div>

            <div className="flex-1 overflow-y-auto py-5 px-5">
                <div className="max-w-2xl mx-auto">
                    <ScriptEditor
                        scenes={displayScenes}
                        onScenesChange={onScenesChange}
                        showImagePrompt={true}
                    />
                </div>
            </div>
        </div>
    );
}
