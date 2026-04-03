"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Download, Share2, Plus, Video } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { videosService, type Video as ApiVideo } from "@/src/services/videos-service";

export default function SuccessPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [video, setVideo] = useState<ApiVideo | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        videosService.getById(resolvedParams.id)
            .then(setVideo)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, [resolvedParams.id]);

    if (loading) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-300 border-t-zinc-900" />
            </div>
        );
    }

    if (!video || !video.videoUrl) {
        return (
            <div className="min-h-[50vh] flex flex-col items-center justify-center gap-4 text-center px-4">
                <div className="h-14 w-14 rounded-2xl bg-zinc-100 flex items-center justify-center">
                    <Video className="h-6 w-6 text-zinc-400" />
                </div>
                <div>
                    <h2 className="font-black text-zinc-900 text-xl mb-1">Vidéo non disponible</h2>
                    <p className="text-sm text-zinc-500">La vidéo n&apos;est pas encore prête ou n&apos;existe pas.</p>
                </div>
                <Button onClick={() => router.push("/videos")} variant="outline" className="rounded-xl h-10">
                    Retour à ma bibliothèque
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-6 max-w-3xl mx-auto">
            <div className="flex items-center gap-2 text-emerald-600">
                <CheckCircle2 className="h-5 w-5" />
                <span className="text-sm font-black uppercase tracking-widest">Génération réussie</span>
            </div>

            <div>
            
                <p className="text-sm text-zinc-500 mt-1">
                    Format {video.options?.aspectRatio || "16:9"}{video.script?.totalDuration ? ` · ${Math.round(video.script.totalDuration)}s` : ""}
                </p>
            </div>

            <Card className="bg-white border border-zinc-100 rounded-2xl shadow-none overflow-hidden">
                <div className="aspect-video bg-zinc-900">
                    <video src={video.videoUrl} controls autoPlay className="w-full h-full object-contain" poster={video.thumbnailUrl} />
                </div>
                <CardContent className="p-4 flex items-center justify-between gap-4">
                   <div className="flex gap-2 shrink-0">
                        <Button asChild className="bg-zinc-900 hover:bg-zinc-700 text-white font-bold rounded-xl h-9 px-4 text-sm">
                            <a href={video.videoUrl} download={`video-${video.id}.mp4`}>
                                <Download className="h-4 w-4 mr-1.5" /> Télécharger
                            </a>
                        </Button>
                        <Button variant="outline" className="rounded-xl h-9 w-9 border-zinc-200 p-0">
                            <Share2 className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline" className="rounded-xl h-11 font-bold border-zinc-200">
                    <Link href="/generate"><Plus className="h-4 w-4 mr-2" /> Nouvelle vidéo</Link>
                </Button>
                <Button asChild variant="outline" className="rounded-xl h-11 font-bold border-zinc-200">
                    <Link href="/videos"><Video className="h-4 w-4 mr-2" /> Ma bibliothèque</Link>
                </Button>
            </div>
        </div>
    );
}
