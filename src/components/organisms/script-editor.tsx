"use client";

import { useState, useRef, useEffect } from "react";
import { Copy, Trash2, Plus, Mic2, Sparkles, Pencil, Wand2, Loader2 } from "lucide-react";

interface Scene {
    id: string;
    text?: string;
    narration?: string;
    content?: string;
    imagePrompt?: string;
    prompt?: string;
    [key: string]: any;
}

interface ScriptEditorProps {
    scenes: Scene[];
    onScenesChange: (scenes: Scene[]) => void;
    showImagePrompt?: boolean;
    onRegenerateImage?: (sceneId: string, index: number, prompt: string) => Promise<any>;
}

function AutoResizeTextarea({
    value,
    onChange,
    placeholder,
    className,
}: {
    value: string;
    onChange: (v: string) => void;
    placeholder?: string;
    className?: string;
}) {
    const ref = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        if (ref.current) {
            ref.current.style.height = "auto";
            ref.current.style.height = ref.current.scrollHeight + "px";
        }
    }, [value]);

    return (
        <textarea
            ref={ref}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            rows={1}
            className={className}
            style={{ resize: "none", overflow: "hidden" }}
        />
    );
}

export function ScriptEditor({
    scenes,
    onScenesChange,
    showImagePrompt = false,
    onRegenerateImage,
}: ScriptEditorProps) {
    const [editingScenes, setEditingScenes] = useState<Scene[]>(scenes);
    const [regeneratingId, setRegeneratingId] = useState<string | null>(null);

    const updateScenes = (next: Scene[]) => {
        setEditingScenes(next);
        onScenesChange(next);
    };

    const handleChange = (id: string, field: string, value: string) => {
        updateScenes(
            editingScenes.map((s) => {
                if (s.id !== id) return s;
                const updated = { ...s, [field]: value };
                if (field === "narration") { updated.text = value; updated.content = value; }
                if (field === "imagePrompt") { updated.prompt = value; }
                return updated;
            })
        );
    };

    const addScene = (afterIndex: number) => {
        const next = [...editingScenes];
        next.splice(afterIndex + 1, 0, {
            id: `new-${Date.now()}`,
            text: "", narration: "", imagePrompt: "",
        });
        updateScenes(next);
    };

    const duplicate = (index: number) => {
        const next = [...editingScenes];
        next.splice(index + 1, 0, { ...editingScenes[index], id: `dup-${Date.now()}` });
        updateScenes(next);
    };

    const remove = (index: number) => {
        if (editingScenes.length <= 1) return;
        updateScenes(editingScenes.filter((_, i) => i !== index));
    };

    return (
        <div className="max-w-2xl mx-auto selection:bg-primary-elite/20">
            <div className="flex flex-col">
                {editingScenes.map((scene, index) => {
                    const num = String(index + 1).padStart(2, "0");
                    const narration = scene.narration ?? scene.text ?? scene.content ?? "";
                    const imagePrompt = scene.imagePrompt ?? scene.prompt ?? "";

                    return (
                        <div key={scene.id} className="relative">
                            {/* Vertical thread */}
                            {index < editingScenes.length - 1 && (
                                <div className="absolute left-4 top-10 bottom-0 w-px bg-gray-200 hidden md:block" />
                            )}

                            {/* Scene row */}
                            <div className="flex items-start gap-6 py-8 group/row">
                                {/* Dot */}
                                <div className="hidden md:flex shrink-0 mt-0.5 w-8 h-8 rounded-full border border-zinc-200 bg-white items-center justify-center transition-all duration-300 group-hover/row:border-primary-elite/30 group-hover/row:shadow-[0_0_15px_rgba(245,158,11,0.1)] relative z-10">
                                    <span className="text-[10px] font-extrabold text-zinc-400 tabular-nums transition-colors group-hover/row:text-primary-elite">
                                        {num}
                                    </span>
                                </div>

                                {/* Card */}
                                <div className="flex-1 rounded-2xl border border-zinc-100/80 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.02)] overflow-hidden transition-all duration-300 hover:shadow-[0_12px_40px_rgb(0,0,0,0.04)] hover:border-zinc-200/60 focus-within:ring-2 focus-within:ring-primary-elite/10 focus-within:border-primary-elite/40 group/card">

                                    {/* Card header */}
                                    <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-50/80">
                                        <span className="text-[10px] font-extrabold tracking-[0.15em] uppercase bg-amber-100 text-amber-500">
                                            Séquence {num}
                                        </span>
                                        <div className="flex gap-1.5 opacity-0 group-hover/card:opacity-100 focus-within:opacity-100 transition-all duration-200 translate-y-1 group-hover/card:translate-y-0">
                                            <button
                                                onClick={() => duplicate(index)}
                                                className="h-8 w-8 rounded-lg border border-zinc-100 bg-white shadow-sm flex items-center justify-center text-zinc-400 hover:text-primary-elite hover:border-primary-elite/20 hover:shadow-primary-elite/5 transition-all"
                                                title="Dupliquer"
                                            >
                                                <Copy className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => remove(index)}
                                                disabled={editingScenes.length <= 1}
                                                className="h-8 w-8 rounded-lg border border-zinc-100 bg-white shadow-sm flex items-center justify-center text-zinc-400 hover:text-red-500 hover:bg-red-50/50 hover:border-red-100 transition-all disabled:opacity-20 disabled:pointer-events-none"
                                                title="Supprimer"
                                            >
                                                <Trash2 className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>

                                    {/* Card body */}
                                    <div className="px-6 py-2s space-y-2">

                                        {/* Narration */}
                                        <div className="group/field">
                                            <div className="flex items-center gap-2 mb-3">
                                                <div className="p-1 rounded-md bg-amber-50 group-hover/field:bg-amber-100 transition-colors flex items-center gap-1.5 pr-2">
                                                    <Mic2 className="h-3.5 w-3.5 text-primary-elite" />
                                                    <Pencil className="h-2.5 w-2.5 text-primary-elite/40" />
                                                </div>
                                                <span className="text-[10px] font-extrabold tracking-[0.1em] uppercase text-zinc-400">
                                                    Narration
                                                </span>
                                            </div>
                                            <AutoResizeTextarea
                                                value={narration}
                                                onChange={(v) => handleChange(scene.id, "narration", v)}
                                                placeholder="Que dit la voix-off ?"
                                                className="w-full bg-transparent border-none outline-none text-[16px] leading-[1.6] text-zinc-800 placeholder:text-zinc-200  font-medium"
                                            />
                                        </div>

                                        {/* Image prompt */}
                                        {showImagePrompt && (
                                            <div className="pt-6 border-t border-zinc-50/80 group/field-prompt">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="p-1 rounded-md bg-zinc-50 group-hover/field-prompt:bg-zinc-100 transition-colors flex items-center gap-1.5 pr-2">
                                                        <Sparkles className="h-3.5 w-3.5 text-zinc-400 group-hover/field-prompt:text-primary-elite transition-colors" />
                                                        <Pencil className="h-2.5 w-2.5 text-zinc-300 group-hover/field-prompt:text-primary-elite/40 transition-colors" />
                                                    </div>
                                                    <span className="text-[10px] font-extrabold tracking-[0.1em] uppercase text-zinc-400">
                                                        Prompt visuel
                                                    </span>
                                                </div>
                                                <div className="bg-zinc-50/40 rounded-xl px-4 py-4 border border-zinc-100/50 focus-within:bg-zinc-50 transition-colors relative group/prompt-box">
                                                    <AutoResizeTextarea
                                                        value={imagePrompt}
                                                        onChange={(v) => handleChange(scene.id, "imagePrompt", v)}
                                                        placeholder="Décrivez l'image ou l'ambiance visuelle…"
                                                        className="w-full bg-transparent border-none outline-none text-[14px] leading-relaxed text-zinc-500 italic placeholder:text-zinc-300 pr-10"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Insert between */}
                            {index < editingScenes.length - 1 && (
                                <div className="flex items-center gap-3 pl-14 h-0 overflow-visible relative z-10 group/insert">
                                    <button
                                        onClick={() => addScene(index)}
                                        className="h-7 w-7 -mt-3.5 rounded-full border border-zinc-200 bg-white shadow-sm flex items-center justify-center text-zinc-400 hover:border-primary-elite/40 hover:text-primary-elite hover:scale-110 transition-all duration-300"
                                        title="Insérer une séquence"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </button>
                                    <div className="h-px bg-zinc-100 flex-1 -mt-3.5 opacity-0 group-hover/insert:opacity-100 transition-opacity" />
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Footer add */}
            <div className="mt-12 flex justify-center">
                <button
                    onClick={() => addScene(editingScenes.length - 1)}
                    className="flex items-center gap-2.5 h-11 px-8 rounded-full border border-zinc-200 bg-white shadow-sm text-[12px] font-extrabold tracking-widest uppercase text-zinc-500 hover:bg-zinc-900 hover:text-white hover:border-zinc-900 hover:-translate-y-0.5 transition-all duration-300"
                >
                    <Plus className="h-4 w-4" />
                    Nouvelle séquence
                </button>
            </div>
        </div>
    );
}