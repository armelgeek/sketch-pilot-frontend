"use client";

import { use, useEffect } from "react";
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
        setShowProductionModal
    } = useStudioStore();

    const {
        handleSaveScript,
        handleAnimate,
        handleAssemble,
        handleRegenerateImage
    } = useStudioActions();

    // Sync tab with URL
    useEffect(() => {
        const validSteps = ["script", "storyboard", "production", "audio"];
        if (validSteps.includes(step)) {
            if (step === "production" || step === "audio") {
                setShowProductionModal(true);
                setTab("storyboard"); // Default background for production modal
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
                    adminService.listVoices(),
                    adminService.listStandardModels(),
                    adminService.listMusic(),
                ]);
                setVideo(video);
                // voices and music from listVoices/listMusic return the array directly (res.data in AdminService)
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
            <StudioHeader
                onNext={() => { }}
                onAssemble={handleAssemble}
            />
            <StudioErrorBar />

            <main className="flex-1 overflow-hidden relative">
                {activeTab === "script" && (
                    <ScriptTabContent
                        onScenesChange={(scenes) => setVideo({ ...activeVideo, scenes })}
                        onSaveScript={handleSaveScript}
                        onAnimate={() => handleAnimate(() => { })}
                    />
                )}

                {activeTab === "storyboard" && (
                    <StoryboardTabContent
                        onRegenerateImage={handleRegenerateImage}
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
