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
            } else if (!session.user?.isAdmin) {
                router.push("/dashboard");
            }
        }
    }, [session, isPending, router]);

    if (isPending || !session?.user?.isAdmin) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
                <div className="flex flex-col items-center gap-4">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
                    <p className="text-sm font-medium text-zinc-500 animate-pulse">Vérification des accès administrateur...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex min-h-screen bg-zinc-50 dark:bg-zinc-950">
            <AdminSidebar />
            <div className="flex-1 flex flex-col min-w-0">
                <AdminHeader />
                <main className="flex-1 overflow-auto">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 pt-10">
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
