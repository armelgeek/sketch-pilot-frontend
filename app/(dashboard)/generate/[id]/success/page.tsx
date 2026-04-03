"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { Video } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { VideoSuccessModal } from "@/src/components/ui/video-success-modal";
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
            <div className="min-h-screen flex items-center justify-center bg-[#F8F8F7]">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-200 border-t-emerald-500" />
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
        <div className="min-h-screen bg-[#0E0E10]">
            <VideoSuccessModal
                videoUrl={video.videoUrl}
                thumbnailUrl={video.thumbnailUrl}
                videoId={video.id}
                aspectRatio={video.options?.aspectRatio}
                duration={video.script?.totalDuration}
            />
        </div>
    );
}
