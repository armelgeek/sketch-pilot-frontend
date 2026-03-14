"use client";

import { useRouter } from "next/navigation";
import { VoiceForm } from "@/src/app/admin/components/voice-form";
import { useAdminActions } from "@/src/app/admin/hooks/use-admin-actions";

export default function NewVoicePage() {
    const router = useRouter();
    const { createVoice, uploadAsset, isPending } = useAdminActions();

    const handleSave = async (data: any, file?: File) => {
        try {
            let previewUrl = data.previewUrl;
            if (file) {
                previewUrl = await uploadAsset({ file, type: 'voice' });
            }
            await createVoice({ ...data, previewUrl });
            router.push("/admin/assets?tab=voices");
        } catch (error) {
            console.error("Failed to create voice:", error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 pb-32">
            <VoiceForm
                title="Ajouter une Voix"
                onSubmit={handleSave}
                isLoading={isPending}
                onCancel={() => router.push("/admin/assets?tab=voices")}
            />
        </div>
    );
}
