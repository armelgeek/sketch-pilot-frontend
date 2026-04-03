"use client";

import { useState } from "react";
import { Plus, Trash2, Copy, Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { cn } from "@/src/lib/utils";

interface Scene {
    id: string;
    text: string;
    [key: string]: any;
}

interface ScriptEditorProps {
    scenes: Scene[];
    onScenesChange: (scenes: Scene[]) => void;
}

export function ScriptEditor({ scenes, onScenesChange }: ScriptEditorProps) {
    const [editingScenes, setEditingScenes] = useState<Scene[]>(scenes);

    const updateScenes = (newScenes: Scene[]) => {
        setEditingScenes(newScenes);
        onScenesChange(newScenes);
    };

    const handleTextChange = (id: string, field: string, value: string) => {
        const newScenes = editingScenes.map(s => {
            if (s.id === id) {
                const updated = { ...s, [field]: value };
                // Also update legacy/alt properties for compatibility
                if (field === 'narration') {
                    updated.text = value;
                    updated.content = value;
                }
                return updated;
            }
            return s;
        });
        updateScenes(newScenes);
    };

    const addScene = (index: number) => {
        const newScene: Scene = {
            id: `new-${Date.now()}`,
            text: "",
        };
        const newScenes = [...editingScenes];
        newScenes.splice(index + 1, 0, newScene);
        updateScenes(newScenes);
    };

    const duplicateScene = (index: number) => {
        const sceneToDuplicate = editingScenes[index];
        const newScene: Scene = {
            ...sceneToDuplicate,
            id: `dup-${Date.now()}`,
        };
        const newScenes = [...editingScenes];
        newScenes.splice(index + 1, 0, newScene);
        updateScenes(newScenes);
    };

    const deleteScene = (index: number) => {
        const newScenes = editingScenes.filter((_, i) => i !== index);
        updateScenes(newScenes);
    };

    return (
        <div className="space-y-3">
            {editingScenes.map((scene, index) => (
                <div key={scene.id} className="group relative flex gap-3 items-start animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${index * 40}ms` }}>
                    {/* Step number + connector */}
                    <div className="flex flex-col items-center shrink-0 pt-3">
                        <div className="flex items-center justify-center w-7 h-7 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-black border border-emerald-500/25">
                            {index + 1}
                        </div>
                        {index < editingScenes.length - 1 && (
                            <div className="w-px flex-1 min-h-[32px] bg-zinc-800 mt-1" />
                        )}
                    </div>

                    {/* Scene card */}
                    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group/card relative mb-2 hover:border-zinc-700 transition-colors">
                        {/* Hover actions */}
                        <div className="flex justify-end items-center opacity-0 group-hover/card:opacity-100 transition-opacity absolute top-2 right-2 z-10">
                            <div className="flex bg-zinc-800 rounded-lg border border-zinc-700 shadow-sm overflow-hidden">
                                <button
                                    onClick={() => duplicateScene(index)}
                                    className="p-1.5 hover:bg-zinc-700 text-zinc-500 hover:text-emerald-400 transition-colors"
                                    title="Dupliquer"
                                >
                                    <Copy className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    onClick={() => deleteScene(index)}
                                    className="p-1.5 hover:bg-zinc-700 text-zinc-500 hover:text-red-400 transition-colors"
                                    title="Supprimer"
                                    disabled={editingScenes.length <= 1}
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>

                        {/* Narration only */}
                        <div className="p-4">
                            <span className="text-[9px] uppercase font-black text-zinc-600 tracking-widest mb-2 block">Narration</span>
                            <Textarea
                                value={scene.narration || scene.text || scene.content || ""}
                                onChange={(e) => handleTextChange(scene.id, 'narration', e.target.value)}
                                placeholder="Ce qui sera dit par la voix off..."
                                className="min-h-[72px] resize-none border-none focus-visible:ring-0 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-700 p-0 leading-relaxed"
                            />
                        </div>
                    </div>

                    {/* Add scene button */}
                    <button
                        onClick={() => addScene(index)}
                        className="absolute -bottom-1 left-9 z-20 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                        <div className="bg-emerald-500 text-white rounded-full p-1 shadow-lg shadow-emerald-500/30">
                            <Plus className="h-3 w-3" />
                        </div>
                    </button>
                </div>
            ))}

            {editingScenes.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-zinc-800 rounded-2xl">
                    <p className="text-zinc-600 mb-4 text-sm">Aucune scène définie.</p>
                    <Button onClick={() => addScene(-1)} variant="outline" className="rounded-xl border-zinc-700 text-zinc-400 hover:bg-zinc-800">
                        <Plus className="mr-2 h-4 w-4" /> Ajouter une scène
                    </Button>
                </div>
            )}
        </div>
    );
}
