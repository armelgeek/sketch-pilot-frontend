"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import { ChevronLeft, ChevronRight, Film, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useStudioStore } from "../store";

interface StoryboardFilmstripProps {
    vertical?: boolean;
}

export function StoryboardFilmstrip({ vertical }: StoryboardFilmstripProps) {
    const {
        activeVideo,
        selectedSceneId,
        setSelectedSceneId,
    } = useStudioStore();

    const filmstripRef = useRef<HTMLDivElement | null>(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const displayScenes = (activeVideo?.scenes?.length ? activeVideo.scenes : activeVideo?.script?.scenes) || [];

    const checkFilmstripScroll = useCallback(() => {
        if (!filmstripRef.current || vertical) return;
        const el = filmstripRef.current;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }, [vertical]);

    const scrollFilmstrip = (direction: 'left' | 'right') => {
        if (!filmstripRef.current || vertical) return;
        const scrollAmount = 250;
        filmstripRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    useEffect(() => {
        if (vertical) return;
        checkFilmstripScroll();
        const el = filmstripRef.current;
        el?.addEventListener('scroll', checkFilmstripScroll);
        window.addEventListener('resize', checkFilmstripScroll);
        return () => {
            el?.removeEventListener('scroll', checkFilmstripScroll);
            window.removeEventListener('resize', checkFilmstripScroll);
        };
    }, [checkFilmstripScroll, displayScenes, vertical]);

    useEffect(() => {
        if (!filmstripRef.current) return;
        const el = filmstripRef.current.querySelector("[data-active='true']") as HTMLElement | null;
        if (vertical) {
            el?.scrollIntoView({ behavior: "smooth", block: "nearest" });
        } else {
            el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
        }
    }, [selectedSceneId, vertical]);

    if (vertical) {
        return (
            <div
                ref={filmstripRef}
                className="flex flex-col gap-3 py-1 pb-4">
                {displayScenes.map((scene: any, i: number) => {
                    const sId = scene.id || `s${i + 1}`;
                    const isAct = selectedSceneId === sId;

                    return (
                        <button
                            key={sId}
                            data-active={isAct}
                            onClick={() => setSelectedSceneId(sId)}
                            className={cn(
                                "relative w-full aspect-video shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-300 group",
                                isAct
                                    ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)] scale-[1.02] z-10"
                                    : "border-zinc-100 hover:border-zinc-300 hover:scale-[1.01]"
                            )}>
                            {scene.thumbnailUrl || scene.imageUrl ? (
                                <img
                                    src={scene.thumbnailUrl || scene.imageUrl}
                                    alt={`Aperçu ${i + 1}`}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center bg-zinc-50 group-hover:bg-zinc-100 transition-colors">
                                    <Film className="h-4 w-4 text-zinc-200 group-hover:text-zinc-300 transition-colors" />
                                </div>
                            )}
                            <div className={cn(
                                "absolute bottom-1 left-1 text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm transition-colors",
                                isAct ? "bg-emerald-500 text-white" : "bg-black/60 text-white group-hover:bg-black/80"
                            )}>
                                {String(i + 1).padStart(2, "0")}
                            </div>
                            {scene.imageUrl && (
                                <div className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)] animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>
        );
    }

    return (
        <div className="mx-4 border border-zinc-200/80 rounded-xl overflow-hidden flex flex-col bg-white">
            {/* Filmstrip content (Horizontal) */}
            <div
                ref={filmstripRef}
                className="flex gap-2 overflow-x-auto px-3 py-2 scroll-smooth"
                style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>

                {displayScenes.map((scene: any, i: number) => {
                    const sId = scene.id || `s${i + 1}`;
                    const isAct = selectedSceneId === sId;
                    const isGen = false; // Placeholder

                    return (
                        <button
                            key={sId}
                            data-active={isAct}
                            onClick={() => setSelectedSceneId(sId)}
                            className={cn(
                                "relative w-[200px] shrink-0 flex flex-col gap-1 rounded-lg overflow-hidden border-2 transition-all duration-200 group",
                                isAct
                                    ? "border-emerald-500 shadow-sm shadow-emerald-200/60"
                                    : "border-zinc-200/80 hover:border-zinc-300"
                            )}>
                            <div className="relative w-full bg-zinc-100 rounded-md overflow-hidden" style={{ aspectRatio: "16/9" }}>
                                {scene.thumbnailUrl || scene.imageUrl ? (
                                    <img
                                        src={scene.thumbnailUrl || scene.imageUrl}
                                        alt={`Aperçu scène ${i + 1}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <Film className="h-4 w-4 text-zinc-300" />
                                    </div>
                                )}
                                {isGen && (
                                    <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[1px] flex items-center justify-center">
                                        <Loader2 className="h-3 w-3 text-emerald-600 animate-spin" />
                                    </div>
                                )}
                                <div className={cn(
                                    "absolute bottom-1 left-1 text-[8px] font-black px-1 py-0.5 rounded transition-colors",
                                    isAct ? "bg-emerald-500 text-white" : "bg-black/50 text-white"
                                )}>
                                    {String(i + 1).padStart(2, "0")}
                                </div>
                                {scene.imageUrl && (
                                    <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-sm" />
                                )}
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
