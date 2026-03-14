"use client";

import { useState } from "react";
import { Plus, Trash2, Copy, GripVertical, Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
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
        <div className="space-y-4">
            {editingScenes.map((scene, index) => (
                <div key={scene.id} className="group relative flex gap-4 items-start animate-in fade-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                    <div className="flex flex-col items-center gap-2 pt-4">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
                            {index + 1}
                        </div>
                        <div className="w-0.5 h-full bg-zinc-100 dark:bg-zinc-800/50 rounded-full min-h-[40px]" />
                    </div>

                    <Card className="flex-1 glass-pill border-none shadow-md hover:shadow-lg transition-shadow overflow-hidden group/card relative">
                        <CardContent className="p-4">
                            <div className="flex justify-between items-start mb-2 opacity-0 group-hover:opacity-100 transition-opacity absolute top-2 right-2 z-10">
                                <div className="flex bg-white/80 dark:bg-zinc-900/80 backdrop-blur rounded-lg border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-hidden">
                                    <button
                                        onClick={() => duplicateScene(index)}
                                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-emerald-500 transition-colors"
                                        title="Dupliquer"
                                    >
                                        <Copy className="h-4 w-4" />
                                    </button>
                                    <button
                                        onClick={() => deleteScene(index)}
                                        className="p-1.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500 hover:text-red-500 transition-colors"
                                        title="Supprimer"
                                        disabled={editingScenes.length <= 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mb-1 block">Narration</span>
                                    <Textarea
                                        value={scene.narration || scene.text || scene.content || ""}
                                        onChange={(e) => handleTextChange(scene.id, 'narration', e.target.value)}
                                        placeholder="Ce qui sera dit par la voix off..."
                                        className="min-h-[80px] resize-none border-none focus-visible:ring-0 bg-transparent text-lg p-0"
                                    />
                                </div>
                                <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
                                    <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mb-1 block">Résumé Visuel</span>
                                    <Textarea
                                        value={scene.visualDescription || scene.visualPrompt || scene.summary || ""}
                                        onChange={(e) => handleTextChange(scene.id, 'visualDescription', e.target.value)}
                                        placeholder="Ce qui se passe visuellement..."
                                        className="min-h-[60px] resize-none border-none focus-visible:ring-0 bg-zinc-50/50 dark:bg-zinc-900/30 text-sm p-2 rounded-lg italic text-zinc-500"
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <button
                        onClick={() => addScene(index)}
                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 z-20 opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                        <div className="bg-emerald-500 text-white rounded-full p-1.5 shadow-lg shadow-emerald-500/30">
                            <Plus className="h-4 w-4" />
                        </div>
                    </button>
                </div>
            ))}

            {editingScenes.length === 0 && (
                <div className="text-center py-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl">
                    <p className="text-zinc-500 mb-4">Aucune scène définie.</p>
                    <Button onClick={() => addScene(-1)} variant="outline" className="rounded-xl">
                        <Plus className="mr-2 h-4 w-4" /> Ajouter une scène
                    </Button>
                </div>
            )}
        </div>
    );
}
