"use client";

import React, { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription
} from "@/src/components/ui/dialog";
import { useRouter } from "next/navigation";
import { seriesService, Series } from "@/src/services/series-service";
import { Video, videosService } from "@/src/services/videos-service";
import { VideoCard } from "@/src/components/organisms/video-card";
import { Loader2, Film, AlertCircle, Sparkles, Users, Maximize2, X, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { cn } from "@/src/lib/utils";

interface SeriesEpisodesDialogProps {
    series: Series | null;
    isOpen: boolean;
    onClose: () => void;
}

export function SeriesEpisodesDialog({ series, isOpen, onClose }: SeriesEpisodesDialogProps) {
    const [episodes, setEpisodes] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [selectedCharacter, setSelectedCharacter] = useState<{ name: string; data: any } | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const router = useRouter();

    const isPrepared = !!(series?.globalContext && Object.keys(series?.characterRegistry || {}).length > 0);

    useEffect(() => {
        if (isOpen && series) {
            loadEpisodes();
        } else {
            setEpisodes([]);
            setError(null);
        }
    }, [isOpen, series]);

    const loadEpisodes = async () => {
        if (!series) return;
        setIsLoading(true);
        setError(null);
        try {
            const data = await seriesService.getEpisodes(series.id);
            setEpisodes(data);
        } catch (err) {
            console.error("Failed to load episodes:", err);
            setError("Impossible de charger les épisodes de cette saga.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleGenerateNext = async () => {
        if (!series || isGenerating) return;

        try {
            setIsGenerating(true);
            const options = {
                type: 'series',
                seriesId: series.id,
                episodeNumber: episodes.length + 1,
                scriptOnly: true
            };

            const response = await videosService.generate(`Saga ${series.title}`, options);
            if (response.videoId) {
                router.push(`/generate/${response.videoId}/script`);
            }
        } catch (err) {
            console.error("Failed to generate next episode:", err);
            alert("Erreur lors de la génération de la suite.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleRegenerateImage = async () => {
        if (!series || !selectedCharacter || isRegenerating) return;
        setIsRegenerating(true);
        try {
            const result = await seriesService.regenerateCharacterImage(series.id, selectedCharacter.name);
            if (result.success && result.thumbnailUrl) {
                // Update local state so image refreshes immediately without page reload
                setSelectedCharacter(prev => prev ? { ...prev, data: { ...prev.data, thumbnailUrl: result.thumbnailUrl } } : null);
            } else {
                alert(result.error || "Erreur lors de la régénération de l'image.");
            }
        } catch (err) {
            console.error("Failed to regenerate character image:", err);
            alert("Erreur lors de la régénération de l'image.");
        } finally {
            setIsRegenerating(false);
        }
    };


    if (!series) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="max-w-4xl h-[90vh] p-0 gap-0 border-zinc-100 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
                {/* Header Section */}
                <div className="bg-zinc-900 text-white p-8 relative overflow-hidden shrink-0">
                    <div className="absolute top-0 right-0 p-12 opacity-10 pointer-events-none">
                        <Film className="h-40 w-40" />
                    </div>

                    <div className="relative z-10">
                        <DialogHeader className="mb-6">
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-0.5 rounded bg-blue-500 text-[10px] font-black uppercase tracking-widest text-white shadow-lg shadow-blue-500/20">Saga Narrative</span>
                                <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">• {episodes.length} Épisodes</span>
                            </div>
                            <DialogTitle className="text-3xl font-black tracking-tight leading-tight">
                                {series.title}
                            </DialogTitle>
                            <DialogDescription className="text-zinc-400 text-sm mt-2 max-w-xl line-clamp-2">
                                {series.description || "Aucune description pour cet univers."}
                            </DialogDescription>
                        </DialogHeader>
                    </div>
                </div>

                {/* Content Section */}
                <div className="p-6 bg-zinc-50 flex-1 overflow-y-auto min-h-0 scrollbar-hide">
                    <Tabs defaultValue="episodes" className="w-full space-y-6">
                        <div className="flex items-center justify-between mb-4">
                            <TabsList className="bg-zinc-200/50 p-1 rounded-2xl h-11">
                                <TabsTrigger value="episodes" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:text-blue-600 font-bold uppercase tracking-widest text-[10px] h-9">
                                    <Film className="h-3.5 w-3.5 mr-2" />
                                    Épisodes
                                </TabsTrigger>
                                <TabsTrigger value="casting" className="rounded-xl px-6 data-[state=active]:bg-white data-[state=active]:text-blue-600 font-bold uppercase tracking-widest text-[10px] h-9">
                                    <Users className="h-3.5 w-3.5 mr-2" />
                                    Casting
                                </TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="episodes" className="mt-0 outline-none">
                            {isLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4">
                                    <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                                    <p className="text-sm font-semibold text-zinc-400 uppercase tracking-widest">Chargement de la saga...</p>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center py-20 gap-4 text-center">
                                    <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
                                        <AlertCircle className="h-6 w-6" />
                                    </div>
                                    <p className="text-zinc-600 font-medium">{error}</p>
                                    <Button variant="outline" onClick={loadEpisodes} className="rounded-xl px-6">Réessayer</Button>
                                </div>
                            ) : episodes.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                                    <div className="h-16 w-16 rounded-3xl bg-zinc-100 flex items-center justify-center text-zinc-300">
                                        <Film className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-zinc-900 font-bold uppercase tracking-tight">Aucun épisode</h3>
                                        <p className="text-zinc-500 text-[11px] font-medium italic">Générez votre premier épisode pour commencer cette saga.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {episodes.map((video) => (
                                        <VideoCard key={video.id} video={video} showActions={true} />
                                    ))}
                                </div>
                            )}
                        </TabsContent>

                        <TabsContent value="casting" className="mt-0 outline-none">
                            {series.characterRegistry && Object.keys(series.characterRegistry).length > 0 ? (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                                    {Object.entries(series.characterRegistry as Record<string, any>).map(([name, data], idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => setSelectedCharacter({ name, data })}
                                            className="flex gap-5 p-5 rounded-3xl bg-white border border-zinc-100 shadow-sm items-center group hover:border-blue-500/30 hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-500 cursor-pointer"
                                        >
                                            <div className="relative shrink-0">
                                                <Avatar className="h-20 w-20 rounded-2xl border-2 border-zinc-100 shadow-inner group-hover:scale-105 transition-transform duration-700">
                                                    <AvatarImage src={data.thumbnailUrl} className="object-cover" />
                                                    <AvatarFallback className="bg-zinc-50 text-zinc-300 text-lg font-bold uppercase">
                                                        {name.substring(0, 2)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="absolute -bottom-1 -right-1 bg-white rounded-lg p-1 shadow-sm border border-zinc-50 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Maximize2 className="h-3 w-3 text-blue-500" />
                                                </div>
                                            </div>
                                            <div className="flex-1 min-w-0 space-y-1">
                                                <h4 className="text-base font-black text-zinc-900 truncate uppercase tracking-tighter group-hover:text-blue-600 transition-colors">{name}</h4>
                                                <p className="text-[11px] text-zinc-500 leading-relaxed italic line-clamp-3 font-medium">{data.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center py-20 text-center gap-4">
                                    <div className="h-16 w-16 rounded-3xl bg-zinc-100 flex items-center justify-center text-zinc-300">
                                        <Users className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-zinc-900 font-bold uppercase tracking-tight">Casting vide</h3>
                                        <p className="text-zinc-500 text-[11px] font-medium italic">Préparez votre saga pour générer les personnages.</p>
                                    </div>
                                </div>
                            )}
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Character Zoom Dialog */}
                {selectedCharacter && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <div className="absolute inset-0 bg-zinc-950/80 backdrop-blur-md animate-in fade-in duration-300" onClick={() => setSelectedCharacter(null)} />
                        <div className="relative w-full max-w-2xl bg-white dark:bg-zinc-900 rounded-[3rem] overflow-hidden shadow-2xl animate-in zoom-in-95 duration-500">
                            <button
                                onClick={() => setSelectedCharacter(null)}
                                className="absolute top-6 right-6 h-10 w-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md flex items-center justify-center text-white z-10 transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>

                            <div className="flex flex-col md:flex-row h-full">
                                <div className="w-full md:w-1/2 aspect-square relative bg-zinc-100">
                                    {selectedCharacter.data.thumbnailUrl ? (
                                        <img
                                            src={selectedCharacter.data.thumbnailUrl}
                                            alt={selectedCharacter.name}
                                            className="h-full w-full object-cover"
                                        />
                                    ) : (
                                        <div className="h-full w-full flex items-center justify-center text-zinc-200 bg-zinc-50 font-black text-9xl">
                                            {selectedCharacter.name.substring(0, 1)}
                                        </div>
                                    )}
                                </div>
                                <div className="w-full md:w-1/2 p-8 md:p-12 space-y-6 flex flex-col justify-center">
                                    <div className="space-y-2">
                                        <span className="px-3 py-1 rounded-full bg-blue-500/10 text-blue-500 text-[10px] font-black uppercase tracking-widest">Protagoniste</span>
                                        <h2 className="text-4xl font-black text-zinc-900 dark:text-white uppercase tracking-tighter leading-none">
                                            {selectedCharacter.name}
                                        </h2>
                                    </div>
                                    <div className="h-px w-12 bg-zinc-200" />
                                    <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed italic font-medium">
                                        {selectedCharacter.data.description}
                                    </p>
                                    {selectedCharacter.data.portraitPrompt && (
                                        <div className="p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Instructions Visuelles</p>
                                            <p className="text-[10px] text-zinc-500 dark:text-zinc-500 leading-snug">{selectedCharacter.data.portraitPrompt}</p>
                                        </div>
                                    )}
                                    <button
                                        onClick={handleRegenerateImage}
                                        disabled={isRegenerating}
                                        className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-[11px] font-black uppercase tracking-widest transition-colors disabled:opacity-60 disabled:cursor-not-allowed w-fit"
                                    >
                                        {isRegenerating
                                            ? <><Loader2 className="h-3.5 w-3.5 animate-spin" /> Génération...</>
                                            : <><RefreshCw className="h-3.5 w-3.5" /> Régénérer l&apos;image</>}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Footer Section */}
                <div className="p-4 bg-white border-t border-zinc-100 flex flex-col gap-4 shrink-0">
                    {!isPrepared && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 border border-amber-100 text-amber-700 animate-in fade-in slide-in-from-bottom-2">
                            <AlertCircle className="h-4 w-4 shrink-0" />
                            <p className="text-[10px] font-bold uppercase tracking-widest leading-none">
                                Saga non préparée : Bible narrative ou personnages manquants.
                            </p>
                        </div>
                    )}

                    {isPrepared && series.plannedEpisodes && series.plannedEpisodes.find((p: any) => p.number === episodes.length + 1) && (
                        <div className="p-4 rounded-2xl bg-blue-50/50 border border-blue-100/50 space-y-2 animate-in fade-in slide-in-from-bottom-2">
                            <div className="flex items-center gap-2">
                                <Sparkles className="h-3 w-3 text-blue-500" />
                                <span className="text-[9px] font-black uppercase tracking-widest text-blue-600">Prochainement : Épisode {episodes.length + 1}</span>
                            </div>
                            {(() => {
                                const nextPlanned = series.plannedEpisodes.find((p: any) => p.number === episodes.length + 1);
                                return (
                                    <>
                                        <p className="text-xs font-bold text-stone-900 leading-tight">{nextPlanned?.title}</p>
                                        <p className="text-[10px] text-stone-500 italic leading-snug line-clamp-2">{nextPlanned?.hook}</p>
                                    </>
                                );
                            })()}
                        </div>
                    )}
                    <div className="flex justify-between gap-3">
                        <Button onClick={onClose} variant="secondary" className="rounded-xl px-8 font-bold">Fermer</Button>
                        <Button
                            onClick={handleGenerateNext}
                            disabled={isGenerating || !isPrepared}
                            className={cn(
                                "rounded-xl px-8 font-black uppercase tracking-widest gap-2 transition-all",
                                isPrepared
                                    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-200"
                                    : "bg-zinc-200 text-zinc-400 cursor-not-allowed"
                            )}
                        >
                            {isGenerating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                            {isGenerating ? "Génération..." : `Générer l'épisode ${episodes.length + 1}`}
                        </Button>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
