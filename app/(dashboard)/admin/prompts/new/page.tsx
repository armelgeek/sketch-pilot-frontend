"use client";

import { useRouter } from "next/navigation";
import { PromptForm } from "@/src/app/admin/components/prompt-form";
import { useAdminActions } from "@/src/app/admin/hooks/use-admin-actions";
import { DEFAULT_SPEC } from "@/src/app/admin/constants";

export default function NewPromptPage() {
    const router = useRouter();
    const { createPrompt, isPending } = useAdminActions();

    const handleSave = async (data: any) => {
        try {
            await createPrompt(data);
            router.push("/admin/prompts");
        } catch (error) {
            console.error("Failed to create prompt:", error);
        }
    };

    return (
        <div className="max-w-5xl mx-auto py-10 px-6">
            <PromptForm
                title="Nouveau Prompt Système"
                initialData={DEFAULT_SPEC}
                isLoading={isPending}
                onSubmit={handleSave}
                onCancel={() => router.push("/admin/prompts")}
            />
        </div>
    );
}
