"use client";

import { useRouter } from "next/navigation";
import { ModelForm } from "@/src/app/admin/components/model-form";
import { useAdminActions } from "@/src/app/admin/hooks/use-admin-actions";

export default function NewModelPage() {
    const router = useRouter();
    const { createModel, uploadAsset, isPending } = useAdminActions();

    const handleSave = async (data: any, files: File[]) => {
        try {
            // 1. Upload all new images first
            const uploadedUrls: string[] = [];
            for (const file of files) {
                const url = await uploadAsset({ file, type: 'image' as any }); // Re-using asset upload
                uploadedUrls.push(url);
            }

            // 2. Prepare model data
            const modelData = {
                name: data.name,
                description: data.description || "",
                gender: data.gender || "unknown",
                age: data.age || "unknown",
                voiceId: data.voiceId && data.voiceId !== "none" ? data.voiceId : undefined,
                isStandard: String(data.isStandard),
                stylePrefix: data.stylePrefix || "",
                artistPersona: data.artistPersona || "",
                images: [...(data.images || []), ...uploadedUrls]
            };

            await createModel(modelData);
            router.push("/admin/models");
        } catch (error) {
            console.error("Failed to create model:", error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 pb-32">
            <ModelForm
                title="Créer un Modèle"
                onSubmit={handleSave}
                isLoading={isPending}
                onCancel={() => router.push("/admin/models")}
            />
        </div>
    );
}
