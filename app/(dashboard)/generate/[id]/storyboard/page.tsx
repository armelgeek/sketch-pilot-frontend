"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import {
    ChevronRight, FileText, Image, Play, RefreshCw, Wand2, Loader2,
    ChevronLeft, Zap, Sparkles, Music, Volume2, SkipBack,
    SkipForward, Type, Eye, Check, ExternalLink, Settings2,
    Users, MessageSquare, Monitor, FileJson, XCircle, RotateCcw
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion";
import { Slider } from "@/src/components/ui/slider";
import { cn } from "@/src/lib/utils";
import { videosService, type Video } from "@/src/services/videos-service";
import { useVideoProgress } from "@/src/hooks/use-video-progress";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { CharacterCasting } from "@/src/components/organisms/character-casting";

const adminService = new AdminService();

export default function StoryboardPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();

    const [activeVideo, setActiveVideo] = useState<Video | null>(null);
    const [storyboardView, setStoryboardView] = useState<"script" | "visuals">("script");
    const [selectedScene, setSelectedScene] = useState<string>("s1");

    const [generating, setGenerating] = useState(false);
    const [visualsGenerated, setVisualsGenerated] = useState(false);
    const [regeneratingSceneId, setRegeneratingSceneId] = useState<string | null>(null);
    const [jobId, setJobId] = useState<string | undefined>();
    const [repromptJobId, setRepromptJobId] = useState<string | undefined>();
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
        progress: realProgress,
        message: realMessage,
        isFinished,
        lastScene,
        lastSceneIndex,
        currentSceneIndex,
        error: jobError,
        promptsUrl,
        status: jobStatus,
        cancelVideo,
        restartVideo,
        rescriptVideo,
        insertScene: apiInsertScene
    } = useVideoProgress(jobId);

    const {
        currentSceneIndex: repromptIndex,
        isFinished: isRepromptFinished,
        error: repromptError
    } = useVideoProgress(repromptJobId);

    useEffect(() => {
        videosService.getById(resolvedParams.id)
            .then(video => {
                setActiveVideo(video);
                // If video is still in terminal processing state, pick up the jobId to track progress
                if ((video.status === "processing" || video.status === "queued") && video.jobId) {
                    setJobId(video.jobId);
                    setGenerating(true);
                    if (video.script || (video.scenes && video.scenes.length > 0)) {
                        setStoryboardView("visuals");
                    }
                }
                // Initialize visualsGenerated if scenes are already there
                if (video.status === 'scenes_generated' || video.status === 'narration_generated' || video.status === 'completed') {
                    setVisualsGenerated(true);
                }
                // Initialize scene selection
                const displayScenes = (video.scenes && video.scenes.length > 0) ? video.scenes : (video.script?.scenes || []);
                const firstSceneId = displayScenes[0]?.id || "s1";
                setSelectedScene(firstSceneId);
            })
            .catch(err => setError("Failed to load video storyboard."));
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
        } catch (err) {
            setError("Failed to insert scene");
            setGenerating(false);
        }
    };

    const handleAnimate = async () => {
        if (!activeVideo) return;
        try {
            setGenerating(true);
            setStoryboardView("visuals");
            const response = await videosService.generateScenes(activeVideo.id);
            setJobId(response.jobId);
            setError(null);
        } catch (error: any) {
            setError(error.message || "Failed to start animating");
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
        } catch (err: any) {
            setError("Failed to regenerate image");
            setRegeneratingSceneId(null);
        }
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
            setError("Erreur lors de la regénération de l'image");
            setRegeneratingSceneId(null);
        }
    }, [isRepromptFinished, repromptJobId, repromptError, resolvedParams.id]);

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
                if (scenes[lastSceneIndex]) {
                    scenes[lastSceneIndex] = { ...scenes[lastSceneIndex], ...lastScene };
                } else {
                    scenes[lastSceneIndex] = lastScene;
                }
                return { ...prev, scenes };
            });
            setSelectedScene(lastScene.id || `s${lastSceneIndex + 1}`);
        }
    }, [lastScene, lastSceneIndex]);

    useEffect(() => {
        if (isFinished && jobId && !jobError) {
            // Job done: reload video data to show generated images, switch to visuals tab
            videosService.getById(resolvedParams.id).then(updated => {
                setActiveVideo(updated);
                setVisualsGenerated(true);
                setGenerating(false);
                setStoryboardView("visuals"); // Automatically show generated images
            });
        } else if (isFinished && jobError) {
            setGenerating(false);
        }
    }, [isFinished, jobId, jobError, resolvedParams.id]);

    const currentProgress = generating ? realProgress : 0;
    const currentMessage = generating ? realMessage : "";

    // If video is loading or generating and script is not yet present
    const isScriptMissing = !activeVideo?.script && !activeVideo?.scenes;
    const showLoadingState = !activeVideo || (generating && isScriptMissing);

    if (showLoadingState) {
        return (
            <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
                <div className="h-24 w-24 rounded-3xl bg-emerald-500/10 flex items-center justify-center relative">
                    <Wand2 className="h-10 w-10 text-emerald-600 animate-pulse" />
                    <div className="absolute inset-0 rounded-3xl border-2 border-emerald-500/20 animate-ping opacity-20" />
                </div>
                <div className="text-center space-y-4 max-w-md">
                    <h2 className="text-2xl font-black tracking-tight">
                        {activeVideo?.status === "queued" ? "Dans la file d'attente..." : "Génération de votre storyboard..."}
                    </h2>
                    <p className="text-zinc-500 font-medium">
                        {realMessage || "Notre IA concocte vos scènes et vos visuels. Patientez quelques instants."}
                    </p>
                    <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 overflow-hidden border border-zinc-200 dark:border-zinc-700/50">
                        <div
                            className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-full transition-all duration-500 ease-out"
                            style={{ width: `${realProgress}%` }}
                        />
                    </div>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{realProgress}% complété</p>
                </div>
            </div>
        );
    }

    const scenes = activeVideo.scenes;
    const scriptScenes = activeVideo.script?.scenes;
    const displayScenes = (scenes && scenes.length > 0) ? scenes : (scriptScenes || []);

    if (!activeVideo && !error) {
        return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" /></div>;
    }

    return (
        <div className="relative min-h-screen mt-12">
            <div className="mesh-gradient" />

            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
                {error && (
                    <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-medium text-center shadow-lg">
                        {error}
                    </div>
                )}

                {/* Back navigation */}
                <button onClick={() => router.back()} className="flex items-center text-sm font-medium text-zinc-500 hover:text-emerald-600 mb-6 transition-colors">
                    <ChevronLeft className="h-4 w-4 mr-1" /> Retour
                </button>

                {/* Main Header */}
                {!generating && (
                    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20 mb-3">
                                Étape 2 sur 3
                            </div>
                            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
                                Storyboard
                            </h1>
                            <p className="text-zinc-500 font-medium mt-1">Affinez chaque scène avant l'animation</p>
                        </div>
                        <div className="flex flex-col sm:flex-row gap-3">
                            {!visualsGenerated ? (
                                <Button
                                    onClick={handleAnimate}
                                    disabled={generating}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 rounded-xl shadow-lg shadow-emerald-500/20 h-11"
                                >
                                    Générer les visuels <Wand2 className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <>
                                    <Button
                                        onClick={async () => {
                                            const newJobId = await restartVideo(activeVideo.id);
                                            if (newJobId) setJobId(newJobId);
                                        }}
                                        variant="outline"
                                        className="px-6 rounded-xl h-11 text-sm border-orange-200 text-orange-600 hover:bg-orange-50"
                                    >
                                        <RotateCcw className="mr-2 h-4 w-4" /> RESTART
                                    </Button>
                                    <Button
                                        onClick={async () => {
                                            if (confirm("Ceci va régénérer tout le script. Continuer ?")) {
                                                const newJobId = await rescriptVideo(activeVideo.id);
                                                if (newJobId) {
                                                    setJobId(newJobId);
                                                    setVisualsGenerated(false);
                                                    setActiveVideo(prev => prev ? { ...prev, script: undefined, scenes: [] } : null);
                                                }
                                            }
                                        }}
                                        variant="outline"
                                        className="px-6 rounded-xl h-11 text-sm border-purple-200 text-purple-600 hover:bg-purple-50"
                                    >
                                        <Sparkles className="mr-2 h-4 w-4" /> RE-SCRIPT
                                    </Button>
                                    <Button
                                        onClick={handleAnimate}
                                        variant="outline"
                                        disabled={generating}
                                        className="px-6 rounded-xl h-11 text-sm"
                                    >
                                        <RefreshCw className="mr-2 h-4 w-4" /> Régénérer tout
                                    </Button>
                                    <Button
                                        onClick={() => router.push(`/generate/${resolvedParams.id}/audio`)}
                                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 rounded-xl shadow-lg shadow-emerald-500/20 h-11"
                                    >
                                        Continuer vers Audio <ChevronRight className="ml-2 h-5 w-5" />
                                    </Button>
                                </>
                            )}
                            {(promptsUrl || activeVideo?.options?.promptsUrl) && (
                                <Button
                                    variant="outline"
                                    onClick={() => window.open(promptsUrl || activeVideo?.options?.promptsUrl, '_blank')}
                                    className="px-4 rounded-xl h-11 border-dashed border-emerald-500/50 text-emerald-600 hover:bg-emerald-50"
                                >
                                    <FileJson className="mr-2 h-4 w-4" /> Prompts JSON
                                </Button>
                            )}
                        </div>
                    </div>
                )}

                {/* Global Progress Banner (shown when generating but script is already present) */}
                {(generating && !isScriptMissing) && (
                    <div className="mb-8 animate-in fade-in slide-in-from-top-4 duration-500">
                        <div className="bg-emerald-500/5 backdrop-blur-sm overflow-hidden border-2 border-emerald-500/20 rounded-2xl">
                            <div className="p-4 flex flex-col md:flex-row items-center gap-4">
                                <div className="h-10 w-10 rounded-xl bg-emerald-500 flex items-center justify-center shrink-0 shadow-lg shadow-emerald-500/20">
                                    <Loader2 className="h-5 w-5 text-white animate-spin" />
                                </div>
                                <div className="flex-1 min-w-full md:min-w-0">
                                    <div className="flex items-center justify-between mb-1 gap-4">
                                        <p className="font-bold text-xs text-emerald-900 dark:text-emerald-100 uppercase tracking-wider truncate">
                                            {currentMessage || "Génération en cours..."}
                                        </p>
                                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 shrink-0">{currentProgress}%</span>
                                    </div>
                                    <div className="w-full bg-zinc-200 dark:bg-zinc-800 rounded-full h-2 overflow-hidden">
                                        <div
                                            className="bg-emerald-500 h-full transition-all duration-700 ease-out"
                                            style={{ width: `${currentProgress}%` }}
                                        />
                                    </div>
                                </div>
                                <div className="flex shrink-0 items-center gap-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => cancelVideo(activeVideo.id)}
                                        className="h-8 px-3 text-xs font-bold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg border border-red-200"
                                    >
                                        <XCircle className="h-3.5 w-3.5 mr-1.5" /> STOP
                                    </Button>
                                    <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                                        <Sparkles className="h-4 w-4 text-emerald-500 animate-pulse" />
                                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase">En direct</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Storyboard Content */}
                {(storyboardView === "script" || visualsGenerated || (generating && !isScriptMissing)) && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Sub-view tabs */}
                        <div className="flex gap-2 p-1.5 bg-zinc-100 dark:bg-zinc-800/50 w-fit rounded-2xl border border-zinc-200 dark:border-zinc-700/50 backdrop-blur-sm">
                            <button
                                onClick={() => setStoryboardView("script")}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
                                    storyboardView === "script"
                                        ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                )}
                            >
                                <FileText className="h-4 w-4" />
                                {(activeVideo?.script?.characterSheets?.length === 1 && activeVideo.options?.baseImages?.length > 0)
                                    ? "Script"
                                    : "Script & Casting"}
                            </button>
                            <button
                                onClick={() => setStoryboardView("visuals")}
                                className={cn(
                                    "flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300",
                                    storyboardView === "visuals"
                                        ? "bg-white dark:bg-zinc-700 text-emerald-600 dark:text-emerald-400 shadow-sm"
                                        : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                                )}
                            >
                                <Image className="h-4 w-4" aria-hidden="true" /> Aperçu Visuel
                            </button>
                        </div>

                        {/* Script view */}
                        {storyboardView === "script" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Scene list sidebar */}
                                <div className="lg:col-span-1">
                                    <Card className="glass-pill border-none shadow-xl overflow-hidden">
                                        <CardHeader className="border-b border-zinc-200/50 dark:border-zinc-700/50 bg-white/30 dark:bg-black/20">
                                            <CardTitle className="text-xs uppercase tracking-widest text-zinc-500">Scènes</CardTitle>
                                        </CardHeader>
                                        <CardContent className="p-0 max-h-[600px] overflow-y-auto">
                                            {displayScenes.map((scene: any, i: number) => {
                                                const currentId = scene.id || `s${i + 1}`;
                                                return (
                                                    <button
                                                        key={currentId}
                                                        onClick={() => setSelectedScene(currentId)}
                                                        className={cn(
                                                            "w-full text-left px-5 py-4 text-sm border-b border-zinc-100 dark:border-zinc-800/50 last:border-b-0 transition-all duration-300",
                                                            selectedScene === currentId
                                                                ? "bg-emerald-500/10 dark:bg-emerald-500/20 border-l-4 border-l-emerald-500"
                                                                : "hover:bg-zinc-50 dark:hover:bg-zinc-800/50"
                                                        )}
                                                    >
                                                        <div className="flex items-center justify-between mb-1">
                                                            <div className="flex items-center gap-2">
                                                                <span className={cn("font-bold", selectedScene === currentId ? "text-emerald-600 dark:text-emerald-400" : "text-zinc-900 dark:text-zinc-100")}>
                                                                    Scène {i + 1}
                                                                </span>
                                                                {(currentSceneIndex === i || repromptIndex === i) && <Loader2 className="h-3 w-3 animate-spin text-emerald-500" />}
                                                            </div>
                                                            {scene.imageUrl && <div className="h-2 w-2 rounded-full bg-emerald-500" />}
                                                        </div>
                                                        <span className="block text-zinc-500 text-xs truncate font-medium">{sceneEdits[currentId]?.narration ?? (scene.narration || scene.text || scene.content || "...")}</span>
                                                    </button>
                                                );
                                            })}
                                        </CardContent>
                                    </Card>
                                </div>
                                {/* Accordion */}
                                <div className="lg:col-span-2">


                                    <Accordion type="single" collapsible value={selectedScene} onValueChange={setSelectedScene} className="space-y-4">
                                        {displayScenes.map((scene: any, i: number) => {
                                            const currentId = scene.id || `s${i + 1}`;
                                            return (
                                                <div key={currentId} className="space-y-4">
                                                    {/* Insertion point before each scene */}
                                                    <div className="flex justify-center -my-2 opacity-0 hover:opacity-100 transition-opacity">
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            onClick={() => { setInsertIndex(i); setIsInserting(true); }}
                                                            className="h-8 rounded-full border border-dashed border-emerald-500/30 text-emerald-500 hover:bg-emerald-50"
                                                        >
                                                            <Sparkles className="h-3 w-3 mr-2" /> Insérer une scène ici
                                                        </Button>
                                                    </div>

                                                    <AccordionItem
                                                        value={currentId}
                                                        className="glass-pill border-none px-6 rounded-2xl shadow-lg transition-all"
                                                    >
                                                        <AccordionTrigger className="hover:no-underline py-4">
                                                            <span className="font-bold text-zinc-700 dark:text-zinc-300 text-left flex items-center gap-2">
                                                                Scène {i + 1}
                                                                {(currentSceneIndex === i || repromptIndex === i) && <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />}
                                                                <span className="text-zinc-500 font-medium break-words leading-tight pl-1">— {(sceneEdits[currentId]?.narration || scene.narration || scene.text || scene.content || "").substring(0, 40)}...</span>
                                                            </span>
                                                        </AccordionTrigger>
                                                        <AccordionContent className="pb-6">
                                                            <div className="space-y-3">
                                                                <div className="space-y-1">
                                                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Narration</label>
                                                                    <Textarea
                                                                        value={sceneEdits[currentId]?.narration ?? (scene.narration || scene.text || scene.content || "")}
                                                                        onChange={(e) => updateScene(currentId, 'narration', e.target.value)}
                                                                        className="min-h-[80px] resize-none"
                                                                    />
                                                                </div>
                                                                <div className="space-y-1">
                                                                    <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider ml-1">Prompt de l'image</label>
                                                                    <Textarea
                                                                        value={sceneEdits[currentId]?.imagePrompt ?? (scene.imagePrompt || scene.prompt || "")}
                                                                        onChange={(e) => updateScene(currentId, 'imagePrompt', e.target.value)}
                                                                        className="min-h-[80px] resize-none text-sm font-medium bg-emerald-50/50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-800"
                                                                        placeholder="Prompt utilisé pour générer le visuel..."
                                                                    />
                                                                </div>

                                                            </div>
                                                        </AccordionContent>
                                                    </AccordionItem>

                                                    {/* Last insertion point */}
                                                    {i === displayScenes.length - 1 && (
                                                        <div className="flex justify-center -my-2 opacity-0 hover:opacity-100 transition-opacity">
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => { setInsertIndex(i + 1); setIsInserting(true); }}
                                                                className="h-8 rounded-full border border-dashed border-emerald-500/30 text-emerald-500 hover:bg-emerald-50"
                                                            >
                                                                <Sparkles className="h-3 w-3 mr-2" /> Ajouter une scène à la fin
                                                            </Button>
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                    </Accordion>
                                </div>
                            </div>
                        )}

                        {/* Visuals view */}
                        {storyboardView === "visuals" && (
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                {/* Thumbnails */}
                                <div className="lg:col-span-1 space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                                    {displayScenes.map((scene: any, i: number) => {
                                        const currentId = scene.id || `s${i + 1}`;
                                        return (
                                            <button
                                                key={currentId}
                                                onClick={() => setSelectedScene(currentId)}
                                                className={cn(
                                                    "w-full rounded-2xl border-2 overflow-hidden text-left transition-all duration-300 group",
                                                    selectedScene === currentId
                                                        ? "border-emerald-500 shadow-xl shadow-emerald-500/10 scale-[1.02]"
                                                        : "border-transparent hover:border-zinc-200 dark:hover:border-zinc-700"
                                                )}
                                            >
                                                <div className="aspect-video bg-zinc-200 dark:bg-zinc-800/50 flex items-center justify-center relative overflow-hidden">
                                                    {scene.thumbnailUrl || scene.imageUrl ? (
                                                        <img src={scene.thumbnailUrl || scene.imageUrl} alt={scene.title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                                                    ) : (
                                                        <div className="flex flex-col items-center gap-2">
                                                            <Image className="h-8 w-8 text-zinc-400 opacity-20" />
                                                        </div>
                                                    )}

                                                    {(currentSceneIndex === i || repromptIndex === i) && (
                                                        <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-[2px] flex flex-col items-center justify-center gap-2 z-10 animate-in fade-in duration-300 transition-all">
                                                            <Wand2 className="h-8 w-8 text-emerald-500 animate-bounce" />
                                                            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 animate-pulse italic">GÉNÉRATION...</p>
                                                        </div>
                                                    )}

                                                    <div className="absolute top-2 left-2 bg-black/50 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-tighter">
                                                        Scène {i + 1}
                                                    </div>
                                                </div>
                                            </button>
                                        )
                                    })}
                                </div>
                                {/* Preview + settings */}
                                <div className="lg:col-span-2 space-y-4">
                                    {/* Main Canvas Context */}
                                    {(() => {
                                        const activeSceneIndex = displayScenes.findIndex((s: any, i: number) => (s.id || `s${i + 1}`) === selectedScene);
                                        const activeScene = displayScenes[activeSceneIndex];
                                        const isGeneratingThis = regeneratingSceneId === selectedScene;

                                        return (
                                            <div className="relative aspect-video rounded-xl bg-zinc-100 dark:bg-zinc-900 overflow-hidden border border-zinc-200 dark:border-zinc-800 group shadow-lg">
                                                {/* Action Bar / Overlay on hover */}
                                                <div className="absolute top-0 right-0 p-4 z-20 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        size="sm"
                                                        variant="secondary"
                                                        className="bg-white/80 hover:bg-white text-zinc-800 backdrop-blur"
                                                        onClick={() => handleRegenerateImage(selectedScene, activeSceneIndex)}
                                                        disabled={isGeneratingThis || generating}
                                                    >
                                                        <RefreshCw className={cn("h-4 w-4 mr-2", isGeneratingThis && "animate-spin")} />
                                                        Régénérer l'image (5 🪙)
                                                    </Button>
                                                </div>

                                                {isGeneratingThis ? (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-100/80 dark:bg-zinc-900/80 backdrop-blur-sm z-10">
                                                        <Wand2 className="h-8 w-8 text-emerald-500 animate-pulse mb-3" />
                                                        <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Création de la nouvelle image...</p>
                                                    </div>
                                                ) : activeScene?.imageUrl ? (
                                                    <img src={activeScene.imageUrl} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-zinc-400">
                                                        <Image className="h-12 w-12 opacity-20 mb-3" />
                                                        <span className="text-sm">Aucune image générée (Passer à l'animation)</span>
                                                    </div>
                                                )}

                                                {/* Lower Third Caption preview */}
                                                <div className="absolute bottom-4 left-4 right-4 bg-black/70 backdrop-blur-md text-white text-sm md:text-base p-3 md:p-4 rounded-xl font-medium border border-white/10 text-center leading-relaxed shadow-xl">
                                                    "{sceneEdits[selectedScene]?.narration ?? activeScene?.narration ?? activeScene?.text ?? activeScene?.content ?? "..."}"
                                                </div>
                                            </div>
                                        );
                                    })()}

                                    {/* NEW: Prompt Adjuster for Visuals View */}
                                    {(() => {
                                        const activeSceneIndex = displayScenes.findIndex((s: any, i: number) => (s.id || `s${i + 1}`) === selectedScene);
                                        const activeScene = displayScenes[activeSceneIndex];
                                        if (!activeScene) return null;

                                        return (
                                            <Card className="glass-pill border-none shadow-lg overflow-hidden mt-4 animate-in fade-in slide-in-from-bottom-2 duration-500">
                                                <CardHeader className="py-3 px-4 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/20">
                                                    <div className="flex items-center gap-2">
                                                        <Zap className="h-4 w-4 text-emerald-500" />
                                                        <h3 className="text-sm font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider">Ajuster le Visuel</h3>
                                                    </div>
                                                </CardHeader>
                                                <CardContent className="p-4 space-y-4">
                                                    <div className="space-y-2">
                                                        <label className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em]">Prompt de l'image (IA)</label>
                                                        <div className="relative group">
                                                            <Textarea
                                                                value={sceneEdits[selectedScene]?.imagePrompt ?? (activeScene.imagePrompt || activeScene.prompt || "")}
                                                                onChange={(e) => updateScene(selectedScene, 'imagePrompt', e.target.value)}
                                                                className="min-h-[100px] bg-zinc-50/20 dark:bg-zinc-950/20 border-zinc-200 dark:border-zinc-800 focus:border-emerald-500/50 focus:ring-emerald-500/20 text-sm font-medium transition-all"
                                                                placeholder="Décrivez ce que vous voulez voir dans cette scène (ex: ajouter un chapeau rouge, ambiance plus sombre...)"
                                                            />
                                                        </div>
                                                    </div>
                                                    <div className="flex justify-end pt-2">
                                                        <Button
                                                            size="lg"
                                                            className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/20 px-8 py-6 h-auto text-base group"
                                                            onClick={() => handleRegenerateImage(selectedScene, activeSceneIndex)}
                                                            disabled={regeneratingSceneId === selectedScene || generating}
                                                        >
                                                            {regeneratingSceneId === selectedScene ? (
                                                                <RefreshCw className="h-5 w-5 mr-3 animate-spin" />
                                                            ) : (
                                                                <Sparkles className="h-5 w-5 mr-3 group-hover:rotate-12 transition-transform" />
                                                            )}
                                                            Appliquer & Régénérer
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })()}
                                </div>
                            </div>
                        )}
                    </div>
                )}

                {/* Global Progress Screen (Shown when generating in any step) */}
                {(generating && isScriptMissing) && (
                    <div className="flex justify-center animate-in fade-in zoom-in-95 duration-700">
                        <div className="w-full max-w-2xl px-4 lg:px-0">
                            <Card className="glass-pill border-none shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden relative group">
                                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 pointer-events-none" />
                                <CardContent className="p-10 lg:p-16 flex flex-col items-center gap-8 relative z-10">
                                    {/* High-tech Circular progress */}
                                    <div className="relative h-48 w-48 animate-float">
                                        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10 dark:border-emerald-500/5" />
                                        <svg className="h-full w-full -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" viewBox="0 0 100 100">
                                            <circle
                                                cx="50" cy="50" r="44"
                                                fill="none"
                                                className="stroke-zinc-100 dark:stroke-zinc-800/50"
                                                strokeWidth="6"
                                            />
                                            <circle
                                                cx="50" cy="50" r="44"
                                                fill="none"
                                                className="stroke-emerald-500"
                                                strokeWidth="8"
                                                strokeLinecap="round"
                                                strokeDasharray={`${2 * Math.PI * 44}`}
                                                strokeDashoffset={`${2 * Math.PI * 44 * (1 - currentProgress / 100)}`}
                                                style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
                                            />
                                        </svg>
                                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                                            <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
                                                {currentProgress}%
                                            </span>
                                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mt-1">Status</span>
                                        </div>
                                    </div>

                                    <div className="text-center space-y-3">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20 animate-pulse">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                            Live Status
                                        </div>
                                        <p className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-200">{currentMessage}</p>
                                        {jobError && (
                                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-xl text-sm font-medium">
                                                {jobError}
                                            </div>
                                        )}
                                        {!jobError && (
                                            <p className="text-zinc-500 font-medium italic">
                                                Génération des visuels et animations...
                                            </p>
                                        )}
                                    </div>

                                    {/* Micro-activity bar */}
                                    <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-4">
                                        <div className="h-full bg-emerald-500 animate-[loading_2s_infinite]" style={{ width: '30%' }} />
                                    </div>

                                    <Button
                                        variant="outline"
                                        onClick={() => cancelVideo(activeVideo.id)}
                                        className="mt-4 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                                    >
                                        <XCircle className="h-4 w-4 mr-2" /> Annuler la génération
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
            {/* Insertion Dialog/Modal */}
            {isInserting && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
                    <Card className="w-full max-w-lg shadow-2xl border-emerald-500/20 overflow-hidden">
                        <CardHeader className="bg-emerald-50/50 dark:bg-emerald-950/20 border-b border-emerald-100 dark:border-emerald-900">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <Sparkles className="h-5 w-5 text-emerald-500" />
                                Nouvelle Scène IA
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="p-6 space-y-4">
                            <p className="text-sm text-zinc-500 font-medium">
                                Écrivez la narration. L'IA s'occupe de générer les descriptions visuelles et les prompts correspondants.
                            </p>
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Narration</label>
                                <Textarea
                                    placeholder="Ex: Le petit chat saute sur le canapé avec enthousiasme..."
                                    value={newNarration}
                                    onChange={(e) => setNewNarration(e.target.value)}
                                    className="min-h-[120px] focus:ring-emerald-500/20 focus:border-emerald-500"
                                />
                            </div>
                            <div className="flex justify-end gap-3 pt-4">
                                <Button variant="ghost" onClick={() => setIsInserting(false)} className="rounded-xl">
                                    Annuler
                                </Button>
                                <Button
                                    onClick={handleInsertScene}
                                    disabled={!newNarration || generating}
                                    className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl px-6"
                                >
                                    {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Générer la scène"}
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
