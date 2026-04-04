"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, ChevronLeft, ChevronRight, AlertCircle, FileVideo, Sparkles } from "lucide-react";
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
    <div className="relative min-h-[calc(100vh-80px)] -mx-6 -my-8 px-8 py-10 overflow-hidden mesh-gradient-premium grain-overlay">
      {/* Background Decor */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] -z-10 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.08),transparent_70%)] blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] -z-10 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.05),transparent_70%)] blur-[120px] pointer-events-none animate-pulse delay-1000" />

      <div className="relative z-10 space-y-12 pb-20 max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-1 w-8 bg-amber-400 rounded-full" />
              <span className="text-[10px] font-black uppercase tracking-[0.3em] text-amber-600">Galerie de Créations</span>
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-zinc-950 tracking-tightest leading-none">
              Mes vidéos
            </h1>
            <p className="text-[15px] text-zinc-500 font-medium max-w-lg leading-relaxed mt-4">
              {videos.length > 0
                ? `Vous avez généré ${videos.length} projet${videos.length > 1 ? "s" : ""} unique${videos.length > 1 ? "s" : ""} avec l'intelligence artificielle de Sketch Pilot.`
                : "Transformez vos idées en vidéos virales. Commencez votre premier projet dès maintenant."}
            </p>
          </div>

          <Link
            href="/generate"
            className="group relative flex items-center gap-3 h-14 px-8 rounded-2xl bg-zinc-950 text-white text-[13px] font-black tracking-widest uppercase hover:bg-amber-500 transition-all shadow-[0_20px_40px_-12px_rgba(0,0,0,0.25)] hover:shadow-amber-500/20 hover:-translate-y-1 active:scale-95 w-fit overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-amber-400/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
            <Sparkles className="h-4 w-4 text-amber-400" />
            <span>Nouvelle Vidéo</span>
            <Plus className="h-4 w-4 opacity-40 group-hover:rotate-90 transition-transform duration-500 ml-1" />
          </Link>
        </div>

        {/* Filters & Search Bar - Ultra Premium Glass */}
        <div className="flex flex-col lg:flex-row items-center gap-4 p-2 bg-white/40 backdrop-blur-2xl border border-white/60 rounded-[2.5rem] shadow-[0_8px_32px_-4px_rgba(0,0,0,0.05)]">
          <div className="relative flex-1 w-full translate-z-0">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-5 w-5 text-zinc-400" />
            <Input
              placeholder="Rechercher une vidéo ou un sujet d'inspiration…"
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              className="pl-14 h-14 rounded-[1.75rem] border-zinc-200/50 bg-white shadow-sm text-[15px] placeholder:text-zinc-400 focus-visible:ring-4 focus-visible:ring-amber-500/10 focus-visible:border-amber-500/30 transition-all font-medium"
            />
          </div>
          <div className="flex items-center gap-2 p-1.5 bg-zinc-100/50 rounded-[1.75rem] w-full lg:w-auto overflow-x-auto no-scrollbar">
            {STATUS_OPTIONS.map(o => (
              <button
                key={o.value}
                onClick={() => { setStatusFilter(o.value); setPage(1); }}
                className={cn(
                  "h-11 px-6 rounded-full text-[12px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  statusFilter === o.value
                    ? "bg-white text-zinc-950 shadow-md ring-1 ring-black/5"
                    : "text-zinc-400 hover:text-zinc-600 hover:bg-white/50"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-4 bg-red-50/50 border border-red-100/50 text-red-600 px-6 py-5 rounded-3xl text-[14px] font-semibold animate-in fade-in slide-in-from-top-2 duration-500 shadow-sm">
            <div className="h-10 w-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
              <AlertCircle className="h-5 w-5" />
            </div>
            {error}
          </div>
        )}

        {/* Loading Skeleton */}
        {loading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="space-y-5">
                <div className="aspect-video rounded-[2.5rem] bg-zinc-100 animate-pulse relative overflow-hidden ring-1 ring-zinc-200">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 translate-x-[-100%] animate-shimmer" />
                </div>
                <div className="space-y-3 px-2">
                  <div className="h-5 w-3/4 bg-zinc-100 rounded-xl animate-pulse" />
                  <div className="h-4 w-1/4 bg-zinc-100 rounded-xl animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && paginated.length === 0 && (
          <div className="py-32 flex flex-col items-center gap-8 text-center animate-in zoom-in-95 duration-1000">
            <div className="relative">
              <div className="h-24 w-24 rounded-[3rem] bg-white border border-zinc-100 flex items-center justify-center shadow-xl">
                <FileVideo className="h-10 w-10 text-zinc-300" />
              </div>
              <div className="absolute -bottom-2 -right-2 h-10 w-10 rounded-full bg-amber-400 flex items-center justify-center text-white shadow-lg border-4 border-white animate-bounce-subtle">
                <Plus className="h-5 w-5" />
              </div>
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-zinc-950 tracking-tight">
                {search || statusFilter !== "all" ? "Aucun résultat trouvé" : "Prêt à créer votre chef-d'œuvre ?"}
              </h2>
              <p className="text-[15px] text-zinc-400 max-w-[320px] leading-relaxed mx-auto font-medium">
                {search || statusFilter !== "all"
                  ? "Nous n'avons trouvé aucune vidéo correspondant à vos critères de recherche. Essayez d'autres mots-clés."
                  : "Sketch Pilot transforme vos idées en vidéos professionnelles. Votre prochaine vidéo virale commence ici."}
              </p>
            </div>
            {!search && statusFilter === "all" && (
              <Link href="/generate" className="flex items-center gap-3 h-14 px-10 rounded-2xl bg-zinc-950 text-white text-[13px] font-black tracking-widest uppercase hover:bg-amber-500 transition-all shadow-[0_20px_40px_-12px_rgba(0,0,0,0.2)] mt-2 hover:-translate-y-1">
                <Sparkles className="h-4 w-4 text-amber-400" />
                <span>Commencer la magie</span>
              </Link>
            )}
          </div>
        )}

        {/* Grid - 4 Columns Responsive */}
        {!loading && paginated.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {paginated.map(video => <VideoCard key={video.id} video={video} showActions />)}
          </div>
        )}

        {/* Pagination - Premium Mini */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-10">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="h-10 w-10 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-amber-500 hover:text-amber-500 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
            ><ChevronLeft className="h-4 w-4" /></button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={cn(
                  "h-10 min-w-[40px] px-3 rounded-2xl text-[13px] font-black transition-all",
                  p === page
                    ? "bg-zinc-950 text-white shadow-lg"
                    : "bg-white text-zinc-400 border border-zinc-200 hover:border-zinc-300 hover:text-zinc-600 shadow-sm"
                )}
              >{p}</button>
            ))}

            <button
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="h-10 w-10 rounded-2xl bg-white border border-zinc-200 flex items-center justify-center text-zinc-400 hover:border-amber-500 hover:text-amber-500 disabled:opacity-30 disabled:pointer-events-none transition-all shadow-sm"
            ><ChevronRight className="h-4 w-4" /></button>
          </div>
        )}
      </div>
    </div>
  );
}