"use client";

import { useRouter } from "next/navigation";
import { ModelForm } from "@/src/app/admin/components/model-form";
import { useAdminActions } from "@/src/app/admin/hooks/use-admin-actions";

export default function NewModelPage() {
    const router = useRouter();
    const { createModel, isPending } = useAdminActions();

    const handleSave = async (data: any, file?: File) => {
        try {
            const formData = new FormData();
            formData.append("name", data.name);
            formData.append("gender", data.gender || "unknown");
            formData.append("age", data.age || "unknown");
            if (data.voiceId && data.voiceId !== "none") {
                formData.append("voiceId", data.voiceId);
            }
            formData.append("isStandard", String(data.isStandard));
            formData.append("stylePrefix", data.stylePrefix || "");
            formData.append("artistPersona", data.artistPersona || "");
            if (file) {
                formData.append("image", file);
            }

            await createModel(formData);
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
