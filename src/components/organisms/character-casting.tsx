import { useState, useMemo } from "react";
import Image from "next/image";
import { User, Sparkles, Wand2, Check, UserPlus, Loader2, Save, Library, UserCircle, Mic2, Monitor, Eye, EyeOff, LayoutPanelTop, PlayCircle } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Badge } from "@/src/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue, SelectGroup, SelectLabel } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/src/components/ui/dialog";
import { Textarea } from "@/src/components/ui/textarea";
import { GenerationVariantGallery } from "@/src/app/character-models/components";
import { Switch } from "@/src/components/ui/switch";
import { Label } from "@/src/components/ui/label";

export interface GenerationVariant {
    id: string;
    imageUrl: string;
    seedUsed?: number;
    generatedAt?: string;
}

export interface CharacterSheet {
    id: string;
    name: string;
    role: string;
    appearance?: {
        description: string;
    };
    metadata?: {
        gender?: string;
        age?: string;
    };
    modelId?: string;
    voiceId?: string;
    referenceImageUrl?: string;
    generationVariants?: GenerationVariant[];
    lockedPromptSegment?: string;
}

interface CharacterCastingProps {
    characters: CharacterSheet[];
    availableModels: Array<{ id: string; name: string; imageUrl: string; userId?: string }>;
    availableVoices?: Array<{ id: string; presetId: string; name: string; language: string; gender: string; previewUrl?: string }>;
    onCastChange: (characterId: string, updates: {
        modelId?: string,
        voiceId?: string,
        referenceImageUrl?: string,
        appearance?: { description: string },
        generationVariants?: GenerationVariant[],
        lockedPromptSegment?: string
    }) => void;
    onGenerate: (characterId: string, prompt: string, modelId?: string) => Promise<string>;
    onSaveAsModel?: (name: string, imageUrl: string, description: string, voiceId?: string) => Promise<void>;
    onDetect?: () => void;
}

export function CharacterCasting({ characters, availableModels, availableVoices, onCastChange, onGenerate, onSaveAsModel, onDetect }: CharacterCastingProps) {
    // Advanced state for prompts: DNA (Appearance) vs Action
    // Initializing DNA from lockedPromptSegment if it exists, fallback to current description
    const [appearancePrompts, setAppearancePrompts] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        characters.forEach(c => {
            initial[c.id] = c.lockedPromptSegment || c.appearance?.description || "";
        });
        return initial;
    });

    const [actionPrompts, setActionPrompts] = useState<Record<string, string>>(() => {
        const initial: Record<string, string> = {};
        characters.forEach(c => {
            initial[c.id] = ""; // Actions start empty for focus
        });
        return initial;
    });

    const [generating, setGenerating] = useState<Record<string, boolean>>({});
    const [savingModel, setSavingModel] = useState<Record<string, boolean>>({});
    const [openGenerators, setOpenGenerators] = useState<Record<string, boolean>>({});
    const [isWhiteboard, setIsWhiteboard] = useState<Record<string, boolean>>({});
    const [batchGenerating, setBatchGenerating] = useState(false);

    const systemModels = availableModels.filter(m => !m.userId);
    const personalModels = availableModels.filter(m => !!m.userId);

    if (!characters || characters.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-8 bg-zinc-50 dark:bg-zinc-800/10 rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800 gap-4">
                <div className="p-4 bg-white dark:bg-zinc-800 rounded-full shadow-lg">
                    <User className="h-8 w-8 text-zinc-300" />
                </div>
                <div className="text-center space-y-1">
                    <h4 className="font-bold text-zinc-800 dark:text-zinc-100 italic">Aucun personnage détecté</h4>
                    <p className="text-sm text-zinc-500 max-w-70">
                        Utilisez le bouton ci-dessous pour tenter de détecter les personnages dans votre script.
                    </p>
                </div>
                <Button
                    variant="outline"
                    size="sm"
                    className="rounded-xl border-emerald-500/20 hover:bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-bold"
                    onClick={() => onDetect?.()}
                >
                    <Sparkles className="h-4 w-4 mr-2" />
                    Détecter les personnages
                </Button>
            </div>
        );
    }

    const handleGenerate = async (charId: string, modelId?: string) => {
        const dna = appearancePrompts[charId];
        const action = actionPrompts[charId];
        const fullPrompt = [dna, action].filter(Boolean).join(", ");

        if (!fullPrompt) return;

        try {
            setGenerating(prev => ({ ...prev, [charId]: true }));
            const imageUrl = await onGenerate(charId, fullPrompt, modelId);
            const char = characters.find(c => c.id === charId);

            const newVariant: GenerationVariant = {
                id: `variant-${Date.now()}`,
                imageUrl: imageUrl,
                seedUsed: Math.floor(Math.random() * 1000000),
                generatedAt: new Date().toISOString(),
            };

            const updatedVariants = [newVariant, ...(char?.generationVariants || [])].slice(0, 4);

            onCastChange(charId, {
                referenceImageUrl: imageUrl,
                appearance: { description: dna }, // Appearance stays as reference
                lockedPromptSegment: dna,
                generationVariants: updatedVariants,
            });

            return imageUrl;
        } catch (error) {
            console.error("Generation failed", error);
            throw error;
        } finally {
            setGenerating(prev => ({ ...prev, [charId]: false }));
        }
    };

    const handleGenerateAll = async () => {
        try {
            setBatchGenerating(true);
            for (const char of characters) {
                if (!char.referenceImageUrl) {
                    await handleGenerate(char.id, char.modelId);
                }
            }
        } catch (error) {
            console.error("Batch generation failed", error);
        } finally {
            setBatchGenerating(false);
        }
    };

    const handleSaveAsModel = async (charId: string) => {
        const char = characters.find(c => c.id === charId);
        if (!char || !char.referenceImageUrl || !onSaveAsModel) return;

        try {
            setSavingModel(prev => ({ ...prev, [charId]: true }));
            // We save the "DNA" (appearance) as the model description
            await onSaveAsModel(char.name, char.referenceImageUrl, appearancePrompts[charId] || "", char.voiceId);
        } catch (error) {
            console.error("Failed to save as model", error);
        } finally {
            setSavingModel(prev => ({ ...prev, [charId]: false }));
        }
    };

    const toggleWhiteboard = (charId: string) => {
        setIsWhiteboard(prev => ({ ...prev, [charId]: !prev[charId] }));
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">
                    <UserPlus className="h-4 w-4" />
                    Casting des Personnages
                </div>

                <Button
                    variant="ghost"
                    size="sm"
                    disabled={batchGenerating}
                    onClick={handleGenerateAll}
                    className="rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 hover:bg-emerald-500 text-[10px] font-black italic px-4 uppercase tracking-tighter shadow-sm"
                >
                    {batchGenerating ? (
                        <Loader2 className="h-3 w-3 mr-2 animate-spin" />
                    ) : (
                        <PlayCircle className="h-3 w-3 mr-2" />
                    )}
                    {batchGenerating ? "Génération en cours..." : "Générer Tout le Casting (5 🪙 / pers.)"}
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {characters.map((char) => {
                    const selectedModel = availableModels.find(m => m.id === char.modelId);
                    const isGenerating = generating[char.id];
                    const isSaving = savingModel[char.id];

                    return (
                        <Card key={char.id} className="glass-pill border border-emerald-500/10 shadow-md hover:shadow-lg transition-all overflow-hidden group">
                            <CardContent className="p-4 flex gap-4">
                                <div className="relative">
                                    <Avatar
                                        key={`${char.id}-${char.referenceImageUrl || char.modelId}`}
                                        className="h-20 w-20 border-2 border-emerald-500/20 shadow-inner group-hover:scale-105 transition-transform bg-zinc-100 dark:bg-zinc-800"
                                    >
                                        <AvatarImage
                                            src={char.referenceImageUrl ? `${char.referenceImageUrl}?t=${Date.now()}` : selectedModel?.imageUrl}
                                            className={cn("object-cover transition-opacity duration-300", isGenerating ? "opacity-30" : "opacity-100")}
                                        />
                                        <AvatarFallback className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 font-black text-xl">
                                            {char.name[0]}
                                        </AvatarFallback>
                                        {isGenerating && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <Loader2 className="h-6 w-6 text-emerald-500 animate-spin" />
                                            </div>
                                        )}
                                    </Avatar>
                                    {(char.modelId || char.referenceImageUrl) && (
                                        <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full shadow-lg border-2 border-white dark:border-zinc-900 animate-in zoom-in duration-300">
                                            <Check className="h-3 w-3" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h4 className="font-black text-lg tracking-tight text-zinc-800 dark:text-zinc-100">{char.name}</h4>
                                            <p className="text-xs font-medium text-emerald-600/70 dark:text-emerald-400/60 uppercase tracking-wide">{char.role}</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {char.metadata?.gender && (
                                                <Badge variant="outline" className="text-[10px] py-0 border-emerald-500/20 bg-emerald-500/5">
                                                    {char.metadata.gender}
                                                </Badge>
                                            )}
                                            {char.voiceId && (
                                                <Badge variant="outline" className="text-[10px] py-0 border-blue-500/20 bg-blue-500/5 text-blue-600 dark:text-blue-400">
                                                    🎙️
                                                </Badge>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3">
                                        <div className="flex items-center justify-between p-2 bg-emerald-500/5 rounded-xl border border-emerald-500/10 gap-2">
                                            <div className="flex items-center gap-2 overflow-hidden flex-1">
                                                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
                                                <span className="text-[10px] font-bold text-zinc-500 uppercase truncate">
                                                    {selectedModel?.name || "IA Libre"}
                                                </span>
                                            </div>
                                            <div className="flex gap-1">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    disabled={isGenerating}
                                                    onClick={() => handleGenerate(char.id, char.modelId)}
                                                    className="h-7 px-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black italic rounded-lg text-[9px] transition-all shadow-sm shadow-emerald-500/20 uppercase tracking-tighter"
                                                >
                                                    {isGenerating ? <Loader2 className="h-3 w-3 animate-spin" /> : <Sparkles className="h-3 w-3 mr-1" />}
                                                    Générer (5 🪙)
                                                </Button>
                                                <Dialog
                                                    open={openGenerators[char.id] || false}
                                                    onOpenChange={(open) => setOpenGenerators(prev => ({ ...prev, [char.id]: open }))}
                                                >
                                                    <DialogTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-7 px-2 bg-white dark:bg-zinc-800 border border-emerald-500/20 hover:bg-emerald-50 text-emerald-600 dark:text-emerald-400 font-black italic rounded-lg text-[9px] transition-all shadow-sm uppercase tracking-tighter"
                                                        >
                                                            Editer
                                                        </Button>
                                                    </DialogTrigger>
                                                    <DialogContent className="sm:max-w-6xl  max-h-[90vh] bg-white dark:bg-zinc-900 border-none rounded-4xl overflow-hidden glass-pill shadow-2xl p-0">
                                                        <div className="flex flex-col md:flex-row h-full">
                                                            {/* Left: Huge Preview Section */}
                                                            <div className="relative w-full md:w-1/2 h-64 md:h-[600px] overflow-hidden bg-black/5">
                                                                <div className="absolute inset-0 bg-linear-to-b from-emerald-500/10 via-transparent to-zinc-900/40 z-10 pointer-events-none" />
                                                                <img
                                                                    src={char.referenceImageUrl ? `${char.referenceImageUrl}?t=${Date.now()}` : selectedModel?.imageUrl || "/placeholder-avatar.png"}
                                                                    className={cn(
                                                                        "w-full h-full object-cover transition-all duration-1000",
                                                                        isGenerating ? "scale-110 blur-md grayscale brightness-50" : "scale-100 blur-0 grayscale-0 brightness-100",
                                                                        isWhiteboard[char.id] && !isGenerating && "contrast-[2] grayscale brightness-125 saturate-0"
                                                                    )}
                                                                    alt={char.name}
                                                                />

                                                                {/* Toolbar Overlay */}
                                                                <div className="absolute top-6 left-6 z-20 flex gap-2">
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        onClick={() => toggleWhiteboard(char.id)}
                                                                        className={cn(
                                                                            "rounded-full h-10 w-10 p-0 backdrop-blur-md transition-all",
                                                                            isWhiteboard[char.id] ? "bg-emerald-500 text-white" : "bg-black/20 text-white hover:bg-black/40"
                                                                        )}
                                                                        title="Aperçu Whiteboard"
                                                                    >
                                                                        {isWhiteboard[char.id] ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                                                                    </Button>
                                                                </div>

                                                                {isGenerating && (
                                                                    <div className="absolute inset-0 flex items-center justify-center z-30">
                                                                        <div className="flex flex-col items-center gap-4">
                                                                            <div className="relative">
                                                                                <div className="absolute -inset-4 bg-emerald-500/20 blur-2xl rounded-full animate-pulse" />
                                                                                <Loader2 className="h-16 w-16 text-emerald-500 animate-spin relative z-10" />
                                                                            </div>
                                                                            <span className="text-emerald-500 font-black italic text-base tracking-[0.3em] animate-pulse">MAGIE EN COURS</span>
                                                                        </div>
                                                                    </div>
                                                                )}
                                                                <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                                                                    <Badge className="mb-3 bg-emerald-500 text-white border-none font-black italic text-[11px] px-3 py-1 shadow-lg shadow-emerald-500/30">
                                                                        {isWhiteboard[char.id] ? "SIMULATION WHITEBOARD" : "APERCU PHOTO"}
                                                                    </Badge>
                                                                    <h4 className="text-4xl font-black text-white italic leading-tight drop-shadow-2xl">{char.name}</h4>
                                                                    <p className="text-emerald-400 font-bold uppercase tracking-[0.2em] mt-2 drop-shadow-md">{char.role}</p>
                                                                </div>
                                                            </div>

                                                            {/* Right: Configuration Section */}
                                                            <div className="w-full md:w-1/2 sm:max-w-6xl  max-h-[90vh] overflow-y-auto p-10 flex flex-col justify-between bg-white dark:bg-zinc-900/50 backdrop-blur-xl shrink-0 overflow-y-auto">
                                                                <div className="space-y-8">
                                                                    <div className="flex items-start justify-between">
                                                                        <div className="space-y-2">
                                                                            <h3 className="text-2xl font-black italic text-zinc-800 dark:text-zinc-100 tracking-tight">Configuration IA</h3>
                                                                            <p className="text-xs font-medium text-zinc-400">Ajustez le style et la cohérence de votre personnage.</p>
                                                                        </div>
                                                                        <Badge className="bg-emerald-500/10 text-emerald-600 border-none font-black italic text-[10px]">S-PILOT v2.1</Badge>
                                                                    </div>

                                                                    <div className="grid grid-cols-2 gap-4">
                                                                        <div className="space-y-3">
                                                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                                                                <Monitor className="h-3 w-3" /> ADN Visuel
                                                                            </label>
                                                                            <Select
                                                                                value={char.modelId || "none"}
                                                                                onValueChange={(val) => onCastChange(char.id, { modelId: val === "none" ? undefined : val })}
                                                                            >
                                                                                <SelectTrigger className="h-12 bg-zinc-50 dark:bg-zinc-800/80 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl px-4 text-xs font-black italic shadow-inner transition-all">
                                                                                    <SelectValue placeholder="ADN Style" />
                                                                                </SelectTrigger>
                                                                                <SelectContent className="rounded-2xl border-emerald-500/20 shadow-2xl p-2 min-w-60">
                                                                                    <SelectItem value="none" className="text-xs font-bold py-3 rounded-xl">
                                                                                        <div className="flex items-center gap-3">
                                                                                            <div className="h-6 w-6 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                                                                <Sparkles className="h-3 w-3 text-zinc-400" />
                                                                                            </div>
                                                                                            IA Libre (Génération sans base)
                                                                                        </div>
                                                                                    </SelectItem>

                                                                                    {personalModels.length > 0 && (
                                                                                        <SelectGroup>
                                                                                            <SelectLabel className="px-3 pt-4 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-600 flex items-center gap-2">
                                                                                                <UserCircle className="h-3 w-3" />
                                                                                                Mes Modèles Persos
                                                                                            </SelectLabel>
                                                                                            {personalModels.map((m) => (
                                                                                                <SelectItem key={m.id} value={m.id} className="text-xs font-black italic py-3 rounded-xl">
                                                                                                    <div className="flex items-center gap-4">
                                                                                                        <Avatar className="h-8 w-8 border-2 border-emerald-500/20 shadow-sm relative">
                                                                                                            <AvatarImage src={m.imageUrl} />
                                                                                                            <AvatarFallback>{m.name[0]}</AvatarFallback>
                                                                                                            <div className="absolute top-0 right-0 h-2 w-2 bg-emerald-500 rounded-full border-2 border-white dark:border-zinc-900" />
                                                                                                        </Avatar>
                                                                                                        {m.name}
                                                                                                    </div>
                                                                                                </SelectItem>
                                                                                            ))}
                                                                                        </SelectGroup>
                                                                                    )}

                                                                                    <SelectGroup>
                                                                                        <SelectLabel className="px-3 pt-4 pb-2 text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 flex items-center gap-2">
                                                                                            <Library className="h-3 w-3" />
                                                                                            Modèles Système
                                                                                        </SelectLabel>
                                                                                        {systemModels.map((m) => (
                                                                                            <SelectItem key={m.id} value={m.id} className="text-xs font-black italic py-3 rounded-xl">
                                                                                                <div className="flex items-center gap-4">
                                                                                                    <Avatar className="h-8 w-8 border-2 border-zinc-200 dark:border-zinc-800 shadow-sm">
                                                                                                        <AvatarImage src={m.imageUrl} />
                                                                                                        <AvatarFallback>{m.name[0]}</AvatarFallback>
                                                                                                    </Avatar>
                                                                                                    {m.name}
                                                                                                </div>
                                                                                            </SelectItem>
                                                                                        ))}
                                                                                    </SelectGroup>
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>

                                                                        <div className="space-y-3">
                                                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                                                                <Mic2 className="h-3 w-3" /> Voix
                                                                            </label>
                                                                            <Select
                                                                                value={char.voiceId || "default"}
                                                                                onValueChange={(val) => onCastChange(char.id, { voiceId: val === "default" ? undefined : val })}
                                                                            >
                                                                                <SelectTrigger className="h-12 bg-zinc-50 dark:bg-zinc-800 border-2 border-transparent focus:border-blue-500/30 rounded-2xl px-4 text-xs font-black italic shadow-inner">
                                                                                    <SelectValue placeholder="Pas de voix" />
                                                                                </SelectTrigger>
                                                                                <SelectContent className="rounded-xl min-w-60">
                                                                                    <SelectItem value="default">Standard Narrateur</SelectItem>
                                                                                    {availableVoices?.map(v => (
                                                                                        <SelectItem key={v.id} value={v.presetId || v.id} className="py-2 text-xs font-bold">
                                                                                            {v.gender === 'female' ? '👩' : '👨'} {v.name}
                                                                                        </SelectItem>
                                                                                    ))}
                                                                                </SelectContent>
                                                                            </Select>
                                                                        </div>
                                                                    </div>

                                                                    <div className="space-y-6">
                                                                        {/* DNA PROMPT: APPERANCE */}
                                                                        <div className="space-y-3">
                                                                            <div className="flex items-center justify-between">
                                                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                                                                                    APPARENCE FIXE (DNA)
                                                                                </label>
                                                                                <Badge variant="outline" className="text-emerald-500 border-emerald-500/20 bg-emerald-500/5 font-black text-[9px] px-2 py-0.5 italic">COHÉRENCE</Badge>
                                                                            </div>
                                                                            <Textarea
                                                                                className="min-h-24 bg-zinc-50 dark:bg-zinc-800/80 border-2 border-transparent focus:border-emerald-500/30 rounded-2xl p-4 focus:ring-0 text-sm font-medium leading-relaxed resize-none shadow-inner"
                                                                                placeholder="Traits physiques, vêtements, accessoires récurrents..."
                                                                                value={appearancePrompts[char.id] || ""}
                                                                                onChange={(e) => {
                                                                                    const val = e.target.value;
                                                                                    setAppearancePrompts(prev => ({ ...prev, [char.id]: val }));
                                                                                    onCastChange(char.id, { appearance: { description: val }, lockedPromptSegment: val });
                                                                                }}
                                                                            />
                                                                        </div>

                                                                        {/* ACTION PROMPT: EXPLORATION */}
                                                                        <div className="space-y-3">
                                                                            <div className="flex items-center justify-between">
                                                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-500 dark:text-zinc-400">
                                                                                    ACTION / CONTEXTE
                                                                                </label>
                                                                                <Badge variant="outline" className="text-cyan-500 border-cyan-500/20 bg-cyan-500/5 font-black text-[9px] px-2 py-0.5 italic">EXPLORATION</Badge>
                                                                            </div>
                                                                            <Textarea
                                                                                className="min-h-20 bg-emerald-500/5 dark:bg-emerald-500/5 border-2 border-emerald-500/10 focus:border-emerald-500/30 rounded-2xl p-4 focus:ring-0 text-sm font-bold leading-relaxed italic resize-none shadow-inner"
                                                                                placeholder="Action en cours, expression, environnement spécifique..."
                                                                                value={actionPrompts[char.id] || ""}
                                                                                onChange={(e) => setActionPrompts(prev => ({ ...prev, [char.id]: e.target.value }))}
                                                                            />
                                                                        </div>
                                                                    </div>
                                                                </div>

                                                                <div className="space-y-4 pt-6">
                                                                    <div className="flex flex-col gap-3">
                                                                        <Button
                                                                            onClick={() => handleGenerate(char.id, char.modelId)}
                                                                            disabled={isGenerating}
                                                                            className="w-full h-14 bg-emerald-600 hover:bg-emerald-500 text-white font-black italic rounded-2xl shadow-xl shadow-emerald-500/20 transition-all uppercase tracking-widest active:scale-95 text-base group"
                                                                        >
                                                                            {isGenerating ? (
                                                                                <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                                                                            ) : (
                                                                                <Wand2 className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
                                                                            )}
                                                                            {isGenerating ? "Mise à jour..." : "Générer la Variante (5 🪙)"}
                                                                        </Button>

                                                                        <div className="flex gap-3">
                                                                            <Button
                                                                                variant="outline"
                                                                                onClick={() => handleSaveAsModel(char.id)}
                                                                                disabled={!char.referenceImageUrl || isSaving || isGenerating}
                                                                                className="flex-1 h-12 border-2 border-emerald-500/20 hover:bg-emerald-50 text-emerald-600 font-bold rounded-2xl transition-all uppercase text-[10px] tracking-widest"
                                                                            >
                                                                                {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sauver comme Modèle"}
                                                                            </Button>
                                                                            <Button
                                                                                variant="ghost"
                                                                                className="flex-1 h-12 rounded-2xl font-bold text-zinc-400 hover:text-zinc-600 transition-all uppercase text-[10px] tracking-widest hover:bg-zinc-100"
                                                                                onClick={() => setOpenGenerators(prev => ({ ...prev, [char.id]: false }))}
                                                                            >
                                                                                Fermer
                                                                            </Button>
                                                                        </div>
                                                                    </div>

                                                                    {/* Generation Variants Gallery */}
                                                                    {char.generationVariants && char.generationVariants.length > 0 && (
                                                                        <div className="mt-4">
                                                                            <p className="text-[10px] font-black uppercase text-zinc-400 mb-2 tracking-[0.1em]">Variantes de Session</p>
                                                                            <GenerationVariantGallery
                                                                                variants={char.generationVariants}
                                                                                onSelectVariant={(variant) => {
                                                                                    onCastChange(char.id, { referenceImageUrl: variant.imageUrl });
                                                                                }}
                                                                            />
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </DialogContent>
                                                </Dialog>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>
        </div>
    );
}
