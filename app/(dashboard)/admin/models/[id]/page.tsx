"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { ModelForm } from "@/src/app/admin/components/model-form";
import { useAdminModels } from "@/src/app/admin/hooks/use-admin-data";
import { useAdminActions } from "@/src/app/admin/hooks/use-admin-actions";
import { Skeleton } from "@/src/components/ui/skeleton";

interface EditModelPageProps {
    params: Promise<{ id: string }>;
}

export default function EditModelPage({ params }: EditModelPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { data: models, isLoading } = useAdminModels();
    const { updateModel, uploadAsset, isPending } = useAdminActions();

    const model = models?.data?.find((m: any) => m.id === id);

    const handleSave = async (data: any, files: File[], inspirationFiles: Record<number, File>) => {
        try {
            // 1. Upload new main images
            const uploadedUrls: string[] = [];
            for (const file of files) {
                const url = await uploadAsset({ file, type: 'image' as any });
                uploadedUrls.push(url);
            }

            // 2. Upload new inspiration images
            const finalInspirations = [...(data.thumbnailInspirations || [])];
            for (const [indexStr, file] of Object.entries(inspirationFiles)) {
                const index = parseInt(indexStr);
                const url = await uploadAsset({ file, type: 'image' as any });
                finalInspirations[index] = url;
            }

            // 3. Prepare update data
            const updateData = {
                ...data,
                images: [...(data.images || []), ...uploadedUrls],
                thumbnailInspirations: finalInspirations
            };

            if (updateData.voiceId === "none") {
                updateData.voiceId = null;
            }

            // Update uses JSON with PATCH
            await updateModel({ id, data: updateData });
            router.push("/admin/models");
        } catch (error) {
            console.error("Failed to update model:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
                <Skeleton className="h-[60px] w-3/4 rounded-2xl" />
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="lg:col-span-2 h-[400px] rounded-[32px]" />
                    <Skeleton className="h-[400px] rounded-[32px]" />
                </div>
            </div>
        );
    }

    if (!model) {
        return (
            <div className="max-w-5xl mx-auto py-20 px-6 text-center">
                <h1 className="text-2xl font-black tracking-tighter">Modèle non trouvé</h1>
                <p className="text-zinc-500 mt-2 font-medium">Le modèle que vous essayez de modifier n'existe pas ou a été supprimé.</p>
                <button
                    onClick={() => router.push("/admin/models")}
                    className="mt-6 text-black font-black underline"
                >
                    Retour à la liste
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 pb-32">
            <ModelForm
                title="Modifier le Modèle"
                initialData={model}
                isLoading={isPending}
                onSubmit={handleSave}
                onCancel={() => router.push("/admin/models")}
            />
        </div>
    );
}
