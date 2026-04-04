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
        stopProgress();
        setGenerating(false);
        setAnimateJobId(undefined);
        if (animateStatus === "completed") {
            setVisualsGenerated(true);
            setTab("storyboard");
            router.replace(`/generate/${id}/storyboard`);
        }
    }, [animateFinished, animateStatus, animateJobId, id, router, setTab, setVisualsGenerated, setGenerating, stopProgress]);

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
        const loadData = async () => {
            try {
                const [video, voices, models, music] = await Promise.all([
                    videosService.getById(id),
                    adminService.listPublicVoices(),
                    adminService.listStandardModels(),
                    adminService.listPublicMusic(),
                ]);
                setVideo(video);
                setLists(voices || [], models.data || [], music || []);
            } catch (err) {
                console.error("[Studio] Failed to load video data:", err);
            }
        };
        loadData();
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
