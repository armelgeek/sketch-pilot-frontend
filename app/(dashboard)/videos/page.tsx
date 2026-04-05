"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight, FileVideo, AlertCircle, X, Film, Clock, CheckCircle2, XCircle } from "lucide-react";
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
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    setError(null);
    videosService.getAll()
      .then(setVideos)
      .catch(() => setError("Impossible de charger vos vidéos."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = videos.filter((v) => {
    const title = (v.title || v.topic || "").toLowerCase();
    return title.includes(search.toLowerCase()) && (status === "all" || v.status === status);
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const counts = {
    completed: videos.filter((v) => v.status === "completed").length,
    processing: videos.filter((v) => v.status === "processing").length,
    failed: videos.filter((v) => v.status === "failed").length,
  };

  const goTo = (p: number) => { setPage(p); window.scrollTo({ top: 0, behavior: "smooth" }); };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20">

      {/* Error */}
      {error && (
        <div className="flex items-center gap-3 border border-red-200 bg-red-50 text-red-700 rounded-xl px-4 py-3 text-sm">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)}><X className="h-4 w-4 opacity-40 hover:opacity-100" /></button>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { icon: Film, label: "Total", value: videos.length, cls: "text-zinc-400" },
          { icon: CheckCircle2, label: "Terminées", value: counts.completed, cls: "text-emerald-500" },
          { icon: Clock, label: "En cours", value: counts.processing, cls: "text-amber-500" },
          { icon: XCircle, label: "Échecs", value: counts.failed, cls: "text-red-400" },
        ].map(({ icon: Icon, label, value, cls }) => (
          <div key={label} className="bg-white border border-zinc-100 rounded-xl p-4 flex items-center gap-3">
            <Icon className={cn("h-4 w-4 shrink-0", cls)} />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">{label}</p>
              <p className="text-lg font-bold text-zinc-900 leading-none mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-300" />
          <input
            placeholder="Rechercher…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-4 h-9 rounded-lg border border-zinc-200 text-sm placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 bg-white"
          />
        </div>
        <div className="flex items-center gap-1 bg-zinc-100 rounded-lg p-1">
          {STATUS_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => { setStatus(o.value); setPage(1); }}
              className={cn(
                "px-3 h-7 text-sm font-semibold rounded-md transition-all whitespace-nowrap",
                status === o.value ? "bg-white text-zinc-900 shadow-sm" : "text-zinc-400 hover:text-zinc-700"
              )}
            >
              {o.label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="space-y-3">
              <div className="aspect-video rounded-xl bg-zinc-100 animate-pulse" />
              <div className="h-3 w-2/3 bg-zinc-100 rounded animate-pulse" />
              <div className="h-3 w-1/3 bg-zinc-100 rounded animate-pulse" />
            </div>
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && paginated.length === 0 && (
        <div className="border border-zinc-100 rounded-2xl bg-white flex flex-col items-center py-24 text-center">
          <div className="h-12 w-12 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center mb-4">
            <FileVideo className="h-5 w-5 text-zinc-300" />
          </div>
          <p className="font-semibold text-zinc-800">
            {search || status !== "all" ? "Aucun résultat" : "Aucune vidéo"}
          </p>
          <p className="text-zinc-400 mt-1 mb-6">
            {search || status !== "all" ? "Essayez de modifier vos filtres." : "Créez votre première vidéo pour commencer."}
          </p>
          {!search && status === "all" && (
            <Link href="/dashboard">
              <button className="flex items-center gap-2 h-9 px-5 rounded-full bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors">
                <Plus className="h-3.5 w-3.5" /> Démarrer
              </button>
            </Link>
          )}
        </div>
      )}

      {/* Grid */}
      {!loading && paginated.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {paginated.map((v) => <VideoCard key={v.id} video={v} showActions />)}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-4 border-t border-zinc-100">
          <button onClick={() => goTo(page - 1)} disabled={page === 1} className="h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 disabled:opacity-30">
            <ChevronLeft className="h-4 w-4" />
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button key={p} onClick={() => goTo(p)} className={cn("h-8 w-8 rounded-lg text-xs font-semibold", p === page ? "bg-zinc-900 text-white" : "text-zinc-400 hover:text-zinc-900")}>
              {p}
            </button>
          ))}
          <button onClick={() => goTo(page + 1)} disabled={page === totalPages} className="h-8 w-8 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 disabled:opacity-30">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}