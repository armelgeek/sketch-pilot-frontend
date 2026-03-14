"use client";

import { useRouter } from "next/navigation";
import { MusicForm } from "@/src/app/admin/components/music-form";
import { useAdminActions } from "@/src/app/admin/hooks/use-admin-actions";

export default function NewMusicPage() {
    const router = useRouter();
    const { createMusic, uploadAsset } = useAdminActions();

    const handleSave = async (data: any, file?: File) => {
        try {
            let path = data.path;
            if (file) {
                path = await uploadAsset({ file, type: 'music' });
            }
            await createMusic({ ...data, path });
            router.push("/admin/assets?tab=music");
        } catch (error) {
            console.error("Failed to add music:", error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 pb-32">
            <MusicForm
                title="Ajouter une Musique"
                onSubmit={handleSave}
                onCancel={() => router.push("/admin/assets?tab=music")}
            />
        </div>
    );
}
