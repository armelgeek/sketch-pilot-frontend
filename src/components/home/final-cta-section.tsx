"use client";

import Link from "next/link";
import { Button } from "@/src/components/ui/button";

interface FinalCTASectionProps {
  isAuthenticated?: boolean;
}

export function FinalCTASection({ isAuthenticated }: FinalCTASectionProps) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 text-center">
      <h2 className="text-3xl font-extrabold sm:text-4xl">
        Prêt à créer votre première vidéo ?
      </h2>
      <p className="mt-4 text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
        Rejoignez 10 000+ créateurs qui utilisent Sketch Pilot pour produire du contenu engageant.
      </p>
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
        <Button size="lg" asChild>
          <Link href={isAuthenticated ? "/generate" : "/register"}>
            {isAuthenticated ? "Créer une vidéo maintenant" : "Commencer gratuitement"}
          </Link>
        </Button>
        <Button size="lg" variant="outline" asChild>
          <Link href={isAuthenticated ? "/dashboard" : "/pricing"}>
            {isAuthenticated ? "Aller au tableau de bord" : "Voir les tarifs"}
          </Link>
        </Button>
      </div>
    </section>
  );
}
