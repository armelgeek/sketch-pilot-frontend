"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import {
    Loader2, CheckCircle2, Download, ChevronLeft,
    Play, Clapperboard, Sparkles, RefreshCw, AlertCircle, Film
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useVideoProgress } from "@/src/hooks/use-video-progress";
import { videosService, Video } from "@/src/services/videos-service";
import { cn } from "@/src/lib/utils";

export default function ResultPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const videoId = params.id as string;
    const jobId = searchParams.get("jobId") || undefined;

    const { progress, status, message, videoUrl, thumbnailUrl, isFinished, error, ffmpegFps, ffmpegTimemark } = useVideoProgress(jobId);
    const [video, setVideo] = useState<Video | null>(null);

    useEffect(() => {
        if (!videoId) return;
        videosService.getById(videoId).then(setVideo);
    }, [videoId, isFinished]);

    const handleDownload = () => {
        if (!videoUrl) return;
        window.open(videoUrl, "_blank");
    };

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col font-sans">
            {/* Header */}
            <header className="h-16 border-b border-zinc-800/50 flex items-center justify-between px-6 shrink-0 bg-zinc-950/50 backdrop-blur-xl sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => router.push("/videos")}
                        className="h-10 w-10 rounded-2xl bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 flex items-center justify-center transition-all group shadow-sm"
                    >
                        <ChevronLeft className="h-5 w-5 text-zinc-400 group-hover:text-white transition-colors" />
                    </button>

                </div>

                <div className="flex items-center gap-3">
                    <Button
                        variant="secondary"
                        size="sm"
                        className="rounded-xl font-black text-xs h-9 px-5 border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 transition-all shadow-sm"
                        onClick={() => router.push(`/generate/${videoId}/audio`)}
                    >
                        <RefreshCw className="h-3.5 w-3.5 mr-2" /> Modifier
                    </Button>
                    <Button
                        size="sm"
                        disabled={!isFinished || !!error}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl h-9 px-6 shadow-lg shadow-emerald-500/20 transition-all disabled:opacity-40"
                        onClick={handleDownload}
                    >
                        <Download className="h-3.5 w-3.5 mr-2" /> Télécharger
                    </Button>
                </div>
            </header>

            <main className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-4xl space-y-12">

                    {/* Video Player / Loading Area */}
                    <div className="relative aspect-video rounded-[2.5rem] overflow-hidden bg-zinc-900 border-4 border-zinc-900 shadow-[0_0_100px_rgba(0,0,0,0.5)] ring-1 ring-zinc-800/50 group">
                        {isFinished && videoUrl ? (
                            <video
                                src={videoUrl}
                                poster={thumbnailUrl}
                                controls
                                className="w-full h-full object-contain animate-in fade-in duration-1000"
                                autoPlay
                            />
                        ) : (
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center overflow-hidden">
                                {/* Animated background glow */}
                                <div className="absolute inset-0 bg-emerald-500/5 animate-pulse" />

                                <div className="relative z-10 space-y-8 w-full max-w-md">
                                    <div className="relative h-20 w-20 mx-auto">
                                        <div className="absolute inset-0 rounded-3xl bg-emerald-500/20 animate-ping" />
                                        <div className="relative h-20 w-20 rounded-3xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shadow-2xl">
                                            {error ? (
                                                <AlertCircle className="h-10 w-10 text-red-500 animate-bounce" />
                                            ) : (
                                                <Sparkles className="h-10 w-10 text-emerald-500 animate-pulse" />
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                                            {error ? "Mince, une erreur..." : isFinished ? "C'est prêt !" : "Assemblage final..."}
                                        </h2>
                                        <p className="text-zinc-400 font-medium text-sm sm:text-base leading-relaxed">
                                            {error || message || "Nous assemblons toutes les scènes et la musique pour créer votre chef-d'œuvre."}
                                        </p>
                                    </div>

                                    {!error && !isFinished && (
                                        <div className="space-y-4 pt-4">
                                            <div className="h-3 w-full bg-zinc-800 rounded-full overflow-hidden p-0.5 border border-zinc-700/50">
                                                <div
                                                    className="h-full bg-emerald-500 rounded-full transition-all duration-700 shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                                                    style={{ width: `${progress}%` }}
                                                />
                                            </div>
                                            <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-zinc-500">
                                                <span className="flex items-center gap-1.5">
                                                    <Loader2 className="h-3 w-3 animate-spin" /> {status || "Processing"}
                                                </span>
                                                <span className="text-emerald-500">{Math.round(progress)}%</span>
                                            </div>
                                            {ffmpegFps !== undefined && (
                                                <div className="flex justify-between items-center bg-zinc-900/50 px-3 py-2 rounded border border-zinc-800 text-[10px] uppercase font-bold tracking-widest text-zinc-400 mt-2">
                                                    <span>Vitesse FFMPEG: <strong className="text-emerald-400">{ffmpegFps} FPS</strong></span>
                                                    <span>Position: <strong className="text-emerald-400">{ffmpegTimemark}</strong></span>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {error && (
                                        <Button
                                            onClick={() => window.location.reload()}
                                            className="bg-zinc-800 hover:bg-zinc-700 text-white font-bold rounded-xl h-12 px-8 transition-all"
                                        >
                                            Réessayer
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Status overlays */}
                        {isFinished && (
                            <div className="absolute top-6 right-6 z-20 animate-in slide-in-from-top-4 duration-500">
                                <div className="bg-emerald-500/90 backdrop-blur-md text-white px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 font-black text-xs uppercase tracking-wider">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Vidéo Terminée
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Success details or upselling */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
                        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800/50 space-y-3">
                            <div className="h-10 w-10 rounded-2xl bg-zinc-800 flex items-center justify-center">
                                <Film className="h-5 w-5 text-zinc-400" />
                            </div>
                            <h3 className="font-black text-sm text-zinc-200">Format Professionnel</h3>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed">Vidéo optimisée pour les réseaux sociaux et le partage en haute définition.</p>
                        </div>
                        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800/50 space-y-3">
                            <div className="h-10 w-10 rounded-2xl bg-zinc-800 flex items-center justify-center">
                                <Download className="h-5 w-5 text-zinc-400" />
                            </div>
                            <h3 className="font-black text-sm text-zinc-200">Libre de droits</h3>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed">Tous les éléments générés vous appartiennent. Utilisez-les partout sans limite.</p>
                        </div>
                        <div className="bg-zinc-900/50 p-6 rounded-3xl border border-zinc-800/50 space-y-3 border-emerald-500/20 bg-emerald-500/[0.02]">
                            <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                                <Sparkles className="h-5 w-5 text-emerald-500" />
                            </div>
                            <h3 className="font-black text-sm text-zinc-200">Encore mieux ?</h3>
                            <p className="text-xs text-zinc-500 font-medium leading-relaxed">Modifiez le script ou changez les voix dans le Studio pour affiner le résultat.</p>
                        </div>
                    </div>
                </div>
            </main>

            {/* Footer / Success Message */}
            <footer className="h-16 border-t border-zinc-800/50 flex items-center justify-center gap-2 shrink-0 bg-zinc-950/50 text-[10px] font-black uppercase tracking-widest text-zinc-600">
                <CheckCircle2 className="h-3 w-3 text-emerald-500" />
                Propulsé par Sketch Pilot Engine
            </footer>
        </div>
    );
}
