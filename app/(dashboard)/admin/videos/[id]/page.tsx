"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { useAdminVideo } from "@/src/app/admin/hooks/use-admin-data";
import { useAdminActions } from "@/src/app/admin/hooks/use-admin-actions";
import {
    Clock,
    CheckCircle2,
    AlertCircle,
    PlayCircle,
    User,
    Mail,
    Calendar,
    ChevronLeft,
    ExternalLink,
    Trash2,
    Monitor,
    Zap,
    Download,
    Eye
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Skeleton } from "@/src/components/ui/skeleton";
import { cn } from "@/src/lib/utils";

interface VideoDetailPageProps {
    params: Promise<{ id: string }>;
}

export default function VideoDetailPage({ params }: VideoDetailPageProps) {
    const { id } = use(params);
    const router = useRouter();
    // I need to add useAdminVideo hook
    const { data: video, isLoading } = useAdminVideo(id);
    const { deleteVideo } = useAdminActions();

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
                <Skeleton className="h-[60px] w-3/4 rounded-2xl" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <Skeleton className="md:col-span-2 h-[500px] rounded-[32px]" />
                    <Skeleton className="h-[500px] rounded-[32px]" />
                </div>
            </div>
        );
    }

    if (!video) {
        return (
            <div className="max-w-5xl mx-auto py-20 px-6 text-center">
                <h1 className="text-2xl font-black tracking-tighter">Vidéo non trouvée</h1>
                <p className="text-zinc-500 mt-2 font-medium">La vidéo que vous recherchez n'existe pas ou a été supprimée.</p>
                <Button variant="ghost" className="mt-6 font-black" onClick={() => router.push("/admin/videos")}>
                    Retour à la liste
                </Button>
            </div>
        );
    }

    const statusConfig = {
        draft: { color: "bg-zinc-100 text-zinc-500", icon: <Monitor className="h-4 w-4" />, label: "Brouillon" },
        queued: { color: "bg-blue-50 text-blue-500", icon: <Clock className="h-4 w-4" />, label: "En file" },
        generating: { color: "bg-amber-50 text-amber-500", icon: <PlayCircle className="h-4 w-4 animate-pulse" />, label: "Génération" },
        completed: { color: "bg-amber-50 text-amber-500", icon: <CheckCircle2 className="h-4 w-4" />, label: "Terminé" },
        failed: { color: "bg-red-50 text-red-500", icon: <AlertCircle className="h-4 w-4" />, label: "Échec" },
    }[video.status] || { color: "bg-zinc-100 text-zinc-500", icon: <Monitor className="h-4 w-4" />, label: video.status };

    return (
        <div className="max-w-6xl mx-auto py-10 px-6 pb-32 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full" onClick={() => router.push("/admin/videos")}>
                        <ChevronLeft className="h-6 w-6" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-3">
                            <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white line-clamp-1">{video.topic}</h1>
                            <Badge className={cn("rounded-lg font-black text-[10px] uppercase px-2 py-0.5 border-none", statusConfig.color)}>
                                {statusConfig.label}
                            </Badge>
                        </div>
                        <p className="text-xs font-medium text-zinc-400 mt-1 flex items-center gap-2">
                            ID: <span className="font-mono">{video.id}</span>
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="ghost"
                        className="rounded-2xl font-bold h-11 px-6 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20"
                        onClick={async () => {
                            if (confirm("Supprimer cette vidéo ?")) {
                                await deleteVideo(video.id);
                                router.push("/admin/videos");
                            }
                        }}
                    >
                        <Trash2 className="mr-2 h-4 w-4" /> Supprimer
                    </Button>
                    <Button
                        className="bg-black hover:bg-zinc-800 text-white rounded-2xl font-black h-11 px-8 shadow-xl"
                        onClick={() => window.open(`/projects/${video.id}`, '_blank')}
                    >
                        <ExternalLink className="mr-2 h-4 w-4" /> Ouvrir dans l'éditeur
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    {/* Video Player / Preview */}
                    <Card className="rounded-[40px] border-none shadow-2xl bg-zinc-900 overflow-hidden aspect-video relative group">
                        {video.videoUrl ? (
                            <video
                                src={video.videoUrl}
                                controls
                                className="w-full h-full object-contain"
                            />
                        ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-zinc-500 gap-4">
                                <div className="h-20 w-20 bg-zinc-800 rounded-full flex items-center justify-center">
                                    {statusConfig.icon}
                                </div>
                                <p className="font-black text-xl uppercase tracking-tighter">{statusConfig.label}</p>
                                {video.status === "generating" && (
                                    <div className="w-64 h-2 bg-zinc-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-amber-500 transition-all duration-500"
                                            style={{ width: `${video.progress}%` }}
                                        />
                                    </div>
                                )}
                            </div>
                        )}

                        {video.videoUrl && (
                            <div className="absolute top-6 right-6 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Button className="bg-white/10 backdrop-blur-md hover:bg-white/20 text-white border-none rounded-2xl font-bold gap-2">
                                    <Download className="h-4 w-4" /> Télécharger MP4
                                </Button>
                            </div>
                        )}
                    </Card>

                    {/* Details Card */}
                    <Card className="rounded-[32px] border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="font-black tracking-tight text-xl">Détails du Projet</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Durée</span>
                                    <p className="text-xl font-black text-zinc-900 dark:text-white">{video.duration}s</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Scenes</span>
                                    <p className="text-xl font-black text-zinc-900 dark:text-white">-</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Progress</span>
                                    <p className="text-xl font-black text-amber-500">{video.progress}%</p>
                                </div>
                                <div className="space-y-1">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Coût</span>
                                    <p className="text-xl font-black text-amber-500 flex items-center gap-1">
                                        <Zap className="h-4 w-4 fill-current" /> -
                                    </p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800 space-y-4">
                                <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block">Description / Prompt Initial</span>
                                <div className="p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800 italic text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                                    {video.description || "Aucune description fournie."}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* User Card */}
                    <Card className="rounded-[32px] border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="font-black tracking-tight text-xl">Propriétaire</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="flex items-center gap-4 p-4 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                <div className="h-12 w-12 bg-white dark:bg-zinc-900 rounded-2xl flex items-center justify-center text-zinc-400 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                                    <User className="h-6 w-6" />
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-black text-zinc-900 dark:text-white truncate">{video.userName}</h4>
                                    <p className="text-xs text-zinc-500 font-medium truncate">{video.userEmail}</p>
                                </div>
                            </div>

                            <Button
                                variant="outline"
                                className="w-full rounded-2xl font-black h-12 gap-2 border-zinc-200 dark:border-zinc-800"
                                onClick={() => router.push(`/admin/users/${video.userId}`)}
                            >
                                <Eye className="h-4 w-4" /> Voir l'utilisateur
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Timeline Card */}
                    <Card className="rounded-[32px] border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="font-black tracking-tight text-xl">Chronologie</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="relative pl-6 space-y-8 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-100 dark:before:bg-zinc-800">
                                <div className="relative">
                                    <div className="absolute -left-[29px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-amber-500 ring-4 ring-amber-50 dark:ring-amber-950/20" />
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Création</p>
                                        <p className="text-sm font-black text-zinc-900 dark:text-white">{new Date(video.createdAt).toLocaleString()}</p>
                                    </div>
                                </div>
                                <div className="relative">
                                    <div className="absolute -left-[29px] top-1/2 -translate-y-1/2 h-3 w-3 rounded-full bg-zinc-200 dark:bg-zinc-700" />
                                    <div>
                                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Dernière modification</p>
                                        <p className="text-sm font-bold text-zinc-500">-</p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
