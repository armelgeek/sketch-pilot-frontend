"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { MusicForm } from "@/src/app/admin/components/music-form";
import { useAdminMusic } from "@/src/app/admin/hooks/use-admin-data";
import { useAdminActions } from "@/src/app/admin/hooks/use-admin-actions";
import { Skeleton } from "@/src/components/ui/skeleton";

interface EditMusicPageProps {
    params: Promise<{ id: string }>;
}

export default function EditMusicPage({ params }: EditMusicPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { data: musicTracks, isLoading } = useAdminMusic();
    const { updateMusic, uploadAsset, isPending } = useAdminActions();

    const track = musicTracks?.find((m: any) => m.id === id);

    const handleSave = async (data: any, file?: File) => {
        try {
            let path = data.path;
            if (file) {
                path = await uploadAsset({ file, type: 'music' });
            }
            await updateMusic({ id, data: { ...data, path } });
            router.push("/admin/assets?tab=music");
        } catch (error) {
            console.error("Failed to update music:", error);
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

    if (!track) {
        return (
            <div className="max-w-5xl mx-auto py-20 px-6 text-center">
                <h1 className="text-2xl font-black tracking-tighter">Piste non trouvée</h1>
                <p className="text-zinc-500 mt-2 font-medium">La musique que vous essayez de modifier n'existe pas ou a été supprimée.</p>
                <button
                    onClick={() => router.push("/admin/assets?tab=music")}
                    className="mt-6 text-black font-black underline"
                >
                    Retour à la bibliothèque
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 pb-32">
            <MusicForm
                title="Modifier la Musique"
                initialData={track}
                isLoading={isPending}
                onSubmit={handleSave}
                onCancel={() => router.push("/admin/assets?tab=music")}
            />
        </div>
    );
}
