"use client";

import { useState, useEffect, use, useRef, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import { videosService } from "@/src/services/videos-service";
import { useVideoProgress } from "@/src/hooks/use-video-progress";
import { useSSEProgress } from "@/src/contexts/sse-progress-context";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { VideoSuccessModal } from "@/src/components/ui/video-success-modal";
import {
    useStudioStore,
    useStudioActions,
    StudioHeader,
    StudioErrorBar,
    ScriptTabContent,
    StoryboardTabContent,
    ProductionModal,
    InsertSceneModal
} from "@/src/app/studio";

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

    // ─── Store & Actions ──────────────────────────────────────────────────────
    const {
        activeVideo, setVideo,
        activeTab, setTab,
        visualsGenerated, setVisualsGenerated,
        generating, setGenerating,
        assembling, setAssembling,
        error, setError,
        audioOptions, setAudioOptions,
        captionOptions, setCaptionOptions,
        setLists,
        setSelectedSceneId,
        updateSceneInStore,
        setRegeneratingSceneId,
        regeneratingSceneId,
        showSuccessModal, setShowSuccessModal,
        setIsInserting,
        setNewNarration,
        setIsPlayingAudio,
        setShowProductionModal
    } = useStudioStore();

    const {
        handleSaveScript,
        handleAnimate,
        handleRegenerateImage,
        handleAssemble,
        handleInsertScene
    } = useStudioActions();

    // ─── Progress Tracking ────────────────────────────────────────────────────
    const [jobId, setJobId] = useState<string | undefined>();
    const [repromptJobId, setRepromptJobId] = useState<string | undefined>();
    const [assembleJobId, setAssembleJobId] = useState<string | undefined>();

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

    const { startProgress, updateProgress, stopProgress } = useSSEProgress();

    // Progress Synchronization
    useEffect(() => {
        if (generating && jobId) updateProgress(realProgress, realMessage);
    }, [realProgress, realMessage, generating, jobId, updateProgress]);

    useEffect(() => {
        if (assembling && assembleJobId) updateProgress(assembleProgress, assembleMessage);
    }, [assembleProgress, assembleMessage, assembling, assembleJobId, updateProgress]);

    // ─── Initial Load ─────────────────────────────────────────────────────────
    useEffect(() => {
        const load = async () => {
            try {
                const [video, voices, models, music] = await Promise.all([
                    videosService.getById(resolvedParams.id),
                    adminService.listVoices(),
                    adminService.listModels(),
                    adminService.listMusic(),
                ]);

                setVideo(video);
                setLists(voices || [], models?.data || [], music || []);

                // Restore options
                setAudioOptions({
                    voicePreset: video.options?.kokoroVoicePreset ?? "af_heart",
                    voiceVolume: video.options?.narrationVolume !== undefined
                        ? Math.round(video.options.narrationVolume * 100) : 80,
                    musicId: video.options?.backgroundMusic ?? "none",
                    musicVolume: video.options?.backgroundMusicVolume !== undefined
                        ? Math.round(video.options.backgroundMusicVolume * 100) : 60,
                });

                if (video.options?.assCaptions) {
                    setCaptionOptions({
                        enabled: video.options.assCaptions.enabled !== false,
                        style: video.options.assCaptions.style ?? "colored",
                        fontSize: video.options.assCaptions.fontSize ?? 48,
                        highlightColor: video.options.assCaptions.highlightColor ?? "#FFE135",
                        position: video.options.assCaptions.position ?? "bottom",
                    });
                }

                // Restore job status
                if ((video.status === "processing" || video.status === "queued") && video.jobId) {
                    setJobId(video.jobId);
                    setGenerating(true);
                    if (video.script || video.scenes?.length) setTab("storyboard");
                }

                if (["scenes_generated", "narration_generated", "completed"].includes(video.status)) {
                    setVisualsGenerated(true);
                    setTab("storyboard");
                }

                const ds = (video.scenes?.length ? video.scenes : video.script?.scenes) || [];
                setSelectedSceneId(ds[0]?.id || "s1");

            } catch {
                setError("Impossible de charger les données du studio.");
            }
        };
        load();
    }, [resolvedParams.id, setVideo, setLists, setAudioOptions, setCaptionOptions, setGenerating, setTab, setVisualsGenerated, setSelectedSceneId, setError]);

    // ─── Job Handlers ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!lastScene || lastSceneIndex === undefined || !activeVideo) return;
        updateSceneInStore(lastScene, lastSceneIndex);
        setSelectedSceneId(lastScene.id || `s${lastSceneIndex + 1}`);
    }, [lastScene, lastSceneIndex, activeVideo, updateSceneInStore, setSelectedSceneId]);

    useEffect(() => {
        if (!isFinished || !jobId) return;
        if (jobError) { setGenerating(false); stopProgress(); return; }
        videosService.getById(resolvedParams.id).then(updated => {
            setVideo(updated);
            setVisualsGenerated(true);
            setGenerating(false);
            stopProgress();
            setTab("storyboard");
        });
    }, [isFinished, jobId, jobError, resolvedParams.id, stopProgress, setVideo, setVisualsGenerated, setGenerating, setTab]);

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
                setVideo(updated);
                setRegeneratingSceneId(null);
                setRepromptJobId(undefined);
            });
        }, 800);
        return () => window.clearTimeout(timer);
    }, [isRepromptFinished, repromptJobId, repromptError, resolvedParams.id, setVideo, setError, setRegeneratingSceneId]);

    useEffect(() => {
        if (!isAssembleFinished || !assembleJobId) return;
        if (assembleError) { setAssembling(false); stopProgress(); return; }
        stopProgress();
        videosService.getById(resolvedParams.id).then(updated => {
            setVideo(updated);
            setAssembling(false);
            setShowSuccessModal(true);
        });
    }, [isAssembleFinished, assembleJobId, assembleError, resolvedParams.id, stopProgress, setVideo, setAssembling, setShowSuccessModal]);

    // ─── Actions wrappers ─────────────────────────────────────────────────────
    const onAnimate = async () => {
        const id = await handleAnimate(cancelVideo);
        if (id) setJobId(id);
    };

    const onRegenerateImage = async (sceneId: string, sceneIndex: number, prompt?: string) => {
        const id = await handleRegenerateImage(sceneId, sceneIndex, prompt);
        if (id) setRepromptJobId(id);
    };

    const onAssemble = async () => {
        const id = await handleAssemble();
        if (id) setAssembleJobId(id);
    };

    const onSkipMusic = (dir: "next" | "prev") => {
        const { musicTracks, audioOptions } = useStudioStore.getState();
        if (!musicTracks.length) return;
        const idx = musicTracks.findIndex((t: any) => t.id === audioOptions.musicId);
        let next = dir === "next" ? idx + 1 : idx - 1;
        if (next >= musicTracks.length) next = 0;
        if (next < 0) next = musicTracks.length - 1;
        setAudioOptions({ musicId: musicTracks[next].id });
        setIsPlayingAudio(true);
    };

    const onNext = () => {
        if (activeTab === "script") {
            visualsGenerated ? setTab("storyboard") : onAnimate();
        } else if (activeTab === "storyboard") {
            setShowProductionModal(true);
        }
    };

    const onScenesChange = (scenes: any[]) => {
        setVideo({ ...activeVideo!, script: { ...activeVideo!.script!, scenes } });
    };

    // ─── Music Player ─────────────────────────────────────────────────────────
    const { musicTracks } = useStudioStore();
    const musicUrl = useMemo(() =>
        musicTracks.find((t: any) => t.id === audioOptions.musicId)?.url
        , [musicTracks, audioOptions.musicId]);

    const audioRef = useRef<HTMLAudioElement | null>(null);
    const { isPlayingAudio } = useStudioStore();

    useEffect(() => {
        if (!audioRef.current) return;
        if (isPlayingAudio) {
            audioRef.current.play().catch(() => setIsPlayingAudio(false));
        } else {
            audioRef.current.pause();
        }
    }, [isPlayingAudio, setIsPlayingAudio]);

    // ─── Main Render ──────────────────────────────────────────────────────────
    if (!activeVideo) {
        return (
            <div className="min-h-[calc(100vh-56px)] bg-[#F8F8F7] flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-200 border-t-emerald-500" />
            </div>
        );
    }

    return (
        <>
            <div className="flex flex-col bg-[#F8F8F7]" style={{ minHeight: "calc(100vh - 56px)" }}>
                <StudioHeader
                    onNext={onNext}
                    onAssemble={onAssemble}
                    promptsUrl={activeVideo?.options?.promptsUrl}
                />
                <StudioErrorBar />

                <div className="flex overflow-hidden flex-1">
                    <div className="flex-1 overflow-hidden flex flex-col">
                        <ScriptTabContent
                            onScenesChange={onScenesChange}
                            onSaveScript={handleSaveScript}
                        />
                        <StoryboardTabContent
                            currentSceneIndex={currentSceneIndex}
                            repromptIndex={repromptIndex}
                            onRegenerateImage={onRegenerateImage}
                        />
                    </div>
                </div>

                <ProductionModal onAssemble={onAssemble} onSkipMusic={onSkipMusic} />
                <InsertSceneModal onInsert={() => handleInsertScene(apiInsertScene)} />

                {musicUrl && (
                    <audio ref={audioRef} src={musicUrl} loop />
                )}
            </div>

            {showSuccessModal && activeVideo?.videoUrl && (
                <VideoSuccessModal
                    videoUrl={activeVideo.videoUrl}
                    thumbnailUrl={activeVideo.thumbnailUrl}
                    videoId={activeVideo.id}
                    aspectRatio={activeVideo.options?.aspectRatio}
                    duration={activeVideo.script?.totalDuration}
                    onClose={() => setShowSuccessModal(false)}
                />
            )}
        </>
    );
}