"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, ChevronLeft, Save, Sparkles, Wand2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { videosService, type Video } from "@/src/services/videos-service";
import { ScriptEditor } from "@/src/components/organisms/script-editor";
import { CharacterCasting } from "@/src/components/organisms/character-casting";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { CharacterModelsService } from "@/src/app/character-models/api/character-models-service";

const adminService = new AdminService();
const characterModelsService = new CharacterModelsService();

export default function ScriptValidationPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();

    const [video, setVideo] = useState<Video | null>(null);
    const [availableModels, setAvailableModels] = useState<any[]>([]);
    const [availableVoices, setAvailableVoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [v, models, voices] = await Promise.all([
                    videosService.getById(resolvedParams.id),
                    adminService.listModels(),
                    adminService.listVoices()
                ]);

                // Auto-initialize character sheets if missing
                if (v.script && !v.script.characterSheets) {
                    console.log("Initializing character sheets...");
                    v.script.characterSheets = [];
                }

                setVideo(v);
                setAvailableModels(models || []);
                setAvailableVoices(voices || []);
                setLoading(false);
            } catch (err) {
                setError("Impossible de charger les données.");
                setLoading(false);
            }
        };
        loadData();
    }, [resolvedParams.id]);

    const handleSaveAndContinue = async () => {
        if (!video) return;
        try {
            setSaving(true);
            const scenes = video.script?.scenes || [];
            await videosService.update(video.id, {
                script: video.script,
                scenes: scenes // Sync both
            });
            router.push(`/generate/${video.id}/storyboard`);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la sauvegarde.");
            setSaving(false);
        }
    };

    const onScenesChange = (newScenes: any[]) => {
        if (!video) return;
        setVideo({
            ...video,
            scenes: newScenes,
            script: {
                ...video.script!,
                scenes: newScenes
            }
        });
    };

    const onCastChange = (
        characterId: string,
        updates: any
    ) => {
        if (!video || !video.script) return;

        const newSheets = (video.script.characterSheets || []).map((sheet) => {
            if (sheet.id === characterId || sheet.name === characterId) {
                return { ...sheet, ...updates };
            }
            return sheet;
        });

        setVideo({
            ...video,
            script: {
                ...video.script,
                characterSheets: newSheets
            }
        });
    };

    const handleGenerateCharacter = async (characterId: string, prompt: string, modelId?: string) => {
        if (!video) return "";
        try {
            const res = await videosService.generateCharacter(video.id, characterId, { prompt, modelId });

            // Proactively update local state with the new image URL immediately
            if (res.imageUrl) {
                onCastChange(characterId, { referenceImageUrl: res.imageUrl, modelId });
            }

            return res.imageUrl;
        } catch (err: any) {
            setError(err.message || "Erreur lors de la génération du personnage.");
            throw err;
        }
    };

    const handleSaveAsModel = async (name: string, imageUrl: string, description: string) => {
        try {
            await characterModelsService.savePersonal({ name, imageUrl, description });

            // Refresh available models to include the new one
            const models = await adminService.listModels();
            setAvailableModels(models || []);
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'enregistrement du modèle.");
            throw err;
        }
    };

    const handleDetectCharacters = () => {
        if (!video || !video.script) return;

        const scenes = video.script.scenes || [];
        const detectedNames = new Set<string>();

        scenes.forEach((scene: any) => {
            if (scene.characterIds && Array.isArray(scene.characterIds)) {
                scene.characterIds.forEach((id: string) => detectedNames.add(id));
            }
            if (scene.speakingCharacterId) {
                detectedNames.add(scene.speakingCharacterId);
            }
        });

        if (detectedNames.size === 0) {
            detectedNames.add("Narrateur");
        }

        const newSheets = Array.from(detectedNames).map((name, idx) => ({
            id: name.startsWith('CHAR-') ? name : `CHAR-0${idx + 1}`,
            name: name.startsWith('CHAR-') ? name.replace('CHAR-', 'Personnage ') : name,
            role: "Rôle à définir",
            appearance: {
                description: "Style standard",
                clothing: "Tenue habituelle",
                accessories: [],
                colorPalette: [],
                uniqueIdentifiers: []
            },
            expressions: ["Neutre"]
        }));

        setVideo({
            ...video,
            script: {
                ...video.script,
                characterSheets: newSheets
            }
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen flex items-center justify-center flex-col gap-4">
                <p className="text-zinc-500">Vidéo non trouvée.</p>
                <Button onClick={() => router.push("/videos")}>Retour aux vidéos</Button>
            </div>
        );
    }

    const scenes = video.scenes && video.scenes.length > 0 ? video.scenes : video.script?.scenes || [];

    return (
        <div className="relative min-h-screen mt-12 pb-24">
            <div className="mesh-gradient" />

            <div className="mx-auto max-w-4xl px-4 py-12 relative z-10">
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-medium text-center shadow-lg">
                        {error}
                    </div>
                )}

                {/* Header */}
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-12">
                    <div className="space-y-2">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20 mb-2">
                            Validation du Script
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                            Affinez votre histoire
                        </h1>
                        <p className="text-zinc-500 text-lg font-medium">
                            Réévisez la narration avant de générer les visuels
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <Button
                            onClick={handleSaveAndContinue}
                            disabled={saving}
                            size="lg"
                            className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 rounded-xl shadow-lg shadow-emerald-500/20"
                        >
                            {saving ? "Sauvegarde..." : "Continuer"} <ChevronRight className="ml-2 h-5 w-5" />
                        </Button>
                    </div>
                </div>

                <Card className="glass-pill border-none shadow-2xl overflow-hidden mb-8">
                    <CardContent className="p-8 space-y-12">
                        {video.script && (
                            <>
                                <CharacterCasting
                                    characters={video.script.characterSheets || []}
                                    availableModels={availableModels}
                                    availableVoices={availableVoices}
                                    onCastChange={onCastChange}
                                    onGenerate={handleGenerateCharacter}
                                    onSaveAsModel={handleSaveAsModel}
                                    onDetect={handleDetectCharacters}
                                />
                                <div className="h-px bg-zinc-100 dark:bg-zinc-800 mt-8 mb-4" />
                            </>
                        )}

                        <div className="space-y-6">
                            <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">
                                <Wand2 className="h-4 w-4" />
                                Contenu des Scènes
                            </div>
                            <ScriptEditor
                                scenes={scenes}
                                onScenesChange={onScenesChange}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* Floating Bottom Bar */}
                <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="glass-pill px-6 py-4 border-none shadow-2xl shadow-emerald-500/10 flex items-center gap-8 backdrop-blur-md">
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-[0.2em]">Séquence</span>
                            <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{scenes.length} scènes prévues</span>
                        </div>
                        <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800" />
                        <Button
                            onClick={handleSaveAndContinue}
                            disabled={saving}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl px-8 shadow-lg shadow-emerald-600/20"
                        >
                            Sauvegarder & Continuer
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
