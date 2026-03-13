"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";

interface FinalCTASectionProps {
  isAuthenticated?: boolean;
}

export function FinalCTASection({ isAuthenticated }: FinalCTASectionProps) {
  return (
    <section className="relative py-24 bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-[3rem] bg-zinc-900 dark:bg-zinc-100 overflow-hidden px-8 py-16 md:px-16 md:py-24 text-center group">
          {/* Background Glow */}
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-emerald-600/40 to-transparent opacity-50 group-hover:opacity-70 transition-opacity" />
          <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-emerald-500/20 rounded-full blur-[80px]" />

          <div className="relative space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <h2 className="text-4xl md:text-6xl font-black tracking-tighter text-white dark:text-zinc-900 leading-tight">
              Prêt à créer votre <br />
              <span className="text-emerald-400 dark:text-emerald-600">première vidéo ?</span>
            </h2>

            <p className="mt-4 text-zinc-400 dark:text-zinc-500 max-w-xl mx-auto text-lg font-medium">
              Rejoignez plus de 10 000 créateurs de contenu qui ont déjà dit adieu
              aux logiciels de montage complexes.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-5 pt-4">
              <Button
                size="lg"
                asChild
                className="h-14 px-10 rounded-2xl bg-white text-zinc-900 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800 font-black text-lg transition-all hover:scale-[1.05] active:scale-95 shadow-2xl"
              >
                <Link href={isAuthenticated ? "/generate" : "/register"}>
                  {isAuthenticated ? "Créer une vidéo" : "Commencer gratuitement"}
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="h-14 px-10 rounded-2xl border-white/20 text-white hover:bg-white/10 dark:border-zinc-900/20 dark:text-zinc-900 dark:hover:bg-zinc-900/5 font-black text-lg transition-all active:scale-95"
              >
                <Link href={isAuthenticated ? "/dashboard" : "/pricing"}>
                  {isAuthenticated ? "Tableau de bord" : "Voir les tarifs"}
                </Link>
              </Button>
            </div>

            <div className="pt-8 flex flex-col items-center gap-4">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-8 w-8 rounded-full border-2 border-zinc-900 dark:border-white bg-zinc-800 dark:bg-zinc-200 flex items-center justify-center text-[10px] font-black text-white dark:text-zinc-900">
                    {String.fromCharCode(64 + i)}
                  </div>
                ))}
                <div className="h-8 w-8 rounded-full border-2 border-zinc-900 dark:border-white bg-emerald-500 flex items-center justify-center text-[10px] font-black text-white">
                  +10k
                </div>
              </div>
              <p className="text-[10px] uppercase tracking-[0.2em] font-black text-zinc-500 dark:text-zinc-400">
                Déjà adopté par la communauté
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
