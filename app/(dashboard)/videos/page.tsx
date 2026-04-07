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

  const goTo = (p: number) => {
    // @ts-ignore
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-8 pb-32">

        {/* ── HEADER & CTA ── */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-900">Mes Vidéos</h1>
            <p className="text-sm text-zinc-500 mt-1.5 max-w-lg">
              Retrouvez l'historique complet de vos projets vidéo générés par l'IA. Visionnez, modifiez et téléchargez vos créations.
            </p>
          </div>
          <Link href="/dashboard">
            <button className="hidden md:flex items-center gap-2 h-11 px-6 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-bold transition-all shadow-lg shadow-amber-500/25 active:scale-95">
              <Plus className="h-4 w-4" /> Créer un projet
            </button>
          </Link>
        </div>

        {/* Error State */}
        {error && (
          <div className="flex items-center gap-3 border border-red-200 bg-red-50/50 text-red-700 rounded-2xl px-5 py-4 text-sm animate-in fade-in">
            <AlertCircle className="h-5 w-5 shrink-0 text-red-500" />
            <span className="flex-1 font-medium">{error}</span>
            <button onClick={() => setError(null)} className="p-1 hover:bg-red-100 rounded-md transition-colors">
              <X className="h-4 w-4 opacity-70" />
            </button>
          </div>
        )}

        {/* ── STATS ROW ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Film, label: "Vidéos Totales", value: videos.length, iconCls: "text-zinc-600 bg-zinc-100", cls: "border-zinc-200" },
            { icon: CheckCircle2, label: "Générations Réussies", value: counts.completed, iconCls: "text-emerald-600 bg-emerald-50", cls: "border-emerald-100" },
            { icon: Clock, label: "Projets En Cours", value: counts.processing, iconCls: "text-amber-600 bg-amber-50", cls: "border-amber-100 hover:border-amber-200" },
            { icon: XCircle, label: "Projets Échoués", value: counts.failed, iconCls: "text-red-500 bg-red-50", cls: "border-red-100" },
          ].map(({ icon: Icon, label, value, iconCls, cls }) => (
            <div key={label} className={cn("bg-white border rounded-[1.25rem] p-5 flex flex-col justify-between h-32 transition-all hover:shadow-md", cls)}>
              <div className="flex items-center justify-between">
                <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", iconCls)}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
              <div>
                <p className="text-2xl font-bold text-zinc-900 tracking-tight leading-none mb-1">{value}</p>
                <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 line-clamp-1">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── FILTERS & SEARCH ── */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-zinc-50 border border-zinc-100 p-2 rounded-2xl">
          <div className="relative flex-1 w-full max-w-md">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <input
              placeholder="Rechercher une vidéo..."
              value={search}
              // @ts-ignore
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full h-11 pl-10 pr-4 rounded-xl border border-transparent hover:border-zinc-200 bg-transparent text-sm font-medium focus:bg-white focus:outline-none focus:border-zinc-300 focus:shadow-sm transition-all"
            />
          </div>
          <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-xl p-1 shadow-sm w-full sm:w-auto overflow-x-auto hide-scrollbar">
            {STATUS_OPTIONS.map((o) => (
              <button
                key={o.value}
                // @ts-ignore
                onClick={() => { setStatus(o.value); setPage(1); }}
                className={cn(
                  "px-4 h-9 text-xs font-bold rounded-lg transition-all whitespace-nowrap",
                  status === o.value ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── LOADING SKELETONS ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 p-3 rounded-2xl bg-white border border-zinc-100 shadow-sm animate-pulse">
                <div className="aspect-video rounded-xl bg-zinc-100 w-full" />
                <div className="h-4 w-2/3 bg-zinc-100 rounded-md" />
                <div className="h-3 w-1/3 bg-zinc-100 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {/* ── EMPTY STATE ── */}
        {!loading && !error && paginated.length === 0 && (
          <div className="border-2 border-dashed border-zinc-200 rounded-[2rem] bg-zinc-50/50 flex flex-col items-center justify-center py-24 text-center">
            <div className="h-20 w-20 rounded-3xl bg-white shadow-lg border border-zinc-100 flex items-center justify-center mb-6">
              <FileVideo className="h-8 w-8 text-zinc-300" />
            </div>
            <h3 className="text-xl font-bold text-zinc-900 tracking-tight">
              {search || status !== "all" ? "Aucun projet trouvé" : "Aucune vidéo générée"}
            </h3>
            <p className="text-sm font-medium text-zinc-500 mt-2 mb-8 max-w-sm">
              {search || status !== "all"
                ? "Modifiez vos termes de recherche ou vos filtres pour voir d'autres résultats."
                : "Commencez par transformer vos idées en animations vidéo en créant un nouveau projet depuis le studio."}
            </p>
            {!search && status === "all" && (
              <Link href="/dashboard">
                <button className="flex items-center gap-2 h-12 px-8 rounded-xl bg-zinc-900 text-white text-sm font-bold hover:bg-zinc-800 hover:scale-105 active:scale-95 transition-all shadow-xl shadow-zinc-900/20">
                  <Plus className="h-4 w-4" /> Démarrer un projet
                </button>
              </Link>
            )}
          </div>
        )}

        {/* ── LOADING SKELETONS ── */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex flex-col gap-3 p-3 rounded-2xl bg-white border border-zinc-100 shadow-sm animate-pulse">
                <div className="aspect-video rounded-xl bg-zinc-100 w-full" />
                <div className="h-4 w-2/3 bg-zinc-100 rounded-md" />
                <div className="h-3 w-1/3 bg-zinc-100 rounded-md" />
              </div>
            ))}
          </div>
        )}

        {/* ── GRID ── */}
        {!loading && paginated.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {paginated.map((v) => (
              <VideoCard
                key={v.id}
                video={v}
                showActions
                onDelete={() => setVideos(videos.filter(vid => vid.id !== v.id))}
              />
            ))}
          </div>
        )}

        {/* ── PAGINATION ── */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-8">
            <button onClick={() => goTo(page - 1)} disabled={page === 1} className="h-10 w-10 rounded-xl border border-zinc-200 bg-white flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 disabled:opacity-40 transition-colors">
              <ChevronLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center gap-1 bg-white border border-zinc-200 rounded-xl p-1 shadow-sm">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button key={p} onClick={() => goTo(p)} className={cn("h-8 w-10 rounded-lg text-sm font-bold transition-colors", p === page ? "bg-zinc-900 text-white shadow-sm" : "text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900")}>
                  {p}
                </button>
              ))}
            </div>
            <button onClick={() => goTo(page + 1)} disabled={page === totalPages} className="h-10 w-10 rounded-xl border border-zinc-200 bg-white flex items-center justify-center text-zinc-500 hover:text-zinc-900 hover:border-zinc-300 disabled:opacity-40 transition-colors">
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}