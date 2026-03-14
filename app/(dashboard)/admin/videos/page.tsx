"use client";

import { useState } from "react";
import { useAdminVideos, useAdminActions, AdminVideo } from "@/src/app/admin";
import {
    Search,
    Trash2,
    ExternalLink,
    Clock,
    CheckCircle2,
    AlertCircle,
    PlayCircle,
    ArrowRight,
    ChevronLeft,
    ChevronRight,
    Filter,
    Monitor,
    Eye,
    User
} from "lucide-react";
import {
    Card,
    CardContent,
} from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu";
import { Progress } from "@/src/components/ui/progress";
import { ConfirmDialog } from "@/src/components/organisms/confirm-dialog";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";

export default function AdminVideosPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("");
    const { data: videosRes, isLoading } = useAdminVideos({ page, limit: 12, search, status: statusFilter });
    const { deleteVideo, isPending } = useAdminActions();

    const [videoToDelete, setVideoToDelete] = useState<any>(null);

    const videos = videosRes?.data || [];
    const total = videosRes?.total || 0;

    const getStatusConfig = (status: string) => {
        switch (status) {
            case "completed": return { color: "bg-emerald-50 text-emerald-500", icon: <CheckCircle2 className="h-4 w-4" />, label: "Terminé" };
            case "failed": return { color: "bg-red-50 text-red-500", icon: <AlertCircle className="h-4 w-4" />, label: "Échec" };
            case "generating":
            case "processing": return { color: "bg-blue-50 text-blue-500", icon: <PlayCircle className="h-4 w-4 animate-pulse" />, label: "Génération" };
            case "queued": return { color: "bg-amber-50 text-amber-500", icon: <Clock className="h-4 w-4" />, label: "En file" };
            default: return { color: "bg-zinc-50 text-zinc-500", icon: <Monitor className="h-4 w-4" />, label: status };
        }
    };

    const handleDelete = async () => {
        if (!videoToDelete) return;
        try {
            await deleteVideo(videoToDelete.id);
            setVideoToDelete(null);
        } catch (error) {
            console.error("Failed to delete video:", error);
        }
    };

    const statusOptions = ["queued", "generating", "completed", "failed"];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">Monitoring Vidéos</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Surveillez et gérez tous les jobs de génération de la plateforme.</p>
                </div>

                <div className="flex items-center gap-3">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline" className="h-12 rounded-[20px] border-zinc-200 dark:border-zinc-800 font-bold gap-2 px-6">
                                <Filter className="h-4 w-4" />
                                {statusFilter ? statusFilter.charAt(0).toUpperCase() + statusFilter.slice(1) : "Tous les statuts"}
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="rounded-2xl p-1.5 border-zinc-200 dark:border-zinc-800">
                            <DropdownMenuItem onClick={() => setStatusFilter("")} className="rounded-xl font-bold">Tous les statuts</DropdownMenuItem>
                            {statusOptions.map(opt => (
                                <DropdownMenuItem key={opt} onClick={() => setStatusFilter(opt)} className="rounded-xl font-bold uppercase text-[10px] tracking-widest">
                                    {opt}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 group-focus-within:text-emerald-500 transition-colors" />
                        <Input
                            placeholder="Rechercher par sujet..."
                            className="pl-11 h-12 w-full md:w-[280px] rounded-[20px] bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 shadow-sm focus:ring-emerald-500/20 font-bold transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Video List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-[32px]" />)
                ) : (
                    videos.map((video: AdminVideo) => {
                        const status = getStatusConfig(video.status);
                        return (
                            <Card
                                key={video.id}
                                className="group border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden transition-all duration-300 hover:ring-2 ring-emerald-500 cursor-pointer"
                                onClick={() => router.push(`/admin/videos/${video.id}`)}
                            >
                                <CardContent className="p-0">
                                    <div className="aspect-video relative bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                                        {video.thumbnailUrl ? (
                                            <img src={video.thumbnailUrl} alt={video.topic} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                                <PlayCircle className="h-12 w-12" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                        <div className="absolute top-4 left-4">
                                            <Badge className={cn("rounded-lg font-black text-[9px] uppercase px-2 py-0 border-none", status.color)}>
                                                {status.label}
                                            </Badge>
                                        </div>
                                        <div className="absolute bottom-4 left-4 right-4">
                                            <h3 className="text-white font-black text-lg tracking-tight line-clamp-1">{video.topic}</h3>
                                        </div>
                                    </div>

                                    <div className="p-6">
                                        <div className="flex items-center justify-between mb-4">
                                            <div className="flex items-center gap-2">
                                                <div className="h-8 w-8 rounded-full bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                                                    <User className="h-4 w-4" />
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">{video.userName || "Utilisateur"}</p>
                                                    <p className="text-xs font-bold text-zinc-600 dark:text-zinc-300 truncate">{video.userEmail}</p>
                                                </div>
                                            </div>
                                            <div className="h-10 w-10 bg-zinc-50 dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-300 group-hover:text-emerald-500 transition-colors">
                                                <ArrowRight className="h-5 w-5" />
                                            </div>
                                        </div>

                                        {(video.status === "generating" || video.status === "processing") && (
                                            <div className="space-y-2 mb-4">
                                                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                    <span>Progression</span>
                                                    <span>{video.progress}%</span>
                                                </div>
                                                <Progress value={video.progress} className="h-1.5" />
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                            <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-bold uppercase tracking-widest">
                                                <Clock className="h-3 w-3" />
                                                {new Date(video.createdAt).toLocaleDateString()}
                                            </div>
                                            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setVideoToDelete(video);
                                                    }}
                                                >
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-lg text-zinc-400 hover:text-emerald-500 hover:bg-emerald-50"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        window.open(`/projects/${video.id}`, '_blank');
                                                    }}
                                                >
                                                    <ExternalLink className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                )}
            </div>

            {/* Pagination */}
            {total > 12 && (
                <div className="flex items-center justify-between pt-8">
                    <p className="text-sm font-bold text-zinc-400">
                        Affichage de <span className="text-zinc-900 dark:text-white">{Math.min(videos.length, 1) + (page - 1) * 12}</span> à <span className="text-zinc-900 dark:text-white">{Math.min(page * 12, total)}</span> sur <span className="text-zinc-900 dark:text-white">{total}</span>
                    </p>
                    <div className="flex items-center gap-2">
                        <Button
                            variant="ghost"
                            className="rounded-xl font-bold gap-2"
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                        >
                            <ChevronLeft className="h-4 w-4" /> Précédent
                        </Button>
                        <div className="h-10 w-10 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-black">
                            {page}
                        </div>
                        <Button
                            variant="ghost"
                            className="rounded-xl font-bold gap-2"
                            disabled={page * 12 >= total}
                            onClick={() => setPage(p => p + 1)}
                        >
                            Suivant <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={!!videoToDelete}
                onOpenChange={(open) => !open && setVideoToDelete(null)}
                onConfirm={handleDelete}
                isLoading={isPending}
                title="Supprimer la Vidéo"
                description={`Êtes-vous sûr de vouloir supprimer la vidéo "${videoToDelete?.topic}" ? Cette action est irréversible.`}
                confirmText="Supprimer la vidéo"
                variant="destructive"
            />
        </div>
    );
}
