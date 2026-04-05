"use client";

import { useState } from "react";
import {
    Grid3X3,
    ArrowLeft,
    Save,
    Plus,
    X,
    ChevronUp,
    ChevronDown,
    Zap,
    Target,
    ListTree,
    Sparkles,
    Palette,
    Wand2,
    ShieldCheck
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { cn } from "@/src/lib/utils";

export interface PromptFormData {
    name: string;
    role: string;
    context: string;
    audienceDefault: string;
    task: string;
    goals: string[];
    structure: string[];
    rules: string[];
    formatting: string;
    instructions: string[];
    description?: string;
    category?: string;
    tags?: string[];
    isActive: boolean;
    visualRules?: string[];
    orchestration?: string[];
    outputFormat?: string;
}

interface PromptFormProps {
    initialData: Partial<PromptFormData>;
    onSubmit: (data: PromptFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    title: string;
}

function DynamicList({
    items,
    onChange,
    label,
    placeholder = "Ajouter un élément...",
    icon: Icon
}: {
    items: string[];
    onChange: (items: string[]) => void;
    label: string;
    placeholder?: string;
    icon?: any;
}) {
    const handleAdd = () => onChange([...items, ""]);
    const handleRemove = (index: number) => onChange(items.filter((_, i) => i !== index));
    const handleChange = (index: number, value: string) => {
        const newItems = [...items];
        newItems[index] = value;
        onChange(newItems);
    };
    const handleMove = (index: number, direction: 'up' | 'down') => {
        const newItems = [...items];
        if (direction === 'up' && index > 0) {
            [newItems[index - 1], newItems[index]] = [newItems[index], newItems[index - 1]];
        } else if (direction === 'down' && index < items.length - 1) {
            [newItems[index + 1], newItems[index]] = [newItems[index], newItems[index + 1]];
        }
        onChange(newItems);
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between pb-1 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-2">
                    {Icon && <Icon className="w-4 h-4 text-zinc-400" />}
                    <Label className="font-black uppercase text-[10px] tracking-widest text-zinc-500">
                        {label}
                    </Label>
                </div>
                <Button type="button" variant="ghost" size="sm" onClick={handleAdd} className="h-7 text-[10px] font-black uppercase text-zinc-900 dark:text-zinc-100">
                    <Plus className="w-3 h-3 mr-1" /> Ajouter
                </Button>
            </div>
            <div className="space-y-2">
                {items.length === 0 ? (
                    <p className="text-[10px] text-zinc-400 font-bold italic py-2">Aucun élément.</p>
                ) : (
                    items.map((item, index) => (
                        <div key={index} className="group flex items-start gap-2 bg-zinc-50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-transparent hover:border-zinc-200 transition-all">
                            <Textarea
                                value={item}
                                onChange={(e) => handleChange(index, e.target.value)}
                                placeholder={placeholder}
                                className="min-h-[40px] bg-transparent border-none p-0 focus-visible:ring-0 text-sm font-medium resize-none"
                            />
                            <div className="flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button type="button" onClick={() => handleRemove(index)} className="p-1 hover:text-red-500"><X className="w-3 h-3" /></button>
                                <button type="button" disabled={index === 0} onClick={() => handleMove(index, 'up')} className="p-1 disabled:opacity-20"><ChevronUp className="w-3 h-3" /></button>
                                <button type="button" disabled={index === items.length - 1} onClick={() => handleMove(index, 'down')} className="p-1 disabled:opacity-20"><ChevronDown className="w-3 h-3" /></button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}

export function PromptForm({ initialData, onSubmit, onCancel, isLoading, title }: PromptFormProps) {
    const [formData, setFormData] = useState<any>({
        isActive: true,
        goals: [],
        structure: [],
        rules: [],
        instructions: [],
        visualRules: [],
        orchestration: [],
        ...initialData
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 max-w-6xl mx-auto pb-20 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex items-center justify-between bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl p-6 rounded-[32px] sticky top-0 z-10 border border-zinc-100 dark:border-zinc-800 shadow-xl shadow-zinc-200/20">
                <div className="flex items-center gap-4">
                    <Button type="button" variant="ghost" size="icon" className="rounded-full h-10 w-10" onClick={onCancel}>
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-2xl font-black tracking-tighter">{title}</h1>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Configuration Vidéo</p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button type="button" variant="ghost" className="font-bold px-6 h-11" onClick={onCancel}>Annuler</Button>
                    <Button type="submit" disabled={isLoading} className="bg-black dark:bg-white dark:text-black text-white rounded-2xl font-black px-8 h-11 shadow-lg active:scale-95 transition-all flex items-center gap-2">
                        <Save className="h-4 w-4" /> {isLoading ? "Synchronisation..." : "Enregistrer"}
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="identity" className="w-full">
                <TabsList className="bg-transparent p-0 gap-2 mb-6 h-auto justify-start border-none">
                    {[
                        { id: 'identity', label: 'Identité', icon: Grid3X3 },
                        { id: 'narration', label: 'Narration', icon: ListTree },
                        { id: 'rules', label: 'Directives', icon: ShieldCheck },
                        { id: 'tech', label: 'Technique', icon: Zap }
                    ].map((tab) => (
                        <TabsTrigger
                            key={tab.id}
                            value={tab.id}
                            className="bg-zinc-100/50 dark:bg-zinc-900/50 data-[state=active]:bg-black data-[state=active]:text-white rounded-xl px-5 py-2.5 font-black text-xs transition-all gap-2"
                        >
                            <tab.icon className="w-3.5 h-3.5" /> {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>

                {/* Tab: Identité */}
                <TabsContent value="identity" className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in slide-in-from-left-2 duration-300">
                    <div className="lg:col-span-2 bg-white dark:bg-zinc-950 p-8 rounded-[40px] border border-zinc-100 dark:border-zinc-900 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <Label className="font-black uppercase text-[10px] tracking-widest text-zinc-400 ml-1">Identifiant Unique</Label>
                            <Input
                                placeholder="storytelling-general"
                                className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none font-black text-lg"
                                value={formData.name || ""}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black uppercase text-[10px] tracking-widest text-zinc-400 ml-1">Rôle Système</Label>
                            <Input
                                placeholder="Director..."
                                className="h-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none font-bold"
                                value={formData.role || ""}
                                onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black uppercase text-[10px] tracking-widest text-zinc-400 ml-1">Description Interne</Label>
                            <Textarea
                                placeholder="Notes..."
                                className="min-h-[100px] rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none p-4 font-medium resize-none shadow-inner"
                                value={formData.description || ""}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 p-8 rounded-[40px] border border-zinc-100 dark:border-zinc-800 space-y-6">
                        <div className="flex items-center justify-between px-2">
                            <Label className="font-black text-xs uppercase">Statut</Label>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                                className={cn("rounded-full px-4 h-8 text-[10px] font-black uppercase transition-all", formData.isActive ? "bg-black text-white border-black" : "bg-white dark:bg-zinc-800")}
                            >
                                {formData.isActive ? "Actif" : "Brouillon"}
                            </Button>
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black uppercase text-[10px] tracking-widest text-zinc-400">Catégorie</Label>
                            <Input
                                value={formData.category || ""}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="bg-white dark:bg-zinc-800 border-none rounded-xl font-bold h-10"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black uppercase text-[10px] tracking-widest text-zinc-400">Audience</Label>
                            <Input
                                value={formData.audienceDefault || ""}
                                onChange={(e) => setFormData({ ...formData, audienceDefault: e.target.value })}
                                className="bg-white dark:bg-zinc-800 border-none rounded-xl font-bold h-10"
                            />
                        </div>
                    </div>
                </TabsContent>

                {/* Tab: Narration */}
                <TabsContent value="narration" className="space-y-6 animate-in slide-in-from-right-2 duration-300">
                    <div className="bg-white dark:bg-zinc-950 p-8 rounded-[40px] border border-zinc-100 dark:border-zinc-900 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <Label className="font-black uppercase text-[10px] tracking-widest text-zinc-400 ml-1">Contexte Narratif</Label>
                            <Textarea
                                className="min-h-[120px] rounded-[32px] bg-zinc-50 dark:bg-zinc-900 border-none p-6 font-medium text-base shadow-inner resize-none"
                                value={formData.context || ""}
                                onChange={(e) => setFormData({ ...formData, context: e.target.value })}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            <DynamicList label="Objectifs" items={formData.goals || []} onChange={(items) => setFormData({ ...formData, goals: items })} icon={Target} />
                            <DynamicList label="Structure" items={formData.structure || []} onChange={(items) => setFormData({ ...formData, structure: items })} icon={ListTree} />
                        </div>
                        <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
                            <DynamicList label="Orchestration du Pipeline" items={formData.orchestration || []} onChange={(items) => setFormData({ ...formData, orchestration: items })} icon={Wand2} />
                        </div>
                    </div>
                </TabsContent>

                {/* Tab: Rules */}
                <TabsContent value="rules" className="space-y-6 animate-in zoom-in-95 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white dark:bg-zinc-950 p-8 rounded-[40px] border border-zinc-100 dark:border-zinc-900 shadow-sm pt-6">
                            <DynamicList label="Règles de Narration" items={formData.rules || []} onChange={(items) => setFormData({ ...formData, rules: items })} />
                        </div>
                        <div className="bg-white dark:bg-zinc-950 p-8 rounded-[40px] border border-zinc-100 dark:border-zinc-900 shadow-sm pt-6">
                            <DynamicList label="Directives Finales (Instructions)" items={formData.instructions || []} onChange={(items) => setFormData({ ...formData, instructions: items })} />
                        </div>
                    </div>
                    <div className="bg-zinc-50 dark:bg-zinc-950 p-8 rounded-[40px] border border-zinc-100 dark:border-zinc-900">
                        <DynamicList label="Direction Visuelle & Artistique" items={formData.visualRules || []} onChange={(items) => setFormData({ ...formData, visualRules: items })} icon={Palette} />
                    </div>
                </TabsContent>

                {/* Tab: Technique */}
                <TabsContent value="tech" className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white dark:bg-zinc-950 p-8 rounded-[40px] border border-zinc-100 dark:border-zinc-900 shadow-sm space-y-6">
                        <div className="space-y-2">
                            <Label className="font-black uppercase text-[10px] tracking-widest text-zinc-400 ml-1">Tâche (Task)</Label>
                            <Textarea
                                className="h-40 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border-none p-4 font-bold text-xs"
                                value={formData.task || ""}
                                onChange={(e) => setFormData({ ...formData, task: e.target.value })}
                            />
                        </div>
                    </div>
                    <div className="bg-zinc-900 text-white p-8 rounded-[40px] space-y-6">
                        <div className="space-y-2">
                            <Label className="font-black uppercase text-[10px] tracking-widest text-zinc-500">Formatage (JSON / Technical Spec)</Label>
                            <Textarea
                                className="h-40 rounded-2xl bg-zinc-800 border-none p-4 font-medium text-xs leading-relaxed"
                                value={formData.formatting || ""}
                                onChange={(e) => setFormData({ ...formData, formatting: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <Label className="font-black uppercase text-[10px] tracking-widest text-zinc-500">Format de Sortie (Global)</Label>
                            <Input
                                className="bg-zinc-800 border-none rounded-xl h-10 font-bold"
                                value={formData.outputFormat || ""}
                                onChange={(e) => setFormData({ ...formData, outputFormat: e.target.value })}
                            />
                        </div>
                    </div>
                </TabsContent>
            </Tabs>
        </form>
    );
}
