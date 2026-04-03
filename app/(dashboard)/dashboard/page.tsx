"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Plus,
  Video,
  Play,
  Pencil,
  Clock,
  ArrowRight,
  Image as ImageIcon,
  Sparkles,
  UserSquare2,
  Coins,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
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

  useEffect(() => {
    // Fetch recent videos
    videosService.getAll()
      .then((all) => setRecentVideos(all.slice(0, 3)))
      .catch(() => { })
      .finally(() => setVideosLoading(false));
  }, []);

  return (
    <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">

      {/* Title & Description */}
      <div className="space-y-1">
        <h1 className="text-4xl font-black tracking-tight text-zinc-900">
          Dashboard
        </h1>
        <p className="text-zinc-500 font-medium">
          Aperçu de {session?.user?.name || "votre compte"}
        </p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Thumbnails"
          value={recentVideos.length.toString()}
          description="Total generated"
          icon={<ImageIcon className="h-5 w-5" />}
        />
        <StatCard
          title="Generations"
          value={recentVideos.filter(v => v.status === 'completed').length.toString()}
          description="All completed projects"
          icon={<Sparkles className="h-5 w-5" />}
        />
        <StatCard
          title="Credits"
          value={subLoading ? "..." : (subscriptionStatus?.remainingCredits ?? 0).toString()}
          description="Available"
          icon={<Coins className="h-5 w-5" />}
        />
        <StatCard
          title="Avatars"
          value={modelsLoading ? "..." : (modelsData?.total ?? 0).toString()}
          description="Your library"
          icon={<UserSquare2 className="h-5 w-5" />}
        />
      </div>

      {/* Your Persons Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight flex items-center gap-2">
            Your Persons
          </h2>
          <Link href="/admin/models" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {modelsLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="aspect-square rounded-2xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : !models || models.length === 0 ? (
          <div className="py-10 text-center bg-zinc-50 dark:bg-zinc-900/40 rounded-3xl border-2 border-dashed border-zinc-100 dark:border-zinc-800">
            <p className="text-zinc-400 font-medium text-sm">No personas created yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {models.slice(0, 6).map((model: any) => (
              <Link
                key={model.id}
                href={`/admin/models/${model.id}`}
                className="group relative aspect-square rounded-2xl overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800 hover:ring-2 hover:ring-black dark:hover:ring-white transition-all"
              >
                <img
                  src={model.images?.[0]}
                  alt={model.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/80 to-transparent">
                  <p className="text-[10px] font-black text-white truncate">{model.name}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Recent Generations Grid */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-black tracking-tight">Recent Generations</h2>
          <Link href="/videos" className="text-sm font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors flex items-center gap-1">
            View All <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        {videosLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="aspect-video rounded-3xl bg-zinc-100 dark:bg-zinc-900 animate-pulse" />
            ))}
          </div>
        ) : recentVideos.length === 0 ? (
          <Card className="bg-zinc-50/50 dark:bg-zinc-900/50 border-dashed border-2 border-zinc-200 dark:border-zinc-800 rounded-3xl">
            <CardContent className="py-20 flex flex-col items-center gap-4">
              <div className="h-16 w-16 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-400">
                <Video className="h-8 w-8" />
              </div>
              <p className="text-zinc-500 font-medium">No generations found</p>
              <Button asChild className="bg-black dark:bg-white text-white dark:text-black rounded-xl font-bold">
                <Link href="/generate">Create Thumbnail</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentVideos.map(video => (
              <VideoCard key={video.id} video={video} />
            ))}
          </div>
        )}
      </div>

      {/* Call to Action for Upgrade */}
      <Card className="bg-linear-to-r from-zinc-900 to-zinc-800 dark:from-zinc-100 dark:to-zinc-200 text-white dark:text-black overflow-hidden relative rounded-4xl border-none shadow-2xl">
        <CardContent className="p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-emerald-400 dark:text-emerald-600">
              <Sparkles className="h-5 w-5 fill-current" />
              <span className="text-sm font-black uppercase tracking-widest">Premium Content</span>
            </div>
            <h3 className="text-2xl font-black tracking-tight">Upgrade to Pro</h3>
            <p className="opacity-70 font-medium max-w-md">Unlock all features and boost your thumbnails with high-end AI generation.</p>
          </div>
          <Button asChild className="bg-emerald-500 hover:bg-emerald-400 text-white dark:text-zinc-50 rounded-2xl h-14 px-10 font-black text-lg shadow-xl shadow-emerald-500/20 active:scale-95 transition-all">
            <Link href="/subscription">Upgrade</Link>
          </Button>
        </CardContent>
        {/* Subtle pattern background */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-white to-transparent dark:from-black"></div>
        </div>
      </Card>

    </div>
  );
}

function StatCard({ title, value, description, icon }: { title: string; value: string; description: string; icon: React.ReactNode }) {
  return (
    <Card className="bg-white dark:bg-zinc-950/40 border-none shadow-sm hover:shadow-md transition-all group rounded-3xl overflow-hidden ring-1 ring-zinc-200 dark:ring-zinc-800">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="h-10 w-10 rounded-2xl bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors">
            {icon}
          </div>
          <span className="text-zinc-400">
            <ArrowRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-opacity" />
          </span>
        </div>
        <div className="space-y-1">
          <h3 className="text-zinc-500 dark:text-zinc-400 text-xs font-bold uppercase tracking-wider">{title}</h3>
          <div className="text-3xl font-black tracking-tighter">{value}</div>
          <p className="text-[10px] text-zinc-400 font-medium italic">{description}</p>
        </div>
      </CardContent>
    </Card>
  );
}
