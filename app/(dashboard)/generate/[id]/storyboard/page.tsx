"use client";

import { useState, useEffect, use, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronRight, Play, RefreshCw, Wand2, Loader2,
    ChevronLeft, Zap, Sparkles, Music, SkipBack, SkipForward,
    Type, Eye, Check, FileJson, Film, Mic,
    AlertCircle, Home, Plus, X
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Slider } from "@/src/components/ui/slider";
import { cn } from "@/src/lib/utils";
import { videosService, type Video } from "@/src/services/videos-service";
import { useVideoProgress } from "@/src/hooks/use-video-progress";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { ScriptEditor } from "@/src/components/organisms/script-editor";

// ─── Singleton service ────────────────────────────────────────────────────────
const adminService = new AdminService();

// ─── Types ────────────────────────────────────────────────────────────────────
type StudioTab = "script" | "storyboard" | "production";

interface CaptionOptions {
    enabled: boolean;
    style: string;
    fontSize: number;
    highlightColor: string;
    position: string;
}

interface AudioOptions {
    voicePreset: string;
    voiceVolume: number;   // 0–100
    musicId: string;
    musicVolume: number;   // 0–100
}

// ─── Status label map ─────────────────────────────────────────────────────────
const STATUS_LABELS: Record<string, string> = {
    completed: "Terminé",
    failed: "Échoué",
    processing: "En cours",
    queued: "En file",
    scenes_generated: "Scènes OK",
    narration_generated: "Narration OK",
};

const STATUS_COLORS: Record<string, string> = {
    completed: "text-emerald-700 bg-emerald-50 border-emerald-200",
    failed: "text-red-700 bg-red-50 border-red-200",
    scenes_generated: "text-emerald-700 bg-emerald-50 border-emerald-200",
    narration_generated: "text-emerald-700 bg-emerald-50 border-emerald-200",
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function useKeydown(key: string, handler: () => void) {
    useEffect(() => {
        const fn = (e: KeyboardEvent) => { if (e.key === key) handler(); };
        window.addEventListener("keydown", fn);
        return () => window.removeEventListener("keydown", fn);
    }, [key, handler]);
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function StudioPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();

    // ── Core state ────────────────────────────────────────────────────────────
    const [activeVideo, setActiveVideo] = useState<Video | null>(null);
    const [activeTab, setActiveTab] = useState<StudioTab>("script");
    const [showProductionModal, setShowProductionModal] = useState(false);
    const [productionStep, setProductionStep] = useState<0 | 1 | 2>(0);
    const [selectedScene, setSelectedScene] = useState<string>("s1");
    const [error, setError] = useState<string | null>(null);

    // ── Generation state ──────────────────────────────────────────────────────
    const [generating, setGenerating] = useState(false);
    const [assembling, setAssembling] = useState(false);
    const [visualsGenerated, setVisualsGenerated] = useState(false);
    const [regeneratingSceneId, setRegeneratingSceneId] = useState<string | null>(null);

    // ── Job IDs ───────────────────────────────────────────────────────────────
    const [jobId, setJobId] = useState<string | undefined>();
    const [repromptJobId, setRepromptJobId] = useState<string | undefined>();
    const [assembleJobId, setAssembleJobId] = useState<string | undefined>();

    // ── Audio options (grouped) ───────────────────────────────────────────────
    const [audioOptions, setAudioOptions] = useState<AudioOptions>({
        voicePreset: "af_heart",
        voiceVolume: 80,
        musicId: "none",
        musicVolume: 60,
    });
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);

    // ── Caption options (grouped) ─────────────────────────────────────────────
    const [captionOptions, setCaptionOptions] = useState<CaptionOptions>({
        enabled: true,
        style: "colored",
        fontSize: 48,
        highlightColor: "#FFE135",
        position: "bottom",
    });
    const [showAdvancedCaptions, setShowAdvancedCaptions] = useState(false);

    // ── Remote lists ──────────────────────────────────────────────────────────
    const [availableVoices, setAvailableVoices] = useState<any[]>([]);
    const [availableModels, setAvailableModels] = useState<any[]>([]);
    const [musicTracks, setMusicTracks] = useState<any[]>([]);

    // ── Scene editing ─────────────────────────────────────────────────────────
    const [sceneEdits, setSceneEdits] = useState<Record<string, any>>({});
    const [isInserting, setIsInserting] = useState(false);
    const [insertIndex, setInsertIndex] = useState<number | null>(null);
    const [newNarration, setNewNarration] = useState("");
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    // ── Refs ──────────────────────────────────────────────────────────────────
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const filmstripRef = useRef<HTMLDivElement | null>(null);
    const productionModalRef = useRef<HTMLDivElement | null>(null);

    // ── Video progress hooks ──────────────────────────────────────────────────
    const {
        progress: realProgress, message: realMessage, isFinished,
        lastScene, lastSceneIndex, currentSceneIndex,
        error: jobError, promptsUrl,
        cancelVideo, insertScene: apiInsertScene
    } = useVideoProgress(jobId);

    const {
        currentSceneIndex: repromptIndex,
        isFinished: isRepromptFinished,
        error: repromptError
    } = useVideoProgress(repromptJobId ?? undefined);

    const {
        progress: assembleProgress,
        message: assembleMessage,
        isFinished: isAssembleFinished,
        error: assembleError
    } = useVideoProgress(assembleJobId ?? undefined);

    // ─── Derived values ───────────────────────────────────────────────────────
    const displayScenes = useMemo(() =>
        activeVideo
            ? ((activeVideo.scenes?.length ? activeVideo.scenes : activeVideo.script?.scenes) || [])
            : [],
        [activeVideo]
    );

    const activeSceneIndex = useMemo(() =>
        displayScenes.findIndex((s: any, i: number) => (s.id || `s${i + 1}`) === selectedScene),
        [displayScenes, selectedScene]
    );

    const activeScene = displayScenes[activeSceneIndex] ?? null;

    const isScriptMissing = !activeVideo?.script && !activeVideo?.scenes?.length;
    const showLoadingState = !activeVideo || (generating && isScriptMissing);

    // ─── Filmstrip scroll helpers ─────────────────────────────────────────────
    const checkFilmstripScroll = useCallback(() => {
        if (!filmstripRef.current) return;
        const el = filmstripRef.current;
        setCanScrollLeft(el.scrollLeft > 0);
        setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }, []);

    const scrollFilmstrip = (direction: 'left' | 'right') => {
        if (!filmstripRef.current) return;
        const scrollAmount = 250;
        filmstripRef.current.scrollBy({
            left: direction === 'left' ? -scrollAmount : scrollAmount,
            behavior: 'smooth'
        });
    };

    // ─── Check filmstrip scroll state ──────────────────────────────────────────
    useEffect(() => {
        // Use setTimeout to allow DOM to update before checking scroll
        const timer = setTimeout(() => checkFilmstripScroll(), 0);
        return () => clearTimeout(timer);
    }, [displayScenes, checkFilmstripScroll]);

    // ─── Load data ────────────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const [video, voices, models, music] = await Promise.all([
                    videosService.getById(resolvedParams.id),
                    adminService.listVoices(),
                    adminService.listModels(),
                    adminService.listMusic(),
                ]);

                setActiveVideo(video);
                setAvailableVoices(voices || []);
                setAvailableModels(models?.data || []);
                setMusicTracks(music || []);

                // Restore audio options
                setAudioOptions({
                    voicePreset: video.options?.kokoroVoicePreset ?? "af_heart",
                    voiceVolume: video.options?.narrationVolume !== undefined
                        ? Math.round(video.options.narrationVolume * 100) : 80,
                    musicId: video.options?.backgroundMusic ?? "none",
                    musicVolume: video.options?.backgroundMusicVolume !== undefined
                        ? Math.round(video.options.backgroundMusicVolume * 100) : 60,
                });

                // Restore caption options
                if (video.options?.assCaptions) {
                    setCaptionOptions({
                        enabled: video.options.assCaptions.enabled !== false,
                        style: video.options.assCaptions.style ?? "colored",
                        fontSize: video.options.assCaptions.fontSize ?? 48,
                        highlightColor: video.options.assCaptions.highlightColor ?? "#FFE135",
                        position: video.options.assCaptions.position ?? "bottom",
                    });
                }

                // Resume in-progress job
                if ((video.status === "processing" || video.status === "queued") && video.jobId) {
                    setJobId(video.jobId);
                    setGenerating(true);
                    if (video.script || video.scenes?.length) setActiveTab("storyboard");
                }

                if (["scenes_generated", "narration_generated", "completed"].includes(video.status)) {
                    setVisualsGenerated(true);
                    setActiveTab("storyboard");
                }

                const ds = (video.scenes?.length ? video.scenes : video.script?.scenes) || [];
                setSelectedScene(ds[0]?.id || "s1");

            } catch {
                setError("Impossible de charger les données du studio.");
            }
        };
        load();
    }, [resolvedParams.id]);

    // ─── Scroll filmstrip to active scene ────────────────────────────────────
    useEffect(() => {
        if (!filmstripRef.current) return;
        const el = filmstripRef.current.querySelector("[data-active='true']") as HTMLElement | null;
        el?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
    }, [selectedScene]);

    // ─── Keyboard: close modal on Escape ─────────────────────────────────────
    const closeModal = useCallback(() => setShowProductionModal(false), []);
    useKeydown("Escape", closeModal);

    // ─── Reset production step when modal closes ──────────────────────────────
    useEffect(() => {
        if (!showProductionModal) setProductionStep(0);
    }, [showProductionModal]);

    // ─── Live scene updates from job ─────────────────────────────────────────
    useEffect(() => {
        if (!lastScene || lastSceneIndex === undefined || !activeVideo) return;
        setActiveVideo(prev => {
            if (!prev) return prev;
            const scenes = [...(prev.scenes || prev.script?.scenes || [])];
            scenes[lastSceneIndex] = { ...scenes[lastSceneIndex], ...lastScene };
            return { ...prev, scenes };
        });
        setSelectedScene(lastScene.id || `s${lastSceneIndex + 1}`);
    }, [lastScene, lastSceneIndex]);

    // ─── Job finished ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!isFinished || !jobId) return;
        if (jobError) { setGenerating(false); return; }
        videosService.getById(resolvedParams.id).then(updated => {
            setActiveVideo(updated);
            setVisualsGenerated(true);
            setGenerating(false);
            setActiveTab("storyboard");
        });
    }, [isFinished, jobId, jobError, resolvedParams.id]);

    // ─── Reprompt finished ────────────────────────────────────────────────────
    useEffect(() => {
        if (!isRepromptFinished || !repromptJobId) return;
        if (repromptError) {
            setError("Erreur lors de la régénération de l'image");
            setRegeneratingSceneId(null);
            setRepromptJobId(undefined);
            return;
        }
        const timer = window.setTimeout(() => {
            videosService.getById(resolvedParams.id, true).then(updated => {
                setActiveVideo(updated);
                setRegeneratingSceneId(null);
                setRepromptJobId(undefined);
            });
        }, 800);
        return () => window.clearTimeout(timer);
    }, [isRepromptFinished, repromptJobId, repromptError, resolvedParams.id]);

    // ─── Assemble finished ────────────────────────────────────────────────────
    useEffect(() => {
        if (!isAssembleFinished || !assembleJobId) return;
        if (assembleError) { setAssembling(false); return; }
        const timer = window.setTimeout(
            () => router.push(`/generate/${resolvedParams.id}/success`), 800
        );
        return () => window.clearTimeout(timer);
    }, [isAssembleFinished, assembleJobId, assembleError, router, resolvedParams.id]);

    // ─── Actions ──────────────────────────────────────────────────────────────
    const handleAnimate = async () => {
        if (!activeVideo) return;
        try {
            setGenerating(true);
            setActiveTab("storyboard");
            const response = await videosService.generateScenes(activeVideo.id);
            setJobId(response.jobId);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Erreur lors du démarrage de la génération des visuels");
            setGenerating(false);
        }
    };

    const handleRegenerateImage = async (sceneId: string, sceneIndex: number) => {
        if (!activeVideo || regeneratingSceneId || repromptJobId) return;
        try {
            setRegeneratingSceneId(sceneId);
            const newPrompt = sceneEdits[sceneId]?.imagePrompt;
            const response = await videosService.repromptScene(activeVideo.id, sceneIndex, newPrompt);
            setRepromptJobId(response.jobId);
        } catch {
            setError("Erreur lors de la régénération de l'image");
            setRegeneratingSceneId(null);
        }
    };

    const handleSaveScript = async () => {
        if (!activeVideo) return;
        try {
            await videosService.update(activeVideo.id, {
                script: activeVideo.script,
                scenes: activeVideo.script?.scenes || [],
            });
        } catch (err: any) {
            setError(err.message || "Erreur lors de la sauvegarde du script");
        }
    };

    const handleAssemble = async () => {
        if (!activeVideo) return;
        try {
            setAssembling(true);
            const nVol = audioOptions.voiceVolume / 100;
            const mVol = audioOptions.musicVolume / 100;

            await videosService.update(activeVideo.id, {
                options: {
                    ...activeVideo.options,
                    backgroundMusic: audioOptions.musicId === "none" ? undefined : audioOptions.musicId,
                    kokoroVoicePreset: audioOptions.voicePreset as any,
                    narrationVolume: nVol,
                    backgroundMusicVolume: mVol,
                    assCaptions: {
                        ...activeVideo.options?.assCaptions,
                        ...captionOptions,
                    },
                },
            });

            const r = await videosService.assemble(activeVideo.id, {
                narrationVolume: nVol,
                backgroundMusicVolume: mVol,
                assCaptions: captionOptions,
            });
            setAssembleJobId(r.jobId);
            setError(null);
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'assemblage de la vidéo finale");
            setAssembling(false);
        }
    };

    const handleSkipMusic = (dir: "next" | "prev") => {
        if (!musicTracks.length) return;
        const idx = musicTracks.findIndex((t: any) => t.id === audioOptions.musicId);
        let next = dir === "next" ? idx + 1 : idx - 1;
        if (next >= musicTracks.length) next = 0;
        if (next < 0) next = musicTracks.length - 1;
        setAudioOptions(prev => ({ ...prev, musicId: musicTracks[next].id }));
        setIsPlayingAudio(true);
    };

    const handleInsertScene = async () => {
        if (!activeVideo || insertIndex === null || !newNarration.trim()) return;
        try {
            setGenerating(true);
            const updatedScript = await apiInsertScene(activeVideo.id, insertIndex, newNarration);
            if (updatedScript) {
                setActiveVideo(prev => prev
                    ? { ...prev, script: updatedScript, scenes: updatedScript.scenes }
                    : null
                );
                setIsInserting(false);
                setNewNarration("");
            }
        } catch {
            setError("Erreur lors de l'insertion de la scène");
        } finally {
            setGenerating(false);
        }
    };

    const onScenesChange = useCallback((newScenes: any[]) => {
        setActiveVideo(prev => prev
            ? { ...prev, scenes: newScenes, script: { ...prev.script!, scenes: newScenes } }
            : null
        );
    }, []);

    const updateSceneEdit = (id: string, field: string, value: any) =>
        setSceneEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }));

    useEffect(() => {
        checkFilmstripScroll();
        const el = filmstripRef.current;
        el?.addEventListener('scroll', checkFilmstripScroll);
        window.addEventListener('resize', checkFilmstripScroll);
        return () => {
            el?.removeEventListener('scroll', checkFilmstripScroll);
            window.removeEventListener('resize', checkFilmstripScroll);
        };
    }, [checkFilmstripScroll]);

    const handleNext = () => {
        if (activeTab === "script") {
            visualsGenerated ? setActiveTab("storyboard") : handleAnimate();
        } else if (activeTab === "storyboard") {
            setShowProductionModal(true);
        }
    };

    // ─── Step wizard config ───────────────────────────────────────────────────
    const STEPS: { id: StudioTab; label: string }[] = [
        { id: "script", label: "Contenu" },
        { id: "storyboard", label: "Storyboard" },
        { id: "production", label: "Vidéo" },
    ];

    const effectiveStepId: StudioTab = showProductionModal ? "production" : activeTab;
    const effectiveStepIndex = STEPS.findIndex(s => s.id === effectiveStepId);

    // ─── Loading screen ───────────────────────────────────────────────────────
    if (showLoadingState) {
        return (
            <div className="min-h-[calc(100vh-56px)] bg-[#F8F8F7] flex flex-col items-center justify-center gap-8 px-4">
                <div className="relative h-36 w-36">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" className="stroke-zinc-100" strokeWidth="5" />
                        <circle cx="50" cy="50" r="42" fill="none" className="stroke-emerald-500" strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 42}`}
                            strokeDashoffset={`${2 * Math.PI * 42 * (1 - realProgress / 100)}`}
                            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-zinc-900 tracking-tight tabular-nums">{realProgress}%</span>
                        <Film className="h-4 w-4 text-emerald-500 mt-1 animate-pulse" />
                    </div>
                </div>
                <div className="text-center space-y-2 max-w-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-[10px] font-black uppercase tracking-widest">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {activeVideo?.status === "queued" ? "En file" : "Génération"}
                    </span>
                    <h2 className="text-lg font-black text-zinc-900 mt-2">
                        {activeVideo?.status === "queued" ? "Dans la file d'attente…" : "Création du storyboard…"}
                    </h2>
                    <p className="text-zinc-400 text-sm leading-relaxed">
                        {realMessage || "L'IA prépare vos scènes et visuels."}
                    </p>
                </div>
            </div>
        );
    }

    // ─── Assembly screen ──────────────────────────────────────────────────────
    if (assembling) {
        return (
            <div className="min-h-[calc(100vh-56px)] bg-[#F8F8F7] flex flex-col items-center justify-center gap-8 px-4">
                <div className="relative h-36 w-36">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" fill="none" className="stroke-zinc-100" strokeWidth="5" />
                        <circle cx="50" cy="50" r="42" fill="none" className="stroke-violet-500" strokeWidth="6"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 42}`}
                            strokeDashoffset={`${2 * Math.PI * 42 * (1 - assembleProgress / 100)}`}
                            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-2xl font-black text-zinc-900 tabular-nums">{assembleProgress}%</span>
                        <Zap className="h-4 w-4 text-violet-500 mt-1 animate-bounce" />
                    </div>
                </div>
                <div className="text-center space-y-2 max-w-xs">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-600 text-[10px] font-black uppercase tracking-widest">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" />
                        Assemblage final
                    </span>
                    <h2 className="text-lg font-black text-zinc-900 mt-2">Finalisation de votre vidéo</h2>
                    <p className="text-zinc-400 text-sm">{assembleMessage || "Voix, musique et captions en cours…"}</p>
                </div>
                {assembleError && (
                    <p className="text-red-500 text-sm bg-red-50 border border-red-200 px-4 py-2 rounded-xl">
                        {assembleError}
                    </p>
                )}
            </div>
        );
    }

    // ─── Main render ──────────────────────────────────────────────────────────
    return (
        <div className="flex flex-col bg-[#F8F8F7]" style={{ minHeight: "calc(100vh - 56px)" }}>

            {/* ── Top bar ──────────────────────────────────────────────────── */}
            <header className="flex items-center px-4 h-12 border-b border-zinc-200/80 bg-white/90 backdrop-blur-sm shrink-0 relative z-10">

                {/* Left */}
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                    <button
                        onClick={() => router.push("/videos")}
                        aria-label="Retour aux vidéos"
                        className="h-7 w-7 flex items-center justify-center rounded-lg bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-400 hover:text-zinc-700 transition-colors shrink-0">
                        <ChevronLeft className="h-3.5 w-3.5" />
                    </button>
                    <div className="h-4 w-px bg-zinc-200 shrink-0" />
                   
                </div>

                {/* Center: step wizard */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center">
                    {STEPS.map(({ id, label }, index) => {
                        const isActive = effectiveStepId === id;
                        const isCompleted = effectiveStepIndex > index;
                        const locked =
                            (id === "storyboard" && !visualsGenerated && !generating) ||
                            (id === "production" && !visualsGenerated);

                        return (
                            <div key={id} className="flex items-center">
                                {index > 0 && (
                                    <div className={cn(
                                        "h-px w-8 transition-colors duration-500",
                                        isCompleted ? "bg-emerald-400" : "bg-zinc-200"
                                    )} />
                                )}
                                <button
                                    onClick={() => {
                                        if (locked) return;
                                        if (id === "production") setShowProductionModal(true);
                                        else { setActiveTab(id); setShowProductionModal(false); }
                                    }}
                                    disabled={locked}
                                    aria-current={isActive ? "step" : undefined}
                                    className="flex items-center gap-1.5 px-1.5 py-1 rounded-lg transition-all">
                                    <div className={cn(
                                        "h-5 w-5 rounded-full text-[9px] flex items-center justify-center font-black border transition-all duration-200 shrink-0",
                                        isActive ? "bg-emerald-500 border-emerald-500 text-white shadow shadow-emerald-200"
                                            : isCompleted ? "bg-emerald-500 border-emerald-500 text-white"
                                                : locked ? "bg-zinc-100 border-zinc-200 text-zinc-300 cursor-not-allowed"
                                                    : "bg-white border-zinc-300 text-zinc-400 hover:border-zinc-400"
                                    )}>
                                        {isCompleted
                                            ? <Check className="h-2.5 w-2.5" />
                                            : <span>{index + 1}</span>}
                                    </div>
                                    <span className={cn(
                                        "text-[10px] font-semibold whitespace-nowrap transition-colors",
                                        isActive ? "text-zinc-800" : isCompleted ? "text-emerald-600" : "text-zinc-400"
                                    )}>
                                        {label}
                                    </span>
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Right */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                    {(promptsUrl || activeVideo?.options?.promptsUrl) && (
                        <button
                            onClick={() => window.open(promptsUrl || activeVideo?.options?.promptsUrl, "_blank")}
                            className="text-zinc-300 hover:text-zinc-500 transition-colors"
                            aria-label="Voir les prompts JSON"
                            title="Prompts JSON">
                            <FileJson className="h-3.5 w-3.5" />
                        </button>
                    )}
                    <Button
                        onClick={handleNext}
                        disabled={generating || assembling}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg h-8 px-4 text-xs gap-1.5 shrink-0 shadow-sm shadow-emerald-200/60 transition-all">
                        {activeTab === "storyboard" && visualsGenerated
                            ? <><Play className="h-3.5 w-3.5" /> Production</>
                            : activeTab === "script" && !visualsGenerated
                                ? <><Wand2 className="h-3.5 w-3.5" /> Animer</>
                                : <>Suivant <ChevronRight className="h-3.5 w-3.5 -mr-0.5" /></>}
                    </Button>
                </div>
            </header>

            {/* ── Error bar ─────────────────────────────────────────────────── */}
            {error && (
                <div role="alert" className="flex items-center gap-3 px-4 py-2 bg-red-50 border-b border-red-200 text-red-600 text-xs shrink-0">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1">{error}</span>
                    <button
                        onClick={() => setError(null)}
                        aria-label="Fermer"
                        className="text-red-400 hover:text-red-600 transition-colors">
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            )}

            {/* ── Generation progress bar ───────────────────────────────────── */}
            {generating && !isScriptMissing && (
                <div className="flex items-center gap-3 px-4 py-2 bg-emerald-50 border-b border-emerald-100 shrink-0">
                    <Loader2 className="h-3 w-3 text-emerald-500 animate-spin shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-semibold text-emerald-700 truncate">
                                {realMessage || "Génération…"}
                            </span>
                            <span className="text-[10px] font-black text-emerald-600 ml-2 shrink-0 tabular-nums">
                                {realProgress}%
                            </span>
                        </div>
                        <div className="h-0.5 bg-emerald-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-emerald-500 transition-all duration-700 rounded-full"
                                style={{ width: `${realProgress}%` }} />
                        </div>
                    </div>
                    <button
                        onClick={() => activeVideo && cancelVideo(activeVideo.id)}
                        className="text-[10px] font-semibold text-red-500 border border-red-200 rounded-md px-2 py-0.5 hover:bg-red-50 transition-colors shrink-0">
                        Stop
                    </button>
                </div>
            )}

            {/* ── Body ──────────────────────────────────────────────────────── */}
            <div className="flex overflow-hidden  flex-1">
                <div className="flex-1 overflow-hidden flex flex-col">

                    {/* ══ SCRIPT TAB ════════════════════════════════════════ */}
                    {activeTab === "script" && (
                        <div className="flex flex-col h-full">
                            <div className="px-5 pt-4 pb-3.5 border-b border-zinc-200/80 shrink-0 bg-white">
                                <div className="flex items-center gap-2">
                                    <span className="h-5 w-5 rounded-full bg-emerald-500 text-white text-[9px] font-black flex items-center justify-center shrink-0">
                                        1
                                    </span>
                                    <div>
                                        <p className="text-xs font-bold text-zinc-800 leading-none">Validation du Script</p>
                                        <p className="text-[10px] text-zinc-400 mt-0.5">Éditez la narration de chaque scène</p>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 overflow-y-auto py-5 px-5">
                                <div className="max-w-2xl mx-auto">
                                    <ScriptEditor scenes={displayScenes} onScenesChange={onScenesChange} />
                                </div>
                            </div>

                            <div className="shrink-0 px-4 py-2.5 border-t border-zinc-200/80 bg-white flex items-center justify-between">
                                <button
                                    onClick={handleSaveScript}
                                    className="text-[11px] text-zinc-400 hover:text-zinc-600 transition-colors font-medium">
                                    Sauvegarder
                                </button>
                                {!visualsGenerated ? (
                                    <Button
                                        onClick={handleAnimate}
                                        disabled={generating}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg h-8 px-4 text-xs gap-1.5 shadow-sm shadow-emerald-200/60">
                                        <Wand2 className="h-3.5 w-3.5" />
                                        Générer les visuels
                                        <ChevronRight className="h-3.5 w-3.5 -mr-0.5" />
                                    </Button>
                                ) : (
                                    <Button
                                        onClick={() => setActiveTab("storyboard")}
                                        className="bg-zinc-900 hover:bg-zinc-700 text-white font-bold rounded-lg h-8 px-4 text-xs gap-1.5">
                                        <Film className="h-3.5 w-3.5" />
                                        Voir le storyboard
                                        <ChevronRight className="h-3.5 w-3.5 -mr-0.5" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ══ STORYBOARD TAB ════════════════════════════════════ */}
                    {activeTab === "storyboard" && (
                        <div className="flex flex-col h-full overflow-hidden">

                            {/* ── Canvas zone ── */}
                            <div className="flex overflow-hidden flex-1 min-h-0">
                                <div className="flex-1 flex flex-col overflow-hidden bg-[#F8F8F7] p-4 gap-3">
                                    {activeScene ? (
                                        <div className="flex flex-1 gap-4 h-full overflow-hidden">

                                            {/* Image column */}
                                            <div className="flex flex-col gap-3 w-2/3 overflow-hidden">
                                                <div
                                                    className="relative rounded-xl overflow-hidden bg-white shadow-lg border border-zinc-200 w-full"
                                                    style={{ aspectRatio: "16/9" }}>

                                                    {/* Generation overlay */}
                                                    {(currentSceneIndex === activeSceneIndex || repromptIndex === activeSceneIndex) && (
                                                        <div className="absolute inset-0 bg-emerald-900/20 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 z-20">
                                                            <Wand2 className="h-8 w-8 text-emerald-400 animate-bounce" />
                                                            <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest">Génération…</p>
                                                        </div>
                                                    )}

                                                    {/* Reprompt overlay */}
                                                    {regeneratingSceneId === selectedScene && (
                                                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-20">
                                                            <RefreshCw className="h-8 w-8 text-emerald-400 animate-spin" />
                                                        </div>
                                                    )}

                                                    {activeScene.imageUrl ? (
                                                        <img
                                                            src={activeScene.imageUrl}
                                                            className="w-full h-full object-contain"
                                                            alt={`Scène ${activeSceneIndex + 1}`} />
                                                    ) : (
                                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                            <Film className="h-14 w-14 mb-3 text-zinc-700 opacity-20" />
                                                            <p className="text-xs text-zinc-500 font-medium">Aucun visuel généré</p>
                                                        </div>
                                                    )}

                                                    <div className="absolute top-2.5 left-2.5 bg-black/50 backdrop-blur-sm text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                                                        {String(activeSceneIndex + 1).padStart(2, "0")} / {String(displayScenes.length).padStart(2, "0")}
                                                    </div>
                                                </div>

                                            </div>

                                            {/* Right panel */}
                                            <div className="flex-1 min-w-0 shrink-0 flex flex-col gap-2.5 min-h-0 overflow-y-auto">
                                                <div className="bg-white border border-zinc-200/80 rounded-xl p-3.5 flex flex-col gap-3">
                                                    <div>
                                                        <p className="text-[12px] font-black text-zinc-400 uppercase tracking-widest mb-1.5">
                                                            Prompt Visuel
                                                        </p>
                                                        <Textarea
                                                            value={sceneEdits[selectedScene]?.imagePrompt ?? (activeScene.imagePrompt || activeScene.prompt || "")}
                                                            onChange={(e) => updateSceneEdit(selectedScene, "imagePrompt", e.target.value)}
                                                            className="min-h-[150px] bg-zinc-50 border-zinc-200 text-zinc-800 focus:border-emerald-400 text-sm resize-none rounded-lg"
                                                            placeholder="Décrivez le visuel…" />
                                                        <div className="text-zinc-300 text-right mt-0.5 text-[10px] tabular-nums">
                                                            {(sceneEdits[selectedScene]?.imagePrompt ?? (activeScene.imagePrompt || activeScene.prompt) ?? "").length}/1000
                                                        </div>
                                                    </div>
                                                    <Button
                                                        onClick={() => handleRegenerateImage(selectedScene, activeSceneIndex)}
                                                        disabled={!!regeneratingSceneId || !!repromptJobId || generating}
                                                        className="w-full bg-zinc-900 hover:bg-zinc-700 text-white font-bold rounded-lg h-8 text-xs gap-1.5">
                                                        {regeneratingSceneId === selectedScene
                                                            ? <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                                                            : <Sparkles className="h-3.5 w-3.5" />}
                                                        Régénérer (5 🪙)
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center flex-1">
                                            <p className="text-zinc-400 text-sm">Sélectionnez une scène ci-dessous</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* ── Filmstrip ── */}
                            <div className="mx-4 border border-zinc-200/80 rounded-xl overflow-hidden flex flex-col">
                                {/* Header */}
                                <div className="px-4 py-2.5 border-b border-zinc-200/80 bg-white flex items-center justify-between shrink-0">
                                    <div className="flex items-center gap-2">
                                        <h3 className="text-xs font-bold text-zinc-900">Scènes</h3>
                                        {(canScrollLeft || canScrollRight) && (
                                            <div className="flex gap-1">
                                                <button
                                                    onClick={() => scrollFilmstrip('left')}
                                                    disabled={!canScrollLeft}
                                                    aria-label="Scroller à gauche"
                                                    className="h-6 w-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                                    <ChevronLeft className="h-4 w-4" />
                                                </button>
                                                <button
                                                    onClick={() => scrollFilmstrip('right')}
                                                    disabled={!canScrollRight}
                                                    aria-label="Scroller à droite"
                                                    className="h-6 w-6 flex items-center justify-center rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
                                                    <ChevronRight className="h-4 w-4" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                    <span className="text-[10px] font-semibold text-zinc-500">{displayScenes.length} scène{displayScenes.length > 1 ? 's' : ''}</span>
                                </div>
                                
                                {/* Filmstrip content */}
                                <div
                                    ref={filmstripRef}
                                    className="flex gap-2 overflow-x-auto px-4 py-2.5 scroll-smooth"
                                    style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}>

                                    {displayScenes.map((scene: any, i: number) => {
                                        const sId = scene.id || `s${i + 1}`;
                                        const isAct = selectedScene === sId;
                                        const isGen = currentSceneIndex === i || repromptIndex === i;

                                        return (
                                            <button
                                                key={sId}
                                                data-active={isAct}
                                                onClick={() => setSelectedScene(sId)}
                                                aria-label={`Scène ${i + 1}`}
                                                aria-pressed={isAct}
                                                className={cn(
                                                    "relative w-[200px] shrink-0 flex flex-col gap-1 rounded-lg overflow-hidden border-2 transition-all duration-200 group",
                                                    isAct
                                                        ? "border-emerald-500 shadow-sm shadow-emerald-200/60"
                                                        : "border-zinc-200/80 hover:border-zinc-300"
                                                )}>
                                                <div
                                                    className="relative w-full bg-zinc-100 rounded-md overflow-hidden"
                                                    style={{ aspectRatio: "16/9" }}>
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

                                    {/* Add scene button */}
                                    {!generating && (
                                        <button
                                            onClick={() => { setInsertIndex(displayScenes.length); setIsInserting(true); }}
                                            aria-label="Ajouter une scène"
                                            className="shrink-0 flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-zinc-200 hover:border-emerald-400 hover:bg-emerald-50 text-zinc-300 hover:text-emerald-500 transition-all duration-200"
                                            style={{ width: 96, aspectRatio: "16/9" }}>
                                            <Plus className="h-4 w-4" />
                                            <span className="text-[9px] font-black uppercase tracking-wider">Scène</span>
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                </div>
            </div>

            {/* ── PRODUCTION MODAL (STEPPER) ─────────────────────────────── */}
            {showProductionModal && (
                <div
                    className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm"
                    onClick={(e) => { if (e.target === e.currentTarget) setShowProductionModal(false); }}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="production-modal-title">
                    <div
                        ref={productionModalRef}
                        className="w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                        {/* Header with Stepper */}
                        <div className="shrink-0 border-b border-zinc-100">
                            {/* Step indicator */}
                            <div className="flex items-center justify-between px-5 py-3.5">
                                <div className="flex-1">
                                    <p id="production-modal-title" className="text-xs font-bold text-zinc-900">Production</p>
                                    <p className="text-[10px] text-zinc-400">Étape {productionStep + 1}/3</p>
                                </div>
                                <button
                                    onClick={() => setShowProductionModal(false)}
                                    aria-label="Fermer"
                                    className="h-7 w-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>

                            {/* Step tabs */}
                            <div className="flex gap-0 px-5 pb-3.5">
                                {[
                                    { id: 0, label: "Voix", icon: Mic },
                                    { id: 1, label: "Musique", icon: Music },
                                    { id: 2, label: "Sous-titres", icon: Type }
                                ].map((step) => {
                                    const isActive = productionStep === step.id;
                                    return (
                                        <button
                                            key={step.id}
                                            onClick={() => setProductionStep(step.id as 0 | 1 | 2)}
                                            className={cn(
                                                "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all",
                                                isActive
                                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                                    : "border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                                            )}>
                                            <step.icon className="h-3.5 w-3.5" />
                                            {step.label}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Body - Content for current step */}
                        <div className="overflow-y-auto p-4 flex-1">
                            <div className="max-w-xl mx-auto">

                                {/* ── Step 0: Voice ── */}
                                {productionStep === 0 && (
                                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
                                        <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-zinc-200 bg-white">
                                            <div className="h-6 w-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                                                <Mic className="h-3 w-3 text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-zinc-900">Voix Narrative</p>
                                                <p className="text-[9px] text-zinc-400">Narration globale</p>
                                            </div>
                                        </div>
                                        <div className="p-3.5 space-y-3.5">
                                            <Select
                                                value={audioOptions.voicePreset}
                                                onValueChange={(v) => setAudioOptions(prev => ({ ...prev, voicePreset: v }))}>
                                                <SelectTrigger className="bg-white border-zinc-200 text-zinc-900 rounded-lg h-9 text-xs">
                                                    <SelectValue placeholder="Choisir une voix" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl bg-white border-zinc-200">
                                                    {availableVoices.map((v: any) => (
                                                        <SelectItem key={v.id} value={v.presetId} className="text-zinc-900 text-xs">
                                                            <div className="flex items-center gap-1.5">
                                                                <span>{v.gender === "female" ? "👩" : "👨"}</span>
                                                            <span className="font-medium">{v.name}</span>
                                                            <span className="text-[8px] uppercase px-1 py-0.5 rounded bg-zinc-100 text-zinc-400 font-bold">
                                                                {v.language?.split("-")[0]}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-zinc-500">🎙️ Voix</span>
                                                    <span className="font-black text-zinc-800 tabular-nums">{audioOptions.voiceVolume}%</span>
                                                </div>
                                                <Slider
                                                    min={0} max={100} step={5}
                                                    value={[audioOptions.voiceVolume]}
                                                    onValueChange={([v]) => setAudioOptions(prev => ({ ...prev, voiceVolume: v }))} />
                                            </div>
                                            <div className="space-y-1">
                                                <div className="flex justify-between text-[10px]">
                                                    <span className="text-zinc-500">🎵 Musique</span>
                                                    <span className="font-black text-zinc-800 tabular-nums">{audioOptions.musicVolume}%</span>
                                                </div>
                                                <Slider
                                                    min={0} max={100} step={5}
                                                    value={[audioOptions.musicVolume]}
                                                    onValueChange={([v]) => setAudioOptions(prev => ({ ...prev, musicVolume: v }))} />
                                            </div>
                                        </div>

                                        <p className="text-[9px] text-zinc-400 italic leading-relaxed border-t border-zinc-200 pt-2.5">
                                            Ducking automatique pour garder la voix audible.
                                        </p>
                                    </div>
                                </div>
                                )}

                                {/* ── Step 1: Music ── */}
                                {productionStep === 1 && (
                                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
                                        <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-zinc-200 bg-white">
                                            <div className="h-6 w-6 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                                                <Music className="h-3 w-3 text-amber-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-zinc-900">Musique de fond</p>
                                                <p className="text-[9px] text-zinc-400">{musicTracks.length} pistes</p>
                                            </div>
                                        </div>
                                        <div className="p-3 space-y-2">
                                            <div className="max-h-44 overflow-y-auto space-y-1 pr-0.5">
                                            {/* No music option */}
                                            <MusicOption
                                                label="Aucune musique"
                                                selected={audioOptions.musicId === "none"}
                                                onClick={() => setAudioOptions(prev => ({ ...prev, musicId: "none" }))} />

                                            {musicTracks.map((t: any) => (
                                                <MusicOption
                                                    key={t.id}
                                                    label={t.name}
                                                    tags={t.tags}
                                                    selected={audioOptions.musicId === t.id}
                                                    playing={audioOptions.musicId === t.id && isPlayingAudio}
                                                    onClick={() => {
                                                        setAudioOptions(prev => ({ ...prev, musicId: t.id }));
                                                        setIsPlayingAudio(true);
                                                    }} />
                                            ))}
                                        </div>

                                        {/* Playback controls */}
                                        <div className="flex items-center justify-center gap-3 pt-2 border-t border-zinc-100">
                                            <button
                                                onClick={() => handleSkipMusic("prev")}
                                                aria-label="Piste précédente"
                                                className="text-zinc-400 hover:text-zinc-700 transition-colors">
                                                <SkipBack className="h-3.5 w-3.5" />
                                            </button>
                                            <button
                                                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                                                disabled={audioOptions.musicId === "none"}
                                                aria-label={isPlayingAudio ? "Pause" : "Lecture"}
                                                className={cn(
                                                    "h-8 w-8 rounded-full border flex items-center justify-center transition-all",
                                                    audioOptions.musicId !== "none"
                                                        ? "bg-white border-zinc-200 text-zinc-700 hover:border-emerald-400 hover:text-emerald-600"
                                                        : "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                                                )}>
                                                {isPlayingAudio
                                                    ? <div className="flex gap-0.5">
                                                        <div className="w-0.5 h-3 bg-current rounded-sm" />
                                                        <div className="w-0.5 h-3 bg-current rounded-sm" />
                                                    </div>
                                                    : <Play className="h-3.5 w-3.5 fill-current ml-0.5" />}
                                            </button>
                                            <button
                                                onClick={() => handleSkipMusic("next")}
                                                aria-label="Piste suivante"
                                                className="text-zinc-400 hover:text-zinc-700 transition-colors">
                                                <SkipForward className="h-3.5 w-3.5" />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                )}

                                {/* ── Step 2: Captions ── */}
                                {productionStep === 2 && (
                                    <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
                                    <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-200 bg-white">
                                        <div className="flex items-center gap-2">
                                            <div className="h-6 w-6 rounded-lg bg-pink-50 flex items-center justify-center shrink-0">
                                                <Type className="h-3 w-3 text-pink-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-bold text-zinc-900">Sous-titres</p>
                                                <p className="text-[9px] text-zinc-400">Style &amp; animation</p>
                                            </div>
                                        </div>
                                        <button
                                            role="switch"
                                            aria-checked={captionOptions.enabled}
                                            aria-label="Activer les sous-titres"
                                            onClick={() => setCaptionOptions(prev => ({ ...prev, enabled: !prev.enabled }))}
                                            className={cn("relative w-8 h-4 rounded-full transition-colors", captionOptions.enabled ? "bg-emerald-500" : "bg-zinc-200")}>
                                            <div className={cn(
                                                "absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform shadow-sm",
                                                captionOptions.enabled ? "translate-x-4" : "translate-x-0.5"
                                            )} />
                                        </button>
                                    </div>

                                    {captionOptions.enabled ? (
                                        <div className="p-3.5 space-y-3">
                                            {/* Style grid */}
                                            <div>
                                                <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Style</label>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {CAPTION_STYLES.map(s => (
                                                        <button
                                                            key={s.id}
                                                            onClick={() => setCaptionOptions(prev => ({ ...prev, style: s.id }))}
                                                            className={cn(
                                                                "flex items-center justify-between px-2 py-1 rounded-lg text-[10px] font-medium border transition-all",
                                                                captionOptions.style === s.id
                                                                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                                                    : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                                                            )}>
                                                            {s.label}
                                                            {captionOptions.style === s.id && <Check className="h-2.5 w-2.5" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Preview */}
                                            <CaptionPreview style={captionOptions.style} highlightColor={captionOptions.highlightColor} />

                                            {/* Advanced toggle */}
                                            <button
                                                onClick={() => setShowAdvancedCaptions(!showAdvancedCaptions)}
                                                className="w-full text-[9px] font-bold text-zinc-400 hover:text-zinc-600 flex items-center justify-center gap-1 py-1 border border-dashed border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors uppercase tracking-widest">
                                                {showAdvancedCaptions ? "Moins ▲" : "Avancé ▼"}
                                            </button>

                                            {showAdvancedCaptions && (
                                                <div className="space-y-2.5">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Taille</label>
                                                            <Select
                                                                value={captionOptions.fontSize.toString()}
                                                                onValueChange={(v) => setCaptionOptions(prev => ({ ...prev, fontSize: parseInt(v) }))}>
                                                                <SelectTrigger className="bg-white border-zinc-200 text-zinc-900 rounded-lg h-7 text-[10px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-white border-zinc-200">
                                                                    <SelectItem value="32">Petit</SelectItem>
                                                                    <SelectItem value="48">Normal</SelectItem>
                                                                    <SelectItem value="64">Grand</SelectItem>
                                                                    <SelectItem value="80">Énorme</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1 block">Position</label>
                                                            <Select
                                                                value={captionOptions.position}
                                                                onValueChange={(v) => setCaptionOptions(prev => ({ ...prev, position: v }))}>
                                                                <SelectTrigger className="bg-white border-zinc-200 text-zinc-900 rounded-lg h-7 text-[10px]">
                                                                    <SelectValue />
                                                                </SelectTrigger>
                                                                <SelectContent className="bg-white border-zinc-200">
                                                                    <SelectItem value="bottom">Bas</SelectItem>
                                                                    <SelectItem value="center">Centre</SelectItem>
                                                                    <SelectItem value="top">Haut</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">Couleur highlight</label>
                                                        <div className="flex gap-1.5 flex-wrap">
                                                            {HIGHLIGHT_COLORS.map(c => (
                                                                <button
                                                                    key={c}
                                                                    onClick={() => setCaptionOptions(prev => ({ ...prev, highlightColor: c }))}
                                                                    aria-label={`Couleur ${c}`}
                                                                    className={cn(
                                                                        "h-5 w-5 rounded-full border-2 transition-all hover:scale-110",
                                                                        captionOptions.highlightColor === c ? "border-zinc-800 scale-110" : "border-transparent"
                                                                    )}
                                                                    style={{ backgroundColor: c }} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-8 gap-1.5 opacity-30">
                                            <Type className="h-6 w-6 text-zinc-400" />
                                            <p className="text-xs text-zinc-400 font-medium">Désactivés</p>
                                        </div>
                                    )}
                                </div>
                                )}
                            </div>
                        </div>

                        {/* Footer with step navigation */}
                        <div className="shrink-0 px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                            <button
                                onClick={() => productionStep > 0 && setProductionStep((productionStep - 1) as 0 | 1 | 2)}
                                disabled={productionStep === 0}
                                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
                                <ChevronLeft className="h-3.5 w-3.5" /> Précédent
                            </button>
                            <div className="text-xs font-medium text-zinc-500">
                                Étape {productionStep + 1} sur 3
                            </div>
                            {productionStep < 2 ? (
                                <button
                                    onClick={() => setProductionStep((productionStep + 1) as 0 | 1 | 2)}
                                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors font-medium">
                                    Suivant <ChevronRight className="h-3.5 w-3.5" />
                                </button>
                            ) : (
                                <Button
                                    onClick={handleAssemble}
                                    disabled={assembling}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg h-8 px-4 text-xs gap-1.5 shadow-sm shadow-emerald-200/60">
                                    <Zap className="h-3.5 w-3.5 fill-current" />
                                    Rendu ({activeVideo?.options?.resolution === "1080p" ? "10" : "5"} 🪙)
                                </Button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* ── INSERT SCENE DIALOG ────────────────────────────────────────── */}
            {isInserting && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="insert-scene-title">
                    <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100">
                            <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div>
                                <h3 id="insert-scene-title" className="text-sm font-bold text-zinc-900">Nouvelle Scène</h3>
                                <p className="text-[10px] text-zinc-400">L'IA génère les prompts visuels automatiquement</p>
                            </div>
                            <button
                                onClick={() => setIsInserting(false)}
                                aria-label="Fermer"
                                className="ml-auto text-zinc-300 hover:text-zinc-600 transition-colors">
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label htmlFor="new-narration" className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">
                                    Narration
                                </label>
                                <Textarea
                                    id="new-narration"
                                    placeholder="Ex: Le chat saute sur le canapé…"
                                    value={newNarration}
                                    onChange={(e) => setNewNarration(e.target.value)}
                                    className="min-h-[100px] bg-zinc-50 border-zinc-200 text-zinc-900 resize-none focus:border-emerald-400 text-sm" />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    variant="ghost"
                                    onClick={() => { setIsInserting(false); setNewNarration(""); }}
                                    className="text-zinc-500 hover:bg-zinc-100 rounded-lg text-xs h-8">
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleInsertScene}
                                    disabled={!newNarration.trim() || generating}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg px-4 h-8 text-xs gap-1.5">
                                    {generating
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : "Générer la scène"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function MusicOption({
    label, tags, selected, playing = false, onClick
}: {
    label: string;
    tags?: string[];
    selected: boolean;
    playing?: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] border transition-colors text-left",
                selected
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            )}>
            <div className={cn(
                "h-3.5 w-3.5 rounded-full border-2 shrink-0 flex items-center justify-center",
                selected ? "border-emerald-500 bg-emerald-500" : "border-zinc-300"
            )}>
                {selected && <div className="h-1 w-1 rounded-full bg-white" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-semibold truncate flex items-center gap-1">
                    {selected && playing && (
                        <span className="flex gap-0.5 mr-1">
                            {[1, 2, 3].map(b => (
                                <span key={b} className="w-0.5 h-2 bg-emerald-500 rounded-full animate-bounce"
                                    style={{ animationDelay: `${b * 0.1}s` }} />
                            ))}
                        </span>
                    )}
                    {label}
                </div>
                {tags && <div className="text-[8px] text-zinc-400 truncate">{tags.join(" · ")}</div>}
            </div>
        </button>
    );
}

function CaptionPreview({ style, highlightColor }: { style: string; highlightColor: string }) {
    return (
        <div className="relative aspect-video rounded-lg bg-zinc-900 overflow-hidden border border-zinc-200">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=60')] bg-cover bg-center opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
                {style === "colored" && <div className="text-xs font-black italic text-white">VOTRE <span style={{ color: highlightColor }}>VIDÉO</span>.</div>}
                {style === "scaling" && <div className="text-xs font-bold text-white uppercase scale-110 animate-pulse">TEXTE</div>}
                {style === "bounce" && <div className="text-xs font-bold text-yellow-400 animate-bounce">REBOND</div>}
                {style === "neon" && <div className="text-xs font-bold text-pink-500" style={{ textShadow: "0 0 8px rgba(236,72,153,0.8)" }}>NÉON</div>}
                {style === "typewriter" && <div className="text-xs font-mono text-emerald-400 border-r border-emerald-400 pr-0.5 animate-pulse">TYPE...</div>}
                {style === "karaoke" && <div className="text-xs font-bold flex gap-1"><span style={{ color: highlightColor }} className="underline underline-offset-2">MOT</span><span className="text-white"> PAR MOT</span></div>}
                {style === "animated-background" && <div className="text-xs font-bold bg-emerald-500 text-white px-2 py-0.5 rounded-full">BULLE</div>}
                {style === "remotion" && <div className="text-xs font-black text-white uppercase tracking-tighter">MOTION</div>}
            </div>
            <div className="absolute bottom-1 left-1.5 flex items-center gap-1 opacity-30">
                <Eye className="h-2 w-2 text-white" />
                <span className="text-[7px] text-white font-bold uppercase tracking-widest">Aperçu</span>
            </div>
        </div>
    );
}

// ─── Constants ────────────────────────────────────────────────────────────────
const CAPTION_STYLES = [
    { id: "colored", label: "Coloré" },
    { id: "scaling", label: "Zoom" },
    { id: "bounce", label: "Rebond" },
    { id: "neon", label: "Néon" },
    { id: "typewriter", label: "Machine" },
    { id: "karaoke", label: "Karaoké" },
    { id: "animated-background", label: "Bulle" },
    { id: "remotion", label: "Moderne" },
];

const HIGHLIGHT_COLORS = ["#FFE135", "#10B981", "#3B82F6", "#EC4899", "#F97316", "#FFFFFF"];