"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronRight, FileText, Play, RefreshCw, Wand2, Loader2,
    ChevronLeft, Zap, Sparkles, Music, SkipBack, SkipForward,
    Type, Eye, Check, Settings2, FileJson, RotateCcw,
    Plus, Film, Mic, AlertCircle, Home
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

const adminService = new AdminService();

type StudioTab = "script" | "storyboard" | "production";

export default function StudioPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();

    const [activeVideo, setActiveVideo] = useState<Video | null>(null);
    const [activeTab, setActiveTab] = useState<StudioTab>("script");
    const [selectedScene, setSelectedScene] = useState<string>("s1");

    const [generating, setGenerating] = useState(false);
    const [assembling, setAssembling] = useState(false);
    const [visualsGenerated, setVisualsGenerated] = useState(false);
    const [regeneratingSceneId, setRegeneratingSceneId] = useState<string | null>(null);
    const [jobId, setJobId] = useState<string | undefined>();
    const [repromptJobId, setRepromptJobId] = useState<string | undefined>();
    const [assembleJobId, setAssembleJobId] = useState<string | undefined>();
    const [error, setError] = useState<string | null>(null);

    // Audio/Video Settings States (Moved from Step 3)
    const [availableVoices, setAvailableVoices] = useState<any[]>([]);
    const [availableModels, setAvailableModels] = useState<any[]>([]);
    const [musicTracks, setMusicTracks] = useState<any[]>([]);
    const [selectedMusicId, setSelectedMusicId] = useState<string>("none");
    const [musicVolume, setMusicVolume] = useState(60);
    const [voiceVolume, setVoiceVolume] = useState(80);
    const [isPlayingAudio, setIsPlayingAudio] = useState(false);
    const [kokoroVoicePreset, setKokoroVoicePreset] = useState<string>("af_heart");
    const [showCaptions, setShowCaptions] = useState(true);
    const [captionStyle, setCaptionStyle] = useState<string>("colored");
    const [fontSize, setFontSize] = useState(48);
    const [highlightColor, setHighlightColor] = useState("#FFE135");
    const [captionPosition, setCaptionPosition] = useState<string>("bottom");
    const [showAdvancedCaptions, setShowAdvancedCaptions] = useState(false);
    const [resolution, setResolution] = useState<string>("720p");

    const audioRef = useRef<HTMLAudioElement | null>(null);

    // Context & Edits
    const [sceneEdits, setSceneEdits] = useState<Record<string, any>>({});
    const [isInserting, setIsInserting] = useState(false);
    const [insertIndex, setInsertIndex] = useState<number | null>(null);
    const [newNarration, setNewNarration] = useState("");

    const {
        progress: realProgress, message: realMessage, isFinished,
        lastScene, lastSceneIndex, currentSceneIndex,
        error: jobError, promptsUrl,
        cancelVideo, restartVideo, rescriptVideo, insertScene: apiInsertScene
    } = useVideoProgress(jobId);

    const { currentSceneIndex: repromptIndex, isFinished: isRepromptFinished, error: repromptError } = useVideoProgress(repromptJobId);
    const { progress: assembleProgress, message: assembleMessage, isFinished: isAssembleFinished, error: assembleError } = useVideoProgress(assembleJobId);

    useEffect(() => {
        const load = async () => {
            try {
                const [video, voices, models, music] = await Promise.all([
                    videosService.getById(resolvedParams.id),
                    adminService.listVoices(),
                    adminService.listModels(),
                    adminService.listMusic()
                ]);
                setActiveVideo(video);
                setAvailableVoices(voices || []);
                setAvailableModels(models?.data || []);
                setMusicTracks(music || []);
                if (video.options?.backgroundMusic) setSelectedMusicId(video.options.backgroundMusic);
                if (video.options?.kokoroVoicePreset) setKokoroVoicePreset(video.options.kokoroVoicePreset);
                if (video.options?.narrationVolume !== undefined) setVoiceVolume(Math.round(video.options.narrationVolume * 100));
                if (video.options?.backgroundMusicVolume !== undefined) setMusicVolume(Math.round(video.options.backgroundMusicVolume * 100));
                if (video.options?.assCaptions) {
                    setShowCaptions(video.options.assCaptions.enabled !== false);
                    setCaptionStyle(video.options.assCaptions.style || "colored");
                    if (video.options.assCaptions.fontSize) setFontSize(video.options.assCaptions.fontSize);
                    if (video.options.assCaptions.highlightColor) setHighlightColor(video.options.assCaptions.highlightColor);
                    if (video.options.assCaptions.position) setCaptionPosition(video.options.assCaptions.position);
                }
                if ((video.status === "processing" || video.status === "queued") && video.jobId) {
                    setJobId(video.jobId);
                    setGenerating(true);
                    if (video.script || (video.scenes && video.scenes.length > 0)) setActiveTab("storyboard");
                }
                if (["scenes_generated", "narration_generated", "completed"].includes(video.status)) {
                    setVisualsGenerated(true);
                    setActiveTab("storyboard");
                }
                const ds = (video.scenes?.length ? video.scenes : video.script?.scenes) || [];
                setSelectedScene(ds[0]?.id || "s1");
            } catch { setError("Impossible de charger les données du studio."); }
        };
        load();
    }, [resolvedParams.id]);

    const handleInsertScene = async () => {
        if (!activeVideo || insertIndex === null || !newNarration) return;
        try {
            setGenerating(true);
            const updatedScript = await apiInsertScene(activeVideo.id, insertIndex, newNarration);
            if (updatedScript) {
                setActiveVideo(prev => prev ? { ...prev, script: updatedScript, scenes: updatedScript.scenes } : null);
                setIsInserting(false);
                setNewNarration("");
            }
            setGenerating(false);
        } catch {
            setError("Erreur lors de l'insertion de la scène");
            setGenerating(false);
        }
    };

    const handleAnimate = async () => {
        if (!activeVideo) return;
        try {
            setGenerating(true);
            setActiveTab("storyboard");
            const response = await videosService.generateScenes(activeVideo.id);
            setJobId(response.jobId);
            setError(null);
        } catch (error: any) {
            setError(error.message || "Erreur lors du démarrage de la génération des visuels");
            setGenerating(false);
        }
    };

    const handleRegenerateImage = async (sceneId: string, sceneIndex: number) => {
        if (!activeVideo) return;
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
        try { await videosService.update(activeVideo.id, { script: activeVideo.script, scenes: activeVideo.script?.scenes || [] }); }
        catch (err: any) { setError(err.message || "Erreur lors de la sauvegarde du script"); }
    };

    const handleAssemble = async () => {
        if (!activeVideo) return;
        try {
            setAssembling(true);
            const nVol = voiceVolume / 100, mVol = musicVolume / 100;
            await videosService.update(activeVideo.id, {
                options: {
                    ...activeVideo.options,
                    backgroundMusic: selectedMusicId === "none" ? undefined : selectedMusicId,
                    kokoroVoicePreset: kokoroVoicePreset as any,
                    narrationVolume: nVol, backgroundMusicVolume: mVol,
                    assCaptions: { ...activeVideo.options?.assCaptions, enabled: showCaptions, style: captionStyle as any, fontSize, highlightColor, position: captionPosition as any }
                }
            });
            const r = await videosService.assemble(activeVideo.id, {
                narrationVolume: nVol, backgroundMusicVolume: mVol,
                assCaptions: { enabled: showCaptions, style: captionStyle as any, fontSize, highlightColor, position: captionPosition as any }
            });
            setAssembleJobId(r.jobId); setError(null);
        } catch (err: any) { setError(err.message || "Erreur lors de l'assemblage de la vidéo finale"); setAssembling(false); }
    };

    const handleSkip = (dir: "next" | "prev") => {
        if (!musicTracks.length) return;
        const idx = musicTracks.findIndex((t: any) => t.id === selectedMusicId);
        let next = dir === "next" ? idx + 1 : idx - 1;
        if (next >= musicTracks.length) next = 0;
        if (next < 0) next = musicTracks.length - 1;
        setSelectedMusicId(musicTracks[next].id); setIsPlayingAudio(true);
    };

    const onScenesChange = (newScenes: any[]) => {
        if (!activeVideo) return;
        setActiveVideo({ ...activeVideo, scenes: newScenes, script: { ...activeVideo.script!, scenes: newScenes } });
    };

    useEffect(() => {
        if (isRepromptFinished && repromptJobId && !repromptError) {
            setTimeout(() => {
                videosService.getById(resolvedParams.id, true).then(updated => {
                    setActiveVideo(updated);
                    setRegeneratingSceneId(null);
                    setRepromptJobId(undefined);
                });
            }, 1000);
        } else if (isRepromptFinished && repromptError) {
            setError("Erreur lors de la régénération de l'image");
            setRegeneratingSceneId(null);
        }
    }, [isRepromptFinished, repromptJobId, repromptError, resolvedParams.id]);

    useEffect(() => {
        if (isAssembleFinished && assembleJobId && !assembleError) {
            setTimeout(() => router.push(`/generate/${resolvedParams.id}/success`), 1000);
        } else if (isAssembleFinished && assembleError) setAssembling(false);
    }, [isAssembleFinished, assembleJobId, assembleError, router, resolvedParams.id]);

    const updateScene = (id: string, field: string, value: any) => {
        setSceneEdits(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
    };

    useEffect(() => {
        if (lastScene && lastSceneIndex !== undefined && activeVideo) {
            setActiveVideo((prev: any) => {
                if (!prev) return prev;
                const scenes = [...(prev.scenes || prev.script?.scenes || [])];
                if (scenes[lastSceneIndex]) scenes[lastSceneIndex] = { ...scenes[lastSceneIndex], ...lastScene };
                else scenes[lastSceneIndex] = lastScene;
                return { ...prev, scenes };
            });
            setSelectedScene(lastScene.id || `s${lastSceneIndex + 1}`);
        }
    }, [lastScene, lastSceneIndex]);

    useEffect(() => {
        if (isFinished && jobId && !jobError) {
            videosService.getById(resolvedParams.id).then(updated => {
                setActiveVideo(updated);
                setVisualsGenerated(true);
                setGenerating(false);
                setActiveTab("storyboard");
            });
        } else if (isFinished && jobError) {
            setGenerating(false);
        }
    }, [isFinished, jobId, jobError, resolvedParams.id]);

    const isScriptMissing = !activeVideo?.script && !activeVideo?.scenes?.length;
    const showLoadingState = !activeVideo || (generating && isScriptMissing);
    const displayScenes = activeVideo ? ((activeVideo.scenes?.length ? activeVideo.scenes : activeVideo.script?.scenes) || []) : [];
    const activeSceneIndex = displayScenes.findIndex((s: any, i: number) => (s.id || `s${i + 1}`) === selectedScene);
    const activeScene = displayScenes[activeSceneIndex];

    // ─── Full-screen loading ──────────────────────────────────────────────
    if (showLoadingState) {
        return (
            <div className="min-h-[calc(100vh-56px)] bg-[#FAFAFA] flex flex-col items-center justify-center gap-10 px-4">
                <div className="relative h-40 w-40">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" className="stroke-zinc-200" strokeWidth="6" />
                        <circle cx="50" cy="50" r="44" fill="none" className="stroke-emerald-500" strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 44}`}
                            strokeDashoffset={`${2 * Math.PI * 44 * (1 - realProgress / 100)}`}
                            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-emerald-600 tracking-tighter">{realProgress}%</span>
                        <Film className="h-5 w-5 text-zinc-400 mt-1 animate-pulse" />
                    </div>
                </div>
                <div className="text-center space-y-3 max-w-sm">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 text-xs font-bold uppercase tracking-widest">
                        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Génération
                    </div>
                    <h2 className="text-xl font-black text-zinc-900">{activeVideo?.status === "queued" ? "Dans la file d'attente..." : "Création du storyboard..."}</h2>
                    <p className="text-zinc-500 text-sm">{realMessage || "L'IA prépare vos scènes et visuels."}</p>
                </div>
            </div>
        );
    }

    // ─── Assembly overlay ─────────────────────────────────────────────────
    if (assembling) {
        return (
            <div className="min-h-[calc(100vh-56px)] bg-[#FAFAFA] flex flex-col items-center justify-center gap-10 px-4">
                <div className="relative h-40 w-40">
                    <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="44" fill="none" className="stroke-zinc-200" strokeWidth="6" />
                        <circle cx="50" cy="50" r="44" fill="none" className="stroke-violet-500" strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${2 * Math.PI * 44}`}
                            strokeDashoffset={`${2 * Math.PI * 44 * (1 - assembleProgress / 100)}`}
                            style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4,0,0.2,1)" }} />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-black text-violet-600">{assembleProgress}%</span>
                        <Zap className="h-5 w-5 text-zinc-400 mt-1 animate-bounce" />
                    </div>
                </div>
                <div className="text-center space-y-3 max-w-sm">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-50 border border-violet-200 text-violet-600 text-xs font-bold uppercase tracking-widest">
                        <span className="h-1.5 w-1.5 rounded-full bg-violet-500 animate-pulse" /> Assemblage final
                    </div>
                    <h2 className="text-xl font-black text-zinc-900">Finalisation de votre vidéo</h2>
                    <p className="text-zinc-500 text-sm">{assembleMessage || "Voix, musique et captions en cours..."}</p>
                </div>
                {assembleError && <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm">{assembleError}</div>}
            </div>
        );
    }

    // ─── Main Studio ──────────────────────────────────────────────────────
    const STEPS: { id: StudioTab; label: string; Icon: any; description: string }[] = [
        { id: "script",     label: "Contenu",    Icon: FileText,  description: "Éditez la narration" },
        { id: "storyboard", label: "Storyboard", Icon: Film,      description: "Visuels générés"     },
        { id: "production", label: "Vidéo",      Icon: Settings2, description: "Voix & Musique"      },
    ];

    const stepIndex = STEPS.findIndex(s => s.id === activeTab);

    const handleNext = () => {
        if (activeTab === "script") {
            if (visualsGenerated) setActiveTab("storyboard");
            else handleAnimate();
        } else if (activeTab === "storyboard") {
            setActiveTab("production");
        } else {
            handleAssemble();
        }
    };

    return (
        <div className="flex flex-col bg-[#FAFAFA]" style={{ minHeight: "calc(100vh - 56px)" }}>

            {/* Studio top bar */}
            <div className="flex items-center px-4 h-14 border-b border-zinc-200 bg-white shrink-0 relative">
                {/* Left: home + title */}
                <div className="flex items-center gap-3 min-w-0 flex-1">
                    <button onClick={() => router.push("/videos")}
                        className="h-8 w-8 flex items-center justify-center rounded-xl bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 text-zinc-500 hover:text-zinc-900 transition-colors shrink-0">
                        <Home className="h-4 w-4" />
                    </button>
                    <span className="text-sm font-bold text-zinc-900 truncate max-w-[200px]">
                        {activeVideo?.title || activeVideo?.topic || "Sans titre"}
                    </span>
                    {activeVideo?.status && (
                        <span className={cn("text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded border shrink-0",
                            activeVideo.status === "completed" ? "text-emerald-700 bg-emerald-50 border-emerald-200"
                            : activeVideo.status === "failed"  ? "text-red-700 bg-red-50 border-red-200"
                            : "text-amber-700 bg-amber-50 border-amber-200")}>
                            {activeVideo.status}
                        </span>
                    )}
                </div>

                {/* Center: Step wizard */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-0">
                    {STEPS.map(({ id, label }, index) => {
                        const isActive = activeTab === id;
                        const isCompleted = stepIndex > index;
                        const locked = id === "storyboard" && !visualsGenerated && !generating;
                        return (
                            <div key={id} className="flex items-center">
                                {index > 0 && (
                                    <div className={cn("h-px w-10 transition-colors duration-300", isCompleted ? "bg-emerald-400" : "bg-zinc-200")} />
                                )}
                                <button
                                    onClick={() => !locked && setActiveTab(id)}
                                    title={locked ? "Générez les visuels d'abord" : label}
                                    disabled={locked}
                                    className="flex flex-col items-center gap-0.5 px-1">
                                    <div className={cn(
                                        "h-7 w-7 rounded-full text-xs flex items-center justify-center font-black border-2 transition-all duration-200",
                                        isActive    ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-200"
                                        : isCompleted ? "bg-emerald-500 border-emerald-500 text-white"
                                        : locked      ? "bg-zinc-100 border-zinc-200 text-zinc-400 cursor-not-allowed"
                                        : "bg-white border-zinc-300 text-zinc-500 hover:border-emerald-400"
                                    )}>
                                        {isCompleted ? <Check className="h-3.5 w-3.5" /> : <span>{index + 1}</span>}
                                    </div>
                                    <span className={cn("text-[10px] font-semibold whitespace-nowrap",
                                        isActive ? "text-emerald-600" : isCompleted ? "text-emerald-500" : "text-zinc-400")}>
                                        {label}
                                    </span>
                                </button>
                            </div>
                        );
                    })}
                </div>

                {/* Right: actions */}
                <div className="flex items-center gap-2 flex-1 justify-end">
                    {(promptsUrl || activeVideo?.options?.promptsUrl) && (
                        <button onClick={() => window.open(promptsUrl || activeVideo?.options?.promptsUrl, "_blank")}
                            className="text-zinc-400 hover:text-zinc-600 transition-colors shrink-0" title="Prompts JSON">
                            <FileJson className="h-4 w-4" />
                        </button>
                    )}
                    <Button onClick={handleNext} disabled={generating || assembling}
                        className="bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl h-9 px-5 text-sm gap-1.5 shrink-0">
                        {activeTab === "production" ? <><Zap className="h-4 w-4" /> Lancer</> : <>Suivant <ChevronRight className="h-4 w-4 -mr-1" /></>}
                    </Button>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 px-5 py-2 bg-red-50 border-b border-red-200 text-red-600 text-xs shrink-0">
                    <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                    <span className="flex-1">{error}</span>
                    <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">✕</button>
                </div>
            )}

            {/* Generation progress */}
            {generating && !isScriptMissing && (
                <div className="flex items-center gap-4 px-5 py-2 bg-emerald-50 border-b border-emerald-200 shrink-0">
                    <Loader2 className="h-3.5 w-3.5 text-emerald-600 animate-spin shrink-0" />
                    <div className="flex-1 min-w-0">
                        <div className="flex justify-between mb-1">
                            <span className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider truncate">{realMessage || "Génération..."}</span>
                            <span className="text-[10px] font-black text-emerald-600 ml-2 shrink-0">{realProgress}%</span>
                        </div>
                        <div className="h-1 bg-emerald-100 rounded-full overflow-hidden">
                            <div className="h-full bg-emerald-500 transition-all duration-700" style={{ width: `${realProgress}%` }} />
                        </div>
                    </div>
                    <button onClick={() => cancelVideo(activeVideo!.id)}
                        className="text-[10px] font-bold text-red-600 border border-red-200 rounded-lg px-2 py-1 hover:bg-red-50 transition-colors shrink-0">Stop</button>
                </div>
            )}

            {/* Studio body */}
            <div className="flex flex-1 overflow-hidden">

                {/* Main content */}
                <div className="flex-1 bg-[#FAFAFA] overflow-hidden flex flex-col">

                    {/* ── SCRIPT TAB ── */}
                    {activeTab === "script" && (
                        <div className="flex flex-col h-full">
                            {/* Step header */}
                            <div className="px-6 pt-5 pb-4 border-b border-zinc-200 shrink-0 bg-white">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-[9px] font-black shrink-0">1</span>
                                    <div>
                                        <p className="text-sm font-black text-zinc-900 leading-none">Validation du Script</p>
                                        <p className="text-[11px] text-zinc-500 mt-0.5">Éditez la narration de chaque scène</p>
                                    </div>
                                </div>
                            </div>

                            {/* Scenes list */}
                            <div className="flex-1 overflow-y-auto py-6 px-5">
                                <div className="max-w-2xl mx-auto">
                                    <ScriptEditor scenes={displayScenes} onScenesChange={onScenesChange} />
                                </div>
                            </div>

                            {/* Bottom action bar */}
                            <div className="shrink-0 px-5 py-3 border-t border-zinc-200 bg-white flex items-center justify-between gap-3">
                                <button onClick={handleSaveScript}
                                    className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors font-medium">
                                    Sauvegarder
                                </button>
                                {!visualsGenerated ? (
                                    <Button onClick={handleAnimate} disabled={generating}
                                        className="bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl h-9 px-5 text-xs gap-2 shrink-0">
                                        <Wand2 className="h-4 w-4" />
                                        Générer les visuels
                                        <ChevronRight className="h-4 w-4 -mr-1" />
                                    </Button>
                                ) : (
                                    <Button onClick={() => setActiveTab("storyboard")}
                                        className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-black rounded-xl h-9 px-5 text-xs gap-2 shrink-0 border border-emerald-200">
                                        <Film className="h-4 w-4" />
                                        Voir le storyboard
                                        <ChevronRight className="h-4 w-4 -mr-1" />
                                    </Button>
                                )}
                            </div>
                        </div>
                    )}

                    {/* ── STORYBOARD TAB ── */}
                    {activeTab === "storyboard" && (
                        <div className="flex h-full overflow-hidden">

                            {/* LEFT PANEL: Settings + Scene list */}
                            <aside className="w-64 bg-white border-r border-zinc-200 flex flex-col overflow-hidden shrink-0">
                                {/* Settings */}
                                <div className="p-4 border-b border-zinc-200 space-y-3">
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">Voix Narrative</label>
                                        <Select value={kokoroVoicePreset} onValueChange={setKokoroVoicePreset}>
                                            <SelectTrigger className="bg-zinc-50 border-zinc-200 text-zinc-900 rounded-xl h-9 text-xs">
                                                <SelectValue placeholder="Choisir une voix" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-zinc-200 rounded-xl">
                                                {availableVoices.map((v: any) => (
                                                    <SelectItem key={v.id} value={v.presetId} className="text-zinc-900 text-xs">
                                                        {v.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div>
                                        <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">Musique de fond</label>
                                        <Select value={selectedMusicId} onValueChange={setSelectedMusicId}>
                                            <SelectTrigger className="bg-zinc-50 border-zinc-200 text-zinc-900 rounded-xl h-9 text-xs">
                                                <SelectValue placeholder="Aucune musique" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-zinc-200 rounded-xl">
                                                <SelectItem value="none" className="text-zinc-900 text-xs">Aucune musique</SelectItem>
                                                {musicTracks.map((t: any) => (
                                                    <SelectItem key={t.id} value={t.id} className="text-zinc-900 text-xs">{t.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>

                                {/* Scene list header */}
                                <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-200">
                                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">
                                        {displayScenes.length} scène{displayScenes.length !== 1 ? "s" : ""}
                                    </span>
                                    <button className="text-[10px] font-bold text-zinc-500 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 border border-zinc-200 px-2 py-1 rounded-lg transition-colors flex items-center gap-1">
                                        Export
                                    </button>
                                </div>

                                {/* Scene thumbnails */}
                                <div className="flex-1 overflow-y-auto">
                                    {displayScenes.map((scene: any, i: number) => {
                                        const sId = scene.id || `s${i + 1}`;
                                        const isAct = selectedScene === sId;
                                        const isGen = currentSceneIndex === i || repromptIndex === i;
                                        return (
                                            <button key={sId} onClick={() => setSelectedScene(sId)}
                                                className={cn(
                                                    "w-full text-left group border-b border-zinc-100 transition-all p-2",
                                                    isAct ? "bg-emerald-50 border-l-4 border-l-emerald-500" : "hover:bg-zinc-50"
                                                )}>
                                                <div className="relative aspect-video bg-zinc-100 rounded-lg overflow-hidden">
                                                    {scene.thumbnailUrl || scene.imageUrl
                                                        ? <img src={scene.thumbnailUrl || scene.imageUrl} alt={`S${i + 1}`}
                                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                                        : <div className="absolute inset-0 flex items-center justify-center">
                                                            <Film className="h-5 w-5 text-zinc-300" />
                                                          </div>}
                                                    {isGen && (
                                                        <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[1px] flex items-center justify-center">
                                                            <Loader2 className="h-4 w-4 text-emerald-600 animate-spin" />
                                                        </div>
                                                    )}
                                                    <div className="absolute bottom-1 left-1 bg-black/50 text-white text-[9px] font-black px-1.5 py-0.5 rounded">
                                                        {String(i + 1).padStart(2, "0")}
                                                    </div>
                                                    {scene.imageUrl && <div className="absolute top-1 right-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />}
                                                </div>
                                                <p className={cn("text-[10px] mt-1.5 line-clamp-2 leading-relaxed",
                                                    isAct ? "text-emerald-700 font-medium" : "text-zinc-500")}>
                                                    {sceneEdits[sId]?.narration ?? (scene.narration || scene.text || scene.content || "...")}
                                                </p>
                                            </button>
                                        );
                                    })}
                                    {!generating && (
                                        <button onClick={() => { setInsertIndex(displayScenes.length); setIsInserting(true); }}
                                            className="w-full flex items-center justify-center gap-1.5 py-3 text-zinc-400 hover:text-emerald-600 border-t border-zinc-100 hover:bg-emerald-50 transition-colors text-[9px] font-black uppercase tracking-wider">
                                            <Plus className="h-3 w-3" /> Scène
                                        </button>
                                    )}
                                </div>
                            </aside>

                            {/* CENTER: Main Canvas + Narration */}
                            <div className="flex-1 flex flex-col overflow-hidden bg-[#FAFAFA]">
                                <div className="flex-1 overflow-y-auto p-6">
                                    {activeScene ? (
                                        <div className="max-w-3xl mx-auto space-y-4">
                                            {/* Main canvas */}
                                            <div className="relative aspect-video rounded-2xl overflow-hidden bg-zinc-900 shadow-xl border border-zinc-200 group">
                                                {(currentSceneIndex === activeSceneIndex || repromptIndex === activeSceneIndex) && (
                                                    <div className="absolute inset-0 bg-emerald-500/15 backdrop-blur-[2px] flex flex-col items-center justify-center gap-3 z-20">
                                                        <Wand2 className="h-10 w-10 text-emerald-400 animate-bounce" />
                                                        <p className="text-sm font-black text-emerald-300 uppercase tracking-widest animate-pulse">Génération en cours...</p>
                                                    </div>
                                                )}
                                                {regeneratingSceneId === selectedScene && (
                                                    <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-20">
                                                        <RefreshCw className="h-10 w-10 text-emerald-400 animate-spin" />
                                                    </div>
                                                )}
                                                {activeScene.imageUrl
                                                    ? <img src={activeScene.imageUrl} className="w-full h-full object-cover" alt="Scene" />
                                                    : <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-600">
                                                        <Film className="h-20 w-20 mb-4 opacity-20" />
                                                        <p className="text-sm font-medium text-zinc-500">Générez les visuels depuis le panneau droit</p>
                                                      </div>}
                                                {activeScene.narration && (
                                                    <div className="absolute bottom-4 left-4 right-4 text-center pointer-events-none">
                                                        <span className="bg-black/75 backdrop-blur-sm text-white text-sm px-4 py-2 rounded-xl font-medium border border-white/10 shadow-lg">
                                                            {(() => { const n = sceneEdits[selectedScene]?.narration ?? activeScene.narration ?? ""; return n.length > 80 ? n.substring(0, 80) + "..." : n; })()}
                                                        </span>
                                                    </div>
                                                )}
                                                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-sm text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wide">
                                                    {String(activeSceneIndex + 1).padStart(2, "0")} / {String(displayScenes.length).padStart(2, "0")}
                                                </div>
                                            </div>

                                            {/* Narration edit */}
                                            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4">
                                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Narration</label>
                                                <Textarea
                                                    value={sceneEdits[selectedScene]?.narration ?? (activeScene.narration || activeScene.text || "")}
                                                    onChange={(e) => updateScene(selectedScene, "narration", e.target.value)}
                                                    className="min-h-[72px] bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-emerald-400 text-sm resize-none rounded-xl"
                                                    placeholder="Texte de narration..." />
                                            </div>

                                            {/* Utility actions */}
                                            <div className="flex items-center justify-between">
                                                <button onClick={() => { setInsertIndex(activeSceneIndex); setIsInserting(true); }}
                                                    className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-zinc-700 transition-colors font-medium">
                                                    <Plus className="h-3.5 w-3.5" /> Insérer une scène avant
                                                </button>
                                                {visualsGenerated && (
                                                    <button onClick={async () => { const j = await restartVideo(activeVideo!.id); if (j) { setJobId(j); setGenerating(true); } }}
                                                        className="flex items-center gap-1.5 text-xs text-zinc-400 hover:text-orange-500 transition-colors font-medium">
                                                        <RotateCcw className="h-3 w-3" /> Tout régénérer
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center h-48">
                                            <p className="text-zinc-400 text-sm">Sélectionnez une scène dans le panneau gauche</p>
                                        </div>
                                    )}
                                </div>

                                {/* Bottom nav */}
                                <div className="shrink-0 px-6 py-3 border-t border-zinc-200 bg-white flex items-center justify-between gap-3">
                                    <button onClick={() => setActiveTab("script")}
                                        className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors font-medium">
                                        <ChevronLeft className="h-3.5 w-3.5" /> Contenu
                                    </button>
                                    {visualsGenerated && (
                                        <Button onClick={() => setActiveTab("production")}
                                            className="bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl h-9 px-5 text-xs gap-2 shrink-0">
                                            Vidéo <ChevronRight className="h-4 w-4 -mr-1" />
                                        </Button>
                                    )}
                                </div>
                            </div>

                            {/* RIGHT PANEL: Prompt visuel + Actions */}
                            <aside className="w-72 bg-white border-l border-zinc-200 flex flex-col overflow-y-auto shrink-0">
                                <div className="p-5 space-y-5 flex-1">
                                    {activeScene ? (
                                        <>
                                            {/* Image prompt */}
                                            <div>
                                                <h3 className="text-sm font-black text-zinc-900 mb-2">Prompt Visuel</h3>
                                                <Textarea
                                                    value={sceneEdits[selectedScene]?.imagePrompt ?? (activeScene.imagePrompt || activeScene.prompt || "")}
                                                    onChange={(e) => updateScene(selectedScene, "imagePrompt", e.target.value)}
                                                    className="min-h-[160px] bg-zinc-50 border-zinc-200 text-zinc-900 focus:border-emerald-400 text-sm resize-none rounded-xl"
                                                    placeholder="Décrivez le visuel de la scène..." />
                                                <div className="text-[10px] text-zinc-400 text-right mt-1">
                                                    {(sceneEdits[selectedScene]?.imagePrompt ?? (activeScene.imagePrompt || activeScene.prompt) ?? "").length} / 1000
                                                </div>
                                            </div>

                                            {/* Regenerate */}
                                            <Button
                                                onClick={() => handleRegenerateImage(selectedScene, activeSceneIndex)}
                                                disabled={!!regeneratingSceneId || generating}
                                                className="w-full bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl h-11 text-sm gap-2">
                                                {regeneratingSceneId === selectedScene
                                                    ? <RefreshCw className="h-4 w-4 animate-spin" />
                                                    : <Sparkles className="h-4 w-4" />}
                                                Régénérer (5 🪙)
                                            </Button>
                                        </>
                                    ) : (
                                        <p className="text-zinc-400 text-sm text-center pt-10">Sélectionnez une scène</p>
                                    )}

                                    {/* Animate / next step */}
                                    {!visualsGenerated ? (
                                        <Button
                                            onClick={handleAnimate}
                                            disabled={generating}
                                            className="w-full font-black rounded-xl h-11 text-sm gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white border-0 shadow-md shadow-emerald-200">
                                            <Wand2 className="h-4 w-4" />
                                            {generating ? "Génération..." : "Générer les visuels"}
                                        </Button>
                                    ) : (
                                        <Button
                                            onClick={() => setActiveTab("production")}
                                            className="w-full font-black rounded-xl h-11 text-sm gap-2 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-white border-0 shadow-md shadow-emerald-200">
                                            <Play className="h-4 w-4" />
                                            Passer en Production
                                        </Button>
                                    )}
                                </div>
                            </aside>
                        </div>
                    )}

                    {/* ── PRODUCTION TAB ── */}
                    {activeTab === "production" && (
                        <div className="flex flex-col h-full">
                            {/* Step header */}
                            <div className="px-6 pt-5 pb-4 border-b border-zinc-200 shrink-0 bg-white">
                                <div className="flex items-center gap-2.5">
                                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-emerald-500 text-white text-[9px] font-black shrink-0">3</span>
                                    <div>
                                        <p className="text-sm font-black text-zinc-900 leading-none">Production</p>
                                        <p className="text-[11px] text-zinc-500 mt-0.5">Voix narrative · Musique de fond · Sous-titres</p>
                                    </div>
                                </div>
                            </div>

                            {/* Config grid */}
                            <div className="flex-1 overflow-y-auto py-6 px-5">
                                <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-4">

                                {/* Voice */}
                                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-200">
                                        <div className="h-7 w-7 rounded-lg bg-blue-50 flex items-center justify-center">
                                            <Mic className="h-3.5 w-3.5 text-blue-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-zinc-900">Voix Narrative</p>
                                            <p className="text-[10px] text-zinc-500">Narration globale</p>
                                        </div>
                                    </div>
                                    <div className="p-4 space-y-4">
                                        <Select value={kokoroVoicePreset} onValueChange={setKokoroVoicePreset}>
                                            <SelectTrigger className="bg-zinc-50 border-zinc-200 text-zinc-900 rounded-xl h-10">
                                                <SelectValue placeholder="Choisir une voix" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl bg-white border-zinc-200">
                                                {availableVoices.map((v: any) => (
                                                    <SelectItem key={v.id} value={v.presetId} className="text-zinc-900">
                                                        <div className="flex items-center gap-2">
                                                            <span>{v.gender === "female" ? "👩" : "👨"}</span>
                                                            <span className="font-medium">{v.name}</span>
                                                            <span className="text-[9px] uppercase px-1 py-0.5 rounded bg-zinc-100 text-zinc-500 font-bold">{v.language?.split("-")[0]}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <div className="space-y-3 pt-1">
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-zinc-500">🎙️ Voix</span>
                                                    <span className="font-black text-zinc-900">{voiceVolume}%</span>
                                                </div>
                                                <Slider min={0} max={100} step={5} value={voiceVolume} onChange={(e) => setVoiceVolume(parseInt(e.target.value))} />
                                            </div>
                                            <div className="space-y-1.5">
                                                <div className="flex justify-between text-xs">
                                                    <span className="text-zinc-500">🎵 Musique</span>
                                                    <span className="font-black text-zinc-900">{musicVolume}%</span>
                                                </div>
                                                <Slider min={0} max={100} step={5} value={musicVolume} onChange={(e) => setMusicVolume(parseInt(e.target.value))} />
                                            </div>
                                        </div>
                                        <p className="text-[10px] text-zinc-400 italic pt-3 border-t border-zinc-100 leading-relaxed">L'IA applique le ducking automatique pour garder la voix audible.</p>
                                    </div>
                                </div>

                                {/* Music */}
                                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="flex items-center gap-2.5 px-4 py-3 border-b border-zinc-200">
                                        <div className="h-7 w-7 rounded-lg bg-amber-50 flex items-center justify-center">
                                            <Music className="h-3.5 w-3.5 text-amber-500" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-zinc-900">Musique de fond</p>
                                            <p className="text-[10px] text-zinc-500">{musicTracks.length} pistes</p>
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        <div className="max-h-52 overflow-y-auto space-y-1 pr-0.5">
                                            <button onClick={() => setSelectedMusicId("none")}
                                                className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium border transition-colors text-left",
                                                    selectedMusicId === "none" ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50")}>
                                                <div className={cn("h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                                                    selectedMusicId === "none" ? "border-emerald-500 bg-emerald-500" : "border-zinc-300")}>
                                                    {selectedMusicId === "none" && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                                </div>
                                                Aucune musique
                                            </button>
                                            {musicTracks.map((t: any) => (
                                                <button key={t.id} onClick={() => { setSelectedMusicId(t.id); setIsPlayingAudio(true); }}
                                                    className={cn("w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs border transition-colors text-left",
                                                        selectedMusicId === t.id ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-zinc-200 text-zinc-600 hover:bg-zinc-50")}>
                                                    <div className={cn("h-4 w-4 rounded-full border-2 shrink-0 flex items-center justify-center",
                                                        selectedMusicId === t.id ? "border-emerald-500 bg-emerald-500" : "border-zinc-300")}>
                                                        {selectedMusicId === t.id && <div className="h-1.5 w-1.5 rounded-full bg-white" />}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="font-bold truncate flex items-center gap-1">
                                                            {selectedMusicId === t.id && isPlayingAudio && (
                                                                <span className="flex gap-0.5 mr-1">
                                                                    {[1, 2, 3].map(b => <span key={b} className="w-0.5 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${b * 0.1}s` }} />)}
                                                                </span>
                                                            )}
                                                            {t.name}
                                                        </div>
                                                        {t.tags && <div className="text-[9px] text-zinc-400 truncate">{t.tags.join(" · ")}</div>}
                                                    </div>
                                                </button>
                                            ))}
                                        </div>
                                        <div className="flex items-center justify-center gap-3 pt-2 border-t border-zinc-100">
                                            <button onClick={() => handleSkip("prev")} className="text-zinc-400 hover:text-zinc-700 transition-colors"><SkipBack className="h-4 w-4" /></button>
                                            <button onClick={() => setIsPlayingAudio(!isPlayingAudio)} disabled={selectedMusicId === "none"}
                                                className={cn("h-9 w-9 rounded-full border flex items-center justify-center transition-all",
                                                    selectedMusicId !== "none" ? "bg-zinc-50 border-zinc-200 text-zinc-700 hover:border-emerald-400 hover:text-emerald-600" : "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed")}>
                                                {isPlayingAudio
                                                    ? <div className="flex gap-0.5"><div className="w-1 h-3.5 bg-current rounded-sm animate-pulse" /><div className="w-1 h-3.5 bg-current rounded-sm animate-pulse" style={{ animationDelay: "0.15s" }} /></div>
                                                    : <Play className="h-4 w-4 fill-current ml-0.5" />}
                                            </button>
                                            <button onClick={() => handleSkip("next")} className="text-zinc-400 hover:text-zinc-700 transition-colors"><SkipForward className="h-4 w-4" /></button>
                                        </div>
                                        {isPlayingAudio && <div className="h-0.5 bg-zinc-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 animate-[loading_10s_linear_infinite]" style={{ width: "100%" }} /></div>}
                                    </div>
                                </div>

                                {/* Captions */}
                                <div className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-sm">
                                    <div className="flex items-center justify-between px-4 py-3 border-b border-zinc-200">
                                        <div className="flex items-center gap-2.5">
                                            <div className="h-7 w-7 rounded-lg bg-pink-50 flex items-center justify-center">
                                                <Type className="h-3.5 w-3.5 text-pink-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-zinc-900">Sous-titres</p>
                                                <p className="text-[10px] text-zinc-500">Style &amp; animation</p>
                                            </div>
                                        </div>
                                        <button onClick={() => setShowCaptions(!showCaptions)}
                                            className={cn("relative w-9 h-5 rounded-full transition-colors", showCaptions ? "bg-emerald-500" : "bg-zinc-200")}>
                                            <div className={cn("absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm", showCaptions ? "translate-x-[18px]" : "translate-x-0.5")} />
                                        </button>
                                    </div>
                                    {showCaptions ? (
                                        <div className="p-4 space-y-3">
                                            <div>
                                                <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Style</label>
                                                <div className="grid grid-cols-2 gap-1">
                                                    {[{id:"colored",l:"Coloré"},{id:"scaling",l:"Zoom"},{id:"bounce",l:"Rebond"},{id:"neon",l:"Néon"},
                                                      {id:"typewriter",l:"Machine"},{id:"karaoke",l:"Karaoké"},{id:"animated-background",l:"Bulle"},{id:"remotion",l:"Moderne"}
                                                    ].map(s => (
                                                        <button key={s.id} onClick={() => setCaptionStyle(s.id)}
                                                            className={cn("flex items-center justify-between px-2 py-1.5 rounded-lg text-[11px] font-medium border transition-all",
                                                                captionStyle === s.id ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-zinc-200 text-zinc-600 hover:border-zinc-300 hover:text-zinc-900")}>
                                                            {s.l} {captionStyle === s.id && <Check className="h-3 w-3" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="relative aspect-video rounded-lg bg-zinc-900 overflow-hidden border border-zinc-200">
                                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=60')] bg-cover bg-center opacity-25" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                                                <div className="absolute inset-0 flex items-center justify-center">
                                                    {captionStyle === "colored" && <div className="text-sm font-black italic text-white drop-shadow-xl">VOTRE <span className="text-emerald-400">VIDÉO</span>.</div>}
                                                    {captionStyle === "scaling" && <div className="text-sm font-bold text-white uppercase scale-110 animate-pulse">TEXTE</div>}
                                                    {captionStyle === "bounce" && <div className="text-sm font-bold text-yellow-400 animate-bounce">REBOND</div>}
                                                    {captionStyle === "neon" && <div className="text-sm font-bold text-pink-500" style={{textShadow:"0 0 8px rgba(236,72,153,0.8)"}}>NÉON</div>}
                                                    {captionStyle === "typewriter" && <div className="text-sm font-mono text-emerald-400 border-r-2 border-emerald-400 pr-1 animate-pulse">TYPE...</div>}
                                                    {captionStyle === "karaoke" && <div className="text-sm font-bold flex gap-1"><span style={{color:highlightColor}} className="underline underline-offset-2">MOT</span><span className="text-white"> PAR MOT</span></div>}
                                                    {captionStyle === "animated-background" && <div className="text-sm font-bold bg-emerald-500 text-white px-3 py-1 rounded-full">BULLE</div>}
                                                    {captionStyle === "remotion" && <div className="text-sm font-black text-white uppercase tracking-tighter">MOTION</div>}
                                                </div>
                                                <div className="absolute bottom-1.5 left-2 flex items-center gap-1 opacity-40">
                                                    <Eye className="h-2.5 w-2.5 text-zinc-400" />
                                                    <span className="text-[8px] text-zinc-400">APERÇU</span>
                                                </div>
                                            </div>
                                            <button onClick={() => setShowAdvancedCaptions(!showAdvancedCaptions)}
                                                className="w-full text-[9px] font-bold text-zinc-400 hover:text-zinc-600 flex items-center justify-center gap-1 py-1.5 border border-dashed border-zinc-200 rounded-lg hover:border-zinc-300 transition-colors uppercase tracking-widest">
                                                {showAdvancedCaptions ? "Moins ▲" : "Avancé ▼"}
                                            </button>
                                            {showAdvancedCaptions && (
                                                <div className="space-y-3">
                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 block">Taille</label>
                                                            <Select value={fontSize.toString()} onValueChange={v => setFontSize(parseInt(v))}>
                                                                <SelectTrigger className="bg-zinc-50 border-zinc-200 text-zinc-900 rounded-lg h-8 text-xs"><SelectValue /></SelectTrigger>
                                                                <SelectContent className="bg-white border-zinc-200">
                                                                    <SelectItem value="32">Petit</SelectItem>
                                                                    <SelectItem value="48">Normal</SelectItem>
                                                                    <SelectItem value="64">Grand</SelectItem>
                                                                    <SelectItem value="80">Énorme</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                        <div>
                                                            <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-1 block">Position</label>
                                                            <Select value={captionPosition} onValueChange={setCaptionPosition}>
                                                                <SelectTrigger className="bg-zinc-50 border-zinc-200 text-zinc-900 rounded-lg h-8 text-xs"><SelectValue /></SelectTrigger>
                                                                <SelectContent className="bg-white border-zinc-200">
                                                                    <SelectItem value="bottom">Bas</SelectItem>
                                                                    <SelectItem value="center">Centre</SelectItem>
                                                                    <SelectItem value="top">Haut</SelectItem>
                                                                </SelectContent>
                                                            </Select>
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <label className="text-[9px] font-black text-zinc-500 uppercase tracking-widest mb-2 block">Couleur</label>
                                                        <div className="flex gap-2 flex-wrap">
                                                            {["#FFE135","#10B981","#3B82F6","#EC4899","#F97316","#FFFFFF"].map(c => (
                                                                <button key={c} onClick={() => setHighlightColor(c)}
                                                                    className={cn("h-6 w-6 rounded-full border-2 transition-transform hover:scale-110",
                                                                        highlightColor === c ? "border-zinc-900 scale-110" : "border-zinc-200")}
                                                                    style={{ backgroundColor: c }} />
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center justify-center py-10 gap-2 opacity-40">
                                            <Type className="h-7 w-7 text-zinc-400" />
                                            <p className="text-xs text-zinc-400">Désactivés</p>
                                        </div>
                                    )}
                                </div>
                                </div>
                            </div>

                            {/* Bottom action bar */}
                            <div className="shrink-0 px-5 py-3 border-t border-zinc-200 bg-white flex items-center justify-between gap-3">
                                <button onClick={() => setActiveTab("storyboard")}
                                    className="flex items-center gap-1.5 text-xs text-zinc-500 hover:text-zinc-900 transition-colors font-medium">
                                    <ChevronLeft className="h-3.5 w-3.5" /> Storyboard
                                </button>
                                <Button onClick={handleAssemble} disabled={assembling}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl h-9 px-5 text-xs gap-2 shrink-0">
                                    <Zap className="h-4 w-4 fill-current" />
                                    Lancer le rendu ({activeVideo?.options?.resolution === "1080p" ? "10" : "5"} 🪙)
                                </Button>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Insert dialog */}
            {isInserting && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm">
                    <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xl">
                        <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-200">
                            <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                                <Sparkles className="h-4 w-4 text-emerald-500" />
                            </div>
                            <div>
                                <h3 className="text-sm font-black text-zinc-900">Nouvelle Scène</h3>
                                <p className="text-[10px] text-zinc-500">L'IA génère les prompts visuels automatiquement</p>
                            </div>
                            <button onClick={() => setIsInserting(false)} className="ml-auto text-zinc-400 hover:text-zinc-700">✕</button>
                        </div>
                        <div className="p-5 space-y-4">
                            <div>
                                <label className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mb-1.5 block">Narration</label>
                                <Textarea placeholder="Ex: Le chat saute sur le canapé..."
                                    value={newNarration} onChange={(e) => setNewNarration(e.target.value)}
                                    className="min-h-[100px] bg-zinc-50 border-zinc-200 text-zinc-900 resize-none focus:border-emerald-400" />
                            </div>
                            <div className="flex justify-end gap-2.5">
                                <Button variant="ghost" onClick={() => setIsInserting(false)} className="text-zinc-500 hover:bg-zinc-100 rounded-xl">Annuler</Button>
                                <Button onClick={handleInsertScene} disabled={!newNarration || generating}
                                    className="bg-emerald-500 hover:bg-emerald-400 text-white font-black rounded-xl px-5">
                                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Générer la scène"}
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
