"use client";

import { useState } from "react";
import Link from "next/link";
import { Plus, Play, MoreHorizontal, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { cn } from "@/src/lib/utils";

type VideoStatus = "completed" | "processing" | "failed" | "queued";

const statusConfig: Record<VideoStatus, { label: string; className: string }> = {
  completed: { label: "Terminé", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  processing: { label: "En cours", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  failed: { label: "Échec", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  queued: { label: "En attente", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
};

const mockVideos = [
  { id: "1", title: "Introduction à Python", status: "completed" as VideoStatus, genre: "Tutoriel", type: "Explainer", duration: "12:30", date: "12 Jan 2026", credits: 120 },
  { id: "2", title: "Histoire de la Renaissance", status: "processing" as VideoStatus, genre: "Éducatif", type: "Storytelling", duration: "18:45", date: "11 Jan 2026", credits: 180 },
  { id: "3", title: "Les bases du marketing digital", status: "queued" as VideoStatus, genre: "Business", type: "Explainer", duration: "—", date: "10 Jan 2026", credits: 90 },
  { id: "4", title: "Physique quantique simplifiée", status: "completed" as VideoStatus, genre: "Science", type: "Educational", duration: "22:10", date: "8 Jan 2026", credits: 220 },
  { id: "5", title: "Apprendre à dessiner en ligne", status: "failed" as VideoStatus, genre: "Art", type: "Tutorial", duration: "—", date: "5 Jan 2026", credits: 0 },
  { id: "6", title: "Comment fonctionne la blockchain", status: "completed" as VideoStatus, genre: "Tech", type: "Explainer", duration: "14:55", date: "2 Jan 2026", credits: 150 },
];

export default function VideosPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [genreFilter, setGenreFilter] = useState("all");
  const [page, setPage] = useState(1);

  const filtered = mockVideos.filter((v) => {
    const matchSearch = v.title.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "all" || v.status === statusFilter;
    const matchGenre = genreFilter === "all" || v.genre.toLowerCase() === genreFilter.toLowerCase();
    return matchSearch && matchStatus && matchGenre;
  });

  const perPage = 6;
  const totalPages = Math.ceil(filtered.length / perPage);
  const paginated = filtered.slice((page - 1) * perPage, page * perPage);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Mes vidéos</h1>
          <p className="text-zinc-500 mt-1">{mockVideos.length} vidéos au total</p>
        </div>
        <Button asChild>
          <Link href="/generate">
            <Plus className="h-4 w-4" /> Créer une vidéo
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
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les statuts</SelectItem>
            <SelectItem value="completed">Terminé</SelectItem>
            <SelectItem value="processing">En cours</SelectItem>
            <SelectItem value="queued">En attente</SelectItem>
            <SelectItem value="failed">Échec</SelectItem>
          </SelectContent>
        </Select>
        <Select value={genreFilter} onValueChange={(v) => { setGenreFilter(v); setPage(1); }}>
          <SelectTrigger className="w-full sm:w-44">
            <SelectValue placeholder="Genre" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous les genres</SelectItem>
            <SelectItem value="tutoriel">Tutoriel</SelectItem>
            <SelectItem value="éducatif">Éducatif</SelectItem>
            <SelectItem value="business">Business</SelectItem>
            <SelectItem value="science">Science</SelectItem>
            <SelectItem value="tech">Tech</SelectItem>
            <SelectItem value="art">Art</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Video grid */}
      {paginated.length === 0 ? (
        <div className="text-center py-20 text-zinc-500">
          <Play className="h-12 w-12 mx-auto mb-3 text-zinc-300 dark:text-zinc-600" />
          <p className="font-medium">Aucune vidéo trouvée</p>
          <p className="text-sm mt-1">Essayez de modifier vos filtres</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {paginated.map((v) => {
            const s = statusConfig[v.status];
            return (
              <Card key={v.id} className="overflow-hidden">
                <div className="aspect-video bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center relative">
                  <Play className="h-10 w-10 text-zinc-400 dark:text-zinc-600" />
                  <span className={cn("absolute top-2 right-2 text-xs font-medium px-2 py-0.5 rounded-full", s.className)}>
                    {s.label}
                  </span>
                </div>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm truncate">{v.title}</h3>
                      <p className="text-xs text-zinc-500 mt-1">
                        {v.genre} • {v.type} • {v.duration}
                      </p>
                      <p className="text-xs text-zinc-400 mt-0.5">{v.date}</p>
                    </div>
                    <button className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0 mt-0.5">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-3 flex gap-2">
                    <Button size="sm" variant="outline" className="flex-1" disabled={v.status !== "completed"}>
                      Voir
                    </Button>
                    <Button size="sm" variant="ghost" className="flex-1" disabled={v.status === "processing" || v.status === "queued"}>
                      Télécharger
                    </Button>
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
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "outline"}
              size="sm"
              onClick={() => setPage(p)}
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline"
            size="icon"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
