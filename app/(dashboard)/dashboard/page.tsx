"use client";

import Link from "next/link";
import {
  Plus,
  Video,
  Clock,
  TrendingUp,
  Play,
  MoreHorizontal,
  Zap,
  Coins,
  ShoppingCart,
  Sparkles,
  Loader2,
  ArrowUpRight
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardTitle, CardDescription, CardHeader } from "@/src/components/ui/card";
import { Progress } from "@/src/components/ui/progress";
import { useSubscriptionManager } from "@/src/hooks/use-subscription-manager";
import { cn } from "@/src/lib/utils";
import { useSession } from "@/src/lib/auth-client";

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
  const { data: session } = useSession();
  const {
    subscriptionStatus,
    isLoading: managerLoading,
    buyCreditPack
  } = useSubscriptionManager();

  const handleBuyPack = async (packId: string) => {
    try {
      await buyCreditPack(packId);
    } catch (err) {
      console.error("Purchase failed:", err);
    }
  };

  const loading = managerLoading;
  const userName = session?.user?.name?.split(" ")[0] || "là";
  const totalPlanCredits = subscriptionStatus?.totalCredits || 0;
  const usedPlanCredits = subscriptionStatus?.usedCredits || 0;
  const usagePercentage = totalPlanCredits > 0 ? (usedPlanCredits / totalPlanCredits) * 100 : 0;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">Bonjour {userName} 👋</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Prêt à donner vie à vos idées aujourd'hui ?</p>
        </div>
        <Link href="/generate">
          <Button className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl h-12 px-6 shadow-lg shadow-emerald-500/20 active:scale-95 transition-all">
            <Plus className="mr-2 h-5 w-5" />
            Démarrer un projet
          </Button>
        </Link>
      </div>

      {/* Plan & credits */}
      <Card className="overflow-hidden border-zinc-200/60 dark:border-zinc-800/60 shadow-xl shadow-zinc-200/20 dark:shadow-none bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm">
        <CardContent className="p-0">
          <div className="flex flex-col lg:flex-row items-stretch">
            <div className="flex-1 p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Zap className="h-5 w-5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/10" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-0.5">Votre Forfait</p>
                    <p className="text-lg font-bold capitalize">{subscriptionStatus?.planName === 'plan_starter' ? 'Starter' : (subscriptionStatus?.planName || 'Gratuit')}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between text-sm font-bold">
                  <span className="text-zinc-600 dark:text-zinc-400">Utilisation des crédits</span>
                  <span className="text-zinc-900 dark:text-zinc-50">{usedPlanCredits} / {totalPlanCredits}</span>
                </div>
                <Progress value={usagePercentage} className="h-2.5 bg-zinc-100 dark:bg-zinc-800" />
                <p className="text-[11px] text-zinc-400 font-medium">Le quota de votre forfait se réinitialise le {subscriptionStatus?.periodEnd ? new Date(subscriptionStatus.periodEnd).toLocaleDateString() : 'prochain cycle'}.</p>
              </div>
            </div>

            <div className="lg:w-px bg-zinc-200/60 dark:bg-zinc-800/60" />

            <div className="p-6 md:p-8 bg-zinc-50/50 dark:bg-zinc-900/30 flex flex-col justify-center gap-4">
              <div className="flex flex-col">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Total Disponible</p>
                <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
                  {subscriptionStatus?.remainingCredits ?? 0}
                  <span className="text-sm font-bold text-zinc-400 ml-2 tracking-normal uppercase">Crédits</span>
                </p>
              </div>
              <Link href="/subscription">
                <Button variant="outline" className="w-full h-11 rounded-xl font-bold border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors">
                  Gérer l'abonnement
                  <ArrowUpRight className="ml-2 h-4 w-4 opacity-50" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Packs Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-950/30 rounded-xl">
              <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h2 className="text-xl font-black tracking-tight leading-none">Besoin de plus de crédits ?</h2>
              <p className="text-xs text-zinc-500 font-medium mt-1">Crédits valables à vie, pour vos projets urgents</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { id: 'pack_100', credits: 100, price: 3, label: 'Essentiel' },
            { id: 'pack_300', credits: 300, price: 7, label: 'Populaire', featured: true, savings: '22%' },
            { id: 'pack_600', credits: 600, price: 12, label: 'Expert', savings: '33%' },
          ].map((pack) => (
            <Card
              key={pack.id}
              className={cn(
                "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group",
                pack.featured
                  ? "border-emerald-500/50 dark:border-emerald-500/30 shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                  : "border-zinc-200/60 dark:border-zinc-800/60"
              )}
            >
              {pack.featured && (
                <div className="absolute top-0 right-0">
                  <div className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-lg">
                    Top
                  </div>
                </div>
              )}

              <CardHeader className="p-6 pb-2">
                <div className="flex flex-col gap-1">
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-emerald-500 transition-colors">
                    Pack {pack.label}
                  </span>
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black tracking-tighter">{pack.credits}</span>
                    <span className="text-xs font-bold text-zinc-500 flex items-center gap-0.5">
                      <Coins className="h-3 w-3" />
                      Crédits
                    </span>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-6 pt-2 space-y-6">
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{pack.price}€</span>
                    <span className="text-[10px] text-zinc-500 font-medium lowercase">paiement unique</span>
                  </div>
                  {pack.savings && (
                    <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full w-fit">
                      -{pack.savings}
                    </span>
                  )}
                </div>

                <Button
                  onClick={() => handleBuyPack(pack.id)}
                  disabled={loading}
                  className={cn(
                    "w-full h-11 font-black transition-all group-hover:scale-[1.02] active:scale-95",
                    pack.featured
                      ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                      : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-lg shadow-zinc-500/10 dark:shadow-none"
                  )}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <span className="flex items-center gap-2">
                      Prendre ce pack
                      <Sparkles className="h-3.5 w-3.5 fill-current" />
                    </span>
                  )}
                </Button>
              </CardContent>

              <div className="absolute -bottom-6 -right-6 h-20 w-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500" />
            </Card>
          ))}
        </div>
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
              <CardDescription className="mt-1 font-medium italic text-emerald-600 dark:text-emerald-400">Lancez votre prochain chef-d'œuvre</CardDescription>
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
            <Button variant="ghost" className="w-full h-11 rounded-xl text-zinc-400 cursor-not-allowed" disabled>Bientôt disponible</Button>
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
        <Card className="border-zinc-200/60 dark:border-zinc-800/60 shadow-lg shadow-zinc-200/10 dark:shadow-none overflow-hidden">
          <div className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {recentVideos.map((v) => {
              const s = statusConfig[v.status];
              return (
                <div key={v.id} className="flex items-center gap-4 p-5 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors group cursor-pointer">
                  <div className="h-12 w-20 rounded-lg bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-200/50 dark:border-zinc-700/50 group-hover:border-emerald-500/30 transition-colors overflow-hidden relative">
                    <Play className="h-5 w-5 text-zinc-400 group-hover:text-emerald-500 transition-colors z-10" />
                    <div className="absolute inset-0 bg-emerald-500/0 group-hover:bg-emerald-500/5 transition-colors" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-zinc-900 dark:text-zinc-50 truncate group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">{v.title}</p>
                    <p className="text-xs text-zinc-500 font-medium flex items-center gap-2 mt-0.5">
                      <span className="px-1.5 py-0.5 bg-zinc-100 dark:bg-zinc-800 rounded uppercase font-black text-[9px] tracking-widest">{v.genre}</span>
                      <span>•</span>
                      <span>{v.duration}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> {v.date}</span>
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-full shrink-0 border ${s.className}`}>
                      {s.label}
                    </span>
                    <button className="h-8 w-8 rounded-full flex items-center justify-center text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shrink-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>
    </div>
  );
}
