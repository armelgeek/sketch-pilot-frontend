"use client";

import { useRouter } from "next/navigation";
import { Play, Pencil, Download, Clock, Image as ImageIcon, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { Video } from "@/src/services/videos-service";

interface VideoCardProps {
    video: Video;
    showActions?: boolean;
}

const statusConfig: Record<string, { label: string; className: string }> = {
    completed: { label: "Terminé", className: "bg-green-500/10 text-green-500 border-green-500/20" },
    processing: { label: "En cours", className: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    failed: { label: "Échec", className: "bg-red-500/10 text-red-500 border-red-500/20" },
    queued: { label: "En attente", className: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" },
    draft: { label: "Brouillon", className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" },
    scenes_generated: { label: "Visuels prêts", className: "bg-cyan-500/10 text-cyan-500 border-cyan-500/20" },
    narration_generated: { label: "Prêt pour audio", className: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
    cancelled: { label: "Annulé", className: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" },
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

    const dateStr = (video as any).createdAt || (video as any).created_at;
    const date = dateStr
        ? new Date(dateStr).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : "Récemment";

    const isProcessing = video.status === "processing" || video.status === "queued";

    return (
        <Card
            className={cn(
                "group relative bg-white dark:bg-zinc-900 rounded-[2rem] overflow-hidden border-none shadow-lg shadow-zinc-200/50 dark:shadow-none transition-all cursor-pointer hover:ring-2 ring-emerald-500/50",
                !showActions && "hover:scale-[1.02]"
            )}
            onClick={() => !showActions && editPath && router.push(editPath)}
        >
            <div className="aspect-video relative overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                {video.thumbnailUrl ? (
                    <img
                        src={video.thumbnailUrl}
                        alt={video.title || video.topic}
                        className="w-full h-full object-cover transform transition-transform duration-500 group-hover:scale-105"
                    />
                ) : isProcessing ? (
                    <div className="flex flex-col items-center gap-2 text-emerald-500">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Génération...</span>
                    </div>
                ) : (
                    <ImageIcon className="h-10 w-10 text-zinc-300 dark:text-zinc-700 opacity-50" />
                )}

                {/* Status Badge */}
                <div className="absolute top-4 left-4">
                    <span className={cn(
                        "text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full border backdrop-blur-md shadow-sm",
                        s.className
                    )}>
                        {s.label}
                    </span>
                </div>

                {/* Play Overlay for Completed */}
                {video.status === "completed" && video.videoUrl && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20 backdrop-blur-[2px] z-10">
                        <a
                            href={video.videoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="h-14 w-14 rounded-full bg-white dark:bg-zinc-800 flex items-center justify-center text-zinc-900 dark:text-white shadow-2xl scale-75 group-hover:scale-100 transition-transform duration-300"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <Play className="h-6 w-6 fill-current ml-1" />
                        </a>
                    </div>
                )}

                {/* Hover Action (Drafts/Processing) */}
                {!showActions && editPath && video.status !== "completed" && (
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/10 z-10">
                        <div className="h-12 w-12 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-xl scale-75 group-hover:scale-100 transition-transform">
                            <Pencil className="h-5 w-5" />
                        </div>
                    </div>
                )}
            </div>

            <CardContent className="p-6">
                <div className="flex flex-col gap-1 mb-4">
                    <h3 className="font-semibold text-lg line-clamp-2 transition-colors duration-200 group-hover:text-primary leading-tight text-zinc-900 dark:text-zinc-100">
                        {video.title || video.topic}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-zinc-400 font-medium">
                        <Clock className="h-3 w-3" />
                        {date}
                    </div>
                </div>

                {showActions && (
                    <div className="flex gap-2 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                        {editPath && (
                            <Button
                                size="sm"
                                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl h-9"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    router.push(editPath);
                                }}
                            >
                                <Pencil className="h-3.5 w-3.5 mr-2" />
                                Éditer
                            </Button>
                        )}
                        {video.status === "completed" && video.videoUrl && (
                            <Button
                                size="sm"
                                variant="outline"
                                className="flex-1 rounded-xl border-zinc-200 dark:border-zinc-800 font-bold h-9"
                                asChild
                                onClick={(e) => e.stopPropagation()}
                            >
                                <a href={video.videoUrl} download>
                                    <Download className="h-3.5 w-3.5 mr-2" />
                                    HD
                                </a>
                            </Button>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
