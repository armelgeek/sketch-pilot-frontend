import { steps } from "./data";
import { ArrowRight } from "lucide-react";

export function HowItWorksSection() {
  return (
    <section className="relative py-24 bg-white dark:bg-zinc-950 overflow-hidden border-y border-zinc-200/60 dark:border-zinc-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
            La magie en <span className="text-emerald-600 dark:text-emerald-400">3 étapes</span>
          </h2>
          <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
            De l&apos;idée à la vidéo finale, découvrez le processus fluide et puissant de Sketch Pilot.
          </p>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-3 gap-12 lg:gap-20">
          {/* Connection Lines (Desktop) */}
          <div className="absolute top-1/4 left-0 w-full h-px bg-gradient-to-r from-transparent via-zinc-200 dark:via-zinc-800 to-transparent hidden md:block -z-10" />

          {steps.map((s, i) => (
            <div key={s.n} className="group relative flex flex-col items-center text-center">
              <div className="relative mb-8">
                <div className="absolute -inset-4 bg-emerald-500/10 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="relative h-20 w-20 rounded-3xl bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-3xl font-black text-zinc-900 dark:text-zinc-50 shadow-xl transition-all group-hover:border-emerald-500 group-hover:-translate-y-2">
                  {s.n}
                  {i < steps.length - 1 && (
                    <div className="absolute -right-10 top-1/2 -translate-y-1/2 hidden lg:block text-zinc-200 dark:text-zinc-800">
                      <ArrowRight className="h-6 w-6" />
                    </div>
                  )}
                </div>
              </div>

              <h3 className="text-xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mb-3">
                {s.title}
              </h3>

              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-[240px]">
                {s.desc}
              </p>

              <div className="mt-6 flex h-1 w-12 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
                <div className="h-full w-0 bg-emerald-500 group-hover:w-full transition-all duration-700" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
