"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const scenes = [
    { id: "01", name: "Forest", theme: "bg-emerald-50 border-emerald-100", dot: "bg-emerald-500" },
    { id: "02", name: "Castle", theme: "bg-indigo-50 border-indigo-100", dot: "bg-indigo-500" },
    { id: "03", name: "Village", theme: "bg-amber-50 border-amber-100", dot: "bg-amber-500" },
];

export function ConsistentCharacterSection() {
    return (
        <section className="relative py-24 md:py-32 bg-[#FAFAFA] border-t border-zinc-100 overflow-hidden" id="consistent-character">
            <div className="mx-auto max-w-6xl px-6 lg:px-8">

                {/* Main Light Container */}
                <div className="relative bg-white border border-zinc-200/60 rounded-[2.5rem] p-8 md:p-16 overflow-hidden flex flex-col lg:flex-row items-center gap-16">

                    {/* Background Glows for Light Mode */}
                    <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-gradient-to-bl from-amber-100/40 via-transparent to-transparent blur-3xl rounded-full pointer-events-none" />

                    {/* Left Content */}
                    <div className="flex-1 text-center lg:text-left z-10 max-w-lg">
                        <div className="flex items-center gap-4 mb-6 justify-center lg:justify-start">
                            <div className="h-px w-8 bg-zinc-300" />
                            <span className="text-[11px] font-bold tracking-[0.2em] uppercase text-zinc-400">
                                Consistent Character
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl lg:text-6xl font-heading font-extrabold tracking-tight text-zinc-950 leading-[1.1] mb-6">
                            Same hero, <br />
                            <span className="text-amber-500 font-extrabold bg-amber-100 px-2">every scene.</span>
                        </h2>
                        <p className="text-lg text-zinc-500 leading-relaxed mb-10 mx-auto lg:mx-0">
                            Our AI keeps your characters visually identical across every frame — same face, same style, same energy. Build a brand your audience recognizes instantly.
                        </p>

                        <Button
                            asChild
                            size="lg"
                            className="h-14 px-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-lg transition-transform hover:scale-105 active:scale-95 shadow-md flex inline-flex items-center mx-auto lg:mx-0"
                        >
                            <Link href="/register">
                                Start now
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>

                    {/* Right Content - Floating Cards */}
                    <div className="flex-1 w-full flex justify-center items-center relative z-10 h-[300px] sm:h-[400px]">
                        <div className="relative flex items-center justify-center w-full max-w-md">
                            {scenes.map((scene, i) => (
                                <div
                                    key={scene.id}
                                    className={`absolute w-32 sm:w-40 aspect-[2/3] rounded-2xl border bg-white p-3 flex flex-col justify-between shadow-xl transition-transform duration-700 hover:-translate-y-4 cursor-pointer`}
                                    style={{
                                        zIndex: i === 1 ? 20 : 10,
                                        transform: `translateX(${(i - 1) * 85}px) translateY(${i === 1 ? '10px' : '-10px'}) rotate(${(i - 1) * 6}deg)`,
                                    }}
                                >
                                    {/* Subtle tint overlay */}
                                    <div className={`absolute inset-0 z-0 opacity-40 rounded-2xl ${scene.theme}`} />

                                    {/* Top Bar */}
                                    <div className="relative z-10 flex justify-between items-start">
                                        <div className="bg-white/80 backdrop-blur-sm rounded-full px-2 py-0.5 border border-white/40 shadow-sm">
                                            <span className="text-[9px] sm:text-[10px] font-bold text-zinc-600 block leading-tight">
                                                Scene
                                            </span>
                                            <span className="text-[9px] sm:text-[10px] font-medium text-zinc-400 block leading-tight">
                                                {scene.id}
                                            </span>
                                        </div>
                                        <div className={`w-1.5 h-1.5 rounded-full ${scene.dot}`} />
                                    </div>

                                    {/* Center Avatar */}
                                    <div className="relative z-10 flex-1 flex items-center justify-center animate-in zoom-in spin-in-2 duration-1000 delay-300">
                                        <span className="text-5xl sm:text-6xl drop-shadow-md">🧙‍♂️</span>
                                    </div>

                                    {/* Bottom Label */}
                                    <div className="relative z-10 text-center pb-2">
                                        <span className="text-xs sm:text-sm font-semibold text-zinc-700">
                                            {scene.name}
                                        </span>
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
