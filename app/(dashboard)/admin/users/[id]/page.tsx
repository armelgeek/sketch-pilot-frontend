"use client";

import { use } from "react";
import { useRouter } from "next/navigation";
import { UserForm } from "@/src/app/admin/components/user-form";
import { useAdminUser } from "@/src/app/admin/hooks/use-admin-data";
import { useAdminActions } from "@/src/app/admin/hooks/use-admin-actions";
import { Skeleton } from "@/src/components/ui/skeleton";

interface EditUserPageProps {
    params: Promise<{ id: string }>;
}

export default function EditUserPage({ params }: EditUserPageProps) {
    const { id } = use(params);
    const router = useRouter();
    const { data: user, isLoading } = useAdminUser(id);
    const { updateUser, banUser, unbanUser, adjustCredits } = useAdminActions();

    const handleSave = async (data: any) => {
        try {
            await updateUser({ id, data });
            router.push("/admin/users");
        } catch (error) {
            console.error("Failed to update user:", error);
        }
    };

    const handleAdjustCredits = async (amount: number, reason: string) => {
        try {
            await adjustCredits({ id, extraCredits: amount, reason });
            // The query will automatically invalidate if using appropriate keys
        } catch (error) {
            console.error("Failed to adjust credits:", error);
        }
    };

    const handleStatusChange = async (banned: boolean, reason?: string) => {
        try {
            if (banned) {
                await banUser({ id, reason });
            } else {
                await unbanUser(id);
            }
        } catch (error) {
            console.error("Failed to change user status:", error);
        }
    };

    if (isLoading) {
        return (
            <div className="max-w-5xl mx-auto py-10 px-6 space-y-8">
                <div className="flex items-center gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                    <Skeleton className="h-20 w-20 rounded-[24px]" />
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <Skeleton className="lg:col-span-2 h-[400px] rounded-[32px]" />
                    <Skeleton className="h-[400px] rounded-[32px]" />
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="max-w-5xl mx-auto py-20 px-6 text-center">
                <h1 className="text-2xl font-black">Utilisateur non trouvé</h1>
                <p className="text-zinc-500 mt-2">L'utilisateur que vous essayez de modifier n'existe pas.</p>
                <button
                    onClick={() => router.push("/admin/users")}
                    className="mt-6 text-black font-bold underline"
                >
                    Retour à la liste
                </button>
            </div>
        );
    }

    return (
        <div className="max-w-5xl mx-auto py-10 px-6 pb-32">
            <UserForm
                user={user}
                onSave={handleSave}
                onCancel={() => router.push("/admin/users")}
                onAdjustCredits={handleAdjustCredits}
                onStatusChange={handleStatusChange}
            />
        </div>
    );
}
