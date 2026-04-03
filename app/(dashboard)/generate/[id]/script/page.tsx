"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Wand2, FileText } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { videosService, type Video } from "@/src/services/videos-service";
import { ScriptEditor } from "@/src/components/organisms/script-editor";

export default function ScriptValidationPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();

    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        videosService.getById(resolvedParams.id)
            .then(setVideo)
            .catch(() => setError("Impossible de charger les données."))
            .finally(() => setLoading(false));
    }, [resolvedParams.id]);

    const handleSaveAndContinue = async () => {
        if (!video) return;
        try {
            setSaving(true);
            const scenes = video.script?.scenes || [];
            await videosService.update(video.id, { script: video.script, scenes });
            router.push(`/generate/${video.id}/storyboard`);
        } catch (err: any) {
            setError(err.message || "Erreur lors de la sauvegarde.");
            setSaving(false);
        }
    };

    const onScenesChange = (newScenes: any[]) => {
        if (!video) return;
        setVideo({ ...video, scenes: newScenes, script: { ...video.script!, scenes: newScenes } });
    };

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-300 border-t-zinc-900" />
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center flex-col gap-4">
                <p className="text-zinc-500 text-sm">Vidéo non trouvée.</p>
                <Button onClick={() => router.push("/videos")} variant="outline" className="rounded-xl">Retour</Button>
            </div>
        );
    }

    const scenes = video.scenes && video.scenes.length > 0 ? video.scenes : video.script?.scenes || [];

    return (
        <div className="space-y-6 pb-24">
            {error && (
                <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
                    {error}
                </div>
            )}

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">
                        <FileText className="h-3.5 w-3.5" /> Script
                    </div>
                    <h1 className="text-2xl font-black tracking-tight text-zinc-900">Validez votre script</h1>
                    <p className="text-sm text-zinc-500 mt-0.5">Révisez la narration avant de générer les visuels.</p>
                </div>
                <Button
                    onClick={handleSaveAndContinue}
                    disabled={saving}
                    className="bg-zinc-900 hover:bg-zinc-700 text-white font-black rounded-xl h-10 px-6"
                >
                    {saving ? "Sauvegarde…" : "Continuer"} <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
            </div>

            <Card className="bg-white border border-zinc-100 rounded-2xl shadow-none">
                <CardContent className="p-6 space-y-6">
                    <div className="flex items-center gap-2 text-sm font-bold text-zinc-500">
                        <Wand2 className="h-4 w-4" />
                        {scenes.length} scène{scenes.length !== 1 ? "s" : ""}
                    </div>
                    <ScriptEditor scenes={scenes} onScenesChange={onScenesChange} />
                </CardContent>
            </Card>

            <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                <div className="bg-white border border-zinc-200 rounded-2xl px-5 py-3 shadow-lg flex items-center gap-5">
                    <span className="text-xs font-bold text-zinc-500">{scenes.length} scène{scenes.length !== 1 ? "s" : ""}</span>
                    <div className="h-4 w-px bg-zinc-200" />
                    <Button onClick={handleSaveAndContinue} disabled={saving} className="bg-zinc-900 hover:bg-zinc-700 text-white font-black rounded-xl h-9 px-5 text-sm">
                        Sauvegarder & Continuer
                    </Button>
                </div>
            </div>
        </div>
    );
}
