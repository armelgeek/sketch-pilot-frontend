"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  FileVideo,
  AlertCircle,
  Loader2,
  CheckCircle,
  X,
  Film,
  Clock,
  CheckCircle2,
  XCircle,
  LayoutGrid,
  List,
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { videosService, type Video } from "@/src/services/videos-service";
import { VideoCard } from "@/src/components/organisms/video-card";

// ─── Types & Constants ────────────────────────────────────────────────────────

const STATUS_OPTIONS = [
  { value: "all", label: "Tous" },
  { value: "completed", label: "Terminées" },
  { value: "processing", label: "En cours" },
  { value: "failed", label: "Échecs" },
];

const PER_PAGE = 12;

// ─── Sub-components ───────────────────────────────────────────────────────────

function Banner({
  type,
  title,
  body,
  onClose,
}: {
  type: "success" | "info" | "error";
  title: string;
  body?: string;
  onClose?: () => void;
}) {
  const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };
  const icons = {
    success: <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />,
    info: <Loader2 className="h-4 w-4 mt-0.5 shrink-0 animate-spin" />,
    error: <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />,
  };

  return (
    <div className={`flex items-start gap-3 border rounded-lg px-4 py-3 text-sm ${styles[type]}`}>
      {icons[type]}
      <div className="flex-1">
        <span className="font-medium">{title}</span>
        {body && <span className="ml-1 opacity-80">{body}</span>}
      </div>
      {onClose && (
        <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  accent,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  accent?: "amber" | "emerald" | "red" | "blue" | "zinc";
}) {
  const accentStyles = {
    amber: "bg-amber-50 text-amber-600 border-amber-100",
    emerald: "bg-emerald-50 text-emerald-600 border-emerald-100",
    red: "bg-red-50 text-red-500 border-red-100",
    blue: "bg-blue-50 text-blue-500 border-blue-100",
    zinc: "bg-zinc-100 text-zinc-500 border-zinc-200",
  };

  return (
    <div className="border border-zinc-200 rounded-xl bg-white p-4 flex items-center gap-4">
      <div className={cn("h-10 w-10 rounded-lg border flex items-center justify-center shrink-0", accentStyles[accent ?? "zinc"])}>
        {icon}
      </div>
      <div>
        <p className="text-[11px] font-semibold tracking-wide uppercase text-zinc-400">{label}</p>
        <p className="text-xl font-bold text-zinc-900 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-amber-400 rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VideosPage() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  useEffect(() => {
    videosService
      .getAll()
      .then(setVideos)
      .catch(() => setError("Impossible de charger vos vidéos."))
      .finally(() => setLoading(false));
  }, []);

  const filtered = videos.filter((v) => {
    const title = (v.title || v.topic || "").toLowerCase();
    return (
      title.includes(search.toLowerCase()) &&
      (status === "all" || v.status === status)
    );
  });

  const totalPages = Math.ceil(filtered.length / PER_PAGE);
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const completed = videos.filter((v) => v.status === "completed").length;
  const processing = videos.filter((v) => v.status === "processing").length;
  const failed = videos.filter((v) => v.status === "failed").length;
  const completionRate =
    videos.length > 0 ? Math.round((completed / videos.length) * 100) : 0;

  function goTo(p: number) {
    setPage(p);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleRefresh() {
    setLoading(true);
    setError(null);
    videosService
      .getAll()
      .then(setVideos)
      .catch(() => setError("Impossible de charger vos vidéos."))
      .finally(() => setLoading(false));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 lg:px-0 pb-20 space-y-6">


      {/* ── Banners ── */}
      {error && (
        <Banner
          type="error"
          title={error}
          onClose={() => setError(null)}
        />
      )}

      {/* ── Layout: main + sidebar ── */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">

        {/* ── Left: Stats + Grid ── */}
        <div className="lg:col-span-3 space-y-6">

          {/* Stats row */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <StatCard
              icon={<Film className="h-5 w-5" />}
              label="Total"
              value={videos.length}
              accent="zinc"
            />
            <StatCard
              icon={<CheckCircle2 className="h-5 w-5" />}
              label="Terminées"
              value={completed}
              accent="emerald"
            />
            <StatCard
              icon={<Clock className="h-5 w-5" />}
              label="En cours"
              value={processing}
              accent="amber"
            />
            <StatCard
              icon={<XCircle className="h-5 w-5" />}
              label="Échecs"
              value={failed}
              accent="red"
            />
          </div>

          {/* Filters + view toggle */}
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-400" />
              <input
                placeholder="Rechercher une production ou un sujet…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setPage(1);
                }}
                className="w-full sm:w-[400px] pl-10 pr-4 h-10 rounded-xl border border-zinc-200 text-[13px] font-medium placeholder:text-zinc-300 focus:outline-none focus:border-zinc-400 transition-colors bg-white"
              />
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-zinc-100 rounded-xl p-1">
                {STATUS_OPTIONS.map((o) => {
                  const count =
                    o.value === "all"
                      ? videos.length
                      : videos.filter((v) => v.status === o.value).length;
                  return (
                    <button
                      key={o.value}
                      onClick={() => {
                        setStatus(o.value);
                        setPage(1);
                      }}
                      className={cn(
                        "flex items-center gap-1.5 px-3 h-8 text-[12px] font-semibold rounded-lg transition-all whitespace-nowrap",
                        status === o.value
                          ? "bg-white text-zinc-900 border border-zinc-200 shadow-sm"
                          : "text-zinc-400 hover:text-zinc-700"
                      )}
                    >
                      {o.label}
                      {count > 0 && status === o.value && (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-700 rounded-full px-1.5 py-px">
                          {count}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Loading skeleton */}
          {loading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            <div className="border border-zinc-200 rounded-xl bg-white flex flex-col items-center py-20 text-center">
              <div className="h-14 w-14 rounded-2xl bg-zinc-100 flex items-center justify-center mb-4">
                <FileVideo className="h-6 w-6 text-zinc-400" />
              </div>
              <p className="text-[15px] font-bold text-zinc-900">
                {search || status !== "all" ? "Aucun résultat" : "Studio vide"}
              </p>
              <p className="text-[13px] text-zinc-400 mt-1 mb-6">
                {search || status !== "all"
                  ? "Essayez de modifier vos filtres."
                  : "Créez votre première vidéo pour commencer."}
              </p>
              {!search && status === "all" && (
                <Link href="/dashboard">
                  <button className="flex items-center gap-2 h-10 px-6 rounded-full bg-zinc-950 text-white text-[13px] font-semibold hover:opacity-80 transition-opacity group">
                    <Plus className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-200" />
                    Démarrer
                  </button>
                </Link>
              )}
            </div>
          )}

          {/* Grid */}
          {!loading && paginated.length > 0 && (
            <div
              className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                  : "flex flex-col gap-3"
              )}
            >
              {paginated.map((v) => (
                <VideoCard key={v.id} video={v} showActions />
              ))}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 pt-4 border-t border-zinc-100">
              <button
                onClick={() => goTo(page - 1)}
                disabled={page === 1}
                className="h-9 w-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 disabled:opacity-30 transition-all"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  onClick={() => goTo(p)}
                  className={cn(
                    "h-9 w-9 rounded-lg text-[13px] font-semibold transition-all",
                    p === page
                      ? "bg-zinc-950 text-white"
                      : "text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50"
                  )}
                >
                  {p}
                </button>
              ))}

              <button
                onClick={() => goTo(page + 1)}
                disabled={page === totalPages}
                className="h-9 w-9 rounded-lg border border-zinc-200 flex items-center justify-center text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 disabled:opacity-30 transition-all"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">

          {/* Completion rate */}
          <div className="border border-zinc-200 rounded-xl bg-white p-5 space-y-4">
            <p className="text-sm font-semibold text-zinc-900">Taux de réussite</p>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Vidéos complètes</span>
                <span className="font-medium text-zinc-900">{completed} / {videos.length}</span>
              </div>
              <ProgressBar value={completionRate} />
              <p className="text-xs text-zinc-400">{completionRate}% de réussite</p>
            </div>

            <div className="space-y-0 divide-y divide-zinc-100">
              {[
                { label: "Terminées", value: completed, color: "text-emerald-500" },
                { label: "En cours", value: processing, color: "text-amber-500" },
                { label: "Échouées", value: failed, color: "text-red-400" },
              ].map((row) => (
                <div key={row.label} className="flex justify-between items-center py-2.5 text-sm">
                  <span className="text-zinc-500">{row.label}</span>
                  <span className={cn("font-semibold", row.color)}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>


          {/* Tips */}
          <div className="border border-zinc-200 rounded-xl bg-white p-5 space-y-2">
            <p className="text-sm font-semibold text-zinc-900">Conseils</p>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li className="flex gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                Les vidéos en échec peuvent être relancées depuis leur page de détail.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                Utilisez la recherche pour retrouver rapidement un projet par sujet.
              </li>
              <li className="flex gap-2">
                <span className="text-amber-400 mt-0.5">•</span>
                Les exports sont disponibles 30 jours après la génération.
              </li>
            </ul>
          </div>

        </div>
      </div>
    </div>
  );
}