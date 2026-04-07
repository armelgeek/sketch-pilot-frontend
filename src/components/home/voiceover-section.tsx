"use client";

import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

const languages = [
    { name: "English", sub: "2.4B speakers", flag: "🇺🇸", active: true },
    { name: "Français", sub: "320M speakers", flag: "🇫🇷", active: false },
    { name: "Español", sub: "600M speakers", flag: "🇪🇸", active: false },
    { name: "Português", sub: "260M speakers", flag: "🇧🇷", active: false },
];

const waveHeights = [
    [4, 9, 6, 11, 5],
    [6, 4, 9, 5, 7],
    [7, 4, 10, 6, 4],
    [5, 8, 4, 10, 6],
];

export function VoiceoverSection() {
    return (
        <section className="relative py-24 md:py-32 bg-white border-t border-zinc-100" id="voiceover">
            <div className="mx-auto max-w-5xl px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* Left */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-px w-5 bg-zinc-300" />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">
                                AI Voiceover
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-zinc-950 leading-[1.1] mb-4">
                            Your story,<br />
                            <span className="text-amber-500 bg-amber-100 px-1.5 rounded">every language.</span>
                        </h2>

                        <p className="text-[15px] text-zinc-500 leading-relaxed max-w-[300px] mb-7">
                            Expressive AI voices in the world's biggest YouTube markets. One script, global reach.
                        </p>

                        <Button
                            asChild
                            size="lg"
                            className="h-12 px-6 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white shadow-none transition-all group"
                        >
                            <Link href="/register">
                                Start generating
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>

                    {/* Right */}
                    <div className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <span className="text-sm font-bold text-zinc-900">Languages</span>
                            <span className="text-[11px] font-semibold text-zinc-500 bg-white border border-zinc-200 rounded-full px-3 py-1">
                                <strong className="text-zinc-900">4</strong> available
                            </span>
                        </div>

                        <div className="grid grid-cols-2 gap-2.5">
                            {languages.map((lang, i) => (
                                <div
                                    key={lang.name}
                                    className={`relative flex items-center gap-3 p-4 rounded-2xl border transition-colors cursor-pointer ${lang.active
                                        ? "bg-amber-50 border-amber-300"
                                        : "bg-white border-zinc-200 hover:border-zinc-300"
                                        }`}
                                >
                                    {lang.active && (
                                        <div className="absolute top-2.5 right-2.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                                    )}

                                    {/* Flag */}
                                    <div className="w-9 h-9 rounded-full bg-zinc-100 border border-black/5 flex items-center justify-center text-xl shrink-0">
                                        {lang.flag}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <span className="block text-[13px] font-bold text-zinc-900">{lang.name}</span>
                                        <span className="block text-[11px] text-zinc-400 font-medium mt-0.5">{lang.sub}</span>
                                    </div>

                                    {/* Wave */}
                                    <div className="flex items-center gap-0.5 h-3.5 shrink-0">
                                        {waveHeights[i].map((h, j) => (
                                            <div
                                                key={j}
                                                className={`w-[2.5px] rounded-full ${lang.active ? "bg-amber-400" : "bg-zinc-300"}`}
                                                style={{ height: `${h}px` }}
                                            />
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                </div>
            </div>
        </section>
    );
}