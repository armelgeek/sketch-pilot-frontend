"use client";

import { useState, useEffect } from "react";
import { Download, Play, Image as ImageIcon, Sparkles } from "lucide-react";
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
    "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80&w=800",
    "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?auto=format&fit=crop&q=80&w=800",
];

interface ThumbnailStudioProps {
    video: any;
    onClose: () => void;
}

type Stage = "idle" | "loading" | "done";

export function ThumbnailStudio({ video, onClose }: ThumbnailStudioProps) {
    const queryClient = useQueryClient();
    const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
    const [title, setTitle] = useState(video.title || video.topic || "");
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
        queryFn: async () => {
            const [stdRes, myRes] = await Promise.all([
                adminService.listStandardModels(),
                adminService.listModels()
            ]);
            // Combine both arrays so we can find user's or standard character
            const allModels = [...(stdRes.data || []), ...(myRes.data || [])];
            return allModels.find(c => c.id === characterModelId);
        },
        enabled: !!characterModelId,
    });

    const { data: globalTemplatesRes } = useQuery({
        queryKey: ["thumbnail-templates"],
        queryFn: () => videosService.listThumbnailTemplates(),
    });

    const character = characterRes;
    const characterInspirations: string[] = character?.thumbnailInspirations ?? [];
    const globalInspirations: string[] = globalTemplatesRes?.data?.map((t: any) => t.imageUrl) ?? [];

    // Prioritize character inspirations, then global ones
    const inspirations = [...new Set([...characterInspirations, ...globalInspirations, ...MOCK_URLS])];

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
            queryClient.invalidateQueries({ queryKey: ["video-full", video.id] });
            queryClient.invalidateQueries({ queryKey: ["videos"] });
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
                                Générer · 2 crédits
                            </Button>
                        </div>
                    </div>

                    {/* Main */}
                    <div className="flex-1 flex flex-col overflow-hidden bg-zinc-50 relative">
                        {/* Status Badge - Floating */}


                        {/* Preview Area */}
                        <div className="flex-1 flex items-center justify-center p-8 lg:p-12">
                            <div className="relative w-full max-w-4xl aspect-video rounded-2xl overflow-hidden bg-white shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] border border-white transition-all duration-700">
                                {stage === "idle" && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 text-center p-12">
                                        <div className="h-16 w-16 rounded-3xl bg-zinc-50 flex items-center justify-center mb-2">
                                            <ImageIcon className="h-8 w-8 text-zinc-200" />
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-zinc-900 mb-1">Prêt à créer</h3>
                                            <p className="text-xs text-zinc-400 max-w-[240px] leading-relaxed">
                                                Personnalisez votre titre et choisissez une inspiration pour commencer.
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {stage === "loading" && (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-white/80 backdrop-blur-sm z-10">
                                        <div className="relative">
                                            <div className="h-12 w-12 border-2 border-zinc-100 border-t-amber-500 rounded-full animate-spin" />
                                            <Sparkles className="absolute -top-1 -right-1 h-4 w-4 text-amber-400 animate-bounce" />
                                        </div>
                                        <div className="text-center">
                                            <p className="text-sm font-bold text-zinc-900">Magie en cours...</p>
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-widest mt-1">IA Creative Engine</p>
                                        </div>
                                    </div>
                                )}

                                {stage === "done" && results.length > 0 && (
                                    <>
                                        <img
                                            src={results[0]}
                                            alt="Thumbnail généré"
                                            className="w-full h-full object-cover animate-in fade-in zoom-in-95 duration-700"
                                        />

                                        {/* Result Actions Overlay */}
                                        <div className="absolute inset-0 bg-black/20 opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-4">
                                            <Button
                                                onClick={handleDownload}
                                                className="h-11 px-6 bg-white hover:bg-zinc-50 text-zinc-900 font-bold rounded-xl gap-2 shadow-2xl scale-95 hover:scale-100 transition-all"
                                            >
                                                <Download className="h-4 w-4" />
                                                Télécharger HD
                                            </Button>
                                            <Button
                                                onClick={handleUse}
                                                className="h-11 px-6 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl gap-2 shadow-2xl scale-95 hover:scale-100 transition-all"
                                            >
                                                <Sparkles className="h-4 w-4" />
                                                Utiliser ce visuel
                                            </Button>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Professional Footer Tips */}
                        <div className="h-16 border-t border-zinc-100 bg-white/50 backdrop-blur-sm flex items-center justify-between px-8 text-zinc-400">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-zinc-300" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold">16:9 Aspect Ratio</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-1 w-1 rounded-full bg-zinc-300" />
                                    <span className="text-[10px] uppercase tracking-widest font-bold">Safe Zones Optimized</span>
                                </div>
                            </div>
                            <p className="text-[10px] font-medium text-zinc-300 italic">
                                "Un bon titre et un visage expressif augmentent le CTR de 40%"
                            </p>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog >
    );
}

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