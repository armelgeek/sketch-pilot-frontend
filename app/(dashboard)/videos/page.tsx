"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Play, Search, ChevronLeft, ChevronRight,
  Pencil, Download, Loader2, AlertCircle, Image, Clock
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";
import { videosService, type Video } from "@/src/services/videos-service";

type VideoStatus = Video["status"];

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: { label: "Terminé", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  processing: { label: "En cours", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 animate-pulse" },
  queued: { label: "En attente", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  failed: { label: "Échec", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  cancelled: { label: "Annulé", className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
  draft: { label: "Brouillon", className: "bg-zinc-100 text-zinc-500 dark:bg-zinc-800 dark:text-zinc-400" },
  scenes_generated: { label: "Visuels générés", className: "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400" },
  narration_generated: { label: "Narration prête", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
};

const EDIT_ROUTE: Record<string, string> = {
  draft: "storyboard",
  scenes_generated: "storyboard",
  narration_generated: "audio",
  failed: "storyboard",
  completed: "storyboard",
  queued: "storyboard",
  processing: "storyboard",
};

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

  const getEditPath = (v: Video): string | null => {
    const step = EDIT_ROUTE[v.status] || "storyboard";
    return `/generate/${v.id}/${step}`;
  };

  const formatDate = (v: Video) => {
    // Try to extract date from the video object
    const date = (v as any).createdAt || (v as any).created_at;
    if (!date) return "";
    return new Date(date).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  };

  return (
    <div className="relative min-h-screen mt-12">
      <div className="mesh-gradient" />
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-8 relative z-10">

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
              Mes vidéos
            </h1>
            <p className="text-zinc-500 mt-1">
              {loading ? "Chargement..." : `${videos.length} vidéo${videos.length > 1 ? "s" : ""} au total`}
            </p>
          </div>
          <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-500/20 h-11 px-6">
            <Link href="/generate">
              <Plus className="h-4 w-4 mr-2" /> Créer une vidéo
            </Link>
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
            <Input
              placeholder="Rechercher une vidéo..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="pl-9"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v); setPage(1); }}>
            <SelectTrigger className="w-full sm:w-52">
              <SelectValue placeholder="Statut" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="draft">Brouillon</SelectItem>
              <SelectItem value="scenes_generated">Visuels générés</SelectItem>
              <SelectItem value="narration_generated">Narration prête</SelectItem>
              <SelectItem value="completed">Terminé</SelectItem>
              <SelectItem value="processing">En cours</SelectItem>
              <SelectItem value="queued">En attente</SelectItem>
              <SelectItem value="failed">Échec</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 text-red-600 px-4 py-3 rounded-xl text-sm">
            <AlertCircle className="h-4 w-4 shrink-0" />
            {error}
          </div>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden glass-pill animate-pulse">
                <div className="aspect-video bg-zinc-200 dark:bg-zinc-700" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-zinc-200 dark:bg-zinc-700 rounded-md w-3/4" />
                  <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-md w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && !error && paginated.length === 0 && (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center h-20 w-20 rounded-full bg-zinc-100 dark:bg-zinc-800 mb-6">
              <Play className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
            </div>
            <h2 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mb-2">
              {search || statusFilter !== "all" ? "Aucune vidéo trouvée" : "Vous n'avez aucune vidéo pour l'instant"}
            </h2>
            <p className="text-zinc-500 text-sm mb-6">
              {search || statusFilter !== "all" ? "Essayez d'autres filtres" : "Créez votre première vidéo dès maintenant !"}
            </p>
            {!search && statusFilter === "all" && (
              <Button asChild className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                <Link href="/generate"><Plus className="h-4 w-4 mr-2" /> Créer une vidéo</Link>
              </Button>
            )}
          </div>
        )}

        {/* Video grid */}
        {!loading && paginated.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginated.map((v) => {
              const s = statusConfig[v.status] || statusConfig.draft;
              const editPath = getEditPath(v);
              const isProcessing = v.status === "processing" || v.status === "queued";

              return (
                <Card key={v.id} className="glass-pill border-none shadow-xl overflow-hidden group hover:shadow-2xl transition-all duration-300">
                  {/* Thumbnail */}
                  <div className="aspect-video bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center relative overflow-hidden">
                    {(v as any).thumbnailUrl ? (
                      <img
                        src={(v as any).thumbnailUrl}
                        alt={v.topic}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      />
                    ) : isProcessing ? (
                      <div className="flex flex-col items-center gap-2 text-emerald-500">
                        <Loader2 className="h-8 w-8 animate-spin" />
                        <span className="text-xs font-medium text-zinc-500">Génération en cours...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-2">
                        <Image className="h-8 w-8 text-zinc-300 dark:text-zinc-600 opacity-40" />
                      </div>
                    )}
                    {/* Status badge */}
                    <span className={cn("absolute top-2 left-2 text-xs font-bold px-2.5 py-1 rounded-full backdrop-blur-sm", s.className)}>
                      {s.label}
                    </span>
                    {/* Play overlay (completed only) */}
                    {v.status === "completed" && v.videoUrl && (
                      <a
                        href={v.videoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="absolute inset-0 flex items-center justify-center bg-black/0 group-hover:bg-black/40 transition-all duration-300"
                      >
                        <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-full bg-white/90 p-3 shadow-xl">
                          <Play className="h-6 w-6 text-zinc-900 fill-zinc-900" />
                        </div>
                      </a>
                    )}
                  </div>

                  {/* Info */}
                  <CardContent className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-sm leading-snug text-zinc-900 dark:text-zinc-100 line-clamp-2">{v.topic}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs text-zinc-400">
                        <Clock className="h-3 w-3" />
                        {formatDate(v)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-1">
                      {editPath && (
                        <Button
                          size="sm"
                          className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs rounded-lg h-8 px-2"
                          onClick={() => router.push(editPath)}
                        >
                          <Pencil className="h-3 w-3 mr-1.5" />
                          Éditer
                        </Button>
                      )}
                      {v.status === "completed" && v.videoUrl && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 text-xs rounded-lg h-8"
                          asChild
                        >
                          <a href={v.videoUrl} download>
                            <Download className="h-3 w-3 mr-1.5" />
                            Télécharger
                          </a>
                        </Button>
                      )}
                      {v.status === "completed" && !v.videoUrl && (
                        <Button size="sm" variant="outline" className="flex-1 text-xs rounded-lg h-8" disabled>
                          Voir la vidéo
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2">
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <Button
                key={p}
                variant={p === page ? "default" : "outline"}
                size="sm"
                onClick={() => setPage(p)}
                className={p === page ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
              >
                {p}
              </Button>
            ))}
            <Button variant="outline" size="icon" onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
