"use client";

import Link from "next/link";
import { Plus, Video, Clock, TrendingUp, Play, MoreHorizontal } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";

type VideoStatus = "completed" | "processing" | "failed" | "queued";

const statusConfig: Record<VideoStatus, { label: string; className: string }> = {
  completed: { label: "Terminé", className: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" },
  processing: { label: "En cours", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" },
  failed: { label: "Échec", className: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" },
  queued: { label: "En attente", className: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" },
};

const recentVideos = [
  { id: "1", title: "Introduction à Python", status: "completed" as VideoStatus, duration: "12:30", genre: "Tutoriel", date: "il y a 2h" },
  { id: "2", title: "Histoire de la Renaissance", status: "processing" as VideoStatus, duration: "18:45", genre: "Éducatif", date: "il y a 5h" },
  { id: "3", title: "Les bases du marketing", status: "queued" as VideoStatus, duration: "9:20", genre: "Business", date: "il y a 1j" },
  { id: "4", title: "Physique quantique simplifiée", status: "completed" as VideoStatus, duration: "22:10", genre: "Science", date: "il y a 2j" },
  { id: "5", title: "Apprendre à dessiner", status: "failed" as VideoStatus, duration: "—", genre: "Art", date: "il y a 3j" },
];

const activeJobs = [
  { id: "j1", title: "Histoire de la Renaissance", progress: 67, step: "Génération des scènes" },
];

const stats = [
  { label: "Vidéos ce mois", value: "8", icon: Video, delta: "+3 vs mois dernier" },
  { label: "Vidéos totales", value: "34", icon: TrendingUp, delta: "Depuis le début" },
  { label: "Durée totale", value: "6h 22m", icon: Clock, delta: "De contenu créé" },
];

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50">Bonjour Jean 👋</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1">Voici un aperçu de votre activité</p>
      </div>

      {/* Plan & credits */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Plan Professional — Crédits utilisés</span>
                <span className="text-sm text-zinc-500">880 / 2 000</span>
              </div>
              <Progress value={44} />
            </div>
            <Button variant="outline" size="sm" asChild>
              <Link href="/pricing">Mettre à niveau</Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Quick actions */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="sm:col-span-1 border-2 border-zinc-900 dark:border-zinc-50">
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <Plus className="h-8 w-8" />
            <div>
              <CardTitle className="text-base">Créer une nouvelle vidéo</CardTitle>
              <CardDescription className="mt-1">Commencez un nouveau projet</CardDescription>
            </div>
            <Button asChild className="w-full">
              <Link href="/generate">Démarrer</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <Video className="h-8 w-8 text-zinc-500" />
            <div>
              <CardTitle className="text-base">Mes vidéos</CardTitle>
              <CardDescription className="mt-1">Gérez votre bibliothèque</CardDescription>
            </div>
            <Button variant="outline" asChild className="w-full">
              <Link href="/videos">Voir tout</Link>
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6 flex flex-col items-center text-center gap-3">
            <TrendingUp className="h-8 w-8 text-zinc-500" />
            <div>
              <CardTitle className="text-base">Statistiques</CardTitle>
              <CardDescription className="mt-1">Analysez vos performances</CardDescription>
            </div>
            <Button variant="outline" className="w-full" disabled>Bientôt</Button>
          </CardContent>
        </Card>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">{s.label}</p>
                  <p className="text-3xl font-bold mt-1">{s.value}</p>
                  <p className="text-xs text-zinc-400 mt-1">{s.delta}</p>
                </div>
                <s.icon className="h-8 w-8 text-zinc-300 dark:text-zinc-600" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Active jobs */}
      {activeJobs.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold mb-3">Générations en cours</h2>
          <div className="space-y-3">
            {activeJobs.map((job) => (
              <Card key={job.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-medium text-sm">{job.title}</span>
                    <span className="text-sm text-zinc-500">{job.progress}%</span>
                  </div>
                  <Progress value={job.progress} />
                  <p className="text-xs text-zinc-400 mt-1">{job.step}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Recent videos */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Vidéos récentes</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/videos">Voir tout</Link>
          </Button>
        </div>
        <Card>
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {recentVideos.map((v) => {
              const s = statusConfig[v.status];
              return (
                <div key={v.id} className="flex items-center gap-4 p-4">
                  <div className="h-10 w-16 rounded bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center shrink-0">
                    <Play className="h-4 w-4 text-zinc-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{v.title}</p>
                    <p className="text-xs text-zinc-500">{v.genre} • {v.duration} • {v.date}</p>
                  </div>
                  <span className={`text-xs font-medium px-2 py-1 rounded-full shrink-0 ${s.className}`}>
                    {s.label}
                  </span>
                  <button className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 shrink-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
