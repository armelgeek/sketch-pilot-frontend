"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight, AlertCircle, FileVideo } from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";
import { videosService, type Video } from "@/src/services/videos-service";
import { VideoCard } from "@/src/components/organisms/video-card";

const STATUS_OPTIONS = [
  { value: "all", label: "Tous" },
  { value: "completed", label: "Terminées" },
  { value: "processing", label: "En cours" },
  { value: "failed", label: "Échecs" },
];

const PER_PAGE = 12;

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

  const filtered = videos.filter(v => {
    const matchSearch = (v.title || v.topic || "").toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="space-y-12 pb-20 max-w-7xl mx-auto">
      {/* Simple Header */}
      <div className="flex items-center justify-between gap-6 pt-4">
        <div>
          <h1 className="text-4xl font-extrabold text-amber-500 tracking-tightest">Mes vidéos</h1>
          <p className="text-sm text-zinc-500 font-medium mt-1">
            {videos.length} projet{videos.length > 1 ? "s" : ""} généré{videos.length > 1 ? "s" : ""}
          </p>
        </div>

        <Link
          href="/generate"
          className="flex items-center gap-2 h-11 px-5 rounded-xl bg-zinc-950 text-white text-[13px] font-bold hover:bg-zinc-800 transition-all shadow-sm active:scale-95"
        >
          <Plus className="h-4 w-4" />
          <span>Nouvelle Vidéo</span>
        </Link>
      </div>

      {/* Extreme Minimalist Search & Filters */}
      <div className="flex flex-col md:flex-row items-center gap-8 border-b border-zinc-100 pb-2">
        <div className="relative flex-1 w-full group">
          <Search className="absolute left-0 top-1/2 mx-2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-zinc-950 transition-colors" />
          <Input
            placeholder="Search videos..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="pl-7 h-10 w-[400px] rounded-md border bg-transparent shadow-none text-sm placeholder:text-zinc-300 focus-visible:ring-0 transition-all font-medium"
          />
        </div>
        <div className="flex items-center gap-6">
          {STATUS_OPTIONS.map(o => (
            <button
              key={o.value}
              onClick={() => { setStatusFilter(o.value); setPage(1); }}
              className={cn(
                "relative h-8 text-[13px] font-bold transition-all whitespace-nowrap",
                statusFilter === o.value
                  ? "text-zinc-950"
                  : "text-zinc-400 hover:text-zinc-600"
              )}
            >
              {o.label}
              {statusFilter === o.value && (
                <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-zinc-950 rounded-full" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 bg-red-50 text-red-600 px-4 py-3 rounded-xl text-sm font-medium border border-red-100">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Loading Skeleton */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="space-y-4">
              <div className="aspect-video rounded-2xl bg-zinc-100 animate-pulse" />
              <div className="space-y-2">
                <div className="h-4 w-3/4 bg-zinc-100 rounded-lg animate-pulse" />
                <div className="h-3 w-1/4 bg-zinc-100 rounded-lg animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && paginated.length === 0 && (
        <div className="py-32 flex flex-col items-center gap-6 text-center">
          <div className="h-16 w-16 rounded-2xl bg-zinc-50 flex items-center justify-center border border-zinc-100">
            <FileVideo className="h-8 w-8 text-zinc-300" />
          </div>
          <div className="space-y-1">
            <h2 className="text-lg font-bold text-zinc-900">
              {search || statusFilter !== "all" ? "Aucun résultat" : "Aucune vidéo"}
            </h2>
            <p className="text-sm text-zinc-500 max-w-[280px]">
              {search || statusFilter !== "all"
                ? "Essayez de modifier vos critères de recherche."
                : "Commencez par créer votre première vidéo avec l'IA."}
            </p>
          </div>
          {!search && statusFilter === "all" && (
            <Link href="/generate" className="flex items-center gap-2 h-11 px-6 rounded-xl bg-zinc-950 text-white text-sm font-bold hover:bg-zinc-800 transition-all shadow-sm">
              <Plus className="h-4 w-4" /> Nouvelle Vidéo
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && paginated.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-8">
          {paginated.map(video => <VideoCard key={video.id} video={video} showActions />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-10">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-10 w-10 rounded-xl border border-zinc-100 flex items-center justify-center text-zinc-400 hover:border-zinc-300 disabled:opacity-30 transition-colors"
          ><ChevronLeft className="h-4 w-4" /></button>

          {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className={cn(
                "h-10 w-10 rounded-xl text-sm font-bold transition-all",
                p === page ? "bg-zinc-950 text-white" : "text-zinc-400 hover:text-zinc-800"
              )}
            >{p}</button>
          ))}

          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="h-10 w-10 rounded-xl border border-zinc-100 flex items-center justify-center text-zinc-400 hover:border-zinc-300 disabled:opacity-30 transition-colors"
          ><ChevronRight className="h-4 w-4" /></button>
        </div>
      )}
    </div>
  );
}