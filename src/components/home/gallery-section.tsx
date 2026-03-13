import { useState } from "react";
import { Play, Filter } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { mockVideos } from "./data";

const genres = ["Tous", "Éducatif", "Tech", "Biographie", "Tutoriel", "Science", "Business"];

export function GallerySection() {
  const [activeGenre, setActiveGenre] = useState("Tous");

  const filteredVideos =
    activeGenre === "Tous"
      ? mockVideos
      : mockVideos.filter((v) => v.genre === activeGenre);

  return (
    <section id="gallery" className="relative py-24 bg-zinc-50 dark:bg-zinc-950 overflow-hidden border-y border-zinc-200/60 dark:border-zinc-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
          <div className="space-y-4">
            <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
              Propulsé par <br />
              <span className="text-emerald-600 dark:text-emerald-400">Sketch Pilot Engine</span>
            </h2>
            <p className="text-lg text-zinc-500 dark:text-zinc-400 font-medium max-w-xl">
              Explorez les créations générées par nos utilisateurs. 100% IA, 100% professionnel.
            </p>
          </div>

          <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm overflow-x-auto no-scrollbar">
            {genres.map((g) => (
              <button
                key={g}
                onClick={() => setActiveGenre(g)}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap",
                  activeGenre === g
                    ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20 scale-105"
                    : "text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                )}
              >
                {g}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredVideos.map((v) => (
            <div
              key={v.id}
              className="group relative flex flex-col rounded-[2rem] overflow-hidden border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 transition-all duration-500 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-2"
            >
              <div className="relative aspect-video bg-zinc-100 dark:bg-zinc-950 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                <div className="h-full w-full flex items-center justify-center transition-transform duration-700 group-hover:scale-110">
                  <Play className="h-12 w-12 text-zinc-300 dark:text-zinc-700 group-hover:text-emerald-500 transition-colors" />
                </div>
                <div className="absolute bottom-4 right-4 px-2 py-1 rounded-lg bg-black/60 backdrop-blur-md text-[10px] font-black text-white tracking-widest">
                  {v.duration}
                </div>
              </div>

              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-50 truncate tracking-tight mb-1">
                      {v.title}
                    </h3>
                    <div className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                      <p className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                        {v.genre}
                      </p>
                    </div>
                  </div>
                  <button className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-800 text-zinc-900 dark:text-white transition-all hover:bg-emerald-600 hover:text-white group-hover:scale-110">
                    <Play className="h-4 w-4 fill-current" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
