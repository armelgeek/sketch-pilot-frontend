"use client";

import { useState } from "react";
import Link from "next/link";
import { Input } from "@/src/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Button } from "@/src/components/ui/button";

export function LiveDemoSection() {
  const [demoText, setDemoText] = useState("");

  return (
    <section className="bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold">Essayez maintenant</h2>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Entrez votre idée et voyez la magie opérer
          </p>
        </div>
        <div className="max-w-3xl mx-auto space-y-4">
          <Input
            placeholder="Ex : Expliquez comment fonctionne l'IA en 5 minutes..."
            value={demoText}
            onChange={(e) => setDemoText(e.target.value)}
            className="h-12 text-base"
          />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Genre" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="edu">Éducatif</SelectItem>
                <SelectItem value="tech">Tech</SelectItem>
                <SelectItem value="bio">Biographie</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="explainer">Explainer</SelectItem>
                <SelectItem value="story">Story</SelectItem>
                <SelectItem value="tutorial">Tutorial</SelectItem>
              </SelectContent>
            </Select>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
                <SelectItem value="es">Español</SelectItem>
              </SelectContent>
            </Select>
            <Button asChild className="w-full">
              <Link href="/register">Générer un exemple</Link>
            </Button>
          </div>
          <div className="mt-6 rounded-xl bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-6">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center">
              Aperçu du storyboard — Inscrivez-vous pour générer votre vidéo
            </p>
            <div className="mt-4 grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="aspect-video rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-xs text-zinc-400"
                >
                  Scène {i}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
