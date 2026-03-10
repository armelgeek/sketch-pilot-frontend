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
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
      <div className="mb-4">
        <Badge className="bg-zinc-100 text-zinc-900 dark:bg-zinc-800 dark:text-zinc-50">
          Nouveau — Vidéos Long-Form jusqu&apos;à 60 min
        </Badge>
      </div>
      <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl max-w-4xl mx-auto">
        L&apos;IA qui dessine vos histoires,{" "}
        <span className="text-zinc-600 dark:text-zinc-400">scène après scène.</span>
      </h1>
      <p className="mt-6 max-w-2xl mx-auto text-lg text-zinc-600 dark:text-zinc-400">
        Créez des vidéos whiteboard captivantes avec des personnages cohérents, une narration
        fluide et des styles artistiques variés — en quelques minutes.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button size="lg" asChild>
          <Link href={isAuthenticated ? "/generate" : "/pricing"}>
            {isAuthenticated ? "Créer une vidéo" : "Démarrer mon projet"} <ChevronRight className="h-4 w-4" />
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <a href="#gallery">Voir les résultats</a>
        </Button>
      </div>

      <div className="mt-16 mx-auto max-w-4xl aspect-video rounded-2xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
        <div className="flex flex-col items-center gap-3 text-zinc-500 dark:text-zinc-400">
          <div className="rounded-full bg-zinc-300 dark:bg-zinc-700 p-5">
            <Play className="h-10 w-10" />
          </div>
          <span className="text-sm font-medium">Démo — Sketch Pilot en action</span>
        </div>
      </div>
    </section>
  );
}
