"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Video, TrendingUp, Play, Pencil, Clock, ArrowUpRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription } from "@/src/components/ui/card";
import { useSession } from "@/src/lib/auth-client";
import { videosService, type Video as ApiVideo } from "@/src/services/videos-service";

const statusConfig: Record<string, { label: string; className: string }> = {
  completed: { label: "Terminé", className: "bg-green-100  text-green-700  dark:bg-green-900/30  dark:text-green-400" },
  processing: { label: "En cours", className: "bg-blue-100   text-blue-700   dark:bg-blue-900/30   dark:text-blue-400" },
  failed: { label: "Échec", className: "bg-red-100    text-red-700    dark:bg-red-900/30    dark:text-red-400" },
  queued: { label: "En attente", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
  draft: { label: "Brouillon", className: "bg-zinc-100   text-zinc-500   dark:bg-zinc-800      dark:text-zinc-400" },
  scenes_generated: { label: "Visuels prêts", className: "bg-cyan-100   text-cyan-700   dark:bg-cyan-900/30   dark:text-cyan-400" },
  narration_generated: { label: "Prêt pour audio", className: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400" },
  cancelled: { label: "Annulé", className: "bg-zinc-100   text-zinc-500   dark:bg-zinc-800      dark:text-zinc-400" },
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

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const userName = session?.user?.name?.split(" ")[0] || "là";

  const [recentVideos, setRecentVideos] = useState<ApiVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);

  useEffect(() => {
    videosService.getAll()
      .then((all) => setRecentVideos(all.slice(0, 5)))
      .catch(() => { })
      .finally(() => setVideosLoading(false));
  }, []);

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
            Bonjour {userName} 👋
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">
            Prêt à donner vie à vos idées aujourd'hui ?
          </p>
        </div>
        <Link href="/generate">
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-12 px-6 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
            <Plus className="mr-2 h-5 w-5" /> Démarrer un projet
          </Button>
        </Link>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <Card className="sm:col-span-1 border-2 border-zinc-900 dark:border-zinc-50 overflow-hidden group">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 flex items-center justify-center transition-transform group-hover:rotate-12">
              <Plus className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tight">Nouvelle vidéo</CardTitle>
              <CardDescription className="mt-1 font-medium italic text-emerald-600 dark:text-emerald-400">
                Lancez votre prochain chef-d'œuvre
              </CardDescription>
            </div>
            <Button asChild className="w-full h-11 rounded-xl bg-zinc-900 dark:bg-zinc-50 shadow-lg active:scale-95 transition-all">
              <Link href="/generate">Démarrer</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:border-emerald-500/50 transition-colors duration-300">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center text-zinc-500">
              <Video className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tight">Bibliothèque</CardTitle>
              <CardDescription className="mt-1 font-medium">Accédez à toutes vos créations</CardDescription>
            </div>
            <Button variant="outline" asChild className="w-full h-11 rounded-xl border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors">
              <Link href="/videos">Voir tout</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-dashed border-zinc-200 dark:border-zinc-800">
          <CardContent className="p-6 flex flex-col items-center text-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <CardTitle className="text-lg font-black tracking-tight text-zinc-400">Statistiques</CardTitle>
              <CardDescription className="mt-1 font-medium text-zinc-400">Découvrez votre impact</CardDescription>
            </div>
            <Button variant="ghost" className="w-full h-11 rounded-xl text-zinc-400 cursor-not-allowed" disabled>
              Bientôt disponible
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Recent videos */}
      <div>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-black tracking-tight">Vidéos récentes</h2>
          <Button variant="ghost" size="sm" asChild className="font-bold text-zinc-500 hover:text-emerald-600 transition-colors">
            <Link href="/videos">Voir tout <ArrowUpRight className="ml-1 h-3 w-3" /></Link>
          </Button>
        </div>

        <Card className="border-zinc-200/60 dark:border-zinc-800/60 shadow-lg overflow-hidden">
          {videosLoading ? (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4 p-5">
                  <div className="h-12 w-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2">
                    <div className="h-4 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-2/3" />
                    <div className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded animate-pulse w-1/3" />
                  </div>
                </div>
              ))}
            </div>
          ) : recentVideos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center text-zinc-400">
              <Play className="h-8 w-8 mb-3 opacity-30" />
              <p className="text-sm font-medium">Aucune vidéo pour l'instant</p>
              <Button asChild size="sm" className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg">
                <Link href="/generate"><Plus className="h-3.5 w-3.5 mr-1.5" />Créer une vidéo</Link>
              </Button>
            </div>
          ) : (
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
              {recentVideos.map((v) => {
                const s = statusConfig[v.status] || statusConfig.draft;
                const step = EDIT_ROUTE[v.status];
                const editPath = step ? `/generate/${v.id}/${step}` : null;
                const date = (v as any).createdAt
                  ? new Date((v as any).createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })
                  : "";
                return (
                  <div key={v.id} className="flex items-center gap-4 p-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors group">
                    <div className="h-12 w-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50">
                      {(v as any).thumbnailUrl
                        ? <img src={(v as any).thumbnailUrl} alt={v.topic} className="w-full h-full object-cover" />
                        : <Play className="h-5 w-5 text-zinc-400" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-zinc-900 dark:text-zinc-50 truncate">{v.topic}</p>
                      {date && (
                        <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5">
                          <Clock className="h-3 w-3" /> {date}
                        </p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full border ${s.className}`}>
                        {s.label}
                      </span>
                      <div className="flex items-center gap-1.5">
                        {editPath && (
                          <Button
                            size="sm"
                            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg px-3"
                            onClick={() => router.push(editPath)}
                          >
                            <Pencil className="h-3 w-3 mr-1" /> Éditer
                          </Button>
                        )}
                        {v.videoUrl && (
                          <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg px-3" asChild>
                            <a href={v.videoUrl} target="_blank">Voir</a>
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
