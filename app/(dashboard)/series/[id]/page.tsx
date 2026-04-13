"use client";

import React, { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { seriesService, Series } from "@/src/services/series-service";
import { Video, videosService } from "@/src/services/videos-service";
import { VideoCard } from "@/src/components/organisms/video-card";
import { useVideoProgress } from "@/src/hooks/use-video-progress";
import { 
    Loader2, 
    Film, 
    AlertCircle, 
    Sparkles, 
    Users, 
    RefreshCw, 
    Trash2, 
    AlertTriangle, 
    Calendar,
    ChevronLeft,
    Check,
    Plus,
    Moon,
    MapPin,
    Package,
    Image as ImageIcon
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { useQueryClient } from "@tanstack/react-query";

const adminService = new AdminService();

export default function SeriesDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id: seriesId } = use(params);
    const [series, setSeries] = useState<Series | null>(null);
    const [episodes, setEpisodes] = useState<Video[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isExtending, setIsExtending] = useState(false);
    const [extensionPhase, setExtensionPhase] = useState<'idle' | 'brainstorming' | 'review' | 'casting'>('idle');
    const [extensionProgress, setExtensionProgress] = useState<number | null>(null);
    const [extensionMessage, setExtensionMessage] = useState<string>("");
    const [suggestedData, setSuggestedData] = useState<any | null>(null);
    const [approvedCharacters, setApprovedCharacters] = useState<string[]>([]);
    
    const [generatedVideoId, setGeneratedVideoId] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [selectedCharacter, setSelectedCharacter] = useState<{ name: string; data: any } | null>(null);
    const [isRegenerating, setIsRegenerating] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isEditingTitle, setIsEditingTitle] = useState(false);
    const [editedTitle, setEditedTitle] = useState("");
    const [regeneratingChars, setRegeneratingChars] = useState<Record<string, boolean>>({});
    const [promotingFor, setPromotingFor] = useState<{ type: 'character' | 'location', name: string } | null>(null);
    const [isPromoting, setIsPromoting] = useState(false);

    const router = useRouter();
    const queryClient = useQueryClient();

    const [trackingJobId, setTrackingJobId] = useState<string | null>(null);
    const { progress, message, status } = useVideoProgress(trackingJobId || undefined);

    const isPrepared = !!((series?.globalContext || series?.description) && Object.keys(series?.characterRegistry || {}).length > 0);
    const isRoadmapFinished = episodes.length >= Number(series?.totalEpisodes || 0);

    useEffect(() => {
        loadData();
    }, [seriesId]);

    const loadData = async () => {
        setIsLoading(true);
        try {
            const [s, eps] = await Promise.all([
                seriesService.getById(seriesId),
                seriesService.getEpisodes(seriesId)
            ]);
            setSeries(s);
            setEpisodes(eps);
        } catch (err) {
            setError("Impossible de charger la saga.");
        } finally {
            setIsLoading(false);
        }
    };

    // Dynamic redirection effect
    useEffect(() => {
        if (!trackingJobId || !generatedVideoId || !series) return;
        
        const isDone = status === "completed" || status === "narration_generated" || status === "scenes_generated";
        
        if (isDone) {
            loadData(); // REFRESH UI
            const target = status === "narration_generated" ? "script" : "storyboard";
            router.push(`/generate/${generatedVideoId}/${target}`);
        }
    }, [status, generatedVideoId, trackingJobId, router]);

    const handleGenerateNext = async () => {
        if (!series || isGenerating) return;

        // Check for missing images in registry
        const missingImages = Object.entries(series.characterRegistry || {})
            .filter(([_, data]: [string, any]) => !data.thumbnailUrl)
            .map(([name]) => name);

        if (missingImages.length > 0) {
            const confirmGen = confirm(
                `Attention : certains personnages (${missingImages.join(", ")}) n'ont pas encore d'image de casting. \n\nL'IA en générera de nouvelles pendant l'épisode, ce qui peut nuire à la continuité visuelle. \n\nVoulez-vous quand même lancer la génération ?`
            );
            if (!confirmGen) return;
        }

        try {
            setIsGenerating(true);
            setError(null);
            const response = await seriesService.generateNextEpisode(series.id);
            if (response.success) {
                if (response.jobId) setTrackingJobId(response.jobId);
                setGeneratedVideoId(response.videoId);
            }
        } catch (err) {
            setError("Le lancement de la génération a échoué.");
            setIsGenerating(false);
        }
    };

    const handleStartBrainstorming = async () => {
        if (!series || isExtending) return;
        
        if (!confirm("Étendre la saga coûte 5 crédits pour le brainstorming IA. Voulez-vous continuer ?")) return;

        setIsExtending(true);
        setExtensionPhase('brainstorming');
        setError(null);

        try {
            // Updated to skip immediate portraits for review
            const streamUrl = seriesService.getPrepareStreamUrl({
                seriesId: series.id,
                title: series.title,
                description: series.description || series.globalContext,
                language: series.language || 'fr',
                promptId: series.promptId,
                visualStyleModelId: series.visualStyleModelId,
                videoGenre: series.videoGenre,
                totalEpisodes: 10,
                // @ts-ignore - planned parameter
                skipPortraits: true 
            });

            const es = new EventSource(streamUrl, { withCredentials: true });

            es.addEventListener("progress", (event: any) => {
                const data = JSON.parse(event.data);
                if (data.progress !== undefined) setExtensionProgress(data.progress);
                if (data.status) setExtensionMessage(data.status === 'analyzing' ? "Analyse narrative..." : data.status);
            });

            es.addEventListener("final", (event: any) => {
                const data = JSON.parse(event.data);
                setSuggestedData(data);
                
                // Identify NEW characters for review
                const newChars = Object.keys(data.characterRegistry || {}).filter(
                    name => !series.characterRegistry?.[name]
                );
                
                setApprovedCharacters(newChars);
                setExtensionPhase('review');
                es.close();
            });

            es.addEventListener("error", (event: any) => {
                setError("L'IA n'a pas pu étendre la saga.");
                es.close();
                setIsExtending(false);
            });

        } catch (err) {
            setError("Erreur de connexion.");
            setIsExtending(false);
        }
    };

    const handleConfirmCasting = async () => {
        if (!series || !suggestedData) return;

        setExtensionPhase('casting');
        
        try {
            // 1. Identify characters needing portraits (those in suggestedData.characterRegistry)
            const charactersWithPrompts = Object.entries(suggestedData.characterRegistry || {})
                .filter(([_, data]: [string, any]) => !!data.portraitPrompt);

            // 2. Trigger portrait generation in parallel (backend handles queueing)
            const portraitResults = await Promise.all(
                charactersWithPrompts.map(async ([name, _]) => {
                    try {
                        return await seriesService.regenerateCharacterImage(series.id, name);
                    } catch (e) {
                        return { success: false };
                    }
                })
            );

            // 3. Update character registry with new thumbnails
            const updatedRegistry = { ...(series.characterRegistry || {}), ...(suggestedData.characterRegistry || {}) };
            charactersWithPrompts.forEach(([name, _], idx) => {
                const res = portraitResults[idx];
                if (res.success && res.thumbnailUrl) {
                    updatedRegistry[name].thumbnailUrl = res.thumbnailUrl;
                }
            });

            // 4. Save everything
            const finalPlannedEpisodes = [...(series.plannedEpisodes || []), ...(suggestedData.suggestedEpisodes || [])];
            
            await seriesService.update(series.id, {
                plannedEpisodes: finalPlannedEpisodes,
                totalEpisodes: (Number(series.totalEpisodes || 0) + (suggestedData.suggestedEpisodes?.length || 10)).toString(),
                characterRegistry: updatedRegistry,
                description: suggestedData.globalContext || series.description
            });

            await loadData();
            setIsExtending(false);
            setExtensionPhase('idle');
            setSuggestedData(null);
            alert("Saison 2 prête avec son nouveau casting !");
        } catch (err) {
            setError("Échec de la finalisation du casting.");
            setExtensionPhase('review');
        }
    };

    const handleSaveTitle = async () => {
        if (!series || !editedTitle.trim() || editedTitle === series.title) {
            setIsEditingTitle(false);
            return;
        }
        try {
            await seriesService.update(series.id, { title: editedTitle });
            setSeries({ ...series, title: editedTitle });
            setIsEditingTitle(false);
        } catch (err) {
            setError("Échec de la mise à jour du titre.");
        }
    };

    const handleRegeneratePortrait = async (charName: string) => {
        if (!series || regeneratingChars[charName]) return;
        
        setRegeneratingChars(prev => ({ ...prev, [charName]: true }));
        try {
            const res = await seriesService.regenerateCharacterImage(series.id, charName);
            if (res.success && res.thumbnailUrl) {
                const updatedRegistry = { ...(series.characterRegistry || {}) };
                if (updatedRegistry[charName]) {
                    updatedRegistry[charName].thumbnailUrl = res.thumbnailUrl;
                    setSeries({ ...series, characterRegistry: updatedRegistry });
                }
                alert(`Portrait généré pour ${charName} !`);
            } else {
                setError(res.error || "Échec de la génération.");
            }
        } catch (err) {
            setError("Erreur lors de la génération du portrait.");
        } finally {
            setRegeneratingChars(prev => ({ ...prev, [charName]: false }));
        }
    };

    const handlePromoteScene = async (imageUrl: string) => {
        if (!series || !promotingFor || isPromoting) return;
        
        setIsPromoting(true);
        try {
            const res = await seriesService.promote(series.id, {
                type: promotingFor.type,
                name: promotingFor.name,
                thumbnailUrl: imageUrl
            });
            if (res.success) {
                await loadData();
                setPromotingFor(null);
                alert(`${promotingFor.name} a maintenant une nouvelle image !`);
            }
        } catch (err) {
            setError("L'association de l'image a échoué.");
        } finally {
            setIsPromoting(false);
        }
    };

    // Extract all scene images from all episodes
    const getAllSagaImages = () => {
        const images: string[] = [];
        episodes.filter(v => v.status === 'completed').forEach(video => {
            if (video.thumbnailUrl) images.push(video.thumbnailUrl);
            (video.scenes || []).forEach((scene: any) => {
                if (scene.imageUrl) images.push(scene.imageUrl);
            });
        });
        return [...new Set(images)]; // Distinct
    };

    const handleDeleteSeries = async () => {
        if (!series) return;
        setIsDeleting(true);
        try {
            await seriesService.delete(series.id);
            router.push("/series");
        } catch (err) {
            setIsDeleting(false);
            setError("Échec de la suppression.");
        }
    };

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Chargement de votre saga...</p>
            </div>
        );
    }

    if (!series) return null;

    return (
        <div className="max-w-7xl mx-auto px-4 pb-20 space-y-8 animate-in fade-in duration-500">
            {/* Header / Navigation */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pt-4">
                <div className="space-y-4">
                    <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => router.push("/series")}
                        className="p-0 h-auto hover:bg-transparent text-zinc-400 hover:text-zinc-600 font-bold uppercase tracking-widest text-[10px]"
                    >
                        <ChevronLeft className="h-4 w-4 mr-1" /> Retour aux Sagas
                    </Button>
                    <div className="space-y-1">
                        <div className="flex items-center gap-2">
                             <span className="px-2 py-0.5 rounded bg-blue-500 text-[10px] font-black uppercase tracking-widest text-white">Saga Narrative</span>
                             <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-widest">• {episodes.length} / {series.totalEpisodes || '?'} Épisodes</span>
                        </div>
                        {isEditingTitle ? (
                            <div className="flex items-center gap-2">
                                <Input 
                                    value={editedTitle}
                                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEditedTitle(e.target.value)}
                                    className="text-2xl font-black h-12 bg-white border-blue-200"
                                    autoFocus
                                    onKeyDown={(e: React.KeyboardEvent) => e.key === 'Enter' && handleSaveTitle()}
                                />
                                <Button onClick={handleSaveTitle} size="sm" className="bg-emerald-500 hover:bg-emerald-600 h-12 px-4 rounded-xl">
                                    <Check className="h-4 w-4" />
                                </Button>
                            </div>
                        ) : (
                            <h1 
                                className="text-4xl font-black tracking-tight text-zinc-900 group line-clamp-2 cursor-pointer hover:text-blue-600 transition-colors"
                                onClick={() => {
                                    setEditedTitle(series.title);
                                    setIsEditingTitle(true);
                                }}
                            >
                                {series.title}
                            </h1>
                        )}
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    {isRoadmapFinished && !isExtending && (
                        <Button
                            onClick={handleStartBrainstorming}
                            className="bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-xl h-12 px-6 shadow-lg shadow-amber-200 gap-2 transition-all hover:scale-105"
                        >
                            <Sparkles className="h-4 w-4" /> Étendre la Saga (5 cr.)
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        onClick={() => setShowDeleteConfirm(true)}
                        className="rounded-xl h-12 px-4 text-red-400 hover:text-red-500 hover:bg-red-50"
                    >
                        <Trash2 className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <Tabs defaultValue="episodes" className="w-full">
                <TabsList className="bg-zinc-100 p-1 rounded-2xl h-12 w-full max-w-md mb-8">
                    <TabsTrigger value="episodes" className="rounded-xl flex-1 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Épisodes
                    </TabsTrigger>
                    <TabsTrigger value="characters" className="rounded-xl flex-1 font-bold text-[10px] uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">
                        Casting & Bible
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="episodes" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    {episodes.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-center border-2 border-dashed border-zinc-100 rounded-[2.5rem] bg-zinc-50/50">
                             <div className="h-20 w-20 rounded-3xl bg-white shadow-sm flex items-center justify-center text-zinc-300 mb-6">
                                 <Film className="h-10 w-10" />
                             </div>
                             <h3 className="text-xl font-bold text-zinc-900 mb-2">Aucun épisode généré</h3>
                             <p className="text-zinc-500 max-w-xs mx-auto mb-8">Lancez la production de votre premier épisode à partir de la roadmap.</p>
                             <Button onClick={handleGenerateNext} disabled={isGenerating} className="rounded-xl h-12 px-10 bg-blue-600 font-bold">
                                {isGenerating ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2 text-blue-200" />}
                                Générer l'épisode 1
                             </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {episodes.map((video) => (
                                <VideoCard key={video.id} video={video} showActions={true} />
                            ))}
                            {!isRoadmapFinished && (
                                <div 
                                    onClick={handleGenerateNext}
                                    className="group flex flex-col items-center justify-center min-h-[300px] border-2 border-dashed border-zinc-200 rounded-[2rem] hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer gap-4 p-8 text-center"
                                >
                                    <div className="h-14 w-14 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        {isGenerating ? <Loader2 className="h-6 w-6 animate-spin" /> : <Plus className="h-6 w-6" />}
                                    </div>
                                    <div>
                                        <p className="font-bold text-zinc-900">Suivant : Épisode {episodes.length + 1}</p>
                                        <p className="text-[10px] font-medium text-zinc-400 uppercase tracking-widest mt-1">Cliquez pour générer</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Roadmap Info */}
                    <div className="p-8 rounded-[2rem] bg-zinc-900 text-white relative overflow-hidden shadow-2xl">
                         <div className="absolute top-0 right-0 p-10 opacity-10">
                            <Film className="h-32 w-32" />
                         </div>
                         <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-xl bg-blue-500 flex items-center justify-center">
                                    <Sparkles className="h-5 w-5" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black uppercase tracking-tight">Roadmap Narrative</h3>
                                    <p className="text-zinc-400 text-xs font-medium">Structure planifiée par l'IA pour cette saga.</p>
                                </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                                {(series.plannedEpisodes || []).map((ep: any, idx: number) => {
                                    const isDone = episodes.some(v => v.episodeNumber === ep.number);
                                    const isCurrent = episodes.length === idx;
                                    return (
                                        <div key={idx} className={cn(
                                            "p-4 rounded-2xl border transition-all",
                                            isDone ? "bg-emerald-500/10 border-emerald-500/20" : 
                                            isCurrent ? "bg-blue-500/20 border-blue-500/50 scale-105 shadow-lg shadow-blue-500/20" : 
                                            "bg-white/5 border-white/10 opacity-50"
                                        )}>
                                            <div className="flex justify-between items-start mb-2">
                                                <span className="text-[10px] font-black uppercase tracking-widest">Ép {ep.number}</span>
                                                {isDone && <div className="h-4 w-4 bg-emerald-500 rounded-full flex items-center justify-center"><Check className="h-2.5 w-2.5 text-white" /></div>}
                                            </div>
                                            <p className="text-xs font-bold leading-tight line-clamp-2">{ep.title}</p>
                                        </div>
                                    );
                                })}
                            </div>
                         </div>
                    </div>
                </TabsContent>

                <TabsContent value="characters" className="space-y-8 animate-in fade-in slide-in-from-bottom-2">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-8">
                             <div className="p-8 rounded-[2rem] bg-white border border-zinc-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-3">
                                    <Users className="h-5 w-5 text-blue-500" />
                                    <h3 className="text-xl font-black text-zinc-900 tracking-tight line-clamp-2">Casting de l'Univers</h3>
                                </div>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(series.characterRegistry || {}).map(([name, data]: [string, any]) => {
                                        const evolution = series.visualEvolution?.[name.toLowerCase().replace(/^@/, '')];
                                        const stateStr = evolution?.state || evolution;
                                        
                                        return (
                                            <div 
                                                key={name} 
                                                onClick={() => setSelectedCharacter({ name, data })}
                                                className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-blue-200 transition-colors cursor-pointer group relative overflow-hidden"
                                            >
                                                 <Avatar className="h-16 w-16 rounded-2xl border-2 border-white shadow-md transition-transform group-hover:scale-105">
                                                    <AvatarImage src={data.thumbnailUrl} className="object-cover" />
                                                    <AvatarFallback className="bg-zinc-200 text-zinc-400 font-bold">{name[0]}</AvatarFallback>
                                                 </Avatar>
                                                 <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-zinc-900 truncate">{name}</h4>
                                                        {stateStr && (
                                                            <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-[8px] font-black text-amber-600 uppercase animate-pulse">
                                                                {stateStr}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{data.description}</p>
                                                 </div>
                                                 <div className="flex items-center gap-1">
                                                     <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        disabled={regeneratingChars[name]}
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleRegeneratePortrait(name);
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-100 shadow-sm relative overflow-visible"
                                                        title="Générer un portrait studio (2 crédits)"
                                                     >
                                                        {regeneratingChars[name] ? (
                                                            <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                                                        ) : (
                                                            <RefreshCw className="h-3 w-3 text-blue-500" />
                                                        )}
                                                        <span className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] font-bold text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            2 CR
                                                        </span>
                                                     </Button>
                                                     <Button 
                                                        size="sm" 
                                                        variant="ghost" 
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            setPromotingFor({ type: 'character', name });
                                                        }}
                                                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-100 shadow-sm"
                                                        title="Promouvoir une image d'épisode (Gratuit)"
                                                     >
                                                        <ImageIcon className="h-3 w-3 text-blue-500" />
                                                     </Button>
                                                 </div>
                                            </div>
                                        );
                                    })}
                                </div>
                             </div>

                             {/* Locations Section */}
                             <div className="p-8 rounded-[2rem] bg-white border border-zinc-100 shadow-sm space-y-6">
                                <div className="flex items-center gap-3">
                                    <MapPin className="h-5 w-5 text-emerald-500" />
                                    <h3 className="text-xl font-black text-zinc-900 tracking-tight">Lieux & Décors</h3>
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {Object.entries(series.locationRegistry || {}).map(([name, data]: [string, any]) => {
                                        const evolution = series.visualEvolution?.[name.toLowerCase()];
                                        const stateStr = evolution?.state || evolution;

                                        return (
                                            <div key={name} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-blue-200 transition-colors cursor-pointer group">
                                                 <div className="h-16 w-16 rounded-2xl border-2 border-white shadow-md bg-white flex items-center justify-center overflow-hidden shrink-0">
                                                    {data.thumbnailUrl ? (
                                                        <img src={data.thumbnailUrl} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <MapPin className="h-6 w-6 text-zinc-200" />
                                                    )}
                                                 </div>
                                                 <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <h4 className="font-bold text-zinc-900 truncate">{name}</h4>
                                                        {stateStr && (
                                                            <span className="px-1.5 py-0.5 rounded-full bg-emerald-100 text-[8px] font-black text-emerald-600 uppercase">
                                                                {stateStr}
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{data.description}</p>
                                                 </div>
                                                 <Button 
                                                    size="sm" 
                                                    variant="ghost" 
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setPromotingFor({ type: 'location', name });
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 rounded-full bg-white/80 backdrop-blur-sm border border-zinc-100 shadow-sm"
                                                 >
                                                    <ImageIcon className="h-3 w-3 text-emerald-500" />
                                                 </Button>
                                            </div>
                                        );
                                    })}
                                </div>
                             </div>

                             {/* Assets Section */}
                             {series.assetRegistry && Object.keys(series.assetRegistry).length > 0 && (
                                <div className="p-8 rounded-[2rem] bg-white border border-zinc-100 shadow-sm space-y-6">
                                    <div className="flex items-center gap-3">
                                        <Package className="h-5 w-5 text-amber-500" />
                                        <h3 className="text-xl font-black text-zinc-900 tracking-tight">Objets & Reliques</h3>
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {Object.entries(series.assetRegistry).map(([name, data]: [string, any]) => {
                                            const evolution = series.assetEvolution?.[name.toLowerCase()];
                                            const stateStr = evolution?.state || evolution;

                                            return (
                                                <div key={name} className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100 hover:border-blue-200 transition-colors cursor-pointer group">
                                                    <div className="h-16 w-16 rounded-2xl border-2 border-white shadow-md bg-white flex items-center justify-center overflow-hidden shrink-0">
                                                        {data.thumbnailUrl ? (
                                                            <img src={data.thumbnailUrl} className="w-full h-full object-cover" />
                                                        ) : (
                                                            <Package className="h-6 w-6 text-zinc-200" />
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-bold text-zinc-900 truncate">{name}</h4>
                                                            {stateStr && (
                                                                <span className="px-1.5 py-0.5 rounded-full bg-amber-100 text-[8px] font-black text-amber-600 uppercase">
                                                                    {stateStr}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">{data.description}</p>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                             )}
                        </div>

                        <div className="space-y-8">
                             <div className="p-8 rounded-[2rem] bg-white border border-zinc-100 shadow-sm space-y-4">
                                <h3 className="text-lg font-black text-zinc-900 uppercase tracking-tight">Bible Narrative</h3>
                                <p className="text-sm text-zinc-600 leading-relaxed font-medium">
                                    {series.description || series.globalContext || "Aucune description globale."}
                                </p>
                             </div>
                        </div>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Extension Overlay */}
            {isExtending && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-white/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl space-y-8">
                         {extensionPhase === 'brainstorming' && (
                             <div className="text-center space-y-6">
                                <div className="relative h-32 w-32 mx-auto">
                                    <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-20" />
                                    <div className="absolute inset-4 bg-blue-600 rounded-3xl flex items-center justify-center shadow-2xl">
                                        <Sparkles className="h-10 w-10 text-white animate-pulse" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <h2 className="text-3xl font-black text-zinc-900 tracking-tight">Extension de la Saga...</h2>
                                    <p className="text-zinc-500 font-medium">{extensionMessage || "L'IA imagine la suite de votre histoire."}</p>
                                </div>
                                <div className="w-64 mx-auto h-2 bg-zinc-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-600 transition-all duration-300" style={{ width: `${extensionProgress || 10}%` }} />
                                </div>
                             </div>
                         )}

                         {extensionPhase === 'review' && suggestedData && (
                            <div className="space-y-6 animate-in zoom-in-95 duration-300">
                                 <div className="text-center space-y-2">
                                    <h2 className="text-2xl font-black text-zinc-900 uppercase">Valider le nouveau casting</h2>
                                    <p className="text-zinc-500 text-sm">L'IA suggère ces nouveaux personnages pour la suite.</p>
                                 </div>

                                 <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[400px] overflow-y-auto p-4 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                                    {Object.entries(suggestedData.characterRegistry || {}).map(([name, data]: [string, any]) => {
                                        const isNew = !series.characterRegistry?.[name];
                                        return (
                                            <div key={name} className={cn(
                                                "p-4 rounded-2xl border bg-white transition-all flex items-start gap-3",
                                                isNew ? "border-amber-200 shadow-sm" : "border-zinc-200 opacity-60"
                                            )}>
                                                <div className="h-10 w-10 rounded-lg bg-zinc-100 flex items-center justify-center shrink-0">
                                                    <Users className="h-5 w-5 text-zinc-400" />
                                                </div>
                                                <div className="space-y-1">
                                                    <div className="flex items-center gap-2">
                                                        <span className="font-bold text-sm">{name}</span>
                                                        {isNew && <span className="px-1.5 py-0.5 rounded bg-amber-100 text-[8px] font-black text-amber-600 uppercase">Nouveau</span>}
                                                    </div>
                                                    <p className="text-[10px] text-zinc-500 line-clamp-3 leading-relaxed">{data.description}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                 </div>

                                 <div className="flex gap-4">
                                     <Button variant="ghost" onClick={() => setIsExtending(false)} className="flex-1 h-14 rounded-2xl font-bold uppercase tracking-widest text-xs">
                                         Annuler
                                     </Button>
                                     <Button onClick={handleConfirmCasting} className="flex-1 h-14 rounded-2xl bg-blue-600 font-bold uppercase tracking-widest text-xs shadow-xl shadow-blue-200">
                                         Valider & Continuer
                                     </Button>
                                 </div>
                            </div>
                         )}

                         {extensionPhase === 'casting' && (
                             <div className="text-center space-y-6">
                                <Loader2 className="h-12 w-12 text-blue-500 animate-spin mx-auto" />
                                <h2 className="text-2xl font-black">Finalisation de la Roadmap...</h2>
                                <p className="text-zinc-500">Mise à jour de votre univers narratif.</p>
                             </div>
                         )}
                    </div>
                </div>
            )}

            {/* Delete Confirmation */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-stone-900/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl p-8 space-y-6 text-center animate-in zoom-in-95">
                        <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mx-auto">
                            <AlertTriangle className="h-10 w-10 text-red-500" />
                        </div>
                        <div className="space-y-2">
                            <h3 className="text-lg font-black text-stone-900 uppercase">Supprimer la Saga ?</h3>
                            <p className="text-sm text-stone-500">Action irréversible. L'historique des vidéos sera conservé.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="outline" className="flex-1 rounded-2xl h-12 font-bold" onClick={() => setShowDeleteConfirm(false)}>Annuler</Button>
                            <Button variant="destructive" className="flex-1 rounded-2xl h-12 font-bold" onClick={handleDeleteSeries} disabled={isDeleting}>
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Promote Scene Image Modal */}
            {promotingFor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-white/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-4xl space-y-8">
                         <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <h2 className="text-2xl font-black text-zinc-900 uppercase">Choisir une image pour {promotingFor.name}</h2>
                                <p className="text-zinc-500 text-sm">Sélectionnez une scène issue des épisodes générés.</p>
                            </div>
                            <Button variant="ghost" onClick={() => setPromotingFor(null)} className="rounded-xl h-10 px-4">
                                Fermer
                            </Button>
                         </div>

                         <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[60vh] overflow-y-auto p-4 bg-zinc-50 rounded-[2rem] border border-zinc-100">
                            {getAllSagaImages().length === 0 ? (
                                <div className="col-span-full py-20 text-center text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                                    Aucune scène générée pour le moment.
                                </div>
                            ) : getAllSagaImages().map((imgUrl, idx) => (
                                <div 
                                    key={idx} 
                                    onClick={() => handlePromoteScene(imgUrl)}
                                    className="aspect-square rounded-xl overflow-hidden cursor-pointer border-2 border-transparent hover:border-blue-500 hover:scale-105 transition-all group relative shadow-sm"
                                >
                                    <img src={imgUrl} className="w-full h-full object-cover" />
                                    {isPromoting && (
                                        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
                                            <Loader2 className="h-4 w-4 animate-spin text-blue-500" />
                                        </div>
                                    )}
                                </div>
                            ))}
                         </div>
                    </div>
                </div>
            )}
            {/* Character Detail Modal */}
            {selectedCharacter && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-white/90 backdrop-blur-xl animate-in fade-in duration-300">
                    <div className="w-full max-w-2xl bg-white rounded-[2.5rem] p-10 shadow-2xl border border-zinc-100 space-y-8">
                         <div className="flex items-center gap-6">
                            <Avatar className="h-32 w-32 rounded-3xl border-4 border-white shadow-xl">
                                <AvatarImage src={selectedCharacter.data.thumbnailUrl} className="object-cover" />
                                <AvatarFallback className="bg-zinc-100 text-zinc-300 text-4xl font-black">{selectedCharacter.name[0]}</AvatarFallback>
                            </Avatar>
                            <div className="space-y-2">
                                <h2 className="text-4xl font-black text-zinc-900 tracking-tight">{selectedCharacter.name}</h2>
                                <div className="flex items-center gap-2">
                                    <span className="px-3 py-1 bg-blue-100 text-blue-600 rounded-full text-[10px] font-black uppercase tracking-widest">Membre du Casting</span>
                                    {series.visualStyleModelId && <span className="px-3 py-1 bg-amber-100 text-amber-600 rounded-full text-[10px] font-black uppercase tracking-widest">Coherence visuelle active</span>}
                                </div>
                            </div>
                         </div>

                         <div className="space-y-4">
                            <h3 className="text-xs font-black text-zinc-400 uppercase tracking-[0.2em]">Rôle & Backstory</h3>
                            <p className="text-zinc-600 text-lg leading-relaxed font-medium">
                                {selectedCharacter.data.description}
                            </p>
                         </div>

                         <div className="pt-8 flex items-center gap-4 border-t border-zinc-50">
                            <Button 
                                onClick={() => handleRegeneratePortrait(selectedCharacter.name)}
                                disabled={regeneratingChars[selectedCharacter.name]}
                                className="flex-1 h-14 bg-zinc-900 text-white rounded-2xl font-bold shadow-xl hover:bg-zinc-800 gap-2"
                            >
                                {regeneratingChars[selectedCharacter.name] ? <Loader2 className="h-5 w-5 animate-spin" /> : <RefreshCw className="h-5 w-5" />}
                                Générer Portrait Studio · 2 Crédits
                            </Button>
                            <Button 
                                variant="outline"
                                onClick={() => setSelectedCharacter(null)}
                                className="h-14 px-8 rounded-2xl font-bold border-zinc-200"
                            >
                                Fermer
                            </Button>
                         </div>
                    </div>
                </div>
            )}
        </div>
    );
}
