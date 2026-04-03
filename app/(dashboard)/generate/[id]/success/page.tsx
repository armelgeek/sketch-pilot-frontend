"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    CheckCircle2, Download, Share2,
    Plus, Home, Sparkles
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { videosService, type Video } from "@/src/services/videos-service";

export default function SuccessPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [video, setVideo] = useState<Video | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadVideo = async () => {
            try {
                const v = await videosService.getById(resolvedParams.id);
                setVideo(v);
                setLoading(false);
            } catch (err) {
                setError("Impossible de charger votre vidéo.");
                setLoading(false);
            }
        };
        loadVideo();
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-12 h-12 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" />
            </div>
        );
    }

    if (!video || !video.videoUrl) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-6 px-4 text-center">
                <div className="h-20 w-20 rounded-full bg-red-50 dark:bg-red-950/20 flex items-center justify-center text-red-500 border border-red-200 dark:border-red-800">
                    <CheckCircle2 className="h-10 w-10 opacity-20" />
                </div>
                <div className="space-y-2">
                    <h1 className="text-2xl font-black tracking-tight">Vidéo non trouvée ou en cours...</h1>
                    <p className="text-zinc-500 max-w-sm mx-auto font-medium">
                        La vidéo n'est pas encore prête ou n'existe pas.
                    </p>
                </div>
                <Button onClick={() => router.push("/videos")} variant="outline" className="rounded-xl h-12 px-8">
                    Retour à ma bibliothèque
                </Button>
            </div>
        );
    }

    return (
        <div className="relative min-h-screen mt-12 pb-24 overflow-hidden">
            {/* Celebration Background Effects */}
            <div className="mesh-gradient opacity-40 dark:opacity-20" />
            <div className="absolute top-0 inset-x-0 h-96 bg-gradient-to-b from-emerald-500/10 to-transparent pointer-events-none" />

            <div className="mx-auto max-w-4xl px-4 py-12 relative z-10 flex flex-col items-center">

                {/* Success Header */}
                <div className="text-center space-y-4 mb-12 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <div className="inline-flex items-center gap-3 px-4 py-2 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shadow-xl shadow-emerald-500/5 mb-2">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-sm font-black uppercase tracking-widest">Génération Réussie !</span>
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-500 dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent px-4">
                        Votre Chef-d'œuvre est Prêt !
                    </h1>
                    <p className="text-zinc-500 text-lg font-medium max-w-xl mx-auto">
                        Félicitations ! Votre vidéo a été assemblée avec succès. Vous pouvez maintenant la visionner et la télécharger.
                    </p>
                </div>

                {/* Video Player Card */}
                <Card className="w-full glass-pill border-none shadow-2xl shadow-emerald-500/10 overflow-hidden mb-12 group animate-in fade-in zoom-in-95 duration-1000 delay-300">
                    <CardContent className="p-0">
                        <div className="aspect-video bg-black relative group/player">
                            <video
                                src={video.videoUrl}
                                controls
                                autoPlay
                                className="w-full h-full object-contain"
                                poster={video.thumbnailUrl}
                            />
                        </div>

                        <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md">
                            <div className="space-y-1 text-center md:text-left">
                                <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                                    {video.title || video.topic}
                                </h3>
                                <p className="text-xs text-zinc-400 font-bold uppercase tracking-widest">
                                    Format: {video.options?.aspectRatio || '16:9'} • Durée: {video.script?.totalDuration ? `${Math.round(video.script.totalDuration)}s` : 'Pro'}
                                </p>
                            </div>
                            <div className="flex gap-3">
                                <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl h-12 px-6 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
                                    <a href={video.videoUrl} download={`video-${video.id}.mp4`}>
                                        <Download className="h-5 w-5 mr-2" /> Télécharger HD
                                    </a>
                                </Button>
                                <Button variant="outline" className="rounded-xl h-12 w-12 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all active:scale-95">
                                    <Share2 className="h-5 w-5" />
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Post-Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500">
                    <Button
                        asChild
                        size="lg"
                        variant="secondary"
                        className="rounded-2xl h-16 text-lg font-black tracking-tight group hover:shadow-xl transition-all"
                    >
                        <Link href="/generate">
                            <Plus className="h-6 w-6 mr-3 text-emerald-500 group-hover:rotate-90 transition-transform duration-300" />
                            Créer une Autre Vidéo
                        </Link>
                    </Button>
                    <Button
                        asChild
                        size="lg"
                        variant="outline"
                        className="rounded-2xl h-16 text-lg font-black tracking-tight border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all"
                    >
                        <Link href="/videos">
                            <Home className="h-5 w-5 mr-3 text-zinc-400" />
                            Ma Bibliothèque
                        </Link>
                    </Button>
                </div>

                {/* Quick Share / Feedback Footer */}
                <div className="mt-16 text-center space-y-6 opacity-60 hover:opacity-100 transition-opacity">
                    <p className="text-xs font-bold uppercase tracking-[0.3em] text-zinc-400">Partagez l'expérience</p>
                    <div className="flex justify-center gap-8">
                        <Sparkles className="h-6 w-6 text-emerald-400 animate-pulse" />
                        <span className="text-sm font-medium italic text-zinc-500">Sketch-Pilot Pipeline Completed</span>
                        <Sparkles className="h-6 w-6 text-emerald-400 animate-pulse" />
                    </div>
                </div>

            </div>
        </div>
    );
}
