"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, Play, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";

interface HeroSectionProps {
  isAuthenticated?: boolean;
}

export function HeroSection({ isAuthenticated }: HeroSectionProps) {
  return (
    <section className="relative pt-32  md:pt-42 pb-12 overflow-hidden mesh-gradient-premium grain-overlay">
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] -z-10 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06),transparent_70%)] blur-[120px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] -z-10 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.04),transparent_70%)] blur-[120px] pointer-events-none animate-pulse delay-1000" />

      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="flex flex-col items-center text-center">

          {/* Badge */}
          <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">
            <div className="inline-flex items-center gap-2.5 rounded-full px-5 py-2 glass-pill shadow-sm hover:border-amber-400/40 transition-all cursor-default">
              <div className="h-4 w-4  flex items-center justify-center">
                <Sparkles className="h-4 w-4 fill-amber-500 text-amber-500" />
              </div>
              <span className="font-bold  text-zinc-900">
                Free to use for 7 days
              </span>
            </div>
          </div>

          {/* Headline */}
          <h1 className="text-2xl md:text-4xl lg:text-[5rem] font-extrabold tracking-tightest leading-[0.9] text-zinc-950 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 max-w-5xl">
            Turn an idea into a YouTube <br className="hidden md:block" />
            <span className="text-amber-500">Faceless video.</span>
          </h1>
          <p className="max-w-2xl mx-auto text-lg text-zinc-500 font-medium leading-relaxed mb-12 animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-300">
            Sketch Pilot generates complete faceless videos — editorial script, natural voiceover, animated captions, and coherent images — ready to publish.
          </p>

          {/* CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-450">
            <Button
              size="lg"
              asChild
              className="h-16 px-12 rounded-2xl   hover:bg-amber-600 text-white font-extrabold text-xl transition-all hover:scale-[1.05] active:scale-95 group"
            >

              <Link href={isAuthenticated ? '/generate' : "/register"}>
                <div className="h-8 w-8  flex items-center justify-center">
                  <Sparkles className="h-4 w-4 fill-amber-500 text-amber-500" />
                </div>
                Start creating
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              asChild
              className="h-16 px-10 rounded-2xl  bg-white/40 backdrop-blur-xl hover:bg-white hover:border-zinc-300 text-zinc-950 font-bold text-lg transition-all active:scale-95"
            >
              <Link href="#" className="flex items-center gap-3">
                <div className="h-4 w-4 flex items-center justify-center">
                  <Play className="h-4 w-4 fill-amber-500 text-amber-500" />
                </div>
                See how it works
              </Link>
            </Button>
          </div>
          <div className="my-4">
            <p className="text-muted-foreground mt-4 text-sm">No credit card required. 5 free thumbnails included.</p>
          </div>

          {/* Visual Mockup - Simple Input to Video flow */}
          <div className="w-full rounded-xl mt-3 max-w-5xl mx-auto group animate-in fade-in zoom-in-95 duration-1000 delay-1000">
            <div className="relative border border-zinc-200 bg-white p-3 shadow-[0_20px_80px_-20px_rgba(0,0,0,0.08)] overflow-hidden">
              <div className="relative aspect-video  bg-zinc-950 overflow-hidden border border-zinc-100 flex items-center justify-center">
                {/* Simulated Subtitles overlay */}
                <div className="absolute z-20 flex flex-col items-center text-center max-w-lg mb-12">
                  <span className="text-4xl md:text-5xl font-heading font-bold text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] tracking-tight">
                    <span className="text-amber-400">3 habits</span> to hack
                  </span>
                  <span className="text-4xl md:text-5xl font-heading font-bold text-white drop-shadow-[0_4px_16px_rgba(0,0,0,0.8)] tracking-tight">
                    your brain this morning
                  </span>
                </div>

                <div className="h-16 w-16 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center cursor-pointer hover:bg-white/20 hover:scale-110 transition-all z-30 ring-1 ring-white/20">
                  <Play className="h-6 w-6 text-white ml-1 fill-white" />
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
