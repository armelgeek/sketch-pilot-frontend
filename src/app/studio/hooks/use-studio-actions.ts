import { videosService } from "@/src/services/videos-service";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { useStudioStore } from "../store";
import { useVideoProgress } from "@/src/hooks/use-video-progress";
import { useSSEProgress } from "@/src/contexts/sse-progress-context";
import { useCallback } from "react";

const adminService = new AdminService();

export function useStudioActions() {
    const {
        activeVideo,
        setVideo,
        setGenerating,
        setAssembling,
        setVisualsGenerated,
        setRegeneratingSceneId,
        setError,
        audioOptions,
        captionOptions,
        setShowSuccessModal,
        setIsInserting,
        setNewNarration,
        updateSceneInStore
    } = useStudioStore();

    const { startProgress, updateProgress, stopProgress } = useSSEProgress();

    const handleSaveScript = useCallback(async () => {
        if (!activeVideo) return;
        const { sceneEdits } = useStudioStore.getState();
        try {
            const currentScenes = activeVideo.scenes || activeVideo.script?.scenes || [];
            const updatedScenes = currentScenes.map((s: any, i: number) => {
                const sId = s.id || `s${i + 1}`;
                const edits = sceneEdits[sId] || {};
                return { ...s, ...edits };
            });

            await videosService.update(activeVideo.id, {
                script: activeVideo.script ? { ...activeVideo.script, scenes: updatedScenes } : undefined,
                scenes: updatedScenes,
                title: activeVideo.title,
                options: {
                    ...activeVideo.options,
                    backgroundMusic: audioOptions.musicId === "none" ? undefined : audioOptions.musicId,
                    kokoroVoicePreset: audioOptions.voicePreset as any,
                    narrationVolume: audioOptions.voiceVolume / 100,
                    backgroundMusicVolume: audioOptions.musicVolume / 100,
                    assCaptions: {
                        ...(activeVideo.options?.assCaptions || {}),
                        ...captionOptions,
                    },
                }
            });
        } catch (err: any) {
            setError(err.message || "Erreur lors de la sauvegarde");
        }
    }, [activeVideo, audioOptions, captionOptions, setError]);

    const handleAnimate = useCallback(async (cancelVideo: (id: string) => void) => {
        if (!activeVideo) return;
        try {
            setGenerating(true);
            startProgress({
                title: "Génération des visuels",
                onCancel: () => {
                    cancelVideo(activeVideo.id);
                    setGenerating(false);
                    stopProgress();
                },
            });
            const response = await videosService.generateScenes(activeVideo.id);
            updateProgress(0, "Demarrage de la generation...", response.jobId);
            return response.jobId;
        } catch (err: any) {
            setError(err.message || "Erreur lors du démarrage de la génération des visuels");
            setGenerating(false);
            stopProgress();
        }
    }, [activeVideo, setGenerating, startProgress, stopProgress, setError]);

    const handleRegenerateImage = useCallback(async (sceneId: string, sceneIndex: number, imagePrompt?: string) => {
        if (!activeVideo) return;
        try {
            setRegeneratingSceneId(sceneId);
            const response = await videosService.repromptScene(activeVideo.id, sceneIndex, imagePrompt);
            return response.jobId;
        } catch {
            setError("Erreur lors de la régénération de l'image");
            setRegeneratingSceneId(null);
        }
    }, [activeVideo, setRegeneratingSceneId, setError]);

    const handleAssemble = useCallback(async () => {
        if (!activeVideo) return;
        try {
            setAssembling(true);
            startProgress({ title: "Assemblage final" });
            const nVol = audioOptions.voiceVolume / 100;
            const mVol = audioOptions.musicVolume / 100;

            const { sceneEdits } = useStudioStore.getState();
            const currentScenes = activeVideo.scenes || activeVideo.script?.scenes || [];
            const updatedScenes = currentScenes.map((s: any, i: number) => {
                const sId = s.id || `s${i + 1}`;
                const edits = sceneEdits[sId] || {};
                return { ...s, ...edits };
            });

            await videosService.update(activeVideo.id, {
                scenes: updatedScenes,
                script: activeVideo.script ? { ...activeVideo.script, scenes: updatedScenes } : undefined,
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
            updateProgress(0, "Demarrage de l'assemblage...", r.jobId);
            return r.jobId;
        } catch (err: any) {
            setError(err.message || "Erreur lors de l'assemblage de la vidéo finale");
            setAssembling(false);
            stopProgress();
        }
    }, [activeVideo, audioOptions, captionOptions, setAssembling, startProgress, stopProgress, setError]);

    const handleInsertScene = useCallback(async (apiInsertScene: (id: string, idx: number, narration: string) => Promise<any>) => {
        const { insertIndex, newNarration } = useStudioStore.getState();
        if (!activeVideo || !newNarration.trim() || insertIndex === null) return;
        try {
            setGenerating(true);
            const updatedScript = await apiInsertScene(activeVideo.id, insertIndex, newNarration);
            if (updatedScript) {
                setVideo({ ...activeVideo, script: updatedScript, scenes: updatedScript.scenes });
                setIsInserting(false);
                setNewNarration("");
            }
        } catch {
            setError("Erreur lors de l'insertion de la scène");
        } finally {
            setGenerating(false);
        }
    }, [activeVideo, setVideo, setIsInserting, setNewNarration, setGenerating, setError]);

    return {
        handleSaveScript,
        handleAnimate,
        handleRegenerateImage,
        handleAssemble,
        handleInsertScene
    };
}
