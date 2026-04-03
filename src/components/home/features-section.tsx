import { Zap, ArrowRight } from "lucide-react";
import { features } from "./data";

export function FeaturesSection() {
  return (
    <section className="relative py-24 md:py-32 bg-white border-t border-zinc-100" id="features">
      <div className="mx-auto max-w-6xl px-6 lg:px-8">

        {/* Header */}
        <div className="max-w-xl mb-16 md:mb-20 animate-in fade-in slide-in-from-bottom-8 duration-700">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-100 mb-6">
            <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-amber-600">
              Pourquoi Sketch Pilot
            </p>
          </div>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-zinc-950 leading-[1.05]">
            Tout ce dont vous <br className="hidden md:block" />
            <span className="text-amber-500">avez besoin.</span>
          </h2>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-[1px] bg-zinc-200/60 rounded-3xl overflow-hidden shadow-sm border border-zinc-200/60 transition-all duration-500 hover:shadow-xl hover:shadow-amber-500/5">
          {features.map((f, i) => (
            <div
              key={f.title}
              className="group relative bg-white p-8 flex flex-col hover:bg-[linear-gradient(to_bottom_right,#ffffff,#fafafa)] transition-all duration-300 z-10 hover:z-20 animate-in fade-in zoom-in-95 fill-mode-both"
              style={{ animationDelay: `${150 * (i + 1)}ms`, animationDuration: '700ms' }}
            >
              {/* Icon Container */}
              <div className="w-14 h-14 mb-8 rounded-2xl bg-zinc-50 border border-zinc-100 flex items-center justify-center text-zinc-900 transition-all duration-300 group-hover:scale-110 group-hover:bg-amber-50 group-hover:border-amber-200 group-hover:text-amber-600 group-hover:shadow-sm">
                <div className="[&>svg]:w-6 [&>svg]:h-6">
                  {f.icon}
                </div>
              </div>

              {/* Text Content */}
              <div className="flex-1 mb-8">
                <h3 className="text-xl font-bold text-zinc-950 mb-3 tracking-tight transition-colors duration-300 group-hover:text-amber-600">
                  {f.title}
                </h3>
                <p className="text-[15px] font-medium text-zinc-500 leading-relaxed group-hover:text-zinc-600 transition-colors duration-300">
                  {f.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}