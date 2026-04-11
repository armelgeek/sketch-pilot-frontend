"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { seriesService, type Series } from "@/src/services/series-service";
import { Loader2, Plus, Sparkles, Settings2, BookOpen, ChevronRight, Users, Trash2, UserPlus, Info, X, Maximize2 } from "lucide-react";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { cn } from "@/src/lib/utils";
import { Progress } from "@/src/components/ui/progress";

const adminService = new AdminService();

interface SeriesCreationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreated: (series: any) => void;
    seriesToEdit?: Series | null;
}

export function SeriesCreationModal({ isOpen, onClose, onCreated, seriesToEdit }: SeriesCreationModalProps) {
    const [loading, setLoading] = useState(false);
    const [isPreparing, setIsPreparing] = useState(false);
    const [preparationProgress, setPreparationProgress] = useState<number | null>(null);
    const [preparationMessage, setPreparationMessage] = useState<string>("");
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [generatingCharacters, setGeneratingCharacters] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'basics' | 'roadmap' | 'casting'>('basics');
    const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);
    const [zoomImage, setZoomImage] = useState<string | null>(null);

    const [isBatchGeneratingPortraits, setIsBatchGeneratingPortraits] = useState(false);

    // Models for casting
    const [models, setModels] = useState<any[]>([]);

    const [form, setForm] = useState({
        title: "",
        description: "",
        globalContext: "",
        totalEpisodes: "",
        characterRegistry: {} as Record<string, any>,
        language: "fr",
        aspectRatio: "9:16",
        duration: "60",
        videoGenre: "Horreur Historique",
        promptId: "",
        visualStyleModelId: "",
        plannedEpisodes: [] as { number: number; title: string; hook: string }[],
    });

    const [prompts, setPrompts] = useState<any[]>([]);

    // Populate form if editing
    useEffect(() => {
        if (seriesToEdit && isOpen) {
            setForm({
                title: seriesToEdit.title || "",
                description: seriesToEdit.description || "",
                globalContext: seriesToEdit.globalContext || "",
                totalEpisodes: seriesToEdit.totalEpisodes || "",
                characterRegistry: seriesToEdit.characterRegistry || {},
                language: seriesToEdit.language || "fr",
                aspectRatio: seriesToEdit.aspectRatio || "9:16",
                duration: seriesToEdit.duration || "60",
                videoGenre: seriesToEdit.videoGenre || "Horreur Historique",
                promptId: seriesToEdit.promptId || "",
                visualStyleModelId: seriesToEdit.visualStyleModelId || "",
                plannedEpisodes: seriesToEdit.plannedEpisodes || [],
            });
            setStep('basics');
        } else if (!seriesToEdit && isOpen) {
            setForm({
                title: "",
                description: "",
                globalContext: "",
                totalEpisodes: "",
                characterRegistry: {},
                language: "fr",
                aspectRatio: "9:16",
                duration: "60",
                videoGenre: "Horreur Historique",
                promptId: "",
                visualStyleModelId: "",
                plannedEpisodes: [],
            });
            setStep('basics');
        }
    }, [seriesToEdit, isOpen]);

    // Load models for casting
    useEffect(() => {
        if (isOpen) {
            Promise.all([
                adminService.listStandardModels(),
                adminService.listModels(),
                adminService.listPublicPrompts({ limit: 100 })
            ]).then(([std, pers, ppts]) => {
                setModels([...(std.data || []), ...(pers.data || [])]);
                setPrompts(ppts.data || []);
            });
        }
    }, [isOpen]);

    const handleAddCharacter = () => {
        setForm(prev => ({
            ...prev,
            characterRegistry: {
                ...prev.characterRegistry,
                [`Personnage ${Object.keys(prev.characterRegistry).length + 1}`]: {
                    description: "",
                    // modelId removed: simplified modeling
                }
            }
        }));
    };

    const handleUpdateCharacter = (oldName: string, newName: string, data: any) => {
        const newRegistry = { ...form.characterRegistry };
        if (oldName !== newName) {
            delete newRegistry[oldName];
        }
        newRegistry[newName] = data;
        setForm({ ...form, characterRegistry: newRegistry });
    };

    const handleRemoveCharacter = (name: string) => {
        const newRegistry = { ...form.characterRegistry };
        delete newRegistry[name];
        setForm({ ...form, characterRegistry: newRegistry });
    };

    const handleUpdateEpisode = (index: number, field: 'title' | 'hook', value: string) => {
        const newEpisodes = [...(form.plannedEpisodes || [])];
        if (newEpisodes[index]) {
            newEpisodes[index] = { ...newEpisodes[index], [field]: value };
            setForm({ ...form, plannedEpisodes: newEpisodes });
        }
    };

    const handleSuggestIdea = async () => {
        setIsSuggesting(true);
        setError(null);
        try {
            const result = await seriesService.suggestConcept();
            if (result.success) {
                setForm(prev => ({
                    ...prev,
                    title: result.title,
                    videoGenre: result.videoGenre,
                    description: result.description
                }));
            }
        } catch (err) {
            setError("Impossible de suggérer une idée pour le moment.");
        } finally {
            setIsSuggesting(false);
        }
    };

    const handleAIPrepare = async () => {
        if (!form.title && !form.videoGenre && !form.description) {
            setError("Veuillez entrer au moins un titre, un genre ou une description pour lancer la préparation IA.");
            return;
        }

        setIsPreparing(true);
        setPreparationProgress(0);
        setPreparationMessage("Connexion au cerveau créatif...");
        setError(null);

        try {
            const streamUrl = seriesService.getPrepareStreamUrl({
                title: form.title,
                description: form.description,
                language: form.language,
                promptId: form.promptId,
                visualStyleModelId: form.visualStyleModelId
            });

            const es = new EventSource(streamUrl, { withCredentials: true });

            es.addEventListener("progress", (event: any) => {
                const data = JSON.parse(event.data);
                if (data.progress !== undefined) setPreparationProgress(data.progress);
                if (data.message) setPreparationMessage(data.message);
            });

            es.addEventListener("character_portrait", (event: any) => {
                const data = JSON.parse(event.data);
                // Partial update of a single character portrait
                setForm(prev => ({
                    ...prev,
                    characterRegistry: {
                        ...prev.characterRegistry,
                        [data.name]: {
                            ...prev.characterRegistry[data.name],
                            thumbnailUrl: data.imageUrl
                        }
                    }
                }));
            });

            es.addEventListener("final", (event: any) => {
                const data = JSON.parse(event.data);

                setForm(prev => ({
                    ...prev,
                    globalContext: data.globalContext,
                    characterRegistry: data.characterRegistry || prev.characterRegistry,
                    videoGenre: data.videoGenre || prev.videoGenre,
                    totalEpisodes: data.totalEpisodes ? data.totalEpisodes.toString() : prev.totalEpisodes,
                    plannedEpisodes: data.suggestedEpisodes || []
                }));
                setSuggestedTitles(data.suggestedTitles || []);

                es.close();
                setIsPreparing(false);
                setPreparationProgress(null);
                setStep('roadmap');
            });

            es.addEventListener("error", (event: any) => {
                let errorMsg = "L'IA n'a pas pu préparer la saga.";
                if (event.data) {
                    try {
                        const data = JSON.parse(event.data);
                        errorMsg = data.error || errorMsg;
                    } catch (e) { }
                }
                setError(errorMsg);
                es.close();
                setIsPreparing(false);
                setPreparationProgress(null);
            });

        } catch (err: any) {
            setError("Erreur de connexion au service de narration.");
            setIsPreparing(false);
            setPreparationProgress(null);
        }
    };


    const handleGeneratePortrait = async (charName: string) => {
        const char = form.characterRegistry[charName];
        const effectiveModelId = form.visualStyleModelId;
        if (!char || !effectiveModelId || !char.portraitPrompt) {
            alert("Veuillez sélectionner un modèle global (Étape 1) et avoir un prompt visuel.");
            return;
        }

        try {
            setGeneratingCharacters(prev => ({ ...prev, [charName]: true }));
            const result = await adminService.generateCharacterImage(effectiveModelId, char.portraitPrompt);
            if (result.success && result.imageUrl) {
                handleUpdateCharacter(charName, charName, { ...char, thumbnailUrl: result.imageUrl });
            } else {
                alert(result.error || "Échec de la génération du portrait.");
            }
        } catch (err) {
            console.error("Failed to generate portrait:", err);
            alert("Erreur lors de la génération.");
        } finally {
            setGeneratingCharacters(prev => ({ ...prev, [charName]: false }));
        }
    };

    const handleGenerateAllPortraits = async () => {
        const charactersToGenerate = Object.entries(form.characterRegistry).filter(
            ([_, char]) => form.visualStyleModelId && char.portraitPrompt && !char.thumbnailUrl
        );

        if (charactersToGenerate.length === 0) return;

        setIsBatchGeneratingPortraits(true);
        for (const [name, _] of charactersToGenerate) {
            await handleGeneratePortrait(name);
        }
        setIsBatchGeneratingPortraits(false);
    };

    // Auto-generation is now handled by the backend
    /*
    useEffect(() => {
        const hasRegistry = Object.keys(form.characterRegistry).length > 0;
        const hasStyle = !!form.visualStyleModelId;
        const missingThumbnails = Object.values(form.characterRegistry).some(c => !c.thumbnailUrl);

        if (hasRegistry && hasStyle && missingThumbnails && !isBatchGeneratingPortraits) {
            // Only auto-trigger if we are not in basics anymore
            if (step !== 'basics') {
                handleGenerateAllPortraits();
            }
        }
    }, [form.characterRegistry, form.visualStyleModelId, step, isBatchGeneratingPortraits]);
    */

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (step === 'basics') {
            if (!form.title) return;
            setLoading(true);
            try {
                await handleAIPrepare();
            } finally {
                setLoading(false);
            }
            return;
        }

        if (step === 'roadmap') {
            setStep('casting');
            return;
        }

        const isMissingPortraits = Object.values(form.characterRegistry).some(char => !char.thumbnailUrl);
        if (isMissingPortraits) {
            setError("Veuillez générer les portraits de tous vos personnages avant de lancer la saga.");
            return;
        }

        if (!form.title) return;

        setLoading(true);
        setError(null);

        try {
            let result;
            if (seriesToEdit) {
                result = await seriesService.update(seriesToEdit.id, {
                    ...form,
                });
            } else {
                result = await seriesService.create({
                    ...form,
                });
            }

            onCreated(result);
            onClose();
        } catch (err: any) {
            setError(err.message || "Failed to save series");
        } finally {
            setLoading(false);
        }
    };

    const isEdit = !!seriesToEdit;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto border-stone-200 dark:border-zinc-800/50 bg-white dark:bg-zinc-950/90 backdrop-blur-2xl scrollbar-hide shadow-2xl p-0 transition-all">
                <div className="mesh-gradient-premium absolute inset-0 opacity-5 pointer-events-none" />

                <div className="p-8 space-y-8 relative">
                    <DialogHeader className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className={cn(
                                    "h-10 w-10 rounded-2xl flex items-center justify-center transition-all",
                                    step === 'basics' ? "bg-blue-500/10 border border-blue-500/20" : "bg-emerald-500/10 border border-emerald-500/20"
                                )}>
                                    {step === 'basics' ? (
                                        <BookOpen className="h-5 w-5 text-blue-500" />
                                    ) : (
                                        <Users className="h-5 w-5 text-emerald-500" />
                                    )}
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-black text-stone-900 dark:text-white uppercase tracking-tight">
                                        {isEdit ? "Modifier la Saga" : "Nouvelle Saga"}
                                    </DialogTitle>
                                    <DialogDescription className="text-[11px] font-medium text-stone-500 dark:text-zinc-500 uppercase tracking-widest mt-0.5">
                                        {step === 'basics' ? "Étape 1 : Configuration & Base" :
                                            step === 'roadmap' ? "Étape 2 : Validation Narrative" :
                                                "Étape 3 : Casting & Personnages"}
                                    </DialogDescription>
                                </div>
                            </div>

                            <div className="flex items-center gap-1">
                                <div className={cn("h-1.5 w-6 rounded-full transition-all", step === 'basics' ? "bg-blue-500" : "bg-stone-200")} />
                                <div className={cn("h-1.5 w-6 rounded-full transition-all", step === 'roadmap' ? "bg-amber-500" : "bg-stone-200")} />
                                <div className={cn("h-1.5 w-6 rounded-full transition-all", step === 'casting' ? "bg-emerald-500" : "bg-stone-200")} />
                            </div>
                        </div>
                    </DialogHeader>

                    <form onSubmit={handleSubmit} className="space-y-8">
                        {step === 'basics' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="space-y-2.5">
                                    <div className="flex items-center justify-between ml-1">
                                        <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 dark:text-zinc-500">
                                            Nom de la Saga
                                        </Label>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleSuggestIdea}
                                            disabled={isSuggesting}
                                            className="h-6 px-2 rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-600 hover:text-blue-700 hover:bg-blue-50 gap-1 active:scale-95"
                                        >
                                            {isSuggesting ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                            Suggérer une idée (2 pts)
                                        </Button>
                                    </div>
                                    <div className="relative flex gap-2">
                                        <Input
                                            id="title"
                                            placeholder="ex: Les Chroniques de l'Ombre"
                                            value={form.title}
                                            onChange={(e) => setForm({ ...form, title: e.target.value })}
                                            className="bg-stone-50 dark:bg-zinc-900/50 border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-white placeholder:text-stone-300 dark:placeholder:text-zinc-600 focus:border-blue-500/50 focus:ring-blue-500/20 h-14 rounded-2xl text-base px-5 transition-all shadow-inner font-bold flex-1"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2.5">
                                    <Label htmlFor="totalEpisodes" className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 dark:text-zinc-500 ml-1">
                                        Objectif Épisodes
                                    </Label>
                                    <Input
                                        id="totalEpisodes"
                                        type="number"
                                        placeholder="ex: 10"
                                        value={form.totalEpisodes}
                                        onChange={(e) => setForm({ ...form, totalEpisodes: e.target.value })} />
                                </div>

                                {isPreparing && (
                                    <div className="space-y-3 p-4 rounded-2xl bg-blue-500/5 border border-blue-500/10 animate-in fade-in slide-in-from-top-2 duration-500">
                                        <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider">
                                            <span className="text-blue-500 flex items-center gap-2">
                                                <div className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
                                                {preparationMessage}
                                            </span>
                                            <span className="text-blue-500">{preparationProgress}%</span>
                                        </div>
                                        <Progress value={preparationProgress || 0} className="h-1.5 bg-blue-500/10" />
                                    </div>
                                )}

                                <div className="space-y-4 p-6 rounded-3xl bg-blue-50/30 border border-blue-100/50 dark:bg-blue-500/5 dark:border-blue-500/10">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Settings2 className="h-4 w-4 text-blue-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Préférences de Génération</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Ratio d'Aspect</Label>
                                            <div className="flex bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-xl p-1 gap-1">
                                                <button
                                                    type="button"
                                                    onClick={() => setForm({ ...form, aspectRatio: "16:9" })}
                                                    className={cn(
                                                        "flex-1 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all",
                                                        form.aspectRatio === "16:9" ? "bg-stone-900 text-white shadow-md shadow-stone-900/20" : "text-stone-400 hover:text-stone-600"
                                                    )}
                                                >
                                                    16:9
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => setForm({ ...form, aspectRatio: "9:16" })}
                                                    className={cn(
                                                        "flex-1 px-3 py-1.5 rounded-lg text-[10px] font-black transition-all",
                                                        form.aspectRatio === "9:16" ? "bg-stone-900 text-white shadow-md shadow-stone-900/20" : "text-stone-400 hover:text-stone-600"
                                                    )}
                                                >
                                                    9:16
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Durée (s)</Label>
                                            <select
                                                value={form.duration}
                                                onChange={(e) => setForm({ ...form, duration: e.target.value })}
                                                className="w-full bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-xl h-10 px-3 text-xs font-bold"
                                            >
                                                <option value="30">30 secondes</option>
                                                <option value="60">60 secondes</option>
                                                <option value="90">90 secondes</option>
                                                <option value="120">2 minutes</option>
                                            </select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Langue</Label>
                                            <select
                                                value={form.language}
                                                onChange={(e) => setForm({ ...form, language: e.target.value })}
                                                className="w-full bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-xl h-10 px-3 text-xs font-bold"
                                            >
                                                <option value="fr">Français 🇫🇷</option>
                                                <option value="en">English 🇺🇸</option>
                                                <option value="es">Español 🇪🇸</option>
                                                <option value="de">Deutsch 🇩🇪</option>
                                                <option value="it">Italiano 🇮🇹</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Niche / Genre</Label>
                                        <Input
                                            placeholder="ex: Horreur Historique, Science-Fiction..."
                                            value={form.videoGenre}
                                            onChange={(e) => setForm({ ...form, videoGenre: e.target.value })}
                                            className="bg-white dark:bg-zinc-900 border-stone-100 dark:border-zinc-800 h-10 rounded-xl text-xs font-bold"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Spécification Narrative (IA)</Label>
                                        <select
                                            value={form.promptId}
                                            onChange={(e) => setForm({ ...form, promptId: e.target.value })}
                                            className="w-full bg-white dark:bg-zinc-900 border border-stone-100 dark:border-zinc-800 rounded-xl h-10 px-3 text-xs font-bold"
                                        >
                                            <option value="">Standard (Auto)</option>
                                            {prompts.map(p => (
                                                <option key={p.id} value={p.id}>{p.name}</option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-[9px] font-bold uppercase tracking-widest text-stone-400">Style Visuel Global (Personnages)</Label>
                                        <p className="text-[9px] text-stone-400 italic">Ce modèle sera utilisé comme référence pour toutes les images de personnages de cette saga.</p>
                                        <div className="grid grid-cols-4 gap-2">
                                            <div
                                                onClick={() => setForm({ ...form, visualStyleModelId: "" })}
                                                className={cn(
                                                    "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 cursor-pointer transition-all",
                                                    !form.visualStyleModelId ? "border-blue-500 bg-blue-50" : "border-stone-100 hover:border-stone-200"
                                                )}
                                            >
                                                <div className="h-12 w-12 rounded-lg bg-stone-100 flex items-center justify-center text-stone-300 text-lg">✦</div>
                                                <span className="text-[8px] font-bold uppercase text-stone-400 text-center">Auto</span>
                                            </div>
                                            {models.slice(0, 11).map(m => (
                                                <div
                                                    key={m.id}
                                                    onClick={() => setForm({ ...form, visualStyleModelId: m.id })}
                                                    className={cn(
                                                        "flex flex-col items-center gap-1.5 p-2 rounded-xl border-2 cursor-pointer transition-all",
                                                        form.visualStyleModelId === m.id ? "border-blue-500 bg-blue-50" : "border-stone-100 hover:border-stone-200"
                                                    )}
                                                >
                                                    <img src={m.images?.[0] || m.thumbnailUrl} alt={m.name} className="h-12 w-12 rounded-lg object-cover" />
                                                    <span className="text-[8px] font-bold uppercase text-stone-400 text-center line-clamp-1">{m.name}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : step === 'roadmap' ? (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                {suggestedTitles.length > 0 && (
                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 dark:text-zinc-500 ml-1">
                                            Titres suggérés par l'IA
                                        </Label>
                                        <div className="flex flex-wrap gap-2">
                                            {suggestedTitles.map((t, idx) => (
                                                <Button
                                                    key={idx}
                                                    type="button"
                                                    variant="ghost"
                                                    onClick={() => setForm({ ...form, title: t })}
                                                    className={cn(
                                                        "h-8 px-3 rounded-lg text-[10px] font-bold border transition-all",
                                                        form.title === t
                                                            ? "bg-blue-500 text-white border-blue-500 shadow-md shadow-blue-500/20"
                                                            : "bg-white dark:bg-zinc-900 border-stone-100 dark:border-zinc-800 text-stone-600 dark:text-zinc-400 hover:border-blue-500/50"
                                                    )}
                                                >
                                                    {t}
                                                </Button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-2.5">
                                    <Label htmlFor="globalContext" className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400 dark:text-zinc-500 ml-1 flex items-center gap-2">
                                        Bible Narrative <Sparkles className="h-3 w-3 text-blue-500 dark:text-blue-400 animate-pulse" />
                                    </Label>
                                    <div className="relative group">
                                        <Textarea
                                            id="globalContext"
                                            placeholder="Décrivez l'univers, le ton, les enjeux majeurs..."
                                            value={form.globalContext}
                                            onChange={(e) => setForm({ ...form, globalContext: e.target.value })}
                                            className="min-h-[160px] bg-stone-50 dark:bg-zinc-900/50 border-stone-200 dark:border-zinc-800 text-stone-900 dark:text-white placeholder:text-stone-300 dark:placeholder:text-zinc-600 focus:border-blue-500/50 focus:ring-blue-500/20 resize-none rounded-2xl text-sm leading-relaxed p-5 transition-all shadow-inner border-dashed"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-4 p-5 rounded-3xl bg-amber-50/30 border border-amber-100/50 dark:bg-amber-500/5 dark:border-amber-500/10">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Sparkles className="h-4 w-4 text-amber-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-amber-600">Arc Narratif Planifié (Roadmap)</span>
                                    </div>
                                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 customize-scrollbar">
                                        {form.plannedEpisodes && form.plannedEpisodes.length > 0 ? (
                                            form.plannedEpisodes.map((ep, idx) => (
                                                <div key={idx} className="flex gap-4 items-start bg-white/50 dark:bg-zinc-900/50 p-3 rounded-xl border border-amber-100/30 dark:border-amber-500/10">
                                                    <div className="h-6 w-6 rounded-lg bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0 mt-1">
                                                        <span className="text-[10px] font-black text-amber-700 dark:text-amber-500">{ep.number}</span>
                                                    </div>
                                                    <div className="flex-1 space-y-2">
                                                        <Input
                                                            value={ep.title}
                                                            onChange={(e) => handleUpdateEpisode(idx, 'title', e.target.value)}
                                                            className="h-8 bg-transparent border-none p-0 text-[11px] font-bold text-stone-900 dark:text-white focus:ring-0"
                                                        />
                                                        <Textarea
                                                            value={ep.hook}
                                                            onChange={(e) => handleUpdateEpisode(idx, 'hook', e.target.value)}
                                                            className="min-h-[40px] bg-transparent border-none p-0 text-[10px] text-stone-500 dark:text-zinc-500 italic resize-none focus:ring-0 leading-snug"
                                                        />
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="text-center py-8">
                                                <p className="text-[10px] text-amber-600/60 font-medium uppercase tracking-widest">Utilisez le bouton "Magique" pour générer un plan</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
                                <div className="flex items-center justify-between mb-2">
                                    <Label className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-400">
                                        Distribution de la Saga (Optionnel)
                                    </Label>
                                    <div className="flex gap-2">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleAIPrepare}
                                            disabled={isPreparing || !form.title}
                                            className="h-8 px-3 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] font-black uppercase tracking-widest gap-2"
                                        >
                                            {isPreparing ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                            Casting Magique (5 pts)
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleGenerateAllPortraits}
                                            disabled={isPreparing || Object.keys(form.characterRegistry).length === 0}
                                            className="h-8 px-3 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 text-[10px] font-black uppercase tracking-widest gap-2"
                                        >
                                            <Sparkles className="h-3 w-3" />
                                            Tout générer (5 pts / char)
                                        </Button>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            onClick={handleAddCharacter}
                                            className="h-8 px-3 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 text-[10px] font-black uppercase tracking-widest gap-2"
                                        >
                                            <UserPlus className="h-3 w-3" /> Ajouter
                                        </Button>
                                    </div>
                                </div>

                                <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 customize-scrollbar">
                                    {Object.entries(form.characterRegistry).map(([name, data], idx) => (
                                        <div key={idx} className="p-5 rounded-2xl bg-white border border-stone-100 shadow-sm space-y-4 relative group">
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveCharacter(name)}
                                                className="absolute top-4 right-4 text-stone-300 hover:text-red-500 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>

                                            <div className="flex gap-4">
                                                <div className="flex-1 space-y-4">
                                                    <div className="space-y-1.5">
                                                        <Input
                                                            placeholder="Nom du personnage"
                                                            value={name}
                                                            onChange={(e) => handleUpdateCharacter(name, e.target.value, data)}
                                                            className="h-10 border-stone-100 bg-stone-50/50 rounded-xl text-sm font-bold"
                                                        />
                                                    </div>
                                                    <div className="space-y-1.5">
                                                        <Textarea
                                                            placeholder="Rôle ou description rapide..."
                                                            value={data.description}
                                                            onChange={(e) => handleUpdateCharacter(name, name, { ...data, description: e.target.value })}
                                                            className="min-h-[60px] border-stone-100 bg-stone-50/50 rounded-xl text-xs resize-none"
                                                        />
                                                    </div>
                                                    {data.portraitPrompt && (
                                                        <div className="p-3 rounded-xl bg-purple-50/50 border border-purple-100/50 space-y-1 animate-in fade-in">
                                                            <div className="flex items-center gap-1.5">
                                                                <Sparkles className="h-3 w-3 text-purple-500" />
                                                                <span className="text-[9px] font-black uppercase tracking-widest text-purple-600">Prompt Visuel IA</span>
                                                            </div>
                                                            <p className="text-[10px] text-purple-700/80 italic leading-tight line-clamp-2">{data.portraitPrompt}</p>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="w-32 space-y-2">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-stone-400 text-center">Style Global</p>
                                                    <div className="relative group/avatar cursor-zoom-in" onClick={() => data.thumbnailUrl && setZoomImage(data.thumbnailUrl)}>
                                                        <Avatar className="h-20 w-20 mx-auto rounded-3xl border-2 border-stone-100 shadow-sm transition-transform group-hover/avatar:scale-105 duration-300">
                                                            <AvatarImage src={data.thumbnailUrl || (models.find(m => m.id === form.visualStyleModelId)?.images?.[0] || models.find(m => m.id === form.visualStyleModelId)?.thumbnailUrl)} />
                                                            <AvatarFallback className="bg-stone-50 text-stone-300">
                                                                <Users className="h-6 w-6" />
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        {data.thumbnailUrl && (
                                                            <div className="absolute top-0 right-0 p-1 opacity-0 group-hover/avatar:opacity-100 transition-opacity bg-white/80 backdrop-blur-sm rounded-bl-xl border-l border-b border-stone-100">
                                                                <Maximize2 className="h-3 w-3 text-blue-500" />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <Button
                                                        type="button"
                                                        variant="ghost"
                                                        onClick={() => handleGeneratePortrait(name)}
                                                        disabled={generatingCharacters[name] || !form.visualStyleModelId || !data.portraitPrompt}
                                                        className="w-full h-7 rounded-lg bg-purple-50 text-purple-600 hover:bg-purple-100 text-[9px] font-black uppercase tracking-widest gap-2 mt-1"
                                                    >
                                                        {generatingCharacters[name] ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3" />}
                                                        Générer (5 pts)
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {Object.keys(form.characterRegistry).length === 0 && (
                                        <div className="text-center py-12 px-6 rounded-3xl bg-stone-50/50 border border-dashed border-stone-200">
                                            <div className="h-12 w-12 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                                <Users className="h-6 w-6 text-stone-300" />
                                            </div>
                                            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Aucun Personnage</p>
                                            <p className="text-[10px] text-stone-400 max-w-[200px] mx-auto leading-relaxed">
                                                Définissez vos protagonistes ici pour une cohérence dès le début. Vous pourrez "caster" les nouveaux personnages au fil de l'histoire.
                                            </p>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-blue-50/50 p-4 rounded-xl border border-blue-100/50 flex gap-3">
                                    <Info className="h-4 w-4 text-blue-500 shrink-0 mt-0.5" />
                                    <p className="text-[10px] text-blue-700 leading-relaxed italic">
                                        <b>Astuce :</b> Vous pouvez générer tous les portraits d'un coup. Chaque génération coûte <b>5 crédits</b>. Choisissez bien vos modèles !
                                    </p>
                                </div>
                            </div>
                        )}

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-2xl flex gap-3 items-start animate-in fade-in slide-in-from-top-2">
                                <span className="h-1.5 w-1.5 rounded-full bg-red-500 mt-2 shrink-0" />
                                <p className="text-xs font-semibold text-red-500 dark:text-red-400 leading-relaxed italic">
                                    {error}
                                </p>
                            </div>
                        )}

                        <div className="flex gap-4 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={() => {
                                    if (step === 'casting') setStep('roadmap');
                                    else if (step === 'roadmap') setStep('basics');
                                    else onClose();
                                }}
                                className="flex-1 text-stone-400 dark:text-zinc-500 hover:text-stone-900 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-zinc-900 rounded-2xl h-14 font-black uppercase tracking-widest text-[11px]"
                            >
                                {step === 'basics' ? "Annuler" : "Précédent"}
                            </Button>
                            <Button
                                type="submit"
                                disabled={loading || !form.title || (step === 'casting' && Object.values(form.characterRegistry).some(char => !char.thumbnailUrl))}
                                className={cn(
                                    "flex-[2] text-white font-black uppercase tracking-[0.2em] transition-all shadow-xl rounded-2xl h-14 text-[11px] gap-2 active:scale-95",
                                    step === 'basics' ? "bg-stone-900 shadow-stone-900/20" : "bg-emerald-600 hover:bg-emerald-500 shadow-emerald-500/20",
                                    (step === 'casting' && Object.values(form.characterRegistry).some(char => !char.thumbnailUrl)) && "opacity-50 grayscale cursor-not-allowed"
                                )}
                            >
                                {loading || isPreparing ? (
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                ) : (
                                    <>
                                        {step === 'basics' ? "Préparer l'Univers" : step === 'roadmap' ? "Vers le Casting" : (isEdit ? "Mettre à jour" : "Lancer la Saga")}
                                        <ChevronRight className="h-4 w-4" />
                                    </>
                                )}
                            </Button>
                        </div>
                    </form>
                </div>
                {zoomImage && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-8 bg-zinc-950/90 backdrop-blur-xl animate-in fade-in duration-300" onClick={() => setZoomImage(null)}>
                        <button
                            className="absolute top-8 right-8 h-12 w-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all hover:scale-110 active:scale-95"
                            onClick={() => setZoomImage(null)}
                        >
                            <X className="h-6 w-6" />
                        </button>
                        <img
                            src={zoomImage}
                            alt="Zoom"
                            className="max-w-full max-h-full object-contain rounded-3xl shadow-2xl border border-white/10 animate-in zoom-in-95 duration-500 shadow-blue-500/10"
                        />
                    </div>
                )}
            </DialogContent >
        </Dialog >
    );
}
