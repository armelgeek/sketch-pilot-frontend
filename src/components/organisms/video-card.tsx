"use client";

import { useRouter } from "next/navigation";
import {
    Play, Pencil, Download, Clock, Image as ImageIcon,
    Loader2, MoreVertical, Trash2, Share2, Eye
} from "lucide-react";
import { CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";
import { Video } from "@/src/services/videos-service";
import { useMemo } from "react";

interface VideoCardProps {
    video: Video;
    showActions?: boolean;
}

const statusConfig: Record<string, { label: string; dotColor: string }> = {
    completed: { label: "Terminé", dotColor: "bg-emerald-500" },
    processing: { label: "En cours", dotColor: "bg-amber-500" },
    failed: { label: "Échec", dotColor: "bg-red-500" },
    queued: { label: "En attente", dotColor: "bg-zinc-400" },
    draft: { label: "Brouillon", dotColor: "bg-zinc-300" },
    scenes_generated: { label: "Visuels prêts", dotColor: "bg-amber-400" },
    narration_generated: { label: "Narration OK", dotColor: "bg-amber-400" },
    cancelled: { label: "Annulé", dotColor: "bg-zinc-200" },
};

const EDIT_ROUTE: Record<string, string> = {
    draft: "storyboard",
    scenes_generated: "storyboard",
    narration_generated: "audio",
    failed: "storyboard",
    completed: "storyboard",
    queued: "storyboard",
    processing: "storyboard",
};

export function VideoCard({ video, showActions = false }: VideoCardProps) {
    const router = useRouter();
    const config = statusConfig[video.status] || statusConfig.draft;
    const step = EDIT_ROUTE[video.status];
    const editPath = step ? `/generate/${video.id}/${step}` : null;

    const dateStr = video.createdAt || video.created_at;
    const date = dateStr
        ? new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
        : "Récemment";

    const isProcessing = video.status === "processing" || video.status === "queued";

    const displayThumbnail = useMemo(() => {
        if (video.thumbnailUrl) return video.thumbnailUrl;

        const scenes = video.scenes || (video as any).script?.scenes || [];
        if (scenes.length > 0) {
            const scenesWithImages = scenes.filter((s: any) => s.imageUrl);
            if (scenesWithImages.length > 0) {
                // Stable random based on video ID
                const charSum = video.id.split("").reduce((sum, char) => sum + char.charCodeAt(0), 0);
                const index = charSum % scenesWithImages.length;
                return scenesWithImages[index].imageUrl;
            }
        }
        return null;
    }, [video.id, video.thumbnailUrl, video.scenes, (video as any).script]);

    const handleCardClick = () => {
        if (!showActions && editPath) {
            router.push(editPath);
        }
    };

    return (
        <div
            className="group relative flex flex-col gap-4 p-3 rounded-xl bg-white border border-zinc-100 shadow-[0_8px_30px_rgb(0,0,0,0.02)] transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.08)] hover:-translate-y-1 cursor-pointer"
            onClick={handleCardClick}
        >
            {/* Thumbnail Area */}
            <div className="aspect-video relative rounded-xl overflow-hidden bg-zinc-50 border border-zinc-50 transition-all duration-500">
                {displayThumbnail ? (
                    <img
                        src={displayThumbnail}
                        alt={video.title || video.topic}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                ) : isProcessing ? (
                    <div className="flex items-center justify-center h-full text-amber-500/40">
                        <Loader2 className="h-6 w-6 animate-spin" />
                    </div>
                ) : (
                    <div className="flex items-center justify-center h-full bg-zinc-50">
                        <ImageIcon className="h-10 w-10 text-zinc-100" />
                    </div>
                )}

                {/* Hover Play/View Overlay - Ultra Minimal */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center z-10">
                    <div className="h-12 w-12 rounded-full bg-white shadow-[0_0_20px_rgba(0,0,0,0.2)] flex items-center justify-center text-zinc-950 scale-90 group-hover:scale-100 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]">
                        {video.status === "completed" ? (
                            <Play className="h-5 w-5 fill-current ml-0.5" />
                        ) : (
                            <Eye className="h-5 w-5" />
                        )}
                    </div>
                </div>

                {/* Dropdown Options - Floating */}
                {showActions && (
                    <div className="absolute top-3 right-3 z-30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-10 w-10 rounded-2xl bg-white/90 backdrop-blur-md border border-white shadow-xl hover:bg-white transition-all hover:scale-110 active:scale-95"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-5 w-5 text-zinc-900" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 p-2 rounded-[1.5rem] border-zinc-100 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
                                {editPath && (
                                    <DropdownMenuItem
                                        className="rounded-xl h-11 px-4 cursor-pointer font-bold text-xs gap-3"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(editPath);
                                        }}
                                    >
                                        <Pencil className="h-4 w-4 opacity-40" /> Éditer le projet
                                    </DropdownMenuItem>
                                )}
                                {video.status === "completed" && video.videoUrl && (
                                    <DropdownMenuItem
                                        className="rounded-xl h-11 px-4 cursor-pointer font-bold text-xs gap-3"
                                        asChild
                                    >
                                        <a href={video.videoUrl} download onClick={(e) => e.stopPropagation()}>
                                            <Download className="h-4 w-4 opacity-40" /> Télécharger en HD
                                        </a>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="rounded-xl h-11 px-4 cursor-pointer font-bold text-xs gap-3">
                                    <Share2 className="h-4 w-4 opacity-40" /> Partager la vidéo
                                </DropdownMenuItem>
                                <DropdownMenuSeparator className="mx-2 my-1 opacity-50" />
                                <DropdownMenuItem className="rounded-xl h-11 px-4 cursor-pointer font-black text-xs gap-3 text-red-500 hover:text-red-600 hover:bg-red-50">
                                    <Trash2 className="h-4 w-4" /> Supprimer définitivement
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}
            </div>

            {/* Info Area - Clean Layout */}
            <div className="flex flex-col gap-2 px-1 pb-1">
                <h3 className="font-bold text-[16px] text-zinc-950 line-clamp-1 leading-snug group-hover:text-amber-500 transition-colors">
                    {video.title || video.topic || "Projet sans titre"}
                </h3>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className={cn("h-1.5 w-1.5 rounded-full ring-[3px] ring-zinc-50 shadow-[0_0_8px_rgba(0,0,0,0.1)]", config.dotColor)} />
                            <span className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.15em] whitespace-nowrap">
                                {config.label}
                            </span>
                        </div>
                        <div className="h-1 w-1 rounded-full bg-zinc-200" />
                        <span className="text-[11px] font-bold text-zinc-300">{date}</span>
                    </div>

                    {video.status === "completed" && (
                        <div className="text-[10px] font-black text-emerald-500/50 scale-90">4K / HDR</div>
                    )}
                </div>
            </div>
        </div>
    );
}
