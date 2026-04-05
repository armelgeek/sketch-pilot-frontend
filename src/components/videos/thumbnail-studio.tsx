"use client";

import { useState, useEffect } from "react";
import { Download, Play } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { videosService } from "@/src/services/videos-service";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent } from "@/src/components/ui/dialog";

const adminService = new AdminService();

const MOCK_URLS = [
    "https://images.unsplash.com/photo-1611162617474-5b21e879e113?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1542751371-adc38448a05e?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&q=80&w=800",
];

interface ThumbnailStudioProps {
    video: any;
    onClose: () => void;
}

type Stage = "idle" | "loading" | "done";

export function ThumbnailStudio({ video, onClose }: ThumbnailStudioProps) {
    const queryClient = useQueryClient();
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [title, setTitle] = useState(video.topic || "");
    const [stage, setStage] = useState<Stage>("idle");
    const [results, setResults] = useState<string[]>(video.options?.thumbnailVariations || []);
    const [selectedResult, setSelectedResult] = useState(0);

    // If there's already persisted results, we can consider the stage done so they are immediately visible
    useEffect(() => {
        if (results.length > 0 && stage === "idle") {
            setStage("done");
        }
    }, []);

    const { data: fullVideo } = useQuery({
        queryKey: ["video-full", video.id],
        queryFn: () => videosService.getById(video.id),
        initialData: video,
    });

    const currentVideo = fullVideo || video;

    const characterModelId =
        currentVideo.characterModelId ||
        currentVideo.options?.characterModelId ||
        currentVideo.options?.modelId ||
        currentVideo.script?.metadata?.characterId ||
        currentVideo.scenes?.[0]?.characterId;

    const { data: characterRes } = useQuery({
        queryKey: ["character", characterModelId],
        queryFn: () => adminService.listModels({ search: characterModelId }),
        enabled: !!characterModelId,
    });

    const character = characterRes?.data?.find((c: any) => c.id === characterModelId) ?? characterRes?.data?.[0];
    const inspirations: string[] = character?.thumbnailInspirations ?? [];

    const handleGenerate = async () => {
        setStage("loading");
        try {
            const res = await videosService.generateThumbnail(video.id, {
                inspirationUrl: selectedTemplate || undefined,
                characterId: character?.id,
                title,
            });
            setResults(res.variations ?? []);
            queryClient.invalidateQueries({ queryKey: ["credits"] });
        } catch (error: any) {
            alert(error.message || "Failed to generate thumbnail. Check your credits.");
        } finally {
            setSelectedResult(0);
            setStage("done");
        }
    };

    const handleUse = async () => {
        try {
            await videosService.update(video.id, { thumbnailUrl: results[selectedResult] });
            queryClient.invalidateQueries({ queryKey: ["videos"] });
            queryClient.invalidateQueries({ queryKey: ["video-full", video.id] });
            onClose();
        } catch (error) {
            console.error("Failed to update video thumbnail", error);
        }
    };

    const handleDownload = async () => {
        try {
            const url = results[selectedResult];
            if (!url) return;
            const res = await fetch(url);
            const blob = await res.blob();
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement("a");
            a.href = blobUrl;
            a.download = `thumbnail_${video.id.substring(0, 8)}.jpg`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(blobUrl);
        } catch (error) {
            console.error("Error downloading thumbnail", error);
            alert("Impossible de télécharger la miniature.");
        }
    };

    const canGenerate = stage !== "loading";

    return (
        <Dialog open onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-[95vw] w-[1200px] h-[85vh] p-0 overflow-hidden rounded-2xl border border-zinc-100 bg-white flex flex-col">

                {/* Header */}
                <div className="h-12 border-b border-zinc-100 px-5 flex items-center justify-between flex-shrink-0">
                    <p className="text-xs font-medium text-zinc-400 uppercase tracking-wider">Thumbnail Studio</p>
                    <Button variant="ghost" size="sm" onClick={onClose} className="text-xs text-zinc-400 h-7 px-3">
                        Fermer
                    </Button>
                </div>

                <div className="flex flex-1 overflow-hidden">

                    {/* Sidebar */}
                    <div className="w-64 border-r border-zinc-100 flex flex-col overflow-y-auto flex-shrink-0">
                        <div className="flex-1 p-5 flex flex-col gap-6">

                            {/* Personnage */}
                            <Section label="Personnage">
                                {character ? (
                                    <div className="flex items-center gap-3 bg-zinc-50 rounded-xl px-3 py-2.5">
                                        <Avatar name={character.name} image={character.images?.[0]} />
                                        <div className="overflow-hidden">
                                            <p className="text-sm font-medium text-zinc-900 truncate">{character.name}</p>
                                            <p className="text-xs text-zinc-400">Sélectionné</p>
                                        </div>
                                    </div>
                                ) : characterModelId ? (
                                    <p className="text-xs text-zinc-400">Chargement…</p>
                                ) : (
                                    <p className="text-xs text-zinc-400">Aucun personnage</p>
                                )}
                            </Section>

                            {/* Inspiration */}
                            <Section label="Inspiration">
                                {inspirations.length === 0 ? (
                                    <p className="text-xs text-zinc-400">Aucune inspiration disponible</p>
                                ) : (
                                    <div className="flex flex-col gap-2">
                                        {inspirations.map((url, i) => (
                                            <button
                                                key={i}
                                                onClick={() => setSelectedTemplate(prev => prev === url ? null : url)}
                                                className={cn(
                                                    "relative aspect-video rounded-lg overflow-hidden border transition-all",
                                                    selectedTemplate === url
                                                        ? "border-blue-500 ring-2 ring-blue-100"
                                                        : "border-zinc-100 hover:border-zinc-300"
                                                )}
                                            >
                                                <img src={url} alt={`Style ${i + 1}`} className="object-cover w-full h-full" />
                                                <span className="absolute bottom-1.5 left-2 text-[10px] text-white/80 font-medium">
                                                    Style {i + 1}
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </Section>

                            {/* Titre */}
                            <Section label="Titre">
                                <Input
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    placeholder="Titre du thumbnail…"
                                    className="h-9 text-sm bg-zinc-50 border-zinc-100 rounded-lg"
                                />
                            </Section>
                        </div>

                        {/* Generate */}
                        <div className="p-5 border-t border-zinc-100">
                            <Button
                                onClick={handleGenerate}
                                disabled={!canGenerate}
                                className="w-full h-9 text-sm font-medium bg-zinc-900 hover:bg-zinc-700 text-white rounded-xl gap-2"
                            >
                                <Play className="h-3.5 w-3.5 fill-current" />
                                Générer · 5 crédits
                            </Button>
                        </div>
                    </div>

                    {/* Main */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-50">

                        {/* Preview */}
                        <div className="flex-1 flex items-center justify-center relative overflow-hidden">
                            {stage === "idle" && (
                                <p className="text-sm text-zinc-300">Le thumbnail apparaîtra ici</p>
                            )}

                            {stage === "loading" && (
                                <div className="flex flex-col items-center gap-3">
                                    <div className="h-7 w-7 border-2 border-zinc-200 border-t-zinc-800 rounded-full animate-spin" />
                                    <p className="text-sm text-zinc-400">Génération en cours…</p>
                                </div>
                            )}

                            {stage === "done" && results.length > 0 && (
                                <>
                                    <img
                                        src={results[selectedResult]}
                                        alt="Thumbnail généré"
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute top-3 right-3 flex gap-2">
                                        <button
                                            onClick={handleDownload}
                                            className="flex items-center gap-1.5 bg-white/90 backdrop-blur-sm text-zinc-700 text-xs font-medium px-3 py-1.5 rounded-lg border border-zinc-200 hover:bg-white transition-colors"
                                        >
                                            <Download className="h-3.5 w-3.5" />
                                            Télécharger
                                        </button>
                                        <Button
                                            size="sm"
                                            onClick={handleUse}
                                            className="h-7 text-xs bg-green-500 hover:bg-green-600 text-white rounded-lg px-3"
                                        >
                                            Utiliser
                                        </Button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Variations strip */}
                        <div className="border-t border-zinc-100 bg-white p-3 flex items-center gap-3 flex-shrink-0">
                            <p className="text-xs text-zinc-400 flex-shrink-0">Variations</p>
                            <div className="flex gap-2 flex-1">
                                {stage === "done"
                                    ? results.map((url, i) => (
                                        <button
                                            key={i}
                                            onClick={() => setSelectedResult(i)}
                                            className={cn(
                                                "flex-1 aspect-video rounded-lg overflow-hidden border transition-all",
                                                selectedResult === i
                                                    ? "border-blue-500 ring-2 ring-blue-100"
                                                    : "border-zinc-100 hover:border-zinc-300"
                                            )}
                                        >
                                            <img src={url} alt={`Variation ${i + 1}`} className="w-full h-full object-cover" />
                                        </button>
                                    ))
                                    : Array.from({ length: 4 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className={cn(
                                                "flex-1 aspect-video rounded-lg bg-zinc-100 border border-zinc-100",
                                                stage === "loading" && "animate-pulse"
                                            )}
                                        />
                                    ))
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}

// ── Sub-components ────────────────────────────────────────────────

function Section({ label, children }: { label: string; children: React.ReactNode }) {
    return (
        <div className="flex flex-col gap-2">
            <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">{label}</p>
            {children}
        </div>
    );
}

function Avatar({ name, image }: { name?: string; image?: string }) {
    return (
        <div className="h-8 w-8 rounded-full overflow-hidden bg-blue-50 flex items-center justify-center flex-shrink-0 text-xs font-medium text-blue-600">
            {image
                ? <img src={image} alt={name} className="object-cover w-full h-full" />
                : (name?.[0] ?? "?")}
        </div>
    );
}