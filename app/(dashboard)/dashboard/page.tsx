"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus, Video, ArrowRight, Sparkles, UserSquare2, Coins, ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { useSession } from "@/src/lib/auth-client";
import { videosService, type Video as ApiVideo } from "@/src/services/videos-service";
import { useSubscriptionManager } from "@/src/hooks/use-subscription-manager";
import { VideoCard } from "@/src/components/organisms/video-card";
import { useAdminModels } from "@/src/app/admin/hooks/use-admin-data";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { subscriptionStatus, isLoading: subLoading } = useSubscriptionManager();

  const [recentVideos, setRecentVideos] = useState<ApiVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const { data: modelsData, isLoading: modelsLoading } = useAdminModels();
  const models: any[] = modelsData?.data || [];

  const firstName = session?.user?.name?.split(" ")[0] || "là";

  useEffect(() => {
    videosService.getAll()
      .then((all) => setRecentVideos(all.slice(0, 3)))
      .catch(() => {})
      .finally(() => setVideosLoading(false));
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-zinc-900">
            Bonjour, {firstName} 👋
          </h1>
          <p className="text-sm text-zinc-500 mt-0.5">Voici un aperçu de votre activité.</p>
        </div>
        <Button
          onClick={() => router.push("/generate")}
          className="bg-zinc-900 hover:bg-zinc-700 text-white rounded-xl h-10 px-5 font-bold text-sm shadow-sm"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nouvelle vidéo
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Vidéos" value={videosLoading ? "—" : recentVideos.length.toString()} icon={<Video className="h-4 w-4" />} href="/videos" />
        <StatCard label="Terminées" value={videosLoading ? "—" : recentVideos.filter(v => v.status === "completed").length.toString()} icon={<Sparkles className="h-4 w-4" />} href="/videos" />
        <StatCard label="Crédits" value={subLoading ? "—" : (subscriptionStatus?.remainingCredits ?? 0).toString()} icon={<Coins className="h-4 w-4" />} href="/subscription" />
        <StatCard label="Personnages" value={modelsLoading ? "—" : (modelsData?.total ?? 0).toString()} icon={<UserSquare2 className="h-4 w-4" />} href="/admin/models" />
      </div>

      {/* Characters */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Personnages</h2>
          <Link href="/admin/models" className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 flex items-center gap-1 transition-colors">
            Voir tout <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {modelsLoading ? (
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            {[1, 2, 3, 4].map(i => <div key={i} className="aspect-square rounded-2xl bg-zinc-100 animate-pulse" />)}
          </div>
        ) : models.length === 0 ? (
          <div className="py-8 text-center border-2 border-dashed border-zinc-100 rounded-2xl">
            <p className="text-sm text-zinc-400 mb-3">Aucun personnage créé</p>
            <Button variant="outline" size="sm" className="rounded-xl" onClick={() => router.push("/admin/models/new")}>
              <Plus className="h-3.5 w-3.5 mr-1.5" /> Créer
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-4 sm:grid-cols-6 lg:grid-cols-8 gap-3">
            {models.slice(0, 8).map((model: any) => (
              <Link key={model.id} href={`/admin/models/${model.id}`} className="group relative aspect-square rounded-2xl overflow-hidden ring-1 ring-zinc-200 hover:ring-2 hover:ring-zinc-900 transition-all">
                <img src={model.images?.[0]} alt={model.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
                <div className="absolute inset-x-0 bottom-0 p-2 bg-gradient-to-t from-black/70 to-transparent">
                  <p className="text-[9px] font-black text-white truncate">{model.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Recent videos */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Récents</h2>
          <Link href="/videos" className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 flex items-center gap-1 transition-colors">
            Voir tout <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {videosLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[1, 2, 3].map(i => <div key={i} className="aspect-video rounded-2xl bg-zinc-100 animate-pulse" />)}
          </div>
        ) : recentVideos.length === 0 ? (
          <Card className="bg-white border border-zinc-100 rounded-2xl shadow-none">
            <CardContent className="py-16 flex flex-col items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-zinc-100 flex items-center justify-center">
                <Video className="h-5 w-5 text-zinc-400" />
              </div>
              <p className="text-sm text-zinc-500">Aucune vidéo générée pour l&apos;instant.</p>
              <Button asChild className="bg-zinc-900 hover:bg-zinc-700 text-white rounded-xl font-bold text-sm">
                <Link href="/generate">Créer ma première vidéo</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recentVideos.map(video => <VideoCard key={video.id} video={video} />)}
          </div>
        )}
      </section>

      {/* Upgrade CTA */}
      {(!subscriptionStatus?.planName || subscriptionStatus.planName === "Free") && (
        <div className="flex items-center justify-between p-5 bg-zinc-900 rounded-2xl text-white">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-zinc-400 mb-1">Passez à Pro</p>
            <p className="font-bold">Débloquez toutes les fonctionnalités IA</p>
          </div>
          <Button asChild className="bg-emerald-500 hover:bg-emerald-400 text-white rounded-xl font-black h-9 px-5 text-sm">
            <Link href="/subscription">
              Upgrade <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}

function StatCard({ label, value, icon, href }: { label: string; value: string; icon: React.ReactNode; href: string }) {
  return (
    <Link href={href} className="block group">
      <Card className="bg-white border border-zinc-100 rounded-2xl shadow-none hover:border-zinc-300 transition-colors">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="h-8 w-8 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:text-zinc-700 transition-colors">
              {icon}
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
          </div>
          <div className="text-2xl font-black tracking-tight text-zinc-900">{value}</div>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">{label}</p>
        </CardContent>
      </Card>
    </Link>
  );
}
