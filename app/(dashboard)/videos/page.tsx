"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Plus, Search, ChevronLeft, ChevronRight, CheckCircle2,
  Loader2, AlertCircle, Video as VideoIcon, TrendingUp, FileVideo
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
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

  const completedCount = videos.filter(v => v.status === "completed").length;
  const processingCount = videos.filter(v => v.status === "processing" || v.status === "queued").length;

  /* Build last-7-days bar chart data */
  const activityData = useMemo(() => {
    const days: { label: string; count: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("fr-FR", { weekday: "short" });
      const dayCount = videos.filter((v) => {
        const created = v.createdAt || v.created_at || "";
        return created.startsWith(dayKey);
      }).length;
      days.push({ label, count: dayCount });
    }
    return days;
  }, [videos]);

  return (
    <div className="space-y-6">
      {/* Header */}
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

      {/* Stats + Chart */}
      {!loading && videos.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Stat cards */}
          <div className="lg:col-span-1 grid grid-cols-1 gap-3">
            <div className="bg-zinc-50 rounded-2xl p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-zinc-100 flex items-center justify-center">
                <VideoIcon className="h-4 w-4 text-zinc-500" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Total</p>
                <p className="text-2xl font-black text-zinc-900 leading-tight">{videos.length}</p>
              </div>
            </div>
            <div className="bg-emerald-50 rounded-2xl p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500">Terminées</p>
                <p className="text-2xl font-black text-zinc-900 leading-tight">{completedCount}</p>
              </div>
            </div>
            <div className="bg-blue-50 rounded-2xl p-4 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-blue-100 flex items-center justify-center">
                <Loader2 className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-blue-500">En cours</p>
                <p className="text-2xl font-black text-zinc-900 leading-tight">{processingCount}</p>
              </div>
            </div>
          </div>

          {/* Activity chart */}
          <Card className="lg:col-span-2 bg-white border border-zinc-100 rounded-2xl shadow-none">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Créations — 7 derniers jours</span>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <ResponsiveContainer width="100%" height={140}>
                <BarChart data={activityData} barSize={24} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "#f4f4f5" }}
                    contentStyle={{ border: "none", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontSize: 12 }}
                    formatter={(value) => [value, "Vidéos"]}
                  />
                  <Bar dataKey="count" radius={[6, 6, 0, 0]}>
                    {activityData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.count > 0 ? "#18181b" : "#e4e4e7"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Search + Filter */}
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
            <FileVideo className="h-7 w-7 text-zinc-300" />
          </div>
          <div>
            <h2 className="text-lg font-black text-zinc-900">Aucune vidéo trouvée</h2>
            <p className="text-sm text-zinc-500 mt-1 max-w-xs">
              {search || statusFilter !== "all"
                ? "Essayez d'ajuster vos filtres."
                : "Vous n'avez pas encore créé de vidéo."}
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
          <Button
            variant="outline" size="icon"
            className="h-9 w-9 rounded-xl border-zinc-200"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Button
              key={p}
              variant={p === page ? "default" : "ghost"}
              size="sm"
              onClick={() => setPage(p)}
              className={cn(
                "h-9 min-w-[36px] font-bold text-xs rounded-xl",
                p === page ? "bg-zinc-900 text-white hover:bg-zinc-700" : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              {p}
            </Button>
          ))}
          <Button
            variant="outline" size="icon"
            className="h-9 w-9 rounded-xl border-zinc-200"
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
