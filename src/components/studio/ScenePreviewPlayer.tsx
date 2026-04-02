"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import { Play, Pause, SkipBack, SkipForward, Volume2, VolumeX, Maximize2 } from "lucide-react";
import { cn } from "@/src/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface PreviewScene {
    id: string;
    title: string;
    narration: string;
    cameraAction: string;
    transition: string;
    imageUrl?: string;
    timeRange?: { start: number; end: number };
    globalWordTimings?: Array<{ word: string; start: number; end: number }>;
    duration: number;
}

interface ScenePreviewPlayerProps {
    scenes: PreviewScene[];
    narrationUrl?: string;
    totalDuration?: number;
    onSceneChange?: (index: number) => void;
    className?: string;
}

// ─── Camera Animation helpers ─────────────────────────────────────────────────

function getCameraTransform(action: string, progress: number): string {
    // progress = 0..1 (linear within scene)
    const ease = progress; // or ease-in-out: progress < 0.5 ? 2*p*p : -1+(4-2p)*p

    switch (action) {
        case "pan-right":
            return `scale(1.08) translateX(${-ease * 5}%)`;
        case "pan-left":
            return `scale(1.08) translateX(${ease * 5}%)`;
        case "pan-up":
            return `scale(1.08) translateY(${-ease * 5}%)`;
        case "pan-down":
            return `scale(1.08) translateY(${ease * 5}%)`;
        case "slow-zoom-in":
            return `scale(${1 + ease * 0.1})`;
        case "slow-zoom-out":
            return `scale(${1.1 - ease * 0.1})`;
        case "ken-burns":
            return `scale(${1 + ease * 0.08}) translate(${-ease * 3}%, ${-ease * 2}%)`;
        case "breathing": {
            const wave = Math.sin(progress * Math.PI * 2) * 0.015;
            return `scale(${1 + wave})`;
        }
        case "dutch-tilt":
            return `rotate(${ease * 2}deg) scale(1.04)`;
        case "snap-zoom":
            return progress < 0.1
                ? `scale(${1 + (progress / 0.1) * 0.15})`
                : `scale(${1.15 - ((progress - 0.1) / 0.9) * 0.1})`;
        case "orbit":
            return `rotate(${Math.sin(progress * Math.PI) * 3}deg) scale(1.05)`;
        case "whip-pan":
            return progress < 0.15
                ? `translateX(${(progress / 0.15) * -8}%) scale(1.05) blur(${(progress / 0.15) * 4}px)`
                : `translateX(${-8 + ((progress - 0.15) / 0.85) * 8}%) scale(1.05)`;
        case "static":
        default:
            return "scale(1)";
    }
}

// ─── Transition CSS classes ────────────────────────────────────────────────────

function getTransitionStyle(transition: string, phase: "out" | "in", t: number): React.CSSProperties {
    // t = 0..1 transition progress
    switch (transition) {
        case "fade":
        case "crossfade":
            return phase === "out"
                ? { opacity: 1 - t }
                : { opacity: t };
        case "slideleft":
            return phase === "out"
                ? { transform: `translateX(${-t * 100}%)`, opacity: 1 }
                : { transform: `translateX(${(1 - t) * 100}%)`, opacity: 1 };
        case "slideright":
            return phase === "out"
                ? { transform: `translateX(${t * 100}%)`, opacity: 1 }
                : { transform: `translateX(${-(1 - t) * 100}%)`, opacity: 1 };
        case "wipeleft":
            return phase === "out"
                ? { clipPath: `inset(0 ${t * 100}% 0 0)` }
                : { clipPath: `inset(0 ${(1 - t) * 100}% 0 0)` };
        case "zoom":
            return phase === "out"
                ? { transform: `scale(${1 + t * 0.3})`, opacity: 1 - t }
                : { transform: `scale(${1.3 - t * 0.3})`, opacity: t };
        case "blur":
            return phase === "out"
                ? { filter: `blur(${t * 16}px)`, opacity: 1 - t * 0.5 }
                : { filter: `blur(${(1 - t) * 16}px)`, opacity: 0.5 + t * 0.5 };
        case "dissolve":
            return phase === "out"
                ? { opacity: 1 - t, filter: `saturate(${1 - t})` }
                : { opacity: t, filter: `saturate(${t})` };
        case "cut":
        default:
            return {};
    }
}

// Format mm:ss
function formatTime(t: number) {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, "0")}`;
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function ScenePreviewPlayer({
    scenes,
    narrationUrl,
    totalDuration,
    onSceneChange,
    className,
}: ScenePreviewPlayerProps) {
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const rafRef = useRef<number>(0);
    const startTimeRef = useRef<number>(0); // audio currentTime when last play() called

    const [isPlaying, setIsPlaying] = useState(false);
    const [isMuted, setIsMuted] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [currentSceneIndex, setCurrentSceneIndex] = useState(0);
    const [sceneProgress, setSceneProgress] = useState(0);
    const [transitioning, setTransitioning] = useState(false);
    const [transitionProgress, setTransitionProgress] = useState(0);
    const [activeWord, setActiveWord] = useState<string | null>(null);

    // Compute cumulative scene start/end times (fallback: sum of durations)
    const sceneTimes = useRef<Array<{ start: number; end: number }>>([]);
    const total = useRef<number>(0);

    useEffect(() => {
        let cursor = 0;
        sceneTimes.current = scenes.map((s) => {
            const d = s.timeRange ? (s.timeRange.end - s.timeRange.start) : s.duration;
            const entry = { start: cursor, end: cursor + d };
            cursor += d;
            return entry;
        });
        total.current = cursor;
    }, [scenes]);

    // Initialize audio
    useEffect(() => {
        const audio = new Audio();
        audio.preload = "auto";
        if (narrationUrl) audio.src = narrationUrl;
        audio.muted = isMuted;
        audioRef.current = audio;

        audio.addEventListener("ended", () => {
            setIsPlaying(false);
            setCurrentTime(total.current);
        });

        return () => {
            audio.pause();
            audio.src = "";
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [narrationUrl]);

    // Update mute
    useEffect(() => {
        if (audioRef.current) audioRef.current.muted = isMuted;
    }, [isMuted]);

    // Animation loop
    const tick = useCallback(() => {
        if (!audioRef.current) return;
        const t = audioRef.current.currentTime;
        setCurrentTime(t);

        // Find current scene
        const idx = sceneTimes.current.findLastIndex((st) => st.start <= t);
        const safeIdx = Math.max(0, Math.min(idx, scenes.length - 1));

        const st = sceneTimes.current[safeIdx];
        if (st) {
            const sceneDuration = st.end - st.start;
            const localT = t - st.start;
            const progress = sceneDuration > 0 ? Math.min(localT / sceneDuration, 1) : 0;
            setSceneProgress(progress);
            setCurrentSceneIndex(safeIdx);
            onSceneChange?.(safeIdx);

            // Transition zone: last 0.5s of the scene
            const TRANSITION_DURATION = 0.5;
            const timeLeft = st.end - t;
            if (timeLeft <= TRANSITION_DURATION && timeLeft >= 0 && safeIdx < scenes.length - 1) {
                const tp = 1 - (timeLeft / TRANSITION_DURATION);
                setTransitioning(true);
                setTransitionProgress(tp);
            } else {
                setTransitioning(false);
                setTransitionProgress(0);
            }
        }

        // Find active word
        const allTimings = scenes.flatMap((s) => s.globalWordTimings || []);
        const word = allTimings.find((w) => t >= w.start && t < w.end);
        setActiveWord(word?.word ?? null);

        rafRef.current = requestAnimationFrame(tick);
    }, [scenes, onSceneChange]);

    const play = useCallback(() => {
        audioRef.current?.play();
        setIsPlaying(true);
        rafRef.current = requestAnimationFrame(tick);
    }, [tick]);

    const pause = useCallback(() => {
        audioRef.current?.pause();
        setIsPlaying(false);
        cancelAnimationFrame(rafRef.current);
    }, []);

    const seekTo = useCallback((t: number) => {
        if (audioRef.current) audioRef.current.currentTime = t;
        setCurrentTime(t);
    }, []);

    const skipToScene = useCallback((idx: number) => {
        const st = sceneTimes.current[idx];
        if (st) seekTo(st.start);
    }, [seekTo]);

    const togglePlay = useCallback(() => {
        if (isPlaying) pause();
        else play();
    }, [isPlaying, play, pause]);

    // Cleanup on unmount
    useEffect(() => {
        return () => cancelAnimationFrame(rafRef.current);
    }, []);

    const currentScene = scenes[currentSceneIndex];
    const nextScene = scenes[currentSceneIndex + 1];
    const duration = total.current || scenes.reduce((a, s) => a + s.duration, 0);
    const progressPct = duration > 0 ? (currentTime / duration) * 100 : 0;

    // Subtitle words
    const currentSceneTimings = currentScene?.globalWordTimings || [];
    const hasWordTimings = currentSceneTimings.length > 0;

    return (
        <div className={cn("flex flex-col w-full bg-black rounded-2xl overflow-hidden shadow-2xl", className)}>
            {/* ── Video Viewport ── */}
            <div className="relative aspect-video w-full overflow-hidden bg-zinc-950 select-none">

                {/* Current Scene Layer */}
                {currentScene?.imageUrl && (
                    <div
                        className="absolute inset-0 will-change-transform"
                        style={{
                            transform: getCameraTransform(currentScene.cameraAction, sceneProgress),
                            transition: "transform 0.05s linear",
                        }}
                    >
                        <img
                            src={currentScene.imageUrl}
                            alt={currentScene.title}
                            className="w-full h-full object-cover"
                            draggable={false}
                        />
                    </div>
                )}

                {!currentScene?.imageUrl && (
                    <div className="absolute inset-0 flex items-center justify-center text-zinc-700">
                        <div className="text-center space-y-2">
                            <div className="text-5xl">🎬</div>
                            <p className="text-sm font-bold">Aucune image générée</p>
                        </div>
                    </div>
                )}

                {/* Next Scene Transition Layer */}
                {transitioning && nextScene?.imageUrl && (
                    <div
                        className="absolute inset-0 will-change-transform"
                        style={{
                            ...getTransitionStyle(currentScene?.transition || "fade", "in", transitionProgress),
                            zIndex: 10,
                        }}
                    >
                        <img
                            src={nextScene.imageUrl}
                            alt={nextScene.title}
                            className="w-full h-full object-cover"
                            draggable={false}
                        />
                    </div>
                )}

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" style={{ zIndex: 20 }} />

                {/* Subtitles */}
                <div className="absolute bottom-14 left-4 right-4 text-center pointer-events-none" style={{ zIndex: 30 }}>
                    {hasWordTimings ? (
                        <p className="text-sm sm:text-base font-black text-white drop-shadow-lg leading-relaxed">
                            {currentSceneTimings.map((w, i) => (
                                <span
                                    key={i}
                                    className={cn(
                                        "mx-0.5 transition-colors duration-100",
                                        activeWord === w.word && currentTime >= w.start && currentTime < w.end
                                            ? "text-yellow-300"
                                            : "text-white"
                                    )}
                                >
                                    {w.word}
                                </span>
                            ))}
                        </p>
                    ) : (
                        isPlaying && (
                            <p className="text-sm text-white/80 font-bold drop-shadow-lg line-clamp-2">
                                {currentScene?.narration}
                            </p>
                        )
                    )}
                </div>

                {/* Scene indicator */}
                <div className="absolute top-3 left-3 px-2 py-0.5 rounded-md bg-black/60 text-[10px] font-black text-white/70 backdrop-blur-sm" style={{ zIndex: 30 }}>
                    {currentSceneIndex + 1}/{scenes.length} · {currentScene?.title}
                </div>

                {/* Camera action badge */}
                <div className="absolute top-3 right-3 px-2 py-0.5 rounded-md bg-emerald-500/20 border border-emerald-500/30 text-[9px] font-black text-emerald-400 uppercase tracking-wider backdrop-blur-sm" style={{ zIndex: 30 }}>
                    {currentScene?.cameraAction || "static"}
                </div>

                {/* Click to play/pause */}
                <button
                    onClick={togglePlay}
                    className="absolute inset-0 w-full h-full cursor-pointer"
                    style={{ zIndex: 25 }}
                    aria-label={isPlaying ? "Pause" : "Play"}
                />

                {/* Center play icon overlay */}
                {!isPlaying && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none" style={{ zIndex: 26 }}>
                        <div className="h-16 w-16 rounded-full bg-black/50 backdrop-blur-md flex items-center justify-center border border-white/20 shadow-xl">
                            <Play className="h-7 w-7 text-white ml-1" fill="white" />
                        </div>
                    </div>
                )}
            </div>

            {/* ── Progress bar ── */}
            <div className="relative h-1.5 bg-zinc-800 cursor-pointer group"
                onClick={(e) => {
                    const rect = e.currentTarget.getBoundingClientRect();
                    const pct = (e.clientX - rect.left) / rect.width;
                    seekTo(pct * duration);
                }}
            >
                <div
                    className="h-full bg-emerald-500 transition-none"
                    style={{ width: `${progressPct}%` }}
                />
                {/* Scene markers */}
                {sceneTimes.current.map((st, i) => (
                    <div
                        key={i}
                        className="absolute top-0 bottom-0 w-px bg-zinc-600 group-hover:bg-zinc-400 transition-colors"
                        style={{ left: `${(st.start / duration) * 100}%` }}
                    />
                ))}
            </div>

            {/* ── Controls ── */}
            <div className="flex items-center gap-2 px-4 py-3 bg-zinc-900">
                {/* Prev scene */}
                <button
                    onClick={() => skipToScene(Math.max(0, currentSceneIndex - 1))}
                    className="h-8 w-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                    <SkipBack className="h-4 w-4" />
                </button>

                {/* Play/Pause */}
                <button
                    onClick={togglePlay}
                    className="h-9 w-9 rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center justify-center text-white transition-colors shadow-lg shadow-emerald-500/20"
                >
                    {isPlaying
                        ? <Pause className="h-4 w-4" fill="white" />
                        : <Play className="h-4 w-4 ml-0.5" fill="white" />
                    }
                </button>

                {/* Next scene */}
                <button
                    onClick={() => skipToScene(Math.min(scenes.length - 1, currentSceneIndex + 1))}
                    className="h-8 w-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                    <SkipForward className="h-4 w-4" />
                </button>

                {/* Time */}
                <span className="text-xs font-mono text-zinc-500 ml-1">
                    {formatTime(currentTime)} / {formatTime(duration)}
                </span>

                <div className="flex-1" />

                {/* Mute */}
                <button
                    onClick={() => setIsMuted((m) => !m)}
                    className="h-8 w-8 rounded-lg hover:bg-zinc-800 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
                >
                    {isMuted ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
                </button>

                {/* Transition badge */}
                {transitioning && (
                    <div className="px-2 py-0.5 rounded-full bg-purple-500/20 border border-purple-500/30 text-[9px] font-black text-purple-400 uppercase tracking-wider animate-pulse">
                        {currentScene?.transition}
                    </div>
                )}
            </div>

            {/* ── Scene scrubber strip ── */}
            <div className="flex gap-1 px-4 pb-4 overflow-x-auto scrollbar-hide bg-zinc-900 pt-1">
                {scenes.map((s, i) => (
                    <button
                        key={s.id}
                        onClick={() => skipToScene(i)}
                        className={cn(
                            "shrink-0 w-16 rounded-lg overflow-hidden border-2 transition-all",
                            i === currentSceneIndex
                                ? "border-emerald-500 shadow-lg shadow-emerald-500/20"
                                : "border-transparent hover:border-zinc-600 opacity-60 hover:opacity-100"
                        )}
                    >
                        <div className="aspect-video bg-zinc-800 relative">
                            {s.imageUrl ? (
                                <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-600 text-[8px]">
                                    {i + 1}
                                </div>
                            )}
                        </div>
                    </button>
                ))}
            </div>
        </div>
    );
}
