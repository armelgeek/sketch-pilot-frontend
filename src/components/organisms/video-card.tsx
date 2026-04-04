"use client";

import { useRouter } from "next/navigation";
import {
    Play, Pencil, Download, Clock, Image as ImageIcon,
    Loader2, MoreVertical, Trash2, Share2, Eye
} from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";
import { Video } from "@/src/services/videos-service";

interface VideoCardProps {
    video: Video;
    showActions?: boolean;
}

const statusConfig: Record<string, { label: string; className: string }> = {
    completed: { label: "Terminé", className: "bg-emerald-50 text-emerald-600 border-emerald-100/50" },
    processing: { label: "En cours", className: "bg-amber-50 text-amber-600 border-amber-100/50" },
    failed: { label: "Échec", className: "bg-red-50 text-red-600 border-red-100/50" },
    queued: { label: "En attente", className: "bg-amber-50 text-amber-600 border-amber-100/50 opacity-70" },
    draft: { label: "Brouillon", className: "bg-zinc-50 text-zinc-500 border-zinc-100" },
    scenes_generated: { label: "Visuels prêts", className: "bg-amber-50 text-amber-600 border-amber-100/50" },
    narration_generated: { label: "Prêt pour audio", className: "bg-amber-50 text-amber-600 border-amber-100/50" },
    cancelled: { label: "Annulé", className: "bg-zinc-50 text-zinc-400 border-zinc-100" },
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
    const s = statusConfig[video.status] || statusConfig.draft;
    const step = EDIT_ROUTE[video.status];
    const editPath = step ? `/generate/${video.id}/${step}` : null;

    const dateStr = video.createdAt || video.created_at;
    const date = dateStr
        ? new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : "Récemment";

    const isProcessing = video.status === "processing" || video.status === "queued";

    const handleCardClick = () => {
        if (!showActions && editPath) {
            router.push(editPath);
        }
    };

    return (
        <Card
            className={cn(
                "group relative bg-white dark:bg-zinc-950 rounded-3xl overflow-hidden border border-zinc-100 dark:border-zinc-800 transition-all duration-300",
                !showActions ? "cursor-pointer hover:border-amber-200 hover:shadow-xl hover:shadow-amber-500/5" : ""
            )}
            onClick={handleCardClick}
        >
            <div className="aspect-video relative overflow-hidden bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-50 dark:border-zinc-800">
                {video.thumbnailUrl ? (
                    <img
                        src={video.thumbnailUrl}
                        alt={video.title || video.topic}
                        className="w-full h-full object-cover transform transition-transform duration-700 group-hover:scale-105"
                    />
                ) : isProcessing ? (
                    <div className="flex flex-col items-center gap-3 text-amber-500">
                        <div className="relative">
                            <Loader2 className="h-8 w-8 animate-spin" />
                            <div className="absolute inset-0 blur-lg bg-amber-500/20 animate-pulse" />
                        </div>
                        <span className="text-[9px] font-black uppercase tracking-[0.2em] text-amber-600/60">Traitement</span>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center w-full h-full bg-gradient-to-br from-zinc-50 to-zinc-100/50 dark:from-zinc-900 dark:to-zinc-800/50">
                        <div className="relative">
                            <ImageIcon className="h-12 w-12 text-zinc-200 dark:text-zinc-700" />
                            <div className="absolute inset-0 blur-2xl bg-zinc-400/10" />
                        </div>
                    </div>
                )}

                {/* Status Badge - Refined */}
                <div className="absolute top-3 left-3 z-20">
                    <span className={cn(
                        "text-[9px] font-black uppercase tracking-wider px-2.5 py-1 rounded-lg border backdrop-blur-sm shadow-sm transition-colors",
                        s.className
                    )}>
                        {s.label}
                    </span>
                </div>

                {/* Top Actions Overlay (More Menu) */}
                {showActions && (
                    <div className="absolute top-3 right-3 z-30">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-xl bg-white/80 backdrop-blur-md border border-white/20 shadow-sm hover:bg-white transition-all"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <MoreVertical className="h-4 w-4 text-zinc-600" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-2xl border-zinc-100 shadow-xl">
                                {editPath && (
                                    <DropdownMenuItem
                                        className="rounded-xl h-9 px-3 cursor-pointer font-semibold text-sm gap-2"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            router.push(editPath);
                                        }}
                                    >
                                        <Pencil className="h-4 w-4 opacity-50" /> Éditer
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className="rounded-xl h-9 px-3 cursor-pointer font-semibold text-sm gap-2">
                                    <Share2 className="h-4 w-4 opacity-50" /> Partager
                                </DropdownMenuItem>
                                {video.status === "completed" && video.videoUrl && (
                                    <DropdownMenuItem
                                        className="rounded-xl h-9 px-3 cursor-pointer font-semibold text-sm gap-2"
                                        asChild
                                    >
                                        <a href={video.videoUrl} download onClick={(e) => e.stopPropagation()}>
                                            <Download className="h-4 w-4 opacity-50" /> Télécharger (HD)
                                        </a>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator className="opacity-50" />
                                <DropdownMenuItem className="rounded-xl h-9 px-3 cursor-pointer font-black text-sm gap-2 text-red-600">
                                    <Trash2 className="h-4 w-4" /> Supprimer
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                )}

                {/* Primary Interaction Overlay */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 bg-black/5 z-10">
                    {video.status === "completed" && video.videoUrl ? (
                        <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-14 w-14 rounded-full bg-white flex items-center justify-center text-zinc-900 shadow-2xl scale-90 group-hover:scale-100 transition-all duration-500 hover:bg-amber-400 hover:text-white"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Play className="h-6 w-6 fill-current ml-1" />
                        </a>
                    ) : editPath ? (
                        <div className="h-12 w-12 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-zinc-900 shadow-xl scale-90 group-hover:scale-100 transition-all duration-500">
                            <Eye className="h-5 w-5" />
                        </div>
                    ) : null}
                </div>
            </div>

            <CardContent className="p-5 bg-white dark:bg-zinc-950">
                <div className="flex flex-col gap-1.5">
                    <h3 className="font-black text-base lg:text-lg tracking-tight text-zinc-900 dark:text-zinc-100 line-clamp-1 group-hover:text-amber-600 transition-all duration-300 group-hover:translate-x-0.5">
                        {video.title || video.topic || "Projet sans titre"}
                    </h3>
                    <div className="flex items-center justify-between mt-2">
                        <div className="flex items-center gap-2 text-[12px] text-zinc-400 font-bold">
                            <Clock className="h-3.5 w-3.5 opacity-60" />
                            {date}
                        </div>
                        {video.status === "completed" && (
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100/50 shadow-sm">
                                <div className="h-1 w-1 rounded-full bg-emerald-500 animate-pulse" />
                                HD READY
                            </div>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
