import { features } from "./data";

export function FeaturesSection() {
  return (
    <section className="relative py-24 bg-white dark:bg-zinc-950 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
            Pourquoi Sketch Pilot ?
          </h2>
          <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
            La première plateforme au monde conçue spécifiquement pour créer des vidéos
            whiteboard professionnelles de haute qualité, sans limite de créativité.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative p-8 rounded-3xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900/50 hover:border-emerald-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/5 hover:-translate-y-1"
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <span className="text-6xl font-black italic">{i + 1}</span>
              </div>

              <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-500 shadow-sm">
                {f.icon}
              </div>

              <h3 className="text-xl font-black tracking-tight text-zinc-900 dark:text-zinc-50 mb-3">
                {f.title}
              </h3>

              <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400 leading-relaxed">
                {f.desc}
              </p>

              <div className="mt-6 flex items-center gap-2 text-emerald-600 dark:text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <span className="text-xs font-black uppercase tracking-widest">En savoir plus</span>
                <div className="h-px w-8 bg-current" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
