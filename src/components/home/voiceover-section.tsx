"use client";

import { ArrowRight, Play } from "lucide-react";
import Link from "next/link";
import { Button } from "@/src/components/ui/button";

const languages = [
    { name: "English", code: "us", active: true },
    { name: "Français", code: "fr", active: false },
    { name: "日本語", code: "jp", active: false },
    { name: "Español", code: "es", active: false },
    { name: "Deutsch", code: "de", active: false },
    { name: "Italiano", code: "it", active: false },
    { name: "Português", code: "br", active: false },
    { name: "Русский", code: "ru", active: false },
    { name: "العربية", code: "sa", active: false },
    { name: "한국어", code: "kr", active: false },
    { name: "Svenska", code: "se", active: false },
    { name: "Nederlands", code: "nl", active: false },
];

const getFlagEmoji = (countryCode: string) => {
    const codePoints = countryCode
        .toUpperCase()
        .split("")
        .map((char) => 127397 + char.charCodeAt(0));
    return String.fromCodePoint(...codePoints);
};

// Handle special flag mapping for languages vs typical regions
const flagMap: Record<string, string> = {
    us: "🇺🇸", fr: "🇫🇷", jp: "🇯🇵", es: "🇪🇸", de: "🇩🇪", it: "🇮🇹",
    br: "🇧🇷", ru: "🇷🇺", sa: "🇸🇦", kr: "🇰🇷", se: "🇸🇪", nl: "🇳🇱"
};

export function VoiceoverSection() {
    return (
        <section className="relative py-24 md:py-32 bg-white border-t border-zinc-100 overflow-hidden" id="voiceover">
            <div className="absolute top-0 left-1/4 w-[600px] h-[600px] -z-10 bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.06),transparent_70%)] blur-[120px] pointer-events-none animate-pulse" />
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] -z-10 bg-[radial-gradient(circle_at_center,rgba(251,191,36,0.04),transparent_70%)] blur-[120px] pointer-events-none animate-pulse delay-1000" />

            <div className="mx-auto max-w-6xl px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* Left Content */}
                    <div className="max-w-xl">
                        <div className="flex items-center gap-4 mb-6">
                            <div className="h-px w-8 bg-zinc-300" />
                            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400">
                                AI Voiceover
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-zinc-950 leading-[1.1] mb-6">
                            Your story, <br />
                            <span className="text-amber-500 font-extrabold bg-amber-100 px-2">every language.</span>
                        </h2>

                        <p className="text-lg text-zinc-500 leading-relaxed max-w-md mb-10">
                            10+ languages, 30+ expressive voices — warm, dramatic, playful. Reach any audience, anywhere, instantly.
                        </p>

                        <Button
                            asChild
                            size="lg"
                            className="h-14 px-8 rounded-full bg-zinc-50 hover:bg-zinc-100 text-zinc-900 border border-zinc-200 shadow-sm transition-all group"
                            variant="outline"
                        >
                            <Link href="/register">
                                Start generating
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>

                    {/* Right Visual Component */}
                    <div className="relative mx-auto w-full max-w-md animate-in fade-in zoom-in-95 duration-1000">
                        {/* Background Glow */}
                        <div className="absolute -inset-1 bg-gradient-to-tr from-amber-100 to-amber-50 blur-2xl opacity-50 z-0" />

                        {/* Main App Window - Light Mode */}
                        <div className="relative z-10 bg-white rounded-[2rem] p-6 shadow-sm border border-zinc-200/80">

                            {/* Header */}
                            <div className="flex items-start justify-between mb-8">
                                <h3 className="text-zinc-950 font-bold leading-tight text-lg">
                                    Available languages
                                </h3>
                                <div className="px-4 py-1.5 rounded-full border border-zinc-200 bg-zinc-50">
                                    <span className="text-[11px] text-zinc-500 font-medium">
                                        <span className="text-zinc-900 font-bold">12</span> languages
                                    </span>
                                </div>
                            </div>

                            {/* Grid */}
                            <div className="grid grid-cols-3 gap-3 mb-6">
                                {languages.map((lang) => (
                                    <div
                                        key={lang.code}
                                        className={`relative p-3 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-colors cursor-pointer group ${lang.active
                                            ? "bg-zinc-50 border-amber-300 shadow-sm"
                                            : "bg-white border-zinc-100 hover:bg-zinc-50 hover:border-zinc-200"
                                            }`}
                                    >
                                        {/* Active Indicator */}
                                        {lang.active && (
                                            <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                        )}

                                        {/* Flag container */}
                                        <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center text-lg border border-zinc-200/50 shadow-inner">
                                            {flagMap[lang.code] || getFlagEmoji(lang.code)}
                                        </div>

                                        {/* Name */}
                                        <span className={`text-[10px] sm:text-[11px] font-bold ${lang.active ? "text-zinc-900" : "text-zinc-500"}`}>
                                            {lang.name}
                                        </span>

                                        {/* Waveform Micro */}
                                        <div className="flex items-center gap-0.5 h-2 opacity-30 group-hover:opacity-60 transition-opacity">
                                            {[3, 5, 2, 4].map((h, i) => (
                                                <div key={i} className="w-[1.5px] bg-zinc-900 rounded-full" style={{ height: `${h}px` }} />
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </div>


                        </div>
                    </div>

                </div>
            </div>

            <style>{`
        @keyframes soundWave {
          0%, 100% { transform: scaleY(0.5); }
          50% { transform: scaleY(1); }
        }
      `}</style>
        </section>
    );
}
