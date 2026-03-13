import { testimonials } from "./data";
import { Quote } from "lucide-react";

export function TestimonialsSection() {
  return (
    <section className="relative py-24 bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
            Adopté par les meilleurs créateurs
          </h2>
          <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
            Découvrez pourquoi des milliers de professionnels font confiance à Sketch Pilot
            pour donner vie à leurs idées.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t) => (
            <div
              key={t.name}
              className="group relative flex flex-col p-8 rounded-[2.5rem] border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 transition-all duration-300 hover:border-emerald-500/50 hover:shadow-2xl hover:shadow-emerald-500/5"
            >
              <div className="absolute top-8 right-8 text-emerald-500/10 group-hover:text-emerald-500/20 transition-colors">
                <Quote className="h-12 w-12 fill-current" />
              </div>

              <p className="relative text-lg font-bold text-zinc-700 dark:text-zinc-300 leading-relaxed mb-8 flex-grow">
                &ldquo;{t.text}&rdquo;
              </p>

              <div className="flex items-center gap-4 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 dark:from-emerald-900 dark:to-emerald-800 flex items-center justify-center text-sm font-black text-emerald-700 dark:text-emerald-300 shadow-sm border-2 border-white dark:border-zinc-800">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-black text-sm text-zinc-900 dark:text-zinc-50 tracking-tight">{t.name}</p>
                  <p className="text-[11px] font-bold text-emerald-600 dark:text-emerald-500 uppercase tracking-widest">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
