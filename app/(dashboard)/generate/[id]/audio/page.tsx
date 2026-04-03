"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Music, Play, Volume2, SkipBack, SkipForward, Type, Eye, Check, ExternalLink, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Slider } from "@/src/components/ui/slider";
import { cn } from "@/src/lib/utils";
import { videosService, type Video } from "@/src/services/videos-service";
import { useVideoProgress } from "@/src/hooks/use-video-progress";
import { AdminService } from "@/src/app/admin/api/admin-service";

const adminService = new AdminService();


export default function AudioPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();

    const [activeVideo, setActiveVideo] = useState<Video | null>(null);
    const [availableVoices, setAvailableVoices] = useState<any[]>([]);
    const [availableModels, setAvailableModels] = useState<any[]>([]);
    const [musicTracks, setMusicTracks] = useState<any[]>([]);
    const [generating, setGenerating] = useState(false);
    const [jobId, setJobId] = useState<string | undefined>();
    const [error, setError] = useState<string | null>(null);

    // Dynamic States
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

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const {
        progress: realProgress,
        message: realMessage,
        isFinished,
        error: jobError
    } = useVideoProgress(jobId);

    useEffect(() => {
        const loadData = async () => {
            try {
                const [video, voices, models, music] = await Promise.all([
                    videosService.getById(resolvedParams.id),
                    adminService.listVoices(),
                    adminService.listModels(),
                    adminService.listMusic()
                ]);
                setActiveVideo(video);
                setAvailableVoices(voices || []);
                setAvailableModels(models || []);
                setMusicTracks(music || []);

                if (video.options?.backgroundMusic) {
                    setSelectedMusicId(video.options.backgroundMusic);
                }
                if (video.options?.kokoroVoicePreset) {
                    setKokoroVoicePreset(video.options.kokoroVoicePreset);
                }

                // Initialize volumes from options
                if (video.options?.narrationVolume !== undefined) {
                    setVoiceVolume(Math.round(video.options.narrationVolume * 100));
                }
                if (video.options?.backgroundMusicVolume !== undefined) {
                    setMusicVolume(Math.round(video.options.backgroundMusicVolume * 100));
                }

                if (video.options?.assCaptions) {
                    setShowCaptions(video.options.assCaptions.enabled !== false);
                    setCaptionStyle(video.options.assCaptions.style || "colored");
                    if (video.options.assCaptions.fontSize) setFontSize(video.options.assCaptions.fontSize);
                    if (video.options.assCaptions.highlightColor) setHighlightColor(video.options.assCaptions.highlightColor);
                    if (video.options.assCaptions.position) setCaptionPosition(video.options.assCaptions.position);
                }

                setActiveVideo(video);
            } catch (err) {
                setError("Failed to load video settings.");
            }
        };
        loadData();
    }, [resolvedParams.id]);

    const onCastChange = async (
        characterId: string,
        updates: { modelId?: string; voiceId?: string; referenceImageUrl?: string }
    ) => {
        if (!activeVideo || !activeVideo.script) return;

        const newSheets = (activeVideo.script.characterSheets || []).map((sheet) => {
            if (sheet.id === characterId) {
                return { ...sheet, ...updates };
            }
            return sheet;
        });

        const updatedVideo = {
            ...activeVideo,
            script: {
                ...activeVideo.script,
                characterSheets: newSheets
            }
        };

        setActiveVideo(updatedVideo);
        // Persist change
        await videosService.update(activeVideo.id, { script: updatedVideo.script });
    };

    const handleGenerateCharacter = async (characterId: string, prompt: string, modelId?: string) => {
        if (!activeVideo) return "";
        try {
            const res = await videosService.generateCharacter(activeVideo.id, characterId, { prompt, modelId });
            return res.imageUrl;
        } catch (err: any) {
            setError(err.message || "Erreur lors de la génération du personnage.");
            throw err;
        }
    };

    const handleAssemble = async () => {
        if (!activeVideo) return;
        try {
            setGenerating(true);

            // Save final music and global voice selection if changed
            const nVol = voiceVolume / 100;
            const mVol = musicVolume / 100;

            if (activeVideo.options?.backgroundMusic !== selectedMusicId ||
                activeVideo.options?.kokoroVoicePreset !== kokoroVoicePreset ||
                activeVideo.options?.narrationVolume !== nVol ||
                activeVideo.options?.backgroundMusicVolume !== mVol ||
                activeVideo.options?.assCaptions?.enabled !== showCaptions ||
                activeVideo.options?.assCaptions?.style !== captionStyle ||
                activeVideo.options?.assCaptions?.fontSize !== fontSize ||
                activeVideo.options?.assCaptions?.highlightColor !== highlightColor ||
                activeVideo.options?.assCaptions?.position !== captionPosition) {
                await videosService.update(activeVideo.id, {
                    options: {
                        ...activeVideo.options,
                        backgroundMusic: selectedMusicId === 'none' ? undefined : selectedMusicId,
                        kokoroVoicePreset: kokoroVoicePreset as any,
                        narrationVolume: nVol,
                        backgroundMusicVolume: mVol,
                        assCaptions: {
                            ...activeVideo.options?.assCaptions,
                            enabled: showCaptions,
                            style: captionStyle as any,
                            fontSize,
                            highlightColor,
                            position: captionPosition as any
                        }
                    }
                });
            }

            const response = await videosService.assemble(activeVideo.id, {
                narrationVolume: nVol,
                backgroundMusicVolume: mVol,
                assCaptions: {
                    enabled: showCaptions,
                    style: captionStyle as any,
                    fontSize,
                    highlightColor,
                    position: captionPosition as any
                }
            });
            setJobId(response.jobId);
            setError(null);
        } catch (error: any) {
            setError(error.message || "Failed to start assembly");
            setGenerating(false);
        }
    };

    // Audio Playback Logic
    useEffect(() => {
        if (typeof window === "undefined") return;

        if (!audioRef.current) {
            audioRef.current = new Audio();
        }

        const audio = audioRef.current;

        const handleEnded = () => setIsPlayingAudio(false);
        audio.addEventListener("ended", handleEnded);

        return () => {
            audio.removeEventListener("ended", handleEnded);
            audio.pause();
        };
    }, []);

    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;

        if (isPlayingAudio) {
            const track = musicTracks.find(t => t.id === selectedMusicId);
            if (track?.previewUrl) {
                if (audio.src !== track.previewUrl) {
                    audio.src = track.previewUrl;
                }
                audio.play().catch(console.error);
            } else {
                setIsPlayingAudio(false);
            }
        } else {
            audio.pause();
        }
    }, [isPlayingAudio, selectedMusicId, musicTracks]);

    useEffect(() => {
        if (audioRef.current) {
            audioRef.current.volume = musicVolume / 100;
        }
    }, [musicVolume]);

    const handleSkip = (direction: 'next' | 'prev') => {
        if (musicTracks.length === 0) return;
        const currentIndex = musicTracks.findIndex(t => t.id === selectedMusicId);
        let nextIndex = direction === 'next' ? currentIndex + 1 : currentIndex - 1;

        if (nextIndex >= musicTracks.length) nextIndex = 0;
        if (nextIndex < 0) nextIndex = musicTracks.length - 1;

        setSelectedMusicId(musicTracks[nextIndex].id);
        setIsPlayingAudio(true);
    };

    const handleTrackSelect = (id: string) => {
        setSelectedMusicId(id);
        setIsPlayingAudio(true);
    };

    useEffect(() => {
        if (isFinished && jobId && !jobError) {
            setTimeout(() => {
                router.push(`/generate/${resolvedParams.id}/success`);
            }, 1000);
        } else if (isFinished && jobError) {
            setGenerating(false);
        }
    }, [isFinished, jobId, jobError, router]);

    const currentProgress = generating ? realProgress : 0;
    const currentMessage = generating ? realMessage : "";

    if (!activeVideo && !error) {
        return <div className="min-h-screen flex items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-emerald-500 border-t-transparent animate-spin" /></div>;
    }

    return (
        <div className="space-y-6 pb-24">
            <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6 lg:px-8">
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
                    <div className="text-center space-y-2 mb-10">
                        <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                            Vidéo &amp; Audio
                        </h1>
                        <p className="text-zinc-500 text-lg">Dernier réglages avant la production finale</p>
                    </div>
                )}

                {/* Content */}
                {!generating && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <div className="space-y-6">
                                {/* Global Narrator Voice */}
                                <Card className="p-5 bg-white border-zinc-200 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="h-10 w-10 rounded-full bg-zinc-900 flex items-center justify-center text-zinc-50">
                                            <Volume2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Voix Narrative Globale</h3>
                                            <p className="text-xs text-zinc-500">Voix par défaut pour les scènes sans personnage</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Select value={kokoroVoicePreset} onValueChange={setKokoroVoicePreset}>
                                            <SelectTrigger className="w-full h-12 bg-white border-zinc-200 rounded-xl">
                                                <SelectValue placeholder="Choisir une voix" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {availableVoices.map((voice) => (
                                                    <SelectItem key={voice.id} value={voice.presetId}>
                                                        <div className="flex items-center gap-2">
                                                            <span>{voice.gender === 'female' ? '👩' : '👨'}</span>
                                                            <span className="font-medium">{voice.name}</span>
                                                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-500 font-bold">
                                                                {voice.language.split('-')[0]}
                                                            </span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>

                                        <p className="text-[11px] text-zinc-400 italic px-1">
                                            Note: Cette voix sera utilisée pour toute la narration si aucun personnage spécifique n&apos;est assigné.
                                        </p>
                                    </div>
                                </Card>

                            </div>

                            {/* Music panel */}
                            <Card className="bg-white border border-zinc-100 shadow-none">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Music className="h-4 w-4" /> Musique de fond
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Track list */}
                                    <div className="space-y-2 max-h-75 overflow-y-auto pr-2 custom-scrollbar">
                                        <button
                                            onClick={() => setSelectedMusicId("none")}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors",
                                                selectedMusicId === "none"
                                                    ? "bg-zinc-900 text-zinc-50 border-zinc-900"
                                                    : "border-zinc-200 hover:bg-zinc-50"
                                            )}
                                        >
                                            <span className="font-medium">Aucune musique</span>
                                        </button>
                                        {musicTracks.map((track) => (
                                            <button
                                                key={track.id}
                                                onClick={() => handleTrackSelect(track.id)}
                                                className={cn(
                                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors",
                                                    selectedMusicId === track.id
                                                        ? "bg-zinc-900 text-zinc-50 border-zinc-900"
                                                        : "border-zinc-200 hover:bg-zinc-50"
                                                )}
                                            >
                                                <div className="flex flex-col items-start gap-0.5">
                                                    <div className="flex items-center gap-2">
                                                        <Play className={cn("h-3.5 w-3.5", selectedMusicId === track.id && isPlayingAudio && "animate-pulse")} />
                                                        <span className="font-bold">{track.name}</span>
                                                    </div>
                                                    {track.tags && (
                                                        <span className={cn("text-[10px] uppercase font-medium", selectedMusicId === track.id ? "opacity-70" : "text-zinc-400")}>
                                                            {track.tags.join(" • ")}
                                                        </span>
                                                    )}
                                                </div>
                                            </button>
                                        ))}
                                    </div>

                                    {/* Player controls */}
                                    <div className="flex flex-col gap-3 pt-2">
                                        <div className="flex items-center justify-center gap-4">
                                            <button
                                                onClick={() => handleSkip('prev')}
                                                className="text-zinc-400 hover:text-zinc-700 transition-colors"
                                            >
                                                <SkipBack className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                                                className="rounded-full bg-zinc-900 border border-transparent p-3 text-zinc-50 hover:scale-105 active:scale-95 transition-all shadow-md"
                                            >
                                                {isPlayingAudio ? (
                                                    <div className="h-5 w-5 flex items-center justify-center gap-1">
                                                        <div className="w-1.5 h-4 bg-current rounded-sm animate-[pulse_1s_ease-in-out_infinite]" />
                                                        <div className="w-1.5 h-4 bg-current rounded-sm animate-[pulse_1s_ease-in-out_infinite_150ms]" />
                                                    </div>
                                                ) : (
                                                    <Play className="h-5 w-5 fill-current" />
                                                )}
                                            </button>
                                            <button
                                                onClick={() => handleSkip('next')}
                                                className="text-zinc-400 hover:text-zinc-700 transition-colors"
                                            >
                                                <SkipForward className="h-5 w-5" />
                                            </button>
                                        </div>
                                        {isPlayingAudio && (
                                            <div className="w-full h-1.5 bg-zinc-200 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 animate-[loading_10s_linear_infinite]" style={{ width: '100%' }} />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Volume panel */}
                            <Card className="bg-white border border-zinc-100 shadow-none">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Volume2 className="h-4 w-4" /> Volumes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-6">
                                    <div className="space-y-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>🎙️ Narration (Voix)</span>
                                                <span className="text-zinc-500 font-bold">{voiceVolume}%</span>
                                            </div>
                                            <Slider
                                                min={0}
                                                max={100}
                                                step={5}
                                                value={voiceVolume}
                                                onChange={(e) => setVoiceVolume(parseInt(e.target.value))}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between text-sm">
                                                <span>🎵 Musique de fond</span>
                                                <span className="text-zinc-500 font-bold">{musicVolume}%</span>
                                            </div>
                                            <Slider
                                                min={0}
                                                max={100}
                                                step={5}
                                                value={musicVolume}
                                                onChange={(e) => setMusicVolume(parseInt(e.target.value))}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                        <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mb-2">Note</p>
                                        <p className="text-xs text-zinc-600 leading-relaxed">
                                            L'IA ajuste automatiquement les volumes (ducking) pour que les voix restent parfaitement audibles sur la musique.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Captions configuration & Preview */}
                            <Card className="bg-white border border-zinc-100 shadow-none overflow-hidden">
                                <CardHeader className="pb-2">
                                    <div className="flex items-center justify-between">
                                        <CardTitle className="flex items-center gap-2 text-base">
                                            <Type className="h-4 w-4" /> Sous-titres (Légendes)
                                        </CardTitle>
                                        <div
                                            onClick={() => setShowCaptions(!showCaptions)}
                                            className={cn(
                                                "relative w-10 h-5 rounded-full transition-colors cursor-pointer",
                                                showCaptions ? "bg-emerald-500" : "bg-zinc-300"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform",
                                                showCaptions ? "translate-x-5.5" : "translate-x-0.5"
                                            )} />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {showCaptions ? (
                                        <>
                                            <div className="space-y-2">
                                                <label className="text-[10px] uppercase font-bold text-zinc-400">Style d'animation</label>
                                                <div className="grid grid-cols-2 gap-2">
                                                    {[
                                                        { id: "colored", label: "Classique Coloré" },
                                                        { id: "scaling", label: "Grossissement" },
                                                        { id: "bounce", label: "Rebondissant" },
                                                        { id: "neon", label: "Néon" },
                                                        { id: "typewriter", label: "Machine" },
                                                        { id: "karaoke", label: "Karaoké" },
                                                        { id: "animated-background", label: "Bulle" },
                                                        { id: "remotion", label: "Moderne" }
                                                    ].map((s) => (
                                                        <button
                                                            key={s.id}
                                                            onClick={() => setCaptionStyle(s.id)}
                                                            className={cn(
                                                                "px-2 py-1.5 rounded-md text-[11px] font-medium border transition-all text-left flex items-center justify-between",
                                                                captionStyle === s.id
                                                                    ? "bg-zinc-900 text-white border-zinc-900"
                                                                    : "bg-zinc-50 border-zinc-200 text-zinc-600 hover:border-zinc-400"
                                                            )}
                                                        >
                                                            {s.label}
                                                            {captionStyle === s.id && <Check className="h-3 w-3" />}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Style Preview Area */}
                                            <div className="relative aspect-video rounded-xl bg-zinc-900 flex flex-col items-center justify-center overflow-hidden border border-zinc-200/20 shadow-inner group">
                                                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80')] bg-cover bg-center opacity-40 group-hover:opacity-50 transition-opacity" />
                                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

                                                <div className="relative z-10 flex flex-col items-center gap-2 px-6 text-center">
                                                    {captionStyle === "colored" && (
                                                        <div className="text-xl font-black italic tracking-tight drop-shadow-xl text-white">
                                                            UN DESIGN <span className="text-emerald-400">ÉPIQUE</span> POUR VOTRE VIDEO.
                                                        </div>
                                                    )}
                                                    {captionStyle === "scaling" && (
                                                        <div className="text-xl font-bold text-white uppercase scale-110 motion-safe:animate-pulse">
                                                            TEXTE DYNAMIQUE
                                                        </div>
                                                    )}
                                                    {captionStyle === "bounce" && (
                                                        <div className="text-xl font-bold text-yellow-400 motion-safe:animate-bounce">
                                                            EFFET REBOND
                                                        </div>
                                                    )}
                                                    {captionStyle === "neon" && (
                                                        <div className="text-xl font-bold text-pink-500 [text-shadow:0_0_10px_rgba(236,72,153,0.8),0_0_20px_rgba(236,72,153,0.5)]">
                                                            STYLE NÉON MODERNE
                                                        </div>
                                                    )}
                                                    {captionStyle === "typewriter" && (
                                                        <div className="text-xl font-mono text-emerald-400 border-r-2 border-emerald-400 pr-1 animate-pulse">
                                                            MACHINE À ÉCRIRE...
                                                        </div>
                                                    )}
                                                    {captionStyle === "karaoke" && (
                                                        <div className="text-xl font-bold flex gap-1">
                                                            <span style={{ color: highlightColor }} className="underline underline-offset-4 decoration-2">MOT</span>
                                                            <span className="text-white">PAR</span>
                                                            <span className="text-white">MOT</span>
                                                        </div>
                                                    )}
                                                    {captionStyle === "animated-background" && (
                                                        <div className="text-xl font-bold bg-emerald-500 text-white px-4 py-1 rounded-full shadow-lg rotate-2">
                                                            BULLE ANIMÉE
                                                        </div>
                                                    )}
                                                    {captionStyle === "remotion" && (
                                                        <div className="text-2xl font-black text-white uppercase tracking-tighter drop-shadow-[0_2px_10px_rgba(0,0,0,0.5)]">
                                                            PURE MOTION
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="absolute bottom-2 left-3 flex items-center gap-1.5 opacity-60">
                                                    <Eye className="h-3 w-3 text-zinc-400" />
                                                    <span className="text-[9px] font-medium text-zinc-400 tracking-wider">PREVISUALISATION LIVE</span>
                                                </div>
                                            </div>

                                            {/* Advanced Caption Settings Toggle */}
                                            <div className="pt-2">
                                                <button
                                                    onClick={() => setShowAdvancedCaptions(!showAdvancedCaptions)}
                                                    className="w-full py-1.5 text-[10px] font-bold text-zinc-400 hover:text-zinc-600 flex items-center justify-center gap-1 transition-colors uppercase tracking-widest border border-dashed border-zinc-200 rounded-lg hover:bg-zinc-50"
                                                >
                                                    {showAdvancedCaptions ? "Moins d'options ▲" : "Plus d'options de style ▼"}
                                                </button>

                                                {showAdvancedCaptions && (
                                                    <div className="space-y-4 pt-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        <div className="grid grid-cols-2 gap-4">
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] uppercase font-bold text-zinc-400">Taille</label>
                                                                <Select value={fontSize.toString()} onValueChange={(v) => setFontSize(parseInt(v))}>
                                                                    <SelectTrigger className="h-8 text-xs">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="32">Petit (32px)</SelectItem>
                                                                        <SelectItem value="48">Normal (48px)</SelectItem>
                                                                        <SelectItem value="64">Grand (64px)</SelectItem>
                                                                        <SelectItem value="80">Énorme (80px)</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                            <div className="space-y-1.5">
                                                                <label className="text-[10px] uppercase font-bold text-zinc-400">Position</label>
                                                                <Select value={captionPosition} onValueChange={setCaptionPosition}>
                                                                    <SelectTrigger className="h-8 text-xs">
                                                                        <SelectValue />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="bottom">En bas</SelectItem>
                                                                        <SelectItem value="center">Au centre</SelectItem>
                                                                        <SelectItem value="top">En haut</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>

                                                        <div className="space-y-1.5">
                                                            <label className="text-[10px] uppercase font-bold text-zinc-400">Couleur d'accentuation</label>
                                                            <div className="flex flex-wrap gap-2">
                                                                {["#FFE135", "#10B981", "#3B82F6", "#EC4899", "#F97316", "#FFFFFF"].map((color) => (
                                                                    <button
                                                                        key={color}
                                                                        onClick={() => setHighlightColor(color)}
                                                                        className={cn(
                                                                            "w-6 h-6 rounded-full border-2 transition-transform hover:scale-110",
                                                                            highlightColor === color ? "border-zinc-900 scale-110" : "border-transparent"
                                                                        )}
                                                                        style={{ backgroundColor: color }}
                                                                    />
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </>
                                    ) : (
                                        <div className="py-8 flex flex-col items-center justify-center text-center gap-2 opacity-50 grayscale">
                                            <div className="p-3 rounded-full bg-zinc-100">
                                                <Type className="h-6 w-6 text-zinc-400" />
                                            </div>
                                            <div className="text-xs font-medium text-zinc-500">Sous-titres désactivés</div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        </div>

                        {/* Generate button */}
                        <div className="space-y-3">
                            {activeVideo?.videoUrl && (isFinished || activeVideo.status === 'completed') && (
                                <Button
                                    onClick={() => window.open(activeVideo.videoUrl, '_blank')}
                                    variant="outline"
                                    className="w-full py-6 rounded-2xl border-emerald-500/30 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all font-bold group"
                                >
                                    <ExternalLink className="mr-2 h-5 w-5 group-hover:scale-110 transition-transform" />
                                    Voir la vidéo finale
                                </Button>
                            )}

                            <Button
                                onClick={handleAssemble}
                                disabled={generating && !isFinished}
                                className="w-full py-7 rounded-2xl bg-zinc-900 text-zinc-50 hover:scale-[1.01] active:scale-95 transition-all shadow-none font-black text-lg group overflow-hidden relative"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                {generating && !isFinished ? (
                                    <div className="flex items-center gap-3">
                                        <div className="flex gap-1">
                                            {[0.1, 0.2, 0.3].map((delay, i) => (
                                                <div
                                                    key={i}
                                                    className="w-1.5 h-1.5 rounded-full bg-current animate-bounce"
                                                    style={{ animationDelay: `${delay}s` }}
                                                />
                                            ))}
                                        </div>
                                        ASSEMBLAGE... {realProgress}%
                                    </div>
                                ) : (
                                    <div className="flex items-center gap-2">
                                        <Zap className="h-5 w-5 fill-current" />
                                        GÉNÉRER LA VIDÉO FINALE ({activeVideo?.options?.resolution === '1080p' ? '10 🪙' : '5 🪙'})
                                    </div>
                                )}
                            </Button>
                        </div>
                    </div>
                )}

                {/* Global Progress Screen */}
                {generating && (
                    <div className="flex justify-center animate-in fade-in zoom-in-95 duration-700">
                        <div className="w-full max-w-2xl px-4 lg:px-0">
                            <Card className="bg-white border border-zinc-100 shadow-none overflow-hidden relative group">
                                <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-cyan-500/5 pointer-events-none" />
                                <CardContent className="p-10 lg:p-16 flex flex-col items-center gap-8">
                                    {/* High-tech Circular progress */}
                                    <div className="relative h-48 w-48 animate-float">
                                        <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10" />
                                        <svg className="h-full w-full -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" viewBox="0 0 100 100">
                                            <circle
                                                cx="50" cy="50" r="44"
                                                fill="none"
                                                className="stroke-zinc-100"
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
                                            <span className="text-4xl font-black text-emerald-600 tracking-tighter">
                                                {currentProgress}%
                                            </span>
                                            <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mt-1">Status</span>
                                        </div>
                                    </div>

                                    <div className="text-center space-y-3">
                                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-bold uppercase tracking-widest border border-emerald-500/20 animate-pulse">
                                            <div className="h-2 w-2 rounded-full bg-emerald-500" />
                                            Live Status
                                        </div>
                                        <p className="text-2xl font-bold tracking-tight text-zinc-800">{currentMessage}</p>
                                        {jobError && (
                                            <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-xl text-sm font-medium">
                                                {jobError}
                                            </div>
                                        )}
                                        {!jobError && (
                                            <p className="text-zinc-500 font-medium italic">
                                                Nous assemblons vos scènes, votre voix off et la musique...
                                            </p>
                                        )}
                                    </div>

                                    {/* Micro-activity bar */}
                                    <div className="w-full h-1 bg-zinc-100 rounded-full overflow-hidden mt-4">
                                        <div className="h-full bg-emerald-500 animate-[loading_2s_infinite]" style={{ width: '30%' }} />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
