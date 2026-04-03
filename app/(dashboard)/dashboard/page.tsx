"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus, Video, ArrowRight, Sparkles, UserSquare2, Coins, ChevronRight,
  TrendingUp, CheckCircle2, Clock, AlertCircle
} from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell
} from "recharts";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader } from "@/src/components/ui/card";
import { useSession } from "@/src/lib/auth-client";
import { videosService, type Video as ApiVideo } from "@/src/services/videos-service";
import { useSubscriptionManager } from "@/src/hooks/use-subscription-manager";
import { VideoCard } from "@/src/components/organisms/video-card";
import { useAdminModels } from "@/src/app/admin/hooks/use-admin-data";

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { subscriptionStatus, isLoading: subLoading } = useSubscriptionManager();

  const [allVideos, setAllVideos] = useState<ApiVideo[]>([]);
  const [videosLoading, setVideosLoading] = useState(true);
  const { data: modelsData, isLoading: modelsLoading } = useAdminModels();
  const models: any[] = modelsData?.data || [];

  const firstName = session?.user?.name?.split(" ")[0] || "là";

  useEffect(() => {
    videosService.getAll()
      .then((all) => setAllVideos(all))
      .catch(() => {})
      .finally(() => setVideosLoading(false));
  }, []);

  const recentVideos = allVideos.slice(0, 3);
  const completedCount = allVideos.filter(v => v.status === "completed").length;
  const processingCount = allVideos.filter(v => v.status === "processing" || v.status === "queued").length;
  const failedCount = allVideos.filter(v => v.status === "failed").length;

  /* Build last-7-days bar chart data */
  const activityData = useMemo(() => {
    const days: { label: string; total: number; completed: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dayKey = d.toISOString().slice(0, 10);
      const label = d.toLocaleDateString("fr-FR", { weekday: "short" });
      const dayVideos = allVideos.filter((v) => {
        const created = v.createdAt || v.created_at || "";
        return created.startsWith(dayKey);
      });
      days.push({
        label,
        total: dayVideos.length,
        completed: dayVideos.filter((v) => v.status === "completed").length,
      });
    }
    return days;
  }, [allVideos]);

  const remainingCredits = subscriptionStatus?.remainingCredits ?? 0;
  const totalCredits = subscriptionStatus?.totalCredits ?? 0;
  const creditPct = totalCredits > 0 ? Math.round((remainingCredits / totalCredits) * 100) : 0;

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
        <StatCard
          label="Total vidéos"
          value={videosLoading ? "—" : allVideos.length.toString()}
          icon={<Video className="h-4 w-4" />}
          href="/videos"
          accent="zinc"
        />
        <StatCard
          label="Terminées"
          value={videosLoading ? "—" : completedCount.toString()}
          icon={<CheckCircle2 className="h-4 w-4" />}
          href="/videos"
          accent="emerald"
        />
        <StatCard
          label="Crédits restants"
          value={subLoading ? "—" : remainingCredits.toString()}
          icon={<Coins className="h-4 w-4" />}
          href="/subscription"
          accent="amber"
          sub={subLoading || totalCredits === 0 ? undefined : `${creditPct}% restants`}
        />
        <StatCard
          label="Personnages"
          value={modelsLoading ? "—" : (modelsData?.total ?? 0).toString()}
          icon={<UserSquare2 className="h-4 w-4" />}
          href="/admin/models"
          accent="violet"
        />
      </div>

      {/* Activity Chart + Status breakdown */}
      {!videosLoading && allVideos.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Bar chart */}
          <Card className="lg:col-span-2 bg-white border border-zinc-100 rounded-2xl shadow-none">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Activité — 7 derniers jours</span>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={activityData} barSize={24} margin={{ top: 4, right: 0, left: -28, bottom: 0 }}>
                  <XAxis dataKey="label" tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: "#a1a1aa" }} axisLine={false} tickLine={false} />
                  <Tooltip
                    cursor={{ fill: "#f4f4f5" }}
                    contentStyle={{ border: "none", borderRadius: 12, boxShadow: "0 4px 24px rgba(0,0,0,0.08)", fontSize: 12 }}
                    formatter={(value, name) => [value, name === "total" ? "Total" : "Terminées"]}
                  />
                  <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                    {activityData.map((_, idx) => (
                      <Cell key={idx} fill={activityData[idx].total > 0 ? "#18181b" : "#e4e4e7"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Status breakdown */}
          <Card className="bg-white border border-zinc-100 rounded-2xl shadow-none">
            <CardHeader className="pb-2 pt-5 px-5">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-zinc-400" />
                <span className="text-xs font-black uppercase tracking-widest text-zinc-400">Répartition</span>
              </div>
            </CardHeader>
            <CardContent className="px-5 pb-5 space-y-3">
              <StatusRow icon={<CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />} label="Terminées" count={completedCount} total={allVideos.length} color="bg-emerald-500" />
              <StatusRow icon={<Clock className="h-3.5 w-3.5 text-blue-500" />} label="En cours" count={processingCount} total={allVideos.length} color="bg-blue-500" />
              <StatusRow icon={<AlertCircle className="h-3.5 w-3.5 text-red-400" />} label="Échecs" count={failedCount} total={allVideos.length} color="bg-red-400" />
              <StatusRow
                icon={<Video className="h-3.5 w-3.5 text-zinc-400" />}
                label="Brouillons"
                count={allVideos.length - completedCount - processingCount - failedCount}
                total={allVideos.length}
                color="bg-zinc-300"
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Credits usage bar */}
      {!subLoading && totalCredits > 0 && (
        <Card className="bg-white border border-zinc-100 rounded-2xl shadow-none">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Utilisation des crédits</p>
                <p className="text-sm font-bold text-zinc-700 mt-0.5">
                  {remainingCredits} / {totalCredits} crédits disponibles
                  {subscriptionStatus?.planName && (
                    <span className="ml-2 text-xs font-semibold text-zinc-400">— {subscriptionStatus.planName}</span>
                  )}
                </p>
              </div>
              <Link href="/subscription" className="text-xs font-semibold text-zinc-400 hover:text-zinc-700 flex items-center gap-1 transition-colors">
                Gérer <ChevronRight className="h-3.5 w-3.5" />
              </Link>
            </div>
            <div className="h-2.5 w-full bg-zinc-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${creditPct}%`,
                  background: creditPct > 50 ? "#10b981" : creditPct > 20 ? "#f59e0b" : "#ef4444",
                }}
              />
            </div>
          </CardContent>
        </Card>
      )}

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
          <h2 className="text-xs font-black uppercase tracking-widest text-zinc-400">Vidéos récentes</h2>
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

type Accent = "zinc" | "emerald" | "amber" | "violet";

const accentMap: Record<Accent, { bg: string; text: string; iconBg: string }> = {
  zinc:    { bg: "bg-zinc-50",    text: "text-zinc-500",   iconBg: "bg-zinc-100" },
  emerald: { bg: "bg-emerald-50", text: "text-emerald-600", iconBg: "bg-emerald-100" },
  amber:   { bg: "bg-amber-50",   text: "text-amber-600",  iconBg: "bg-amber-100" },
  violet:  { bg: "bg-violet-50",  text: "text-violet-600", iconBg: "bg-violet-100" },
};

function StatCard({
  label, value, icon, href, accent = "zinc", sub,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  href: string;
  accent?: Accent;
  sub?: string;
}) {
  const a = accentMap[accent];
  return (
    <Link href={href} className="block group">
      <Card className={`${a.bg} border-0 rounded-2xl shadow-none hover:shadow-sm transition-all`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className={`h-8 w-8 rounded-xl ${a.iconBg} flex items-center justify-center ${a.text}`}>
              {icon}
            </div>
            <ChevronRight className="h-3.5 w-3.5 text-zinc-300 group-hover:text-zinc-500 transition-colors" />
          </div>
          <div className="text-2xl font-black tracking-tight text-zinc-900">{value}</div>
          <p className="text-xs text-zinc-400 font-medium mt-0.5">{label}</p>
          {sub && <p className={`text-[10px] font-semibold mt-1 ${a.text}`}>{sub}</p>}
        </CardContent>
      </Card>
    </Link>
  );
}

function StatusRow({
  icon, label, count, total, color,
}: {
  icon: React.ReactNode;
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-xs font-semibold text-zinc-600">{label}</span>
        </div>
        <span className="text-xs font-black text-zinc-700">{count}</span>
      </div>
      <div className="h-1.5 w-full bg-zinc-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
