"use client";

import { useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { X, Download, Share2, Plus, Video, CheckCircle2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import confetti from "canvas-confetti";

interface VideoSuccessModalProps {
    videoUrl: string;
    thumbnailUrl?: string;
    videoId: string;
    aspectRatio?: string;
    duration?: number;
    onClose?: () => void;
}

export function VideoSuccessModal({
    videoUrl,
    thumbnailUrl,
    videoId,
    aspectRatio,
    duration,
    onClose,
}: VideoSuccessModalProps) {
    const router = useRouter();
    const firedRef = useRef(false);

    const fireConfetti = useCallback(() => {
        if (firedRef.current) return;
        firedRef.current = true;

        const count = 180;
        const defaults = { startVelocity: 30, spread: 360, ticks: 80, zIndex: 60 };

        const randomInRange = (min: number, max: number) =>
            Math.random() * (max - min) + min;

        const fire = (particleRatio: number, opts: confetti.Options) => {
            confetti({
                ...defaults,
                ...opts,
                particleCount: Math.floor(count * particleRatio),
            });
        };

        // Left burst
        fire(0.25, { origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        // Right burst
        fire(0.25, { origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
        // Center burst
        fire(0.35, { origin: { x: 0.5, y: 0.35 }, scalar: 1.2 });
        fire(0.15, { origin: { x: 0.5, y: 0.35 }, scalar: 0.8, shapes: ["circle"] });
    }, []);

    useEffect(() => {
        // Small delay so the modal renders first, then confetti fires on top
        const t = setTimeout(fireConfetti, 120);
        return () => clearTimeout(t);
    }, [fireConfetti]);

    const handleShare = async () => {
        try {
            await navigator.share?.({ url: videoUrl, title: "Ma vidéo" });
        } catch {
            await navigator.clipboard?.writeText(videoUrl);
        }
    };

    const meta = [
        aspectRatio,
        duration ? `${Math.round(duration)}s` : null,
    ].filter(Boolean).join(" · ");

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            role="dialog"
            aria-modal="true"
            aria-label="Vidéo générée avec succès"
        >
            <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-300">

                {/* Close */}
                {onClose && (
                    <button
                        onClick={onClose}
                        aria-label="Fermer"
                        className="absolute top-3 right-3 z-10 h-8 w-8 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm text-zinc-400 hover:text-zinc-700 hover:bg-white transition-colors shadow-sm"
                    >
                        <X className="h-4 w-4" />
                    </button>
                )}

                {/* Success badge */}
                <div className="flex items-center gap-2 px-5 pt-5 pb-3">
                    <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-full">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                        <span className="text-xs font-black text-emerald-700 uppercase tracking-widest">
                            Vidéo générée !
                        </span>
                    </div>
                    {meta && (
                        <span className="text-xs text-zinc-400 font-medium">{meta}</span>
                    )}
                </div>

                {/* Video player */}
                <div className="mx-5 mb-4 rounded-2xl overflow-hidden bg-zinc-900 shadow-lg">
                    <video
                        src={videoUrl}
                        controls
                        autoPlay
                        playsInline
                        poster={thumbnailUrl}
                        className="w-full max-h-[52vh] object-contain"
                    />
                </div>

                {/* Actions */}
                <div className="px-5 pb-5 flex items-center gap-2.5">
                    <Button
                        asChild
                        className="flex-1 h-10 bg-zinc-900 hover:bg-zinc-700 text-white font-bold rounded-xl text-sm gap-2 shadow-sm"
                    >
                        <a href={videoUrl} download={`video-${videoId}.mp4`}>
                            <Download className="h-4 w-4" />
                            Télécharger
                        </a>
                    </Button>
                    <Button
                        onClick={handleShare}
                        variant="outline"
                        className="h-10 w-10 p-0 rounded-xl border-zinc-200 shrink-0"
                        aria-label="Partager"
                    >
                        <Share2 className="h-4 w-4" />
                    </Button>
                    <div className="w-px h-6 bg-zinc-100 shrink-0" />
                    <Button
                        onClick={() => router.push("/generate")}
                        variant="outline"
                        className="h-10 px-4 rounded-xl border-zinc-200 font-bold text-sm gap-2 text-zinc-700"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        Nouvelle
                    </Button>
                    <Button
                        onClick={() => router.push("/videos")}
                        variant="outline"
                        className="h-10 px-4 rounded-xl border-zinc-200 font-bold text-sm gap-2 text-zinc-700"
                    >
                        <Video className="h-3.5 w-3.5" />
                        Bibliothèque
                    </Button>
                </div>
            </div>
        </div>
    );
}
