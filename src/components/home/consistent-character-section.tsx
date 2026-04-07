"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";

const scenes = [
    { id: "01", name: "Forest", color: "bg-emerald-500" },
    { id: "02", name: "Castle", color: "bg-indigo-500" },
    { id: "03", name: "Village", color: "bg-amber-500" },
];

export function ConsistentCharacterSection() {
    return (
        <section className="py-24 md:py-32 bg-white border-t border-zinc-100" id="consistent-character">
            <div className="mx-auto max-w-5xl px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">

                    {/* Left */}
                    <div>
                        <div className="flex items-center gap-3 mb-5">
                            <div className="h-px w-5 bg-zinc-300" />
                            <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-zinc-400">
                                Consistent Character
                            </span>
                        </div>

                        <h2 className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-zinc-950 leading-[1.1] mb-4">
                            Same hero,<br />
                            <span className="text-amber-500 bg-amber-100 px-1.5 rounded">every scene.</span>
                        </h2>

                        <p className="text-[15px] text-zinc-500 leading-relaxed max-w-[300px] mb-7">
                            Same face, same style, same energy — across every frame. Build a character your audience recognizes instantly.
                        </p>

                        <Button
                            asChild
                            size="lg"
                            className="h-12 px-6 rounded-full bg-zinc-950 hover:bg-zinc-800 text-white shadow-none transition-all group"
                        >
                            <Link href="/register">
                                Start now
                                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                        </Button>
                    </div>

                    {/* Right — stacked cards */}
                    <div className="flex justify-center h-72">
                        <div className="relative w-40">
                            {scenes.map((scene, i) => (
                                <div
                                    key={scene.id}
                                    className="absolute w-32 aspect-[2/3] bg-white border border-zinc-200 rounded-2xl shadow-md flex flex-col justify-between p-3 cursor-pointer transition-transform duration-300 hover:-translate-y-2"
                                    style={{
                                        zIndex: i === 1 ? 20 : 10,
                                        transform: `translateX(${(i - 1) * 72}px) translateY(${i === 1 ? 0 : 12}px) rotate(${(i - 1) * 5}deg)`,
                                    }}
                                >
                                    {/* Top */}
                                    <div className="flex items-center justify-between">
                                        <span className="text-[10px] font-bold text-zinc-400">
                                            Scene {scene.id}
                                        </span>
                                        <div className={`w-1.5 h-1.5 rounded-full ${scene.color}`} />
                                    </div>

                                    {/* Avatar */}
                                    <div className="flex-1 flex items-center justify-center">
                                        <span className="text-5xl drop-shadow-sm">🧙‍♂️</span>
                                    </div>

                                    {/* Bottom */}
                                    <div className="text-center">
                                        <span className="text-xs font-semibold text-zinc-600">{scene.name}</span>
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