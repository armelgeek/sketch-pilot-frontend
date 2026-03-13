"use client";

import Link from "next/link";
import { ChevronRight, Badge } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Play } from "lucide-react";

interface HeroSectionProps {
  isAuthenticated?: boolean;
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <section className="relative pt-32 pb-20 md:pt-48 md:pb-32 overflow-hidden">
      {/* Premium Background Elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute top-1/4 right-1/4 w-[400px] h-[400px] bg-emerald-600/5 rounded-full blur-[100px] animate-float" />
        <div className="absolute bottom-0 left-1/3 w-[600px] h-[300px] bg-zinc-200/50 dark:bg-emerald-900/10 rounded-full blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 relative">
        <div className="flex flex-col items-center text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          {/* Announcement Badge */}
          <div className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 border border-zinc-200/60 bg-white/50 dark:border-zinc-800/60 dark:bg-zinc-950/50 backdrop-blur-sm shadow-sm scale-95 hover:scale-100 transition-transform duration-500 cursor-default">
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 dark:text-zinc-400">
              Nouveau — Vidéos Long-Form 60 min
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50 leading-[0.9] md:leading-[0.85]">
            L&apos;IA qui dessine<br />
            <span className="text-emerald-600 dark:text-emerald-400 relative inline-block">
              vos histoires
              <span className="absolute -bottom-1 left-0 w-full h-[6px] bg-emerald-500/20 -skew-x-12" />
            </span>
          </h1>

          {/* Subtext */}
          <p className="mt-6 max-w-2xl mx-auto text-lg md:text-xl text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
            Créez des vidéos whiteboard captivantes avec des personnages cohérents
            et une narration fluide — <span className="text-zinc-900 dark:text-zinc-200 font-bold">en quelques minutes seulement.</span>
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
            <Button
              size="lg"
              asChild
              className="h-14 px-10 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-lg transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-500/20 group"
            >
              <Link href={isAuthenticated ? "/generate" : "/register"}>
                {isAuthenticated ? "Créer une vidéo" : "Commencer gratuitement"}
                <ChevronRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-14 px-10 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 font-black text-lg hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-all active:scale-95"
            >
              <a href="#gallery">Voir nos créations</a>
            </Button>
          </div>

          {/* Video Placeholder / Player Frame */}
          <div className="mt-20 relative group w-full max-w-5xl mx-auto">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-zinc-500/20 rounded-[2.5rem] blur-2xl opacity-20 group-hover:opacity-40 transition-opacity duration-700" />
            <div className="relative rounded-[2rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-sm p-4 shadow-2xl">
              <div className="relative aspect-video rounded-2xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden flex items-center justify-center group/player shadow-inner">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />

                {/* Play Button */}
                <button className="z-10 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600/90 text-white shadow-2xl backdrop-blur-md transition-all group-hover/player:scale-110 group-hover/player:bg-emerald-500 active:scale-90">
                  <Play className="h-8 w-8 fill-current ml-1" />
                </button>

                {/* Fake UI Overlays */}
                <div className="absolute bottom-6 left-6 flex items-center gap-3">
                  <div className="h-2 w-24 rounded-full bg-white/20 overflow-hidden">
                    <div className="h-full w-1/3 bg-emerald-500" />
                  </div>
                  <span className="text-[10px] font-black text-white/50 tracking-widest uppercase">01:45 / 03:00</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
