"use client";

import Link from "next/link";

import { useEffect, useRef } from "react"

import { usePathname } from "next/navigation";
import { Bell, Clapperboard, Video, Zap, LayoutDashboard, Wand2 } from "lucide-react";
import { useSession } from "@/src/lib/auth-client";
import { useSubscriptionManager } from "@/src/hooks/use-subscription-manager";
import { cn } from "@/src/lib/utils";

import type { LucideIcon } from "lucide-react";

const NAV_LABELS: Record<string, { title: string; icon: LucideIcon }> = {
    "/dashboard": { title: "Studio", icon: Clapperboard },
    "/videos": { title: "Mes Vidéos", icon: Video },
    "/subscription": { title: "Abonnement", icon: Zap },
};

function getPageInfo(pathname: string | null): { title: string; Icon: LucideIcon } {
    if (!pathname) return { title: "Dashboard", Icon: LayoutDashboard };
    for (const [key, val] of Object.entries(NAV_LABELS)) {
        if (pathname === key || (key !== "/dashboard" && pathname.startsWith(key))) {
            return { title: val.title, Icon: val.icon };
        }
    }
    return { title: "Dashboard", Icon: LayoutDashboard };
}

import { CreditsWidget } from "@/src/components/organisms/credits-widget";

export function DashboardHeader() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const { subscriptionStatus, isLoading: subLoading } = useSubscriptionManager();

    // ─── Hide Conditions ──────────────────────────────────────────────────────────
    // Hide the global header in all Studio steps (/generate/*) since
    // the Studio has its own dedicated header.
    const isStudio = pathname?.startsWith("/generate/");
    if (isStudio) return null;

    if (!session) return null;

    const credits = subscriptionStatus?.remainingCredits ?? 0;
    const totalCredits = subscriptionStatus?.totalCredits ?? 0;

    return (
        <header className="h-14 px-6 flex items-center justify-between sticky top-0 z-30 shrink-0 backdrop-blur-md border-b border-zinc-100">
            <div className="flex items-center gap-3">
            </div>

            <div className="flex items-center gap-4">
                <CreditsWidget
                    credits={credits}
                    totalCredits={totalCredits}
                    isStudio={false}
                    subLoading={subLoading}
                />
            </div>
        </header>
    );
}
