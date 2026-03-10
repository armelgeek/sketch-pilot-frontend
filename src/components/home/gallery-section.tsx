"use client";

import { useState } from "react";
import { Play } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { mockVideos } from "./data";

const genres = ["Tous", "Éducatif", "Tech", "Biographie", "Tutoriel", "Science", "Business"];

export function GallerySection() {
  const [activeGenre, setActiveGenre] = useState("Tous");

  const filteredVideos =
    activeGenre === "Tous"
      ? mockVideos
      : mockVideos.filter((v) => v.genre === activeGenre);

  return (
    <section id="gallery" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold">Exemples de vidéos</h2>
        <p className="mt-2 text-zinc-500 dark:text-zinc-400">Créées entièrement par Sketch Pilot</p>
      </div>
      <div className="flex flex-wrap gap-2 justify-center mb-8">
        {genres.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGenre(g)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              activeGenre === g
                ? "bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-50"
                : "border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-700 dark:text-zinc-400 dark:hover:bg-zinc-800"
            }`}
          >
            {g}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVideos.map((v) => (
          <Card key={v.id} className="overflow-hidden">
            <div className="aspect-video bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
              <Play className="h-10 w-10 text-zinc-400 dark:text-zinc-600" />
            </div>
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-sm">{v.title}</h3>
                  <p className="text-xs text-zinc-500 mt-1">{v.genre} • {v.duration}</p>
                </div>
                <Button size="sm" variant="outline">
                  Voir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
