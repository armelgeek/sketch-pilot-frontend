"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    useStudioStore,
    useStudioActions,
    StudioHeader,
    StudioErrorBar,
    ScriptTabContent,
    StoryboardTabContent,
    ProductionModal,
} from "@/src/app/studio";
import { videosService } from "@/src/services/videos-service";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { useVideoProgress } from "@/src/hooks/use-video-progress";
import { useSSEProgress } from "@/src/contexts/sse-progress-context";
import { Sparkles } from "lucide-react";

const adminService = new AdminService();

interface StudioPageProps {
    params: Promise<{ id: string; step: string }>;
}

export default function StudioPage({ params }: StudioPageProps) {
    const { id, step } = use(params);
    const router = useRouter();
    const {
        setVideo,
        setTab,
        setLists,
        activeVideo,
        activeTab,
        setShowProductionModal,
        setVisualsGenerated,
        setGenerating,
        setAssembling,
        setRegeneratingSceneId,
    } = useStudioStore();

    const {
        handleSaveScript,
        handleAnimate,
        handleAssemble,
        handleRegenerateImage
    } = useStudioActions();

    const { stopProgress } = useSSEProgress();

    // ── Visual generation (animate all scenes) ────────────────────────────────
    const [animateJobId, setAnimateJobId] = useState<string | undefined>();
    const { isFinished: animateFinished, status: animateStatus } =
        useVideoProgress(animateJobId);

    useEffect(() => {
        if (!animateJobId || !animateFinished) return;

        // Stop tracking job
        setAnimateJobId(undefined);

        if (animateStatus === "completed") {
            // Refetch video to get new scene images before switching tab
            videosService.getById(id)
                .then((updatedVideo) => {
                    setVideo(updatedVideo);
                    setVisualsGenerated(true);
                    setTab("storyboard");
                    router.replace(`/generate/${id}/storyboard`);
                })
                .catch(console.error)
                .finally(() => {
                    setGenerating(false);
                    stopProgress();
                });
        } else {
            setGenerating(false);
            stopProgress();
        }
    }, [animateFinished, animateStatus, animateJobId, id, router, setTab, setVisualsGenerated, setGenerating, stopProgress, setVideo]);

    // ── Final assembly (render video) ──────────────────────────────────────────
    const [assembleJobId, setAssembleJobId] = useState<string | undefined>();
    const { isFinished: assembleFinished, status: assembleStatus } =
        useVideoProgress(assembleJobId);

    useEffect(() => {
        if (!assembleJobId || !assembleFinished) return;

        // Reset jobId first to stop tracking
        setAssembleJobId(undefined);
        setAssembling(false);

        if (assembleStatus === "completed") {
            setShowProductionModal(false);
            stopProgress();
            router.push(`/videos/${id}`);
        } else {
            stopProgress();
        }
    }, [assembleFinished, assembleStatus, assembleJobId, id, router, setAssembling, setShowProductionModal, stopProgress]);

    // ── Per-scene image reprompt ───────────────────────────────────────────────
    const [repromptJobId, setRepromptJobId] = useState<string | undefined>();
    const { isFinished: repromptFinished } = useVideoProgress(repromptJobId);

    useEffect(() => {
        if (!repromptJobId || !repromptFinished) return;
        // Job done — clear jobId first to stop tracking
        setRepromptJobId(undefined);
        // Refetch the full video to get updated imageUrls for all scenes
        videosService.getById(id)
            .then((video) => setVideo(video))
            .catch(() => { })
            .finally(() => setRegeneratingSceneId(null));
    }, [repromptFinished, repromptJobId, id, setVideo, setRegeneratingSceneId]);

    // Sync tab with URL
    useEffect(() => {
        const validSteps = ["script", "storyboard", "production", "audio"];
        if (validSteps.includes(step)) {
            if (step === "production" || step === "audio") {
                setShowProductionModal(true);
                setTab("storyboard");
            } else {
                setTab(step as any);
                setShowProductionModal(false);
            }
        }
    }, [step, setTab, setShowProductionModal]);

    // Initial Data Load
    useEffect(() => {
        let cancelled = false;

        const doLoad = async (isRetry = false) => {
            try {
                const [video, voices, models, music] = await Promise.all([
                    videosService.getById(id),
                    adminService.listPublicVoices(),
                    adminService.listStandardModels(),
                    adminService.listPublicMusic(),
                ]);
                if (cancelled) return;

                const hasScenes = (video.scenes?.length ?? 0) > 0 || (video.script?.scenes?.length ?? 0) > 0;
                const isGeneratingScript = ['queued', 'processing', 'script_generation', 'pre_sync'].includes(video.status);

                // CRITICAL: Determine if visuals are already generated to show "Next" instead of "Generate"
                const hasActuallyGeneratedScenes = (video.scenes?.length || 0) > 0;

                // We consider visuals generated ONLY if scenes exist AND they actually have solid imageUrls.
                // Statuses like "draft" or "script_generated" definitely mean NO visuals.
                const hasActualImages = hasActuallyGeneratedScenes && video.scenes!.every((s: any) => s.imageUrl && s.imageUrl.length > 10);

                // Fallback: If status is completed but we're missing some images, we still consider the run "completed" for navigation purposes.
                const statusAllowsVisuals = ['completed'].includes(video.status);

                const hasVisuals = hasActualImages || statusAllowsVisuals;

                setVideo(video);
                setVisualsGenerated(!!hasVisuals);
                setLists(voices || [], models.data || [], music || []);

                // If scenes are empty and we are still in a state that suggests generation or a recent transition, poll every 2s
                if (!hasScenes && (isGeneratingScript || ['draft', 'script_generated'].includes(video.status)) && !cancelled) {
                    setTimeout(() => doLoad(), 2000);
                }
            } catch (err) {
                console.error("[Studio] Failed to load video data:", err);
                // On error, try once more after 5s
                if (!cancelled) setTimeout(() => doLoad(), 5000);
            }
        };

        // Reset stale video state before fetching so we always show a spinner for fresh data
        setVideo(null);
        doLoad();

        return () => { cancelled = true; };
    }, [id, setVideo, setLists]);


    if (!activeVideo || (!activeVideo.scenes?.length && !activeVideo.script?.scenes?.length)) {
        const isGenerating = ['queued', 'processing', 'script_generation', 'pre_sync'].includes(activeVideo?.status || '');

        return (
            <div className="flex flex-col items-center justify-center min-h-screen bg-white gap-6 p-8 text-center">
                <div className="relative">
                    <div className="animate-spin rounded-full h-12 w-12 border-2 border-zinc-100 border-t-blue-600"></div>
                    {isGenerating && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <Sparkles className="h-4 w-4 text-blue-500 animate-pulse" />
                        </div>
                    )}
                </div>
                <div className="space-y-2 max-w-xs">
                    <h3 className="font-black text-zinc-900 tracking-tight text-lg">
                        {isGenerating ? "Rédaction de votre script..." : "Chargement du studio..."}
                    </h3>
                    <p className="text-zinc-500 text-sm leading-relaxed">
                        {isGenerating
                            ? "Votre suite narrative est en cours d'écriture par notre IA. Cela prend environ 15-20 secondes."
                            : "Nous préparons votre espace de création."
                        }
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white">
            {activeTab !== "script" && (
                <StudioHeader
                    onNext={() => { }}
                    onAssemble={async () => {
                        const jobId = await handleAssemble();
                        if (jobId) setAssembleJobId(jobId);
                    }}
                />
            )}
            <StudioErrorBar />

            <main className="flex-1 overflow-hidden relative">
                {activeTab === "script" && (
                    <ScriptTabContent
                        onScenesChange={(scenes) => setVideo({ ...activeVideo, scenes })}
                        onSaveScript={handleSaveScript}
                        onAnimate={async () => {
                            const jobId = await handleAnimate(() => { });
                            if (jobId) setAnimateJobId(jobId);
                        }}
                        onShare={() => setShowProductionModal(true)}
                    />
                )}

                {activeTab === "storyboard" && (
                    <StoryboardTabContent
                        onRegenerateImage={async (sceneId, index, prompt) => {
                            // Prevent double-click: only one regen at a time
                            if (repromptJobId) return;
                            const jobId = await handleRegenerateImage(sceneId, index, prompt);
                            if (jobId) setRepromptJobId(jobId);
                        }}
                    />
                )}
            </main>

            <ProductionModal
                onAssemble={async () => {
                    const jobId = await handleAssemble();
                    if (jobId) setAssembleJobId(jobId);
                }}
                onSkipMusic={() => { }}
            />
        </div>
    );
}
