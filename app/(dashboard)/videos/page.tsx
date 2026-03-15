"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Search, ChevronLeft, ChevronRight,
  Play, CheckCircle2, Loader2, AlertCircle, Video as VideoIcon
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Card, CardContent } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";
import { videosService, type Video } from "@/src/services/videos-service";
import { VideoCard } from "@/src/components/organisms/video-card";

export default function VideosPage() {
  const router = useRouter();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    videosService.getAll()
      .then(setVideos)
      .catch(() => setError("Impossible de charger vos vidéos."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = videos.filter((v) => {
    const topic = (v.topic || "").toLowerCase();
    const matchSearch = topic.includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const perPage = 9;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  // Stats for the library
  const stats = {
    total: videos.length,
    completed: videos.filter(v => v.status === 'completed').length,
    processing: videos.filter(v => v.status === 'processing' || v.status === 'queued').length
  };

  return (
    <div className="relative min-h-screen">
      <div className="mesh-gradient opacity-30 dark:opacity-20" />

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-12 relative z-10">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-500 dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent">
              Mes Vidéos
            </h1>
            <p className="text-zinc-500 font-medium">
              Gérez et téléchargez vos créations visuelles.
            </p>
          </div>

          <Button asChild className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl h-12 px-8 font-bold shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
            <Link href="/generate">
              <Plus className="h-5 w-5 mr-2" /> Créer une vidéo
            </Link>
          </Button>
        </div>

        {/* Quick Stats Row */}
        {!loading && videos.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <SmallStatCard
              label="Total Vidéos"
              value={stats.total}
              icon={<VideoIcon className="h-4 w-4 text-zinc-400" />}
            />
            <SmallStatCard
              label="Terminées"
              value={stats.completed}
              icon={<CheckCircle2 className="h-4 w-4 text-emerald-500" />}
            />
            <SmallStatCard
              label="En cours"
              value={stats.processing}
              icon={<Loader2 className="h-4 w-4 text-blue-500 animate-spin" />}
            />
          </div>
        )}

        {/* Filters & Search Toolbar */}
        <Card className="bg-white/80 dark:bg-zinc-950/40 border-none shadow-sm backdrop-blur-md rounded-[2rem] p-2 ring-1 ring-zinc-200 dark:ring-zinc-800">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
              <Input
                placeholder="Rechercher par titre..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                className="pl-11 h-12 bg-transparent border-none focus-visible:ring-0 text-sm font-medium"
              />
            </div>
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-800 self-center hidden sm:block" />
            <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-56 h-12 bg-transparent border-none focus:ring-0 font-bold text-xs uppercase tracking-widest text-zinc-500">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className="rounded-2xl border-zinc-200 dark:border-zinc-800">
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="draft">Brouillon</SelectItem>
                <SelectItem value="completed">Terminées</SelectItem>
                <SelectItem value="processing">En cours</SelectItem>
                <SelectItem value="failed">Échecs</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Card>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-4 bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/30 text-red-600 dark:text-red-400 p-6 rounded-3xl animate-in zoom-in duration-300">
            <div className="bg-red-500 text-white p-2 rounded-xl">
              <AlertCircle className="h-6 w-6" />
            </div>
            <div>
              <p className="font-bold">Une erreur est survenue</p>
              <p className="text-sm opacity-80">{error}</p>
            </div>
          </div>
        )}

        {/* Loading Skeletons */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-video rounded-[2rem] bg-zinc-100 dark:bg-zinc-900 animate-pulse border border-zinc-200 dark:border-zinc-800" />
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && paginated.length === 0 && (
          <div className="text-center py-32 flex flex-col items-center gap-6 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="h-24 w-24 rounded-full bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center border-2 border-dashed border-zinc-300 dark:border-zinc-800">
              <Play className="h-10 w-10 text-zinc-300" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black tracking-tight">Aucune vidéo trouvée</h2>
              <p className="text-zinc-500 max-w-sm mx-auto font-medium">
                {search || statusFilter !== "all"
                  ? "Essayez d'ajuster vos filtres de recherche pour trouver ce que vous cherchez."
                  : "Vous n'avez pas encore créé de vidéo. Commencez l'aventure dès maintenant !"}
              </p>
            </div>
            {!search && statusFilter === "all" && (
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl h-14 px-10 font-black shadow-xl shadow-emerald-500/20">
                <Link href="/generate">Créer ma première vidéo</Link>
              </Button>
            )}
          </div>
        )}

        {/* Video Grid */}
        {!loading && paginated.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginated.map((video) => (
              <VideoCard key={video.id} video={video} showActions={true} />
            ))}
          </div>
        )}

        {/* Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-3 pt-8">
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-2xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <Button
                  key={p}
                  variant={p === page ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setPage(p)}
                  className={cn(
                    "h-9 min-w-[36px] font-black text-xs rounded-xl transition-all",
                    p === page
                      ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-black shadow-md"
                      : "text-zinc-500"
                  )}
                >
                  {p}
                </Button>
              ))}
            </div>
            <Button
              variant="outline"
              size="icon"
              className="h-12 w-12 rounded-2xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900"
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}

function SmallStatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <Card className="bg-white/40 dark:bg-zinc-950/20 border-none shadow-sm backdrop-blur-sm rounded-2xl p-4 ring-1 ring-zinc-200/50 dark:ring-zinc-800/50">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">{label}</p>
          <p className="text-xl font-black tracking-tight">{value}</p>
        </div>
        <div className="h-8 w-8 rounded-xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center border border-zinc-100 dark:border-zinc-800">
          {icon}
        </div>
      </div>
    </Card>
  );
}
