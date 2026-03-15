"use client";

import { useState, useEffect, use, useRef } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, Music, Play, Volume2, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Slider } from "@/src/components/ui/slider";
import { cn } from "@/src/lib/utils";
import { videosService, type Video } from "@/src/services/videos-service";
import { useVideoProgress } from "@/src/hooks/use-video-progress";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { CharacterCasting } from "@/src/components/organisms/character-casting";

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
            if (activeVideo.options?.backgroundMusic !== selectedMusicId ||
                activeVideo.options?.kokoroVoicePreset !== kokoroVoicePreset) {
                await videosService.update(activeVideo.id, {
                    options: {
                        ...activeVideo.options,
                        backgroundMusic: selectedMusicId === 'none' ? undefined : selectedMusicId,
                        kokoroVoicePreset: kokoroVoicePreset as any
                    }
                });
            }

            const response = await videosService.assemble(activeVideo.id);
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
                router.push("/videos"); // Or directly to a specific complete page
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
                    <div className="text-center space-y-2 mb-10">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20 mb-3">
                            Étape 3 sur 3
                        </div>
                        <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
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
                                <Card className="p-5 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                                    <div className="flex items-center gap-3 mb-5">
                                        <div className="h-10 w-10 rounded-full bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-zinc-50 dark:text-zinc-900">
                                            <Volume2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold">Voix Narrative Globale</h3>
                                            <p className="text-xs text-zinc-500">Voix par défaut pour les scènes sans personnage</p>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <Select value={kokoroVoicePreset} onValueChange={setKokoroVoicePreset}>
                                            <SelectTrigger className="w-full h-12 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 rounded-xl">
                                                <SelectValue placeholder="Choisir une voix" />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-xl">
                                                {availableVoices.map((voice) => (
                                                    <SelectItem key={voice.id} value={voice.presetId}>
                                                        <div className="flex items-center gap-2">
                                                            <span>{voice.gender === 'female' ? '👩' : '👨'}</span>
                                                            <span className="font-medium">{voice.name}</span>
                                                            <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 font-bold">
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

                                {/* Character Casting (Specific Voices) */}
                                {activeVideo?.script?.characterSheets && activeVideo.script.characterSheets.length > 0 && (
                                    <Card className="p-5 bg-white/50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm">
                                        <div className="flex items-center gap-3 mb-5">
                                            <div className="h-10 w-10 rounded-full bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-zinc-50 dark:text-zinc-900">
                                                <Play className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold">Casting & Voix des Personnages</h3>
                                                <p className="text-xs text-zinc-500">Assignez une voix à chaque rôle spécifique</p>
                                            </div>
                                        </div>

                                        <CharacterCasting
                                            characters={activeVideo.script.characterSheets}
                                            availableModels={availableModels}
                                            onCastChange={onCastChange}
                                            onGenerate={handleGenerateCharacter}
                                        />
                                    </Card>
                                )}
                            </div>

                            {/* Music panel */}
                            <Card className="glass-pill border-none shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2 text-base">
                                        <Music className="h-4 w-4" /> Musique de fond
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    {/* Track list */}
                                    <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        <button
                                            onClick={() => setSelectedMusicId("none")}
                                            className={cn(
                                                "w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors",
                                                selectedMusicId === "none"
                                                    ? "bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-50"
                                                    : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
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
                                                        ? "bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-50"
                                                        : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
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
                                                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                                            >
                                                <SkipBack className="h-5 w-5" />
                                            </button>
                                            <button
                                                onClick={() => setIsPlayingAudio(!isPlayingAudio)}
                                                className="rounded-full bg-zinc-900 border border-transparent dark:bg-zinc-50 p-3 text-zinc-50 dark:text-zinc-900 hover:scale-105 active:scale-95 transition-all shadow-md"
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
                                                className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors"
                                            >
                                                <SkipForward className="h-5 w-5" />
                                            </button>
                                        </div>
                                        {isPlayingAudio && (
                                            <div className="w-full h-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                                                <div className="h-full bg-emerald-500 animate-[loading_10s_linear_infinite]" style={{ width: '100%' }} />
                                            </div>
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Volume panel */}
                            <Card className="glass-pill border-none shadow-xl">
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
                                        <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                                            L'IA ajuste automatiquement les volumes (ducking) pour que les voix restent parfaitement audibles sur la musique.
                                        </p>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Generate button */}
                        <div className="flex justify-center pt-8">
                            <Button
                                size="lg"
                                onClick={handleAssemble}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white px-16 h-14 text-lg font-bold rounded-2xl shadow-xl shadow-emerald-500/30 transition-all hover:scale-105"
                            >
                                Générer la vidéo finale <Play className="ml-3 h-5 w-5 fill-current" />
                            </Button>
                        </div>
                    </div>
                )}

                {/* Global Progress Screen */}
                {generating && (
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
                                                Nous assemblons vos scènes, votre voix off et la musique...
                                            </p>
                                        )}
                                    </div>

                                    {/* Micro-activity bar */}
                                    <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-4">
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
