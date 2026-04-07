"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { videosService } from "@/src/services/videos-service";
import { Button } from "@/src/components/ui/button";
import { ArrowLeft, Download, Play, RefreshCw, Wand2, Share2, FileText, Globe } from "lucide-react";
import { Video } from "@sketch-pilot/types/video.types";
import { cn } from "@/src/lib/utils";

export default function VideoDetailPage() {
    const params = useParams();
    const router = useRouter();
    const videoId = params.id as string;

    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!videoId) return;
        const fetchVideo = async () => {
            try {
                const vid = await videosService.getById(videoId);
                setVideo(vid);
            } catch (error) {
                console.error("Failed to load video", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVideo();
    }, [videoId]);

    if (loading) {
        return (
            <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
                <RefreshCw className="h-6 w-6 animate-spin text-zinc-300" />
            </div>
        );
    }

    if (!video) {
        return (
            <div className="flex flex-col h-[calc(100vh-4rem)] items-center justify-center space-y-4">
                <div className="h-16 w-16 bg-zinc-100 rounded-full flex items-center justify-center">
                    <FileText className="h-6 w-6 text-zinc-400" />
                </div>
                <h2 className="text-xl font-semibold text-zinc-900">Vidéo introuvable</h2>
                <Button onClick={() => router.push("/videos")} variant="outline">
                    Retour aux vidéos
                </Button>
            </div>
        );
    }

    const { options, script } = video as any;
    const isCompleted = video.status === 'completed';

    return (
        <div className="max-w-6xl mx-auto px-6 py-8 space-y-8 animate-in fade-in duration-700">
            {/* Header Navigation */}
            <div className="flex items-center justify-between">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm font-medium text-zinc-500 hover:text-zinc-900 transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Retour
                </button>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={() => router.push(`/generate/${video.id}/storyboard`)}
                        variant="outline"
                        className="h-9 px-4 text-xs font-semibold rounded-xl text-zinc-600 hover:text-zinc-900 border-zinc-200 uppercase tracking-widest"
                    >
                        <Wand2 className="h-3.5 w-3.5 mr-2" />
                        Reprendre l'édition
                    </Button>
                    {isCompleted && video.videoUrl && (
                        <Button
                            onClick={() => window.open(video.videoUrl, '_blank')}
                            className="h-9 px-4 text-xs font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white shadow-md shadow-amber-500/20 uppercase tracking-widest"
                        >
                            <Download className="h-3.5 w-3.5 mr-2" />
                            Télécharger
                        </Button>
                    )}
                </div>
            </div>

            {/* Video Details section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                {/* Left Col: Player */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="w-full aspect-video bg-zinc-950 rounded-2xl overflow-hidden shadow-2xl relative border border-zinc-200">
                        {isCompleted && video.videoUrl ? (
                            <video
                                src={video.videoUrl}
                                controls
                                className="w-full h-full object-contain"
                                poster={video.thumbnailUrl}
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-900 text-white">
                                {video.thumbnailUrl && (
                                    <div className="absolute inset-0 opacity-40 blur-sm">
                                        <img src={video.thumbnailUrl} alt="Thumbnail preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="z-10 flex flex-col items-center">
                                    <h3 className="text-xl font-bold mb-2 text-center max-w-md">
                                        {video.title || video.topic || "Projet en cours de création"}
                                    </h3>
                                    <span className={cn(
                                        "px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest backdrop-blur-md border",
                                        video.status === 'failed' ? "bg-red-500/20 border-red-500/30 text-red-100" :
                                            video.status === 'processing' ? "bg-blue-500/20 border-blue-500/30 text-blue-100" :
                                                "bg-zinc-500/20 border-zinc-500/30 text-zinc-100"
                                    )}>
                                        {video.status === 'failed' ? "Échec" : video.status === 'processing' ? "Assemblage..." : "En préparation"}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-zinc-900 tracking-tight">
                            {video.title || video.topic || "Sans titre"}
                        </h1>
                        <p className="text-sm text-zinc-500">
                            Créée le {new Date(video.createdAt || Date.now()).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>

                {/* Right Col: Meta & Parameters */}
                <div className="space-y-6">
                    <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-6 shadow-sm">
                        <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                            <Globe className="h-4 w-4 text-zinc-400" />
                            Paramètres
                        </h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400 mb-1 block">Titre généré</label>
                                <p className="text-sm font-medium text-zinc-800 bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-100">
                                    {video.title || "Non défini"}
                                </p>
                            </div>
                            <div>
                                <label className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400 mb-1 block">Sujet / Prompt</label>
                                <p className="text-sm text-zinc-700 bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-100 italic line-clamp-4">
                                    "{video.topic}"
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400 mb-1 block">Format</label>
                                    <p className="text-sm font-medium text-zinc-800">
                                        {options?.aspectRatio || "16:9"}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-[10px] font-black tracking-[0.2em] uppercase text-zinc-400 mb-1 block">Durée cible</label>
                                    <p className="text-sm font-medium text-zinc-800">
                                        {options?.duration ? `${options.duration} secondes` : "Auto"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {script && script.scenes && (
                        <div className="bg-white border border-zinc-200 rounded-2xl p-6 space-y-4 shadow-sm">
                            <h3 className="text-sm font-bold text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                                <FileText className="h-4 w-4 text-zinc-400" />
                                Script & Scènes
                            </h3>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center bg-zinc-50 px-3 py-2 rounded-lg border border-zinc-100">
                                    <span className="text-xs font-semibold text-zinc-600">Nombre de scènes</span>
                                    <span className="text-sm font-bold text-zinc-900">{script.scenes.length}</span>
                                </div>
                                <div className="text-xs text-zinc-500 leading-relaxed border-t border-zinc-100 pt-3">
                                    <p className="line-clamp-6">{script.scenes.map((s: any) => s.narration).join(" ")}</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
