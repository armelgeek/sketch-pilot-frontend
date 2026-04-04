"use client";

import { useState } from "react";
import { Sparkles, Image as ImageIcon, ChevronLeft, Wand2, CheckCircle2, History, X } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { cn } from "@/src/lib/utils";
import { useRouter } from "next/navigation";
import { useBaseModels, useCreateCharacter } from "@/src/app/character-models/hooks";

export default function CharacterStudioPage() {
    const router = useRouter();
    const { data: baseModels = [], isLoading: loadingModels } = useBaseModels();
    const { mutateAsync: createCharacter } = useCreateCharacter();

    const [selectedBaseId, setSelectedBaseId] = useState<string>("");
    const [prompt, setPrompt] = useState<string>("");
    const [characterName, setCharacterName] = useState("");

    // Generation State
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const handleGenerate = async () => {
        if (!selectedBaseId && !prompt.trim()) return;
        setIsGenerating(true);
        setGeneratedUrl(null);

        // Simulating AI Image Generation delay (e.g. Midjourney inference)
        setTimeout(() => {
            const base = baseModels.find((m: any) => m.id === selectedBaseId);
            // Simulate generated image by re-using the base image or a placeholder
            // In a real flow, this would be an API call to a generative endpoint
            const mockGeneratedUrl = base?.images?.[0] || "https://res.cloudinary.com/dhh3w8o0f/image/upload/v1741753956/boy1.png";
            setGeneratedUrl(mockGeneratedUrl);
            setIsGenerating(false);
            if (!characterName && base) {
                setCharacterName(`Variante de ${base.name}`);
            }
        }, 4000); // 4 sec mock delay
    };

    const handleSave = async () => {
        if (!generatedUrl) return;
        setIsSaving(true);
        try {
            await createCharacter({
                name: characterName || "Nouveau Personnage",
                description: prompt,
                images: [generatedUrl],
                isStandard: "false"
            });
            router.push("/my-models"); // go back to library
        } catch (error) {
            console.error("Failed to save character", error);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="flex flex-col h-[calc(100vh-3.5rem)] animate-in fade-in zoom-in-95 duration-500">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 bg-white z-10 shrink-0 shadow-sm">
                <div className="flex items-center gap-4">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => router.back()}
                        className="rounded-full hover:bg-zinc-100 text-zinc-500"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <div>
                        <h1 className="text-xl font-black tracking-tight text-zinc-900 flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            Studio L'IA
                        </h1>
                        <p className="text-xs font-bold text-zinc-400">
                            Créez des personnages exclusifs sur-mesure.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 text-amber-600 text-[10px] font-black uppercase tracking-widest">
                        <span>Balance:</span>
                        <span className="text-amber-700">12 🪙 par génération</span>
                    </div>
                </div>
            </div>

            {/* Main Workspace */}
            <div className="flex-1 flex overflow-hidden bg-zinc-50">
                {/* Left Sidebar - Base Characters */}
                <div className="w-80 border-r border-zinc-100 bg-white flex flex-col shrink-0">
                    <div className="p-4 border-b border-zinc-100">
                        <h2 className="text-xs font-black uppercase tracking-widest text-zinc-500 flex items-center gap-2">
                            <ImageIcon className="h-3 w-3" />
                            Modèle de Référence
                        </h2>
                        <p className="text-[10px] text-zinc-400 mt-1 font-medium leading-tight">
                            Sélectionnez un modèle de base pour guider la structure du personnage.
                        </p>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loadingModels ? (
                            <div className="flex justify-center p-8">
                                <div className="h-6 w-6 border-4 border-amber-500 border-t-transparent rounded-full animate-spin" />
                            </div>
                        ) : baseModels.filter((m: any) => m.images?.[0]).map((model: any) => (
                            <button
                                key={model.id}
                                onClick={() => setSelectedBaseId(model.id)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-2 rounded-2xl transition-all border-2 text-left group",
                                    selectedBaseId === model.id
                                        ? "bg-amber-50 border-amber-500 shadow-md shadow-amber-500/10"
                                        : "bg-white border-zinc-100 hover:border-amber-300 hover:shadow-sm"
                                )}
                            >
                                <Avatar className="h-12 w-12 rounded-xl border border-zinc-100 group-hover:scale-105 transition-transform">
                                    <AvatarImage src={model.images[0]} />
                                    <AvatarFallback>{model.name[0]}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                    <div className="text-sm font-black text-zinc-900 truncate">
                                        {model.name}
                                    </div>
                                    <div className="flex items-center gap-1.5 mt-0.5">
                                        <div className={cn(
                                            "h-1.5 w-1.5 rounded-full",
                                            model.gender?.toLowerCase() === "male" ? "bg-amber-400" : "bg-emerald-400"
                                        )} />
                                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest truncate">
                                            {model.gender || "Mixte"}
                                        </span>
                                    </div>
                                </div>
                                {selectedBaseId === model.id && (
                                    <CheckCircle2 className="h-4 w-4 text-amber-500 mr-2 shrink-0" />
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Center - Canvas & Configuration */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 overflow-y-auto relative">
                    {/* Background Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-50" />

                    <div className="w-full max-w-2xl relative z-10 space-y-6">

                        {/* Preview Area */}
                        <Card className="border-none shadow-2xl shadow-zinc-900/5 overflow-hidden">
                            <CardContent className="p-0 aspect-video md:aspect-[21/9] bg-zinc-950 flex flex-col items-center justify-center relative">
                                {isGenerating ? (
                                    <div className="flex flex-col items-center gap-4 animate-in fade-in">
                                        <div className="relative">
                                            <div className="absolute inset-0 border-4 border-amber-500 border-t-transparent rounded-full animate-spin h-12 w-12" />
                                            <div className="h-12 w-12 rounded-full bg-amber-500/20 blur-xl animate-pulse" />
                                            <Wand2 className="h-6 w-6 text-amber-400 absolute inset-0 m-auto" />
                                        </div>
                                        <div className="text-center">
                                            <p className="font-black text-white text-lg tracking-tight">Génération IA en cours</p>
                                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">Application de votre style...</p>
                                        </div>
                                    </div>
                                ) : generatedUrl ? (
                                    <div className="relative h-full w-full group">
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={generatedUrl}
                                            alt="Generated Character"
                                            className="h-full w-full object-contain bg-zinc-900"
                                        />
                                        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-6">
                                            <div className="w-full flex justify-between items-center">
                                                <span className="text-[10px] font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                                                    <Sparkles className="h-3 w-3" /> Résultat IA
                                                </span>
                                                <Button size="icon" variant="ghost" onClick={() => setGeneratedUrl(null)} className="h-8 w-8 text-white hover:bg-white/20 rounded-full">
                                                    <X className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center gap-3 opacity-60">
                                        <div className="h-14 w-14 rounded-2xl bg-zinc-800 flex items-center justify-center text-zinc-500">
                                            <ImageIcon className="h-6 w-6" />
                                        </div>
                                        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-500">
                                            Aperçu du personnage
                                        </span>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        {/* Prompt Input */}
                        <div className="space-y-4 bg-white p-6 rounded-3xl border border-zinc-100 shadow-xl shadow-zinc-200/40">
                            {!generatedUrl ? (
                                <>
                                    <div>
                                        <h3 className="text-sm font-black text-zinc-900 mb-1 flex items-center gap-2">
                                            VOTRE TOUCHE PERSONNELLE
                                        </h3>
                                        <p className="text-xs text-zinc-500 font-medium">Décrivez précisément le personnage ou les modifications par rapport au modèle de base.</p>
                                    </div>
                                    <div className="relative group">
                                        <Textarea
                                            value={prompt}
                                            onChange={(e) => setPrompt(e.target.value)}
                                            placeholder="Ex: Un jeune garçon avec des cheveux bruns en bataille, portant une veste rouge et un gros sac à dos d'explorateur..."
                                            className="min-h-[120px] resize-none rounded-2xl bg-zinc-50 border-zinc-200 focus:border-amber-400 focus:bg-white transition-all text-sm font-medium p-4 leading-relaxed ring-0 focus-visible:ring-0"
                                        />
                                    </div>
                                    <div className="flex items-center justify-between pt-2">
                                        <div className="flex items-center gap-2">
                                            <Button variant="ghost" size="sm" className="text-[10px] font-bold text-zinc-400 hover:text-zinc-600 uppercase tracking-widest rounded-xl">
                                                <History className="h-3 w-3 mr-1.5" /> Historique
                                            </Button>
                                        </div>
                                        <Button
                                            onClick={handleGenerate}
                                            disabled={isGenerating || (!selectedBaseId && !prompt.trim())}
                                            className="h-12 px-8 bg-zinc-950 hover:bg-zinc-800 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-xl shadow-zinc-200 group relative overflow-hidden transition-all active:scale-95"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent group-hover:translate-x-full transition-transform duration-500 pointer-events-none" />
                                            <Wand2 className="h-4 w-4 mr-2 text-amber-400" />
                                            {isGenerating ? "En cours..." : "Générer l'Image"}
                                        </Button>
                                    </div>
                                </>
                            ) : (
                                // Save Step
                                <div className="space-y-4 animate-in slide-in-from-bottom-4">
                                    <div>
                                        <h3 className="text-sm font-black text-zinc-900 mb-1 flex items-center gap-2">
                                            SAUVEGARDER LE PERSONNAGE
                                        </h3>
                                        <p className="text-xs text-zinc-500 font-medium">Donnez-lui un nom pour l'enregistrer dans votre bibliothèque.</p>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="Nom du personnage (ex: Léo l'explorateur)"
                                        value={characterName}
                                        onChange={(e) => setCharacterName(e.target.value)}
                                        className="w-full h-14 bg-zinc-50 border border-zinc-200 focus:border-amber-400 focus:bg-white rounded-2xl px-4 text-sm font-black transition-all outline-none"
                                    />
                                    <div className="flex justify-end gap-3 pt-2">
                                        <Button
                                            variant="outline"
                                            onClick={() => setGeneratedUrl(null)}
                                            disabled={isSaving}
                                            className="h-12 px-6 rounded-2xl font-bold text-xs"
                                        >
                                            Recommencer
                                        </Button>
                                        <Button
                                            onClick={handleSave}
                                            disabled={isSaving || !characterName.trim()}
                                            className="h-12 px-8 bg-amber-500 hover:bg-amber-600 text-white font-black uppercase tracking-widest text-[11px] rounded-2xl shadow-lg shadow-amber-500/20"
                                        >
                                            {isSaving ? "Sauvegarde..." : "Ajouter à ma bibliothèque"}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
