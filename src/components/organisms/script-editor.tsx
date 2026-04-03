"use client";

import { useState } from "react";
import { Plus, Trash2, Copy, Sparkles } from "lucide-react";
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
    showImagePrompt?: boolean;
}

export function ScriptEditor({ scenes, onScenesChange, showImagePrompt = false }: ScriptEditorProps) {
    const [editingScenes, setEditingScenes] = useState<Scene[]>(scenes);

    const updateScenes = (newScenes: Scene[]) => {
        setEditingScenes(newScenes);
        onScenesChange(newScenes);
    };

    const handleTextChange = (id: string, field: string, value: string) => {
        const newScenes = editingScenes.map(s => {
            if (s.id === id) {
                const updated = { ...s, [field]: value };
                if (field === "narration") {
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
        const newScene: Scene = { id: `new-${Date.now()}`, text: "" };
        const newScenes = [...editingScenes];
        newScenes.splice(index + 1, 0, newScene);
        updateScenes(newScenes);
    };

    const duplicateScene = (index: number) => {
        const newScene: Scene = { ...editingScenes[index], id: `dup-${Date.now()}` };
        const newScenes = [...editingScenes];
        newScenes.splice(index + 1, 0, newScene);
        updateScenes(newScenes);
    };

    const deleteScene = (index: number) => {
        updateScenes(editingScenes.filter((_, i) => i !== index));
    };

    return (
        <div className="space-y-2.5">
            {editingScenes.map((scene, index) => (
                <div
                    key={scene.id}
                    className="group relative flex gap-3 items-start animate-in fade-in slide-in-from-bottom-1 duration-200"
                    style={{ animationDelay: `${index * 30}ms` }}
                >
                    {/* Number + connector */}
                    <div className="flex flex-col items-center shrink-0 pt-3.5">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 text-[10px] font-black border border-zinc-700">
                            {index + 1}
                        </div>
                        {index < editingScenes.length - 1 && (
                            <div className="w-px flex-1 min-h-6 bg-zinc-800 mt-1" />
                        )}
                    </div>

                    {/* Card */}
                    <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden group/card relative mb-2 transition-colors hover:border-zinc-700 focus-within:border-zinc-600">

                        {/* Actions (on hover) */}
                        <div className="absolute top-2 right-2 z-10 flex gap-0.5 opacity-0 group-hover/card:opacity-100 transition-opacity">
                            <button
                                onClick={() => duplicateScene(index)}
                                title="Dupliquer"
                                className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-500 hover:text-emerald-400 hover:bg-zinc-700 transition-colors"
                            >
                                <Copy className="h-3 w-3" />
                            </button>
                            <button
                                onClick={() => deleteScene(index)}
                                title="Supprimer"
                                disabled={editingScenes.length <= 1}
                                className="p-1.5 rounded-md bg-zinc-800 border border-zinc-700 text-zinc-500 hover:text-red-400 hover:bg-zinc-700 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            >
                                <Trash2 className="h-3 w-3" />
                            </button>
                        </div>

                        {/* Narration */}
                        <div className="px-4 pt-4 pb-3">
                            <span className="text-[9px] uppercase font-black text-zinc-600 tracking-widest mb-2 block">
                                Narration
                            </span>
                            <Textarea
                                value={scene.narration || scene.text || scene.content || ""}
                                onChange={(e) => handleTextChange(scene.id, "narration", e.target.value)}
                                placeholder="Ce qui sera dit par la voix off…"
                                className="min-h-[64px] resize-none border-none focus-visible:ring-0 bg-transparent text-sm text-zinc-200 placeholder:text-zinc-700 p-0 leading-relaxed"
                            />
                        </div>

                        {/* Image prompt */}
                        {showImagePrompt && (
                            <div className="px-4 pt-2.5 pb-3.5 border-t border-zinc-800">
                                <div className="flex items-center gap-1.5 mb-2">
                                    <Sparkles className="h-3 w-3 text-zinc-600" />
                                    <span className="text-[9px] uppercase font-black text-zinc-600 tracking-widest">
                                        Prompt visuel
                                    </span>
                                </div>
                                <Textarea
                                    value={scene.imagePrompt || scene.prompt || ""}
                                    onChange={(e) => handleTextChange(scene.id, "imagePrompt", e.target.value)}
                                    placeholder="Décrivez ce que l'IA doit générer comme image…"
                                    className="min-h-[56px] resize-none border-none focus-visible:ring-0 bg-transparent text-sm text-zinc-400 placeholder:text-zinc-700 p-0 leading-relaxed"
                                />
                            </div>
                        )}
                    </div>

                    {/* Insert scene (+) */}
                    <button
                        onClick={() => addScene(index)}
                        title="Insérer une scène"
                        className="absolute -bottom-1 left-8 z-20 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
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
                    <Button
                        onClick={() => addScene(-1)}
                        variant="outline"
                        className="rounded-xl border-zinc-700 text-zinc-400 hover:bg-zinc-800"
                    >
                        <Plus className="mr-2 h-4 w-4" /> Ajouter une scène
                    </Button>
                </div>
            )}
        </div>
    );
}
