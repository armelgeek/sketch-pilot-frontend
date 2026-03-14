"use client";

import { use, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PromptForm } from "@/src/app/admin/components/prompt-form";
import { useAdminActions } from "@/src/app/admin/hooks/use-admin-actions";
import { useAdminPrompts } from "@/src/app/admin/hooks/use-admin-data";
import { Skeleton } from "@/src/components/ui/skeleton";

interface EditPromptPageProps {
    params: Promise<{ id: string }>;
}

export default function EditPromptPage({ params }: EditPromptPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { updatePrompt } = useAdminActions();
    const { data: promptsRes, isLoading } = useAdminPrompts({});

    // In a real scenario, we might want a useAdminPrompt(id) hook, 
    // but here we find it in the list for simplicity given the existing hooks.
    const prompt = promptsRes?.data?.find((p: any) => p.id === id);

    const handleSave = async (data: any) => {
        try {
            await updatePrompt({ id, data });
            router.push("/admin/prompts");
        } catch (error) {
            console.error("Failed to update prompt:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
                <Skeleton className="h-20 w-full rounded-[32px]" />
                <div className="grid grid-cols-3 gap-8">
                    <Skeleton className="col-span-2 h-[600px] rounded-[40px]" />
                    <Skeleton className="h-[600px] rounded-[40px]" />
                </div>
            </div>
        );
    }

    if (!prompt) {
        return (
            <div className="max-w-5xl mx-auto py-20 px-6 text-center">
                <h1 className="text-2xl font-black">Prompt non trouvé</h1>
                <p className="text-zinc-500 mt-2">Le prompt que vous essayez de modifier n'existe pas.</p>
                <button
                    onClick={() => router.push("/admin/prompts")}
                    className="mt-6 text-black font-bold underline"
                >
                    Retour à la liste
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-6">
            <PromptForm
                title="Modifier le Prompt"
                initialData={prompt}
                onSubmit={handleSave}
                onCancel={() => router.push("/admin/prompts")}
            />
        </div>
    );
}
