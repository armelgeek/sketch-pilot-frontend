"use client";

import { useRouter } from "next/navigation";
import { ModelForm } from "@/src/app/admin/components/model-form";
import { useAdminActions } from "@/src/app/admin/hooks/use-admin-actions";

export default function NewModelPage() {
    const router = useRouter();
    const { createModel, uploadAsset, isPending } = useAdminActions();

    const handleSave = async (data: any, files: File[], inspirationFiles: Record<number, File>) => {
        try {
            // 1. Upload all new main images
            const uploadedUrls: string[] = [];
            for (const file of files) {
                const url = await uploadAsset({ file, type: 'image' as any });
                uploadedUrls.push(url);
            }

            // 2. Upload new inspiration images
            const finalInspirations: string[] = [];
            // We use the objects from data.thumbnailInspirations but replace URLs for new files
            const baseInspirations = data.thumbnailInspirations || [];
            for (let i = 0; i < baseInspirations.length; i++) {
                if (inspirationFiles[i]) {
                    const url = await uploadAsset({ file: inspirationFiles[i], type: 'image' as any });
                    finalInspirations.push(url);
                } else if (baseInspirations[i]) {
                    finalInspirations.push(baseInspirations[i]);
                }
            }

            // 3. Prepare model data
            const modelData = {
                ...data,
                voiceId: data.voiceId && data.voiceId !== "none" ? data.voiceId : undefined,
                isStandard: String(data.isStandard),
                images: [...(data.images || []), ...uploadedUrls],
                thumbnailInspirations: finalInspirations
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
