"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight, Play, CheckCircle2, Loader2, AlertCircle, Video as VideoIcon } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Card, CardContent } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";
import { videosService, type Video } from "@/src/services/videos-service";
import { VideoCard } from "@/src/components/organisms/video-card";

export default function VideosPage() {
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
    const matchSearch = (v.title || v.topic || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const perPage = 9;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">Mes Vidéos</h1>
          <p className="text-sm text-zinc-500 mt-0.5">
            {videos.length > 0 ? `${videos.length} vidéo${videos.length > 1 ? "s" : ""}` : "Gérez vos créations"}
          </p>
        </div>
        <Button asChild className="bg-zinc-900 hover:bg-zinc-700 text-white rounded-xl h-10 px-5 font-bold text-sm">
          <Link href="/generate"><Plus className="h-4 w-4 mr-2" /> Créer</Link>
        </Button>
      </div>

      {!loading && videos.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-zinc-100 rounded-xl p-3 flex items-center gap-3">
            <VideoIcon className="h-4 w-4 text-zinc-400" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total</p>
              <p className="text-lg font-black text-zinc-900">{videos.length}</p>
            </div>
          </div>
          <div className="bg-white border border-zinc-100 rounded-xl p-3 flex items-center gap-3">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Terminées</p>
              <p className="text-lg font-black text-zinc-900">{videos.filter(v => v.status === "completed").length}</p>
            </div>
          </div>
          <div className="bg-white border border-zinc-100 rounded-xl p-3 flex items-center gap-3">
            <Loader2 className="h-4 w-4 text-blue-500" />
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">En cours</p>
              <p className="text-lg font-black text-zinc-900">{videos.filter(v => v.status === "processing" || v.status === "queued").length}</p>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="pl-9 h-10 rounded-xl border-zinc-200 bg-white text-sm"
          />
        </div>
        <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44 h-10 rounded-xl border-zinc-200 bg-white text-sm font-semibold">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="draft">Brouillons</SelectItem>
            <SelectItem value="completed">Terminées</SelectItem>
            <SelectItem value="processing">En cours</SelectItem>
            <SelectItem value="failed">Échecs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {error && (
        <div className="flex items-center gap-3 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />{error}
        </div>
      )}

      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-video rounded-2xl bg-zinc-100 animate-pulse" />
          ))}
        </div>
      )}

      {!loading && !error && paginated.length === 0 && (
        <div className="py-20 flex flex-col items-center gap-4 text-center">
          <div className="h-16 w-16 rounded-2xl bg-zinc-100 flex items-center justify-center">
            <Play className="h-7 w-7 text-zinc-300" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900">Aucune vidéo trouvée</h2>
            <p className="text-sm text-zinc-500 mt-1 max-w-xs">
              {search || statusFilter !== "all" ? "Essayez d&apos;ajuster vos filtres." : "Vous n&apos;avez pas encore créé de vidéo."}
            </p>
          </div>
          {!search && statusFilter === "all" && (
            <Button asChild className="bg-zinc-900 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm h-10 px-5">
              <Link href="/generate">Créer ma première vidéo</Link>
            </Button>
          )}
        </div>
      )}

      {!loading && paginated.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginated.map((video) => <VideoCard key={video.id} video={video} showActions={true} />)}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-zinc-200" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button key={p} variant={p === page ? "default" : "ghost"} size="sm" onClick={() => setPage(p)}
              className={cn("h-9 min-w-[36px] font-bold text-xs rounded-xl", p === page ? "bg-zinc-900 text-white hover:bg-zinc-700" : "text-zinc-500 hover:text-zinc-900")}>
              {p}
            </Button>
          ))}
          <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-zinc-200" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
