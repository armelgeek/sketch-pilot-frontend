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

                // If scenes are empty on first load, it may be a scriptOnly race — retry once after 2s
                if (!hasScenes && !isRetry) {
                    setTimeout(() => { if (!cancelled) doLoad(true); }, 2000);
                }
            } catch (err) {
                console.error("[Studio] Failed to load video data:", err);
            }
        };

        // Reset stale video state before fetching so we always show a spinner for fresh data
        setVideo(null);
        doLoad();

        return () => { cancelled = true; };
    }, [id, setVideo, setLists]);


    if (!activeVideo) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-white">
                <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-300 border-t-zinc-900"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-screen overflow-hidden bg-white">
            {activeTab !== "script" && (
                <StudioHeader
                    onNext={() => { }}
                    onAssemble={handleAssemble}
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
                onAssemble={handleAssemble}
                onSkipMusic={() => { }}
            />
        </div>
    );
}
