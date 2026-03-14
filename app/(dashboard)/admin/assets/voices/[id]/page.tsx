"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { VoiceForm } from "@/src/app/admin/components/voice-form";
import { useAdminVoices } from "@/src/app/admin/hooks/use-admin-data";
import { useAdminActions } from "@/src/app/admin/hooks/use-admin-actions";
import { Skeleton } from "@/src/components/ui/skeleton";

interface EditVoicePageProps {
    params: Promise<{ id: string }>;
}

export default function EditVoicePage({ params }: EditVoicePageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { data: voices, isLoading } = useAdminVoices();
    const { updateVoice, uploadAsset } = useAdminActions();

    const voice = voices?.find((v: any) => v.id === id);

    const handleSave = async (data: any, file?: File) => {
        try {
            let previewUrl = data.previewUrl;
            if (file) {
                previewUrl = await uploadAsset({ file, type: 'voice' });
            }
            await updateVoice({ id, data: { ...data, previewUrl } });
            router.push("/admin/assets?tab=voices");
        } catch (error) {
            console.error("Failed to update voice:", error);
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

    if (!voice) {
        return (
            <div className="max-w-5xl mx-auto py-20 px-6 text-center">
                <h1 className="text-2xl font-black tracking-tighter">Voix non trouvée</h1>
                <p className="text-zinc-500 mt-2 font-medium">Le preset que vous essayez de modifier n'existe pas ou a été supprimé.</p>
                <button
                    onClick={() => router.push("/admin/assets?tab=voices")}
                    className="mt-6 text-black font-black underline"
                >
                    Retour à la bibliothèque
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 pb-32">
            <VoiceForm
                title="Modifier la Voix"
                initialData={voice}
                onSubmit={handleSave}
                onCancel={() => router.push("/admin/assets?tab=voices")}
            />
        </div>
    );
}
