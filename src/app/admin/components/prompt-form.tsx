"use client";

import { useState } from "react";
import {
    Grid3X3,
    FileText,
    Terminal,
    ArrowLeft,
    Save
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { cn } from "@/src/lib/utils";

export interface PromptFormData {
    name: string;
    role: string;
    context: string;
    audienceDefault: string;
    task: string;
    goals: string[];
    structure: string;
    rules: string[];
    formatting: string;
    outputFormat: string;
    instructions: string[];
    description?: string;
    isActive: boolean;
}

interface PromptFormProps {
    initialData: Partial<PromptFormData>;
    onSubmit: (data: PromptFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    title: string;
}

export function PromptForm({ initialData, onSubmit, onCancel, isLoading, title }: PromptFormProps) {
    const [formData, setFormData] = useState<any>({
        isActive: true,
        ...initialData
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            <div className="flex items-center justify-between bg-white dark:bg-zinc-900 p-6 rounded-[32px] shadow-xl shadow-zinc-200/50 dark:shadow-none sticky top-0 z-10 border border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="rounded-full h-10 w-10"
                        onClick={onCancel}
                    >
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter">{title}</h1>
                        <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Configuration du Prompt Système</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        type="button"
                        variant="ghost"
                        className="rounded-2xl font-bold px-6 h-11"
                        onClick={onCancel}
                    >
                        Annuler
                    </Button>
                    <Button
                        type="submit"
                        disabled={isLoading}
                        className="bg-black hover:bg-zinc-800 text-white rounded-2xl font-black px-8 h-11 shadow-xl gap-2 transition-all active:scale-95"
                    >
                        <Save className="h-4 w-4" />
                        {isLoading ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* --- Section 1: Paramètres Généraux --- */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] shadow-xl shadow-zinc-200/40 dark:shadow-none border border-zinc-50 dark:border-zinc-800 space-y-8">
                        <div className="flex items-center gap-3 pb-2">
                            <div className="h-10 w-10 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                                <Grid3X3 className="w-5 h-5 text-zinc-400" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Paramètres Généraux</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label className="font-bold text-zinc-900 dark:text-zinc-100 ml-1">Nom du prompt (ID unique)</Label>
                                <Input
                                    placeholder="Ex: video-script-generator"
                                    className="rounded-2xl h-12 bg-zinc-50 dark:bg-zinc-800/50 border-none font-bold focus-visible:ring-black transition-all"
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                />
                                <p className="text-[10px] text-zinc-400 font-medium ml-2 italic">L'identifiant utilisé par le système pour résoudre ce prompt.</p>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="font-bold text-zinc-900 dark:text-zinc-100 uppercase text-[10px] tracking-widest ml-1">Description</Label>
                                <Input
                                    placeholder="À quoi sert ce prompt ?"
                                    className="rounded-2xl h-12 bg-zinc-50 dark:bg-zinc-800/50 border-none font-medium focus-visible:ring-black transition-all"
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                />
                            </div>

                            <div className="flex items-center gap-3 pt-2 ml-1">
                                <input
                                    type="checkbox"
                                    id="isActive"
                                    className="h-5 w-5 rounded-lg border-zinc-200 text-black focus:ring-black accent-black cursor-pointer"
                                    checked={formData.isActive}
                                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                                />
                                <Label htmlFor="isActive" className="font-black cursor-pointer text-sm">Prompt Actif</Label>
                            </div>
                        </div>
                    </div>

                    {/* --- Section 2: Spécification --- */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] shadow-xl shadow-zinc-200/40 dark:shadow-none border border-zinc-50 dark:border-zinc-800 space-y-8">
                        <div className="flex items-center gap-3 pb-2">
                            <div className="h-10 w-10 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                                <FileText className="w-5 h-5 text-zinc-400" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Spécification du Système</h3>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2 md:col-span-2">
                                <Label className="font-bold text-zinc-900 dark:text-zinc-100 uppercase text-[10px] tracking-widest ml-1">Role IA</Label>
                                <Input
                                    placeholder="Ex: Storytelling Director"
                                    className="rounded-2xl h-12 bg-zinc-50 dark:bg-zinc-800/50 border-none font-bold focus-visible:ring-black transition-all"
                                    value={formData.role || ""}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="font-bold text-zinc-900 dark:text-zinc-100 uppercase text-[10px] tracking-widest ml-1">Audience par défaut</Label>
                                <Input
                                    placeholder="Ex: General audience interested in psychology"
                                    className="rounded-2xl h-12 bg-zinc-50 dark:bg-zinc-800/50 border-none font-bold focus-visible:ring-black transition-all"
                                    value={formData.audienceDefault || ""}
                                    onChange={(e) => setFormData({ ...formData, audienceDefault: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="font-bold text-zinc-900 dark:text-zinc-100 uppercase text-[10px] tracking-widest ml-1">Contexte & Objectif Global</Label>
                                <Textarea
                                    placeholder="..."
                                    className="rounded-2xl min-h-[120px] bg-zinc-50 dark:bg-zinc-800/50 border-none p-4 font-medium focus-visible:ring-black transition-all resize-none"
                                    value={formData.context || ""}
                                    onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold text-zinc-900 dark:text-zinc-100 uppercase text-[10px] tracking-widest ml-1">Structure Narrative</Label>
                                <Input
                                    placeholder="Hook -> Problem -> Exploration"
                                    className="rounded-2xl h-12 bg-zinc-50 dark:bg-zinc-800/50 border-none font-bold focus-visible:ring-black transition-all"
                                    value={formData.structure || ""}
                                    onChange={(e) => setFormData({ ...formData, structure: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <Label className="font-bold text-zinc-900 dark:text-zinc-100 uppercase text-[10px] tracking-widest ml-1">Objectifs (Un par ligne)</Label>
                                <Textarea
                                    placeholder="..."
                                    className="rounded-2xl min-h-[120px] bg-zinc-50 dark:bg-zinc-800/50 border-none p-4 font-medium focus-visible:ring-black transition-all resize-none"
                                    value={Array.isArray(formData.goals) ? formData.goals.join('\n') : formData.goals || ""}
                                    onChange={(e) => setFormData({ ...formData, goals: e.target.value.split('\n').filter(Boolean) })}
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="space-y-8">
                    {/* --- Section 3: Output --- */}
                    <div className="bg-white dark:bg-zinc-900 p-8 rounded-[40px] shadow-xl shadow-zinc-200/40 dark:shadow-none border border-zinc-50 dark:border-zinc-800 space-y-8 h-fit lg:sticky lg:top-32">
                        <div className="flex items-center gap-3 pb-2">
                            <div className="h-10 w-10 bg-zinc-50 dark:bg-zinc-800 rounded-2xl flex items-center justify-center">
                                <Terminal className="w-5 h-5 text-zinc-400" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight">Output & JSON</h3>
                        </div>

                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="font-bold text-zinc-900 dark:text-zinc-100 uppercase text-[10px] tracking-widest ml-1">Task Description</Label>
                                <Textarea
                                    placeholder="..."
                                    className="rounded-2xl min-h-[100px] bg-zinc-50 dark:bg-zinc-800/50 border-none p-4 font-medium focus-visible:ring-black transition-all resize-none"
                                    value={formData.task || ""}
                                    onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold text-zinc-900 dark:text-zinc-100 uppercase text-[10px] tracking-widest ml-1">Formatting Rules</Label>
                                <Textarea
                                    placeholder="..."
                                    className="rounded-2xl min-h-[100px] bg-zinc-50 dark:bg-zinc-800/50 border-none p-4 font-medium focus-visible:ring-black transition-all resize-none"
                                    value={formData.formatting || ""}
                                    onChange={(e) => setFormData({ ...formData, formatting: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold text-zinc-900 dark:text-zinc-100 uppercase text-[10px] tracking-widest ml-1">Output Format (Figé)</Label>
                                <div className="bg-zinc-100 dark:bg-zinc-800/80 rounded-2xl p-4 border-none">
                                    <pre className="text-[10px] font-mono leading-relaxed text-zinc-400 overflow-x-auto">
                                        {formData.outputFormat ? JSON.stringify(JSON.parse(formData.outputFormat), null, 2) : ""}
                                    </pre>
                                </div>
                                <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-tight italic ml-1">Configuré globalement côté serveur.</p>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold text-zinc-900 dark:text-zinc-100 uppercase text-[10px] tracking-widest ml-1">Instructions finales</Label>
                                <Textarea
                                    placeholder="..."
                                    className="rounded-2xl min-h-[120px] bg-zinc-50 dark:bg-zinc-800/50 border-none p-4 font-medium focus-visible:ring-black transition-all resize-none text-xs"
                                    value={Array.isArray(formData.instructions) ? formData.instructions.join('\n') : formData.instructions || ""}
                                    onChange={(e) => setFormData({ ...formData, instructions: e.target.value.split('\n').filter(Boolean) })}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="font-bold text-zinc-900 dark:text-zinc-100 uppercase text-[10px] tracking-widest ml-1">Règles & Contraintes</Label>
                                <Textarea
                                    placeholder="..."
                                    className="rounded-2xl min-h-[150px] bg-zinc-50 dark:bg-zinc-800/50 border-none p-4 font-medium leading-relaxed focus-visible:ring-black transition-all resize-none text-xs"
                                    value={Array.isArray(formData.rules) ? formData.rules.join('\n') : formData.rules || ""}
                                    onChange={(e) => setFormData({ ...formData, rules: e.target.value.split('\n').filter(Boolean) })}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div >
        </form >
    );
}
