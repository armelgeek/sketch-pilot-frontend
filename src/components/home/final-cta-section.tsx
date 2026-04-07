"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FinalCTASection() {
  return (
    <section className="relative py-32 md:py-48 bg-white border-t border-zinc-100">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">

        {/* Eyebrow */}
        <p className="text-xs font-semibold tracking-[0.2em] uppercase text-zinc-400 mb-10">
          Ready when you are
        </p>

        {/* Headline */}
        <h2 className="text-5xl md:text-7xl font-extrabold text-zinc-950 leading-[1.05] tracking-tight mb-8 max-w-2xl">
          Start publishing.<br />
          Without showing<br />
          your face.
        </h2>

        {/* Sub */}
        <p className="text-lg text-zinc-500 max-w-md mb-14 leading-relaxed">
          Join thousands of creators who publish consistently with AI — no camera, no editing skills, no guesswork.
        </p>

        {/* CTA */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          <Link
            href="/register"
            className="inline-flex items-center gap-3 px-8 py-4 bg-zinc-950 text-white text-sm font-semibold rounded-full hover:bg-zinc-800 transition-colors group"
          >
            Start creating now
            <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
          </Link>

          <span className="flex items-center gap-2 text-sm text-zinc-400">
            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
            Quality-first AI Video Studio
          </span>
        </div>

      </div>
    </section>
  );
}