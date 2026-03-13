"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";
import { Play } from "lucide-react";

export function LiveDemoSection() {
  const [demoText, setDemoText] = useState("");

  return (
    <section className="relative py-24 bg-zinc-50 dark:bg-zinc-950 overflow-hidden border-y border-zinc-200/60 dark:border-zinc-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Input Area */}
          <div className="space-y-10">
            <div className="space-y-4">
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
                L&apos;IA qui comprend <br />
                <span className="text-emerald-600 dark:text-emerald-400">vos idées les plus folles</span>
              </h2>
              <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium leading-relaxed">
                Décrivez votre projet en quelques mots. Sketch Pilot s&apos;occupe du storyboard,
                du style et de la mise en scène.
              </p>
            </div>

            <div className="space-y-6">
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/20 to-transparent rounded-2xl blur-xl opacity-0 group-focus-within:opacity-100 transition-opacity" />
                <textarea
                  placeholder="Ex : Un tutoriel sur la physique quantique expliqué par un chat astronaute..."
                  value={demoText}
                  onChange={(e) => setDemoText(e.target.value)}
                  className="relative w-full min-h-[140px] p-6 text-lg font-bold bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 rounded-2xl focus:border-emerald-500 dark:focus:border-emerald-500/50 outline-none transition-all resize-none shadow-sm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <Select>
                  <SelectTrigger className="h-12 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl font-bold bg-white dark:bg-zinc-900">
                    <SelectValue placeholder="Genre" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                    <SelectItem value="tech">Technologie</SelectItem>
                    <SelectItem value="edu">Éducation</SelectItem>
                    <SelectItem value="story">Narration</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger className="h-12 border-2 border-zinc-200 dark:border-zinc-800 rounded-xl font-bold bg-white dark:bg-zinc-900">
                    <SelectValue placeholder="Style" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-800">
                    <SelectItem value="classic">Whiteboard Classique</SelectItem>
                    <SelectItem value="comic">Bande Dessinée</SelectItem>
                    <SelectItem value="minimal">Minimaliste</SelectItem>
                  </SelectContent>
                </Select>
                <Button asChild className="h-12 rounded-xl bg-zinc-900 dark:bg-emerald-600 dark:hover:bg-emerald-500 text-white font-black shadow-lg shadow-black/10 transition-all hover:scale-[1.02] active:scale-95">
                  <Link href="/register">Générer le concept</Link>
                </Button>
              </div>
            </div>
          </div>

          {/* Right: Preview Area */}
          <div className="relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none" />

            <div className="relative rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl p-8 shadow-2xl">
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                    <Play className="h-5 w-5 text-emerald-600 dark:text-emerald-400 fill-emerald-500/10" />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Storyboard</p>
                    <p className="text-sm font-bold">Aperçu en temps réel</p>
                  </div>
                </div>
                <div className="h-8 w-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center">
                  <span className="text-[10px] font-black text-zinc-400">?</span>
                </div>
              </div>

              <div className="space-y-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex gap-4 items-start group">
                    <div className="h-20 w-32 shrink-0 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 overflow-hidden flex items-center justify-center transition-transform group-hover:scale-105">
                      <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Scène {i}</span>
                    </div>
                    <div className="space-y-2 py-1">
                      <div className="h-2 w-32 bg-zinc-200 dark:bg-zinc-800 rounded-full" />
                      <div className="h-2 w-48 bg-zinc-100 dark:bg-zinc-900 rounded-full" />
                      <div className="h-2 w-24 bg-zinc-100 dark:bg-zinc-900 rounded-full" />
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10 text-center">
                <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                  Inscrivez-vous pour transformer ce storyboard en vidéo complète
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
