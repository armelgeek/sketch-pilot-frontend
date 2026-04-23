"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
    Loader2,
    Plus,
    Sparkles,
    BookOpen,
    ChevronRight,
    Users,
    Trash2,
    UserPlus,
    ArrowLeft,
    Zap,
    Globe,
    ChevronDown,
    RefreshCw,
    Search
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import { seriesService, type Series } from "@/src/services/series-service";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { cn } from "@/src/lib/utils";
import { Progress } from "@/src/components/ui/progress";
import { Card, CardContent } from "@/src/components/ui/card";
import TextareaAutosize from "react-textarea-autosize";

const adminService = new AdminService();

export default function SeriesCreatePage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [seriesId, setSeriesId] = useState<string | null>(searchParams.get('id'));
    const [loading, setLoading] = useState(false);
    const [isPreparing, setIsPreparing] = useState(false);
    const [isRegeneratingRoadmap, setIsRegeneratingRoadmap] = useState(false);
    const [preparationProgress, setPreparationProgress] = useState<number | null>(null);
    const [preparationMessage, setPreparationMessage] = useState<string>("");
    const [isSuggesting, setIsSuggesting] = useState(false);
    const [generatingCharacters, setGeneratingCharacters] = useState<Record<string, boolean>>({});
    const [generatingLocations, setGeneratingLocations] = useState<Record<string, boolean>>({});
    const [error, setError] = useState<string | null>(null);
    const [step, setStep] = useState<'basics' | 'universe' | 'casting' | 'locations' | 'roadmap'>('basics');
    const [suggestedTitles, setSuggestedTitles] = useState<string[]>([]);

    const [prompts, setPrompts] = useState<any[]>([]);
    const [models, setModels] = useState<any[]>([]);

    const [form, setForm] = useState({
        title: "",
        description: "",
        globalContext: "",
        totalEpisodes: "10",
        characterRegistry: {} as Record<string, any>,
        locationRegistry: {} as Record<string, any>,
        language: "fr",
        aspectRatio: "16:9",
        duration: "60",
        videoGenre: "",
        promptId: "",
        visualStyleModelId: "",
        referenceStyleImage: "",
        plannedEpisodes: [] as { number: number; title: string; hook: string }[],
    });

    useEffect(() => {
        Promise.all([
            adminService.listStandardModels(),
            adminService.listModels(),
            adminService.listPublicPrompts({ limit: 100 })
        ]).then(([std, pers, ppts]) => {
            setModels([...(std.data || []), ...(pers.data || [])]);
            setPrompts(ppts.data || []);
            if (ppts.data?.length > 0) {
                setForm(prev => ({ ...prev, promptId: ppts.data[0].id }));
            }
        });
    }, []);

    // Remove Automatic Casting Trigger useEffect
    // Automatic Casting Trigger
    /* useEffect(() => {
        if (step === 'casting') {
            const charactersToGenerate = Object.entries(form.characterRegistry)
                .filter(([_, char]) => !char.thumbnailUrl)
                .map(([name, _]) => name);
            
            charactersToGenerate.forEach(name => handleGeneratePortrait(name));
        }
    }, [step]); */

    // Load existing draft
    useEffect(() => {
        const id = searchParams.get('id');
        if (id) {
            seriesService.getById(id).then(s => {
                if (s) {
                    setSeriesId(s.id);
                    setForm(prev => ({
                        ...prev,
                        title: s.title,
                        description: s.description || '',
                        globalContext: s.globalContext || '',
                        characterRegistry: (s.characterRegistry as any) || {},
                        locationRegistry: (s.locationRegistry as any) || {},
                        visualStyleModelId: s.visualStyleModelId || 'natural-clay',
                        language: s.language || 'fr',
                        videoGenre: s.videoGenre || 'Horreur Historique',
                        totalEpisodes: s.totalEpisodes ? s.totalEpisodes.toString() : "5",
                        plannedEpisodes: s.plannedEpisodes || []
                    }));
                    if (s.plannedEpisodes) {
                        setSuggestedTitles(s.plannedEpisodes.map(ep => ep.title));
                    }
                    // Skip to roadmap if already has episodes, else casting, else universe
                    if (s.plannedEpisodes?.length) setStep('roadmap');
                    else if (Object.keys(s.locationRegistry || {}).length) setStep('locations');
                    else if (Object.keys(s.characterRegistry || {}).length) setStep('casting');
                    else setStep('universe');
                }
            });
        }
    }, []);

    // Sync Series ID with URL
    useEffect(() => {
        if (seriesId && searchParams.get('id') !== seriesId) {
            const params = new URLSearchParams(searchParams.toString());
            params.set('id', seriesId);
            router.replace(`/series/create?${params.toString()}`);
        }
    }, [seriesId, searchParams, router]);

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
            setError("Impossible de suggérer une idée.");
        } finally {
            setIsSuggesting(false);
        }
    };

    // ─── STEP 1: Draft (basics → universe) ─────────────────────────────────
    const handleDraft = async () => {
        if (!form.title.trim()) {
            setError("Veuillez entrer une idée pour lancer la préparation.");
            return;
        }
        setIsPreparing(true);
        setPreparationProgress(10);
        setPreparationMessage("Rédaction du script et des épisodes...");
        setError(null);
        try {
            const result = await seriesService.prepareDraft({
                title: form.title,
                seriesId: seriesId || undefined,
                description: form.description,
                language: form.language,
                totalEpisodes: parseInt(form.totalEpisodes, 10) || 5,
                referenceStyleImage: form.referenceStyleImage || undefined,
            });
            if (!result.success) throw new Error(result.error || "Échec de la rédaction.");
            setSeriesId(result.seriesId);
            setForm(prev => ({
                ...prev,
                globalContext: result.script,
                plannedEpisodes: result.episodes || [],
            }));
            setPreparationProgress(100);
            setTimeout(() => {
                setIsPreparing(false);
                setPreparationProgress(null);
                setStep('universe');
            }, 400);
        } catch (err: any) {
            setError(err.message || "L'IA n'a pas pu rédiger la saga.");
            setIsPreparing(false);
            setPreparationProgress(null);
        }
    };

    // ─── STEP 2: Enrich (universe → casting) ────────────────────────────────
    const handleEnrich = async () => {
        if (!seriesId) { setError("Lancez d'abord l'étape 1."); return; }
        setIsPreparing(true);
        setPreparationProgress(10);
        setPreparationMessage("Analyse des personnages et des lieux...");
        setError(null);
        try {
            const result = await seriesService.prepareEnrich(seriesId, form.globalContext);
            if (!result.success) throw new Error(result.error || "Échec de l'analyse.");
            setForm(prev => ({
                ...prev,
                characterRegistry: result.characterRegistry || prev.characterRegistry,
                locationRegistry: result.locationRegistry || prev.locationRegistry,
            }));
            setPreparationProgress(100);
            setTimeout(() => {
                setIsPreparing(false);
                setPreparationProgress(null);
                setStep('casting');
            }, 400);
        } catch (err: any) {
            setError(err.message || "L'IA n'a pas pu analyser la saga.");
            setIsPreparing(false);
            setPreparationProgress(null);
        }
    };

    // ─── STEP 3: Portraits (casting → locations) ────────────────────────────
    const handlePortraits = async () => {
        if (!seriesId) { setError("Lancez d'abord l'étape 2."); return; }
        setIsPreparing(true);
        setPreparationProgress(10);
        setPreparationMessage("Création des portraits visuels...");
        setError(null);
        try {
            const result = await seriesService.preparePortraits(seriesId, form.visualStyleModelId || undefined);
            if (!result.success) throw new Error(result.error || "Échec des portraits.");
            setForm(prev => ({
                ...prev,
                characterRegistry: result.characterRegistry || prev.characterRegistry,
            }));
            setPreparationProgress(100);
            setTimeout(() => {
                setIsPreparing(false);
                setPreparationProgress(null);
                setStep('locations');
            }, 400);
        } catch (err: any) {
            setError(err.message || "L'IA n'a pas pu créer les portraits.");
            setIsPreparing(false);
            setPreparationProgress(null);
        }
    };

    // ─── Regenerate roadmap only ─────────────────────────────────────────────
    const handleRegenerateRoadmap = async () => {
        if (!seriesId) return;
        setIsRegeneratingRoadmap(true);
        setError(null);
        try {
            const result = await seriesService.prepareDraft({
                title: form.title,
                seriesId,
                description: form.description,
                language: form.language,
                totalEpisodes: parseInt(form.totalEpisodes, 10) || 5,
            });
            if (!result.success) throw new Error(result.error || "Échec.");
            setForm(prev => ({
                ...prev,
                globalContext: result.script,
                plannedEpisodes: result.episodes || [],
            }));
        } catch (err: any) {
            setError(err.message || "Échec de la régénération.");
        } finally {
            setIsRegeneratingRoadmap(false);
        }
    };

    const handleSubmit = async () => {
        if (step === 'basics') { await handleDraft(); return; }
        if (step === 'universe') { await handleEnrich(); return; }
        if (step === 'casting') { await handlePortraits(); return; }
        if (step === 'locations') { setStep('roadmap'); return; }

        setLoading(true);
        try {
            if (seriesId) {
                await seriesService.update(seriesId, { status: 'active' });
                router.push(`/series/${seriesId}`);
            } else {
                const series = await seriesService.create(form);
                router.push(`/series/${series.id}`);
            }
        } catch (err) {
            setError("Échec de la finalisation.");
        } finally {
            setLoading(false);
        }
    };



    const handleGenerateAllPortraits = () => {
        Object.entries(form.characterRegistry).forEach(([name, char]: [string, any]) => {
            if (!char.thumbnailUrl) handleGeneratePortrait(name);
        });
    };

    const handleGeneratePortrait = async (charName: string) => {
        const char = form.characterRegistry[charName];
        if (!char || !form.visualStyleModelId || !char.portraitPrompt) return;
        if (generatingCharacters[charName]) return;
        try {
            setGeneratingCharacters(prev => ({ ...prev, [charName]: true }));
            const result = await adminService.generateCharacterImage(form.visualStyleModelId, char.portraitPrompt);
            if (result.success && result.imageUrl) {
                const newRegistry = { ...form.characterRegistry, [charName]: { ...form.characterRegistry[charName], thumbnailUrl: result.imageUrl } };
                setForm(prev => ({ ...prev, characterRegistry: newRegistry }));
                if (seriesId) await seriesService.update(seriesId, { characterRegistry: newRegistry });
            }
        } catch (err) { } finally {
            setGeneratingCharacters(prev => ({ ...prev, [charName]: false }));
        }
    };

    const handleGenerateAllLocations = () => {
        Object.entries(form.locationRegistry).forEach(([name, data]: [string, any]) => {
            if (!data.thumbnailUrl) handleGenerateLocation(name);
        });
    };

    const handleGenerateLocation = async (locName: string) => {
        const loc = form.locationRegistry[locName];
        if (!loc || !form.visualStyleModelId || !loc.description) return;
        if (generatingLocations[locName]) return;
        try {
            setGeneratingLocations(prev => ({ ...prev, [locName]: true }));
            const result = await adminService.generateCharacterImage(form.visualStyleModelId, `Landscape orientation, cinematic master shot of: ${loc.description}`);
            if (result.success && result.imageUrl) {
                const newRegistry = { ...form.locationRegistry, [locName]: { ...form.locationRegistry[locName], thumbnailUrl: result.imageUrl } };
                setForm(prev => ({ ...prev, locationRegistry: newRegistry }));
                if (seriesId) await seriesService.update(seriesId, { locationRegistry: newRegistry });
            }
        } catch (err) { } finally {
            setGeneratingLocations(prev => ({ ...prev, [locName]: false }));
        }
    };

    const updateEpisode = async (index: number, field: string, value: string) => {
        const newEpisodes = form.plannedEpisodes.map((ep, i) => i === index ? { ...ep, [field]: value } : ep);
        setForm(prev => ({ ...prev, plannedEpisodes: newEpisodes }));
        if (seriesId) await seriesService.update(seriesId, { plannedEpisodes: newEpisodes });
    };

    const addEpisode = async () => {
        const newEpisodes = [...form.plannedEpisodes, { number: form.plannedEpisodes.length + 1, title: "Nouvel épisode", hook: "Décrivez l'intrigue..." }];
        setForm(prev => ({ ...prev, plannedEpisodes: newEpisodes }));
        if (seriesId) await seriesService.update(seriesId, { plannedEpisodes: newEpisodes });
    };

    const removeEpisode = async (index: number) => {
        const newEpisodes = form.plannedEpisodes.filter((_, i) => i !== index).map((ep, i) => ({ ...ep, number: i + 1 }));
        setForm(prev => ({ ...prev, plannedEpisodes: newEpisodes }));
        if (seriesId) await seriesService.update(seriesId, { plannedEpisodes: newEpisodes });
    };

    const steps = [

        { id: 'basics', label: 'Identité' },
        { id: 'universe', label: 'Univers' },
        { id: 'casting', label: 'Casting' },
        { id: 'locations', label: 'Lieux' },
        { id: 'roadmap', label: 'Planning' }
    ];

    return (
        <div className="min-h-screen -m-6 bg-[#FAFAFA] flex flex-col items-center justify-center p-6 relative overflow-hidden grain-overlay">
            {/* Mesh Gradient Background */}
            <div className="mesh-gradient-premium absolute inset-0 -z-10 opacity-60" />

            <div className="w-full max-w-2xl space-y-10 relative z-10">
                {/* Header Actions */}
                <div className="flex items-center justify-between">
                    <button 
                        onClick={() => step === 'basics' ? router.back() : setStep(steps[steps.findIndex(s => s.id === step)-1].id as any)}
                        className="flex items-center gap-2 text-stone-400 hover:text-stone-800 transition-colors group"
                    >
                        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Retour</span>
                    </button>
                    
                    {/* Minimal Progress Steps */}
                    <div className="flex items-center gap-1.5 p-1 rounded-full bg-stone-100/50 border border-stone-200/40">
                        {steps.map((s, idx) => (
                            <div 
                                key={s.id} 
                                className={cn(
                                    "h-1.5 w-6 rounded-full transition-all duration-500",
                                    step === s.id ? "bg-amber-500 w-10 shadow-sm" : 
                                    (idx < steps.findIndex(x => x.id === step) ? "bg-amber-200" : "bg-white")
                                )} 
                            />
                        ))}
                    </div>
                </div>

                <div className="text-center space-y-2">
                    <h1 className="text-4xl font-black text-stone-900 tracking-tightest uppercase">
                        {step === 'basics' ? "Démarrer une Saga" : 
                         step === 'universe' ? "L'Univers Bible" : 
                         step === 'casting' ? "Casting IA Automatique" : "Roadmap Narrative"}
                    </h1>
                    <p className="text-stone-400 text-[10px] font-black uppercase tracking-[0.25em] opacity-80">
                        {step === 'basics' ? "Sketch Pilot Studio — AI Narrative Engine" : 
                         step === 'universe' ? "Définition de l'arc narratif global" : 
                         step === 'casting' ? "Visualisation des personnages de la saga" : "Prêt à lancer la production"}
                    </p>
                </div>

                {/* The "Paper" Card */}
                <Card className="rounded-md border-stone-200/60 shadow-2xl shadow-stone-200/40 bg-white overflow-hidden animate-in fade-in zoom-in-95 duration-1000">
                    <CardContent className="p-0">
                        {step === 'basics' && (
                            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <div className="px-10 pt-10 pb-6 relative">
                                    <TextareaAutosize
                                        placeholder="Décrivez votre idée de saga..."
                                        className="w-full min-h-[80px] resize-none border-none focus-visible:ring-0 shadow-none outline-none bg-transparent text-xl font-light text-stone-800 placeholder:text-stone-200 leading-relaxed p-0"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        disabled={isPreparing}
                                    />
                                    {isPreparing && (
                                        <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20 px-10">
                                            <div className="text-center w-full max-w-xs">
                                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-6 animate-pulse">
                                                    {preparationMessage}
                                                </p>
                                                <div className="w-full h-1 bg-amber-100 rounded-full overflow-hidden">
                                                    <div 
                                                        className="h-full bg-amber-500 transition-all duration-700 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                                                        style={{ width: `${preparationProgress}%` }}
                                                    />
                                                </div>
                                                <p className="text-[9px] text-stone-400 mt-4 tabular-nums font-bold">{preparationProgress}% complété</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="h-px bg-stone-100/60 mx-10" />
                                <div className="p-10 space-y-10">
                                    <div className="grid grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                                                <Globe className="h-3 w-3 text-amber-500" /> Niche & Langue
                                            </Label>
                                            <div className="space-y-3">
                                                <div className="flex bg-stone-50 border border-stone-100 p-1 rounded-xl gap-1">
                                                    {['fr', 'en'].map(l => (
                                                        <button 
                                                            key={l}
                                                            onClick={() => setForm({...form, language: l})}
                                                            className={cn(
                                                                "flex-1 h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                                                form.language === l ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"
                                                            )}
                                                        >
                                                            {l === 'fr' ? 'FR' : 'EN'}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="relative group">
                                                    <select 
                                                        value={form.promptId}
                                                        onChange={(e) => setForm({...form, promptId: e.target.value})}
                                                        className="w-full h-10 rounded-xl bg-stone-50 border-none font-bold text-xs px-4 appearance-none cursor-pointer focus:ring-0 text-stone-700"
                                                    >
                                                        {prompts.map(p => (
                                                            <option key={p.id} value={p.id}>{p.name}</option>
                                                        ))}
                                                    </select>
                                                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-stone-300 pointer-events-none group-hover:text-stone-500 transition-colors" />
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                                                <Zap className="h-3 w-3 text-amber-500" /> Format & Volume
                                            </Label>
                                            <div className="space-y-3">
                                                <div className="flex bg-stone-50 border border-stone-100 p-1 rounded-xl gap-1">
                                                    {['9:16', '16:9'].map(r => (
                                                        <button 
                                                            key={r}
                                                            onClick={() => setForm({...form, aspectRatio: r})}
                                                            className={cn(
                                                                "flex-1 h-8 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all",
                                                                form.aspectRatio === r ? "bg-white text-stone-900 shadow-sm" : "text-stone-400 hover:text-stone-600"
                                                            )}
                                                        >
                                                            {r === '9:16' ? '9:16' : '16:9'}
                                                        </button>
                                                    ))}
                                                </div>
                                                <div className="flex gap-2">
                                                    <div className="flex-1 relative group">
                                                        <select 
                                                            value={form.duration}
                                                            onChange={(e) => setForm({...form, duration: e.target.value})}
                                                            className="w-full h-10 rounded-xl bg-stone-50 border-none font-bold text-xs px-4 appearance-none cursor-pointer focus:ring-0 text-stone-700"
                                                        >
                                                            <option value="30">30 sec</option>
                                                            <option value="60">60 sec</option>
                                                            <option value="90">90 sec</option>
                                                        </select>
                                                        <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-stone-300 pointer-events-none group-hover:text-stone-500 transition-colors" />
                                                    </div>
                                                    <div className="flex-1">
                                                        <Input 
                                                            type="number"
                                                            placeholder="Épisodes"
                                                            value={form.totalEpisodes}
                                                            onChange={(e) => setForm({...form, totalEpisodes: e.target.value})}
                                                            className="h-10 rounded-xl bg-stone-50 border-none font-bold text-xs px-4"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                                                <Sparkles className="h-3 w-3 text-amber-500" /> Style Visuel de Référence
                                            </Label>
                                            <span className="text-[8px] font-bold text-amber-600 uppercase tracking-widest bg-amber-50 px-2 py-0.5 rounded-full border border-amber-100">
                                                Visual DNA Lock
                                            </span>
                                        </div>
                                        <div className="grid grid-cols-6 gap-3">
                                            <button
                                                onClick={() => setForm({ ...form, visualStyleModelId: "" })}
                                                className={cn(
                                                    "aspect-square rounded-2xl border-2 flex flex-col items-center justify-center gap-1 transition-all",
                                                    !form.visualStyleModelId ? "border-amber-500 bg-amber-50 shadow-inner scale-105" : "border-stone-100 hover:border-stone-200 bg-stone-50/50"
                                                )}
                                            >
                                                <Plus className="h-4 w-4 text-stone-300" />
                                                <span className="text-[8px] font-black uppercase text-stone-400">Auto</span>
                                            </button>
                                            {models.slice(0, 5).map(m => (
                                                <button
                                                    key={m.id}
                                                    onClick={() => setForm({ ...form, visualStyleModelId: m.id })}
                                                    className={cn(
                                                        "aspect-square rounded-2xl border-2 overflow-hidden transition-all relative group",
                                                        form.visualStyleModelId === m.id ? "border-amber-500 shadow-xl scale-110 z-10" : "border-stone-100 hover:border-stone-200"
                                                    )}
                                                >
                                                    <img src={m.images?.[0] || m.thumbnailUrl} className="w-full h-full object-cover" />
                                                    <div className={cn(
                                                        "absolute inset-x-0 bottom-0 py-1 transition-all",
                                                        form.visualStyleModelId === m.id ? "bg-amber-500/90 text-white" : "bg-white/80 text-stone-600"
                                                    )}>
                                                        <span className="text-[6px] font-black uppercase line-clamp-1 px-1">{m.name}</span>
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'universe' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-700 p-10 space-y-10 relative">
                                {isPreparing && (
                                    <div className="absolute inset-0 bg-white/95 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20 px-10">
                                        <div className="text-center w-full max-w-xs">
                                            <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-6 animate-pulse">
                                                {preparationMessage}
                                            </p>
                                            <div className="w-full h-1 bg-amber-100 rounded-full overflow-hidden">
                                                <div 
                                                    className="h-full bg-amber-500 transition-all duration-700 shadow-[0_0_10px_rgba(245,158,11,0.5)]" 
                                                    style={{ width: `${preparationProgress}%` }}
                                                />
                                            </div>
                                            <p className="text-[9px] text-stone-400 mt-4 tabular-nums font-bold">{preparationProgress}% complété</p>
                                        </div>
                                    </div>
                                )}
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between px-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                                            <BookOpen className="h-4 w-4 text-amber-500" /> La Bible de l'Univers
                                        </Label>
                                        <button 
                                            onClick={() => handleRegenerateRoadmap()}
                                            disabled={isPreparing}
                                            className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600 hover:text-amber-700 gap-2 flex items-center transition-colors px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100"
                                        >
                                            <RefreshCw className={cn("h-3 w-3", isPreparing && "animate-spin")} /> Mettre à jour (IA)
                                        </button>
                                    </div>
                                    <Textarea 
                                        value={form.globalContext}
                                        onChange={(e) => setForm({...form, globalContext: e.target.value})}
                                        className="min-h-[240px] rounded-[2rem] bg-stone-50 border-stone-100 font-medium text-sm p-8 resize-none focus:border-stone-200 focus:ring-0 leading-relaxed transition-all"
                                        placeholder="Le contexte global..."
                                    />

                                    {suggestedTitles.length > 0 && (
                                        <div className="space-y-4">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400 px-2">Titres suggérés par l'IA</Label>
                                            <div className="flex flex-wrap gap-2">
                                                {suggestedTitles.map(t => (
                                                    <button 
                                                        key={t}
                                                        onClick={async () => {
                                                            setForm(prev => ({ ...prev, title: t }));
                                                            if (seriesId) await seriesService.update(seriesId, { title: t });
                                                        }}
                                                        className={cn(
                                                            "px-4 py-2 rounded-xl text-[10px] font-bold border transition-all",
                                                            form.title === t ? "bg-amber-500 border-amber-500 text-white" : "bg-stone-50 border-stone-100 text-stone-600 hover:border-amber-200"
                                                        )}
                                                    >
                                                        {t}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <p className="text-[9px] text-stone-400 italic px-4">Modifiez la bible et cliquez sur "Mettre à jour" pour recalculer le casting et les épisodes.</p>
                                </div>
                            </div>
                        )}

                        {step === 'casting' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-700 p-10 space-y-10">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Distribution / Casting IA</Label>
                                        <button 
                                            onClick={handleGenerateAllPortraits}
                                            className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600 hover:text-amber-700 gap-2 flex items-center transition-colors px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100"
                                        >
                                            <Sparkles className="h-3 w-3" /> Lancer le Casting IA
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {Object.entries(form.characterRegistry).map(([name, char]: [string, any]) => (
                                            <div key={name} className="p-4 rounded-[1.5rem] bg-stone-50 border border-stone-100 hover:border-stone-200 transition-all flex gap-4 group">
                                                <div className="relative shrink-0">
                                                    <Avatar className={cn(
                                                        "h-16 w-16 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-white transition-all duration-1000",
                                                        generatingCharacters[name] && "opacity-40 scale-95 grayscale"
                                                    )}>
                                                        <AvatarImage src={char.thumbnailUrl} className="object-cover" />
                                                        <AvatarFallback className="bg-stone-50 text-stone-300">
                                                            {generatingCharacters[name] ? <Loader2 className="h-6 w-6 animate-spin" /> : <Users className="h-6 w-6" />}
                                                        </AvatarFallback>
                                                    </Avatar>
                                                    <button 
                                                        onClick={() => handleGeneratePortrait(name)}
                                                        disabled={generatingCharacters[name]}
                                                        className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-stone-900 border border-stone-800 text-white flex items-center justify-center shadow-lg hover:bg-amber-600 hover:border-amber-500 transition-all"
                                                    >
                                                        {generatingCharacters[name] ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                                                    </button>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-black text-stone-900 text-[11px] truncate uppercase tracking-tight">
                                                            {char.fullName || name.replace(/^@/, '')}
                                                        </h4>
                                                        <span className="text-[8px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100">
                                                            @{name.replace(/^@/, '')}
                                                        </span>
                                                    </div>
                                                    <p className="text-[10px] text-stone-400 leading-snug line-clamp-2 mt-1 italic font-medium">{char.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'locations' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-700 p-10 space-y-10">
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400">Atmosphère / Lieux & Décors</Label>
                                        <button 
                                            onClick={handleGenerateAllLocations}
                                            className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 hover:text-emerald-700 gap-2 flex items-center transition-colors px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-100"
                                        >
                                            <Globe className="h-3 w-3" /> Lancer la génération des Décors
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                        {Object.entries(form.locationRegistry).map(([name, data]: [string, any]) => (
                                            <div key={name} className="p-4 rounded-[1.5rem] bg-stone-50 border border-stone-100 hover:border-stone-200 transition-all flex gap-4 group">
                                                <div className="relative shrink-0">
                                                    <div className={cn(
                                                        "h-16 w-32 rounded-2xl border-2 border-white shadow-md overflow-hidden bg-white transition-all duration-1000 flex items-center justify-center",
                                                        generatingLocations[name] && "opacity-40 scale-95 grayscale"
                                                    )}>
                                                        {data.thumbnailUrl ? (
                                                            <img src={data.thumbnailUrl} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <div className="text-stone-200">
                                                                {generatingLocations[name] ? <Loader2 className="h-6 w-6 animate-spin" /> : <Globe className="h-6 w-6" />}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <button 
                                                        onClick={() => handleGenerateLocation(name)}
                                                        disabled={generatingLocations[name]}
                                                        className="absolute -bottom-1 -right-1 h-6 w-6 rounded-lg bg-stone-900 border border-stone-800 text-white flex items-center justify-center shadow-lg hover:bg-emerald-600 hover:border-emerald-500 transition-all"
                                                    >
                                                        {generatingLocations[name] ? <RefreshCw className="h-3 w-3 animate-spin" /> : <RefreshCw className="h-3 w-3" />}
                                                    </button>
                                                </div>
                                                <div className="min-w-0 flex-1">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-black text-stone-900 text-[11px] truncate uppercase tracking-tight">
                                                            {name}
                                                        </h4>
                                                    </div>
                                                    <p className="text-[10px] text-stone-400 leading-snug line-clamp-2 mt-1 italic font-medium">{data.description}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 'roadmap' && (
                            <div className="animate-in fade-in slide-in-from-right-4 duration-700 p-10 space-y-10 relative">
                                {isRegeneratingRoadmap && (
                                    <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center gap-4 z-20">
                                        <RefreshCw className="h-10 w-10 text-amber-500 animate-spin" />
                                        <p className="text-xs font-black uppercase tracking-widest text-stone-500">Optimisation de l'arc narratif...</p>
                                    </div>
                                )}
                                
                                <div className="space-y-6">
                                    <div className="flex items-center justify-between px-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-stone-400 flex items-center gap-2">
                                            <Zap className="h-4 w-4 text-amber-500" /> Planning des Épisodes ({form.plannedEpisodes.length})
                                        </Label>
                                        <button 
                                            onClick={() => handleRegenerateRoadmap()}
                                            disabled={isRegeneratingRoadmap}
                                            className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600 hover:text-amber-700 gap-2 flex items-center transition-colors px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100"
                                        >
                                            <RefreshCw className={cn("h-3 w-3", isRegeneratingRoadmap && "animate-spin")} /> Régénérer la Roadmap
                                        </button>
                                    </div>

                                    <div className="grid grid-cols-1 gap-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar pb-10">
                                        {form.plannedEpisodes.map((ep, idx) => (
                                            <div key={idx} className="flex gap-4 p-5 rounded-3xl bg-stone-50/50 border border-stone-100 hover:border-stone-200 transition-all group relative">
                                                <div className="h-10 w-10 rounded-2xl bg-white border border-stone-100 flex items-center justify-center text-[10px] font-black text-amber-600 shrink-0 shadow-sm">
                                                    {idx + 1}
                                                </div>
                                                <div className="flex-1 min-w-0 space-y-2">
                                                    <input 
                                                        value={ep.title}
                                                        onChange={(e) => updateEpisode(idx, 'title', e.target.value)}
                                                        className="w-full bg-transparent border-none p-0 font-bold text-stone-800 text-sm focus:ring-0 uppercase tracking-tight placeholder:text-stone-300"
                                                        placeholder="Titre de l'épisode"
                                                    />
                                                    <TextareaAutosize 
                                                        value={ep.hook}
                                                        onChange={(e) => updateEpisode(idx, 'hook', e.target.value)}
                                                        className="w-full bg-transparent border-none p-0 text-[10px] text-stone-500 leading-tight italic focus:ring-0 resize-none placeholder:text-stone-300"
                                                        placeholder="Que se passe-t-il dans cet épisode ?"
                                                    />
                                                </div>
                                                <button 
                                                    onClick={() => removeEpisode(idx)}
                                                    className="absolute top-4 right-4 text-stone-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </button>
                                            </div>
                                        ))}

                                        <button 
                                            onClick={addEpisode}
                                            className="w-full py-4 rounded-3xl border-2 border-dashed border-stone-100 text-stone-300 hover:border-stone-200 hover:text-stone-400 transition-all flex items-center justify-center gap-2 group"
                                        >
                                            <Plus className="h-4 w-4 transition-transform group-hover:scale-110" />
                                            <span className="text-[10px] font-black uppercase tracking-widest">Ajouter un épisode</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Main Action Footer */}
                <div className="flex flex-col items-center gap-6">
                    <div className="relative group w-full max-w-xs">
                        <div className="absolute -inset-1 bg-amber-500/20 blur opacity-0 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 rounded-[2rem]" />
                        <Button
                            onClick={handleSubmit}
                            disabled={loading || isPreparing || isRegeneratingRoadmap || (step === 'basics' && !form.title.trim())}
                            className={cn(
                                "w-full h-16 rounded-[2rem] font-black uppercase tracking-[0.25em] text-[11px] transition-all relative z-10 shadow-2xl disabled:opacity-30",
                                step === 'basics' ? "bg-stone-900 text-white hover:bg-stone-800 active:scale-95" :
                                "bg-amber-500 text-white hover:bg-amber-600 active:scale-95 shadow-amber-500/30"
                            )}
                        >
                            {loading || isPreparing ? (
                                <Loader2 className="h-5 w-5 animate-spin" />
                            ) : (
                                <div className="flex items-center gap-4">
                                    {step === 'basics' ? "Préparer l'Univers (5 cr.)" : 
                                     step === 'universe' ? "Valider la Bible" : 
                                     step === 'casting' ? "Valider le Casting" : 
                                     step === 'locations' ? "Valider les Lieux" : "Lancer la Saga"}
                                    <ChevronRight className="h-4 w-4" />
                                </div>
                            )}
                        </Button>
                    </div>

                    <div className="flex items-center gap-8">
                        <button 
                            type="button"
                            onClick={handleSuggestIdea}
                            disabled={isSuggesting || isPreparing}
                            className="text-[9px] font-black uppercase tracking-[0.25em] text-stone-300 hover:text-amber-500 transition-colors flex items-center gap-2 group"
                        >
                            <Sparkles className={cn("h-3 w-3 group-hover:rotate-12 transition-transform", isSuggesting && "animate-spin")} />
                            {isSuggesting ? "Inspiration..." : "Inspiration IA (2 pts)"}
                        </button>
                        
                        <div className="h-4 w-px bg-stone-100" />

                        <div className="flex items-center gap-1.5 grayscale opacity-40">
                             <span className="text-[8px] font-black uppercase tracking-widest text-stone-400">Sketch Pilot Engine V3</span>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="p-5 rounded-2xl bg-red-50/50 border border-red-100 flex items-center gap-4 animate-in fade-in slide-in-from-top-2 backdrop-blur-sm">
                        <div className="h-2 w-2 rounded-full bg-red-500 animate-pulse" />
                        <p className="text-[10px] font-bold text-red-600 uppercase tracking-widest italic">{error}</p>
                    </div>
                )}
            </div>
        </div>
    );
}