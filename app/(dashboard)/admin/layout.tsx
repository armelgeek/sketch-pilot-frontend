"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { AdminSidebar } from "@/src/components/admin/admin-sidebar";
import { AdminHeader } from "@/src/components/admin/admin-header";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const { data: session, isPending } = useSession();

    useEffect(() => {
        if (!isPending) {
            if (!session) {
                router.push("/login");
            } else if (!(session.user as any)?.isAdmin) {
                router.push("/dashboard");
            }
        }
    }, [session, isPending, router]);

    if (isPending || !(session?.user as any)?.isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
                    <p className="text-sm font-medium text-zinc-500 animate-pulse">Vérification des accès administrateur...</p>
                </div>
            </div>
        );
    }

    return <>{children}</>;
}
