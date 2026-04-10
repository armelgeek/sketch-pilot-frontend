"use client";

import { useRouter } from "next/navigation";
import {
    Play, Pencil, Download, Image as ImageIcon,
    Loader2, MoreVertical, Trash2, Share2, Eye, Sparkles
} from "lucide-react";
import { useState } from "react";
import { ThumbnailStudio } from "@/src/components/videos/thumbnail-studio";
import { Button } from "@/src/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";
import { Video, videosService } from "@/src/services/videos-service";
import { useVideoProgress } from "@/src/hooks/use-video-progress";

interface VideoCardProps {
    video: Video;
    showActions?: boolean;
    onDelete?: () => void;
}

const STATUS: Record<string, { label: string; color: string }> = {
    completed: { label: "Terminé", color: "bg-emerald-500" },
    processing: { label: "En cours", color: "bg-amber-400" },
    failed: { label: "Échec", color: "bg-red-500" },
    queued: { label: "En attente", color: "bg-zinc-400" },
    draft: { label: "Brouillon", color: "bg-zinc-300" },
    scenes_generated: { label: "Visuels prêts", color: "bg-amber-400" },
    narration_generated: { label: "Narration OK", color: "bg-amber-400" },
    cancelled: { label: "Annulé", color: "bg-zinc-300" },
};

const EDIT_STEP: Record<string, string> = {
    narration_generated: "audio",
};

function getEditPath(video: Video): string | null {
    const step = EDIT_STEP[video.status] ?? "storyboard";
    return `/generate/${video.id}/${step}`;
}

export function VideoCard({ video, showActions = false, onDelete }: VideoCardProps) {
    const router = useRouter();
    const [isStudioOpen, setIsStudioOpen] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    const [isResuming, setIsResuming] = useState(false);
    const [currentTitle, setCurrentTitle] = useState(video.title || video.topic || "Sans titre");
    const [tempTitle, setTempTitle] = useState(currentTitle);
    const { resumeVideo } = useVideoProgress();


    const handleRename = async () => {
        if (!tempTitle.trim() || tempTitle === currentTitle) {
            setIsEditing(false);
            return;
        }
        try {
            await videosService.update(video.id, { title: tempTitle });
            setCurrentTitle(tempTitle);
            setIsEditing(false);
        } catch {
            alert("Erreur lors du renommage.");
            setTempTitle(currentTitle);
            setIsEditing(false);
        }
    };

    const status = STATUS[video.status] ?? STATUS.draft;
    const editPath = getEditPath(video);
    const isProcessing = video.status === "processing" || video.status === "queued";

    const date = (() => {
        const raw = video.createdAt ?? video.created_at;
        return raw
            ? new Date(raw).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
            : "Récemment";
    })();

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Supprimer cette vidéo ? Cette action est irréversible.")) return;
        try {
            await videosService.deleteVideo(video.id);
            onDelete?.();
        } catch {
            alert("Erreur lors de la suppression.");
        }
    };

    const handleGenerateNextEpisode = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isGenerating) return;

        try {
            setIsGenerating(true);
            const options = {
                ...(video.options || {}),
                type: 'series',
                seriesId: video.seriesId,
                episodeNumber: (video.episodeNumber || 0) + 1,
                scriptOnly: true
            };

            const response = await videosService.generate(video.topic, options);
            if (response.videoId) {
                router.push(`/generate/${response.videoId}/script`);
            }
        } catch (err) {
            console.error("Failed to generate next episode:", err);
            alert("Erreur lors de la génération de la suite.");
        } finally {
            setIsGenerating(false);
        }
    };

    const handleResume = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (isResuming) return;
        try {
            setIsResuming(true);
            await resumeVideo(video.id);
            router.refresh();
        } catch (err) {
            console.error("Failed to resume video:", err);
            alert("Erreur lors de la reprise.");
        } finally {
            setIsResuming(false);
        }
    };

    return (

        <>
            <div
                className={cn(
                    "group relative flex flex-col gap-3 p-3 rounded-2xl bg-white",
                    "border border-zinc-100 shadow-sm",
                    "transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
                    !showActions && editPath && "cursor-pointer"
                )}
                onClick={() => !showActions && editPath && router.push(editPath)}
            >
                {/* Thumbnail */}
                <div className="aspect-video relative rounded-xl overflow-hidden bg-zinc-50">
                    {video.thumbnailUrl ? (
                        <img
                            src={video.thumbnailUrl}
                            alt={currentTitle}
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                    ) : isProcessing ? (
                        <div className="flex items-center justify-center h-full w-full bg-zinc-900 absolute inset-0 z-10 p-4">
                            <VideoProgressIndicator video={video} />
                        </div>
                    ) : (
                        <div className="flex items-center justify-center h-full">
                            <ImageIcon className="h-8 w-8 text-zinc-200" />
                        </div>
                    )}

                    {/* Play / View overlay */}
                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                        <div className="h-11 w-11 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-lg scale-90 group-hover:scale-100 transition-transform duration-300">
                            {video.status === "completed"
                                ? <Play className="h-4 w-4 fill-zinc-900 text-zinc-900 ml-0.5" />
                                : <Eye className="h-4 w-4 text-zinc-900" />
                            }
                        </div>
                    </div>

                    {/* Thumbnail badge */}
                    {video.seriesId ? (
                        <div className="absolute top-2 left-2 flex items-center gap-1.5 px-2.5 py-1 bg-blue-600/90 backdrop-blur-sm rounded-lg text-white shadow-lg border border-blue-400/30">
                            <Sparkles className="h-3 w-3 text-blue-200" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Épisode {video.episodeNumber || '?'}</span>
                        </div>
                    ) : video.options?.thumbnailVariations?.length > 0 ? (
                        <div className="absolute top-2 left-2 flex items-center gap-1 px-2 py-0.5 bg-black/60 backdrop-blur-sm rounded-md text-white">
                            <ImageIcon className="h-3 w-3 text-amber-400" />
                            <span className="text-[10px] font-semibold">Miniature</span>
                        </div>
                    ) : null}

                    {/* Actions dropdown */}
                    {showActions && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-xl bg-white/90 backdrop-blur-sm border border-white/50 shadow-md hover:bg-white"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <MoreVertical className="h-4 w-4 text-zinc-800" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-52 p-1.5 rounded-2xl shadow-xl border-zinc-100">
                                    <DropdownMenuItem
                                        className="rounded-xl h-10 px-3 text-xs font-semibold gap-2.5 cursor-pointer"
                                        onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                                    >
                                        <Pencil className="h-3.5 w-3.5 opacity-50" /> Renommer
                                    </DropdownMenuItem>
                                    {editPath && (
                                        <DropdownMenuItem
                                            className="rounded-xl h-10 px-3 text-xs font-semibold gap-2.5 cursor-pointer"
                                            onClick={(e) => { e.stopPropagation(); router.push(editPath!); }}
                                        >
                                            <Play className="h-3.5 w-3.5 opacity-50" /> Ouvrir
                                        </DropdownMenuItem>
                                    )}
                                    {video.seriesId && video.status === "completed" && (
                                        <DropdownMenuItem
                                            className="rounded-xl h-10 px-3 text-xs font-semibold gap-2.5 cursor-pointer text-blue-600 hover:bg-blue-50"
                                            disabled={isGenerating}
                                            onClick={handleGenerateNextEpisode}
                                        >
                                            {isGenerating ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Sparkles className="h-3.5 w-3.5" />
                                            )}
                                            {isGenerating ? "Génération..." : "Générer la suite"}
                                        </DropdownMenuItem>
                                    )}
                                    {video.status === "completed" && video.videoUrl && (
                                        <DropdownMenuItem className="rounded-xl h-10 px-3 text-xs font-semibold gap-2.5 cursor-pointer" asChild>
                                            <a href={video.videoUrl} download onClick={(e) => e.stopPropagation()}>
                                                <Download className="h-3.5 w-3.5 opacity-50" /> Télécharger
                                            </a>
                                        </DropdownMenuItem>
                                    )}
                                    {(video.status === "completed" || video.status === "processing") && (
                                        <DropdownMenuItem
                                            className="rounded-xl h-10 px-3 text-xs font-semibold gap-2.5 cursor-pointer text-amber-600 hover:bg-amber-50"
                                            onClick={(e) => { e.stopPropagation(); setIsStudioOpen(true); }}
                                        >
                                            <Sparkles className="h-3.5 w-3.5" /> Miniature
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuItem
                                        className="rounded-xl h-10 px-3 text-xs font-semibold gap-2.5 cursor-pointer"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            if (video.videoUrl) {
                                                navigator.clipboard.writeText(video.videoUrl);
                                                alert("Lien copié dans le presse-papier !");
                                            } else {
                                                alert("Vidéo non encore disponible pour le partage.");
                                            }
                                        }}
                                    >
                                        <Share2 className="h-3.5 w-3.5 opacity-50" /> Partager
                                    </DropdownMenuItem>
                                    {(video.status === "failed" || video.status === "cancelled") && (
                                        <DropdownMenuItem
                                            className="rounded-xl h-10 px-3 text-xs font-semibold gap-2.5 cursor-pointer text-violet-600 hover:bg-violet-50"
                                            disabled={isResuming}
                                            onClick={handleResume}
                                        >
                                            {isResuming ? (
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                            ) : (
                                                <Play className="h-3.5 w-3.5" />
                                            )}
                                            {isResuming ? "Reprise..." : "Reprendre la génération"}
                                        </DropdownMenuItem>
                                    )}
                                    <DropdownMenuSeparator className="mx-2 my-1" />

                                    <DropdownMenuItem
                                        className="rounded-xl h-10 px-3 text-xs font-semibold gap-2.5 cursor-pointer text-red-500 hover:bg-red-50"
                                        onClick={handleDelete}
                                    >
                                        <Trash2 className="h-3.5 w-3.5" /> Supprimer
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    )}
                </div>

                {/* Info */}
                <div className="flex flex-col gap-1.5 px-0.5 pb-0.5">
                    {isEditing ? (
                        <input
                            autoFocus
                            value={tempTitle}
                            onChange={(e) => setTempTitle(e.target.value)}
                            onBlur={handleRename}
                            onKeyDown={(e) => e.key === "Enter" && handleRename()}
                            className="h-6 w-full rounded-md border border-zinc-200 px-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
                            onClick={(e) => e.stopPropagation()}
                        />
                    ) : (
                        <h3 className="font-semibold text-sm text-zinc-900 line-clamp-1 group-hover:text-amber-500 transition-colors">
                            {currentTitle}
                        </h3>
                    )}
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className={cn("h-1.5 w-1.5 rounded-full", status.color)} />
                            <span className="text-[10px] font-semibold text-zinc-400 uppercase tracking-wider">
                                {status.label}
                            </span>
                            <span className="text-zinc-200">·</span>
                            <span className="text-[11px] text-zinc-300 font-medium">{date}</span>
                        </div>
                        {video.status === "completed" && (
                            <span className="text-[10px] font-semibold text-emerald-400/70">4K</span>
                        )}
                    </div>
                </div>
            </div>

            {isStudioOpen && (
                <ThumbnailStudio video={video} onClose={() => setIsStudioOpen(false)} />
            )}
        </>
    );
}

function VideoProgressIndicator({ video }: { video: Video }) {
    // Only connect SSE if processing.
    const { progress, message, rawProgress } = useVideoProgress(
        (video.status === "processing" || video.status === "queued") ? video.jobId : undefined
    );

    // Fallback to initial progress if SSE hasn't synced
    const activeProgress = rawProgress > 0 ? progress : (video.progress || 0);

    return (
        <div className="w-full flex flex-col items-center justify-center space-y-3">
            <div className="relative flex items-center justify-center">
                <svg width="48" height="48" className="rotate-[-90deg]">
                    <circle cx="24" cy="24" r="20" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="3" />
                    <circle
                        cx="24"
                        cy="24"
                        r="20"
                        fill="none"
                        stroke="#1D9E75"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeDasharray={2 * Math.PI * 20}
                        strokeDashoffset={(2 * Math.PI * 20) - ((activeProgress / 100) * (2 * Math.PI * 20))}
                        className="transition-all duration-300"
                    />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-[10px] font-bold text-white tabular-nums">
                        {activeProgress}%
                    </span>
                </div>
            </div>
            <span className="text-[10px] text-zinc-400 font-medium tracking-wide text-center uppercase truncate w-full px-2">
                {message || "Initiation..."}
            </span>
        </div>
    );
}