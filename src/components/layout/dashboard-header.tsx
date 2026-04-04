"use client";

import Link from "next/link";

import { useEffect, useRef } from "react"

import { usePathname } from "next/navigation";
import {
    Bell, Coins, Plus, Clapperboard, Video, Zap, LayoutDashboard,
    Search, Wand2, Command
} from "lucide-react";
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
    // Hide the black global header during the "Storyboard" step of the Studio
    // to give more breathing room to the canvas.
    const isStoryboard = pathname?.endsWith("/storyboard");
    if (isStoryboard) return null;

    if (!session) return null;

    const credits = subscriptionStatus?.remainingCredits ?? 0;
    const totalCredits = subscriptionStatus?.totalCredits ?? 0;
    const isStudio = pathname?.startsWith("/generate/");

    return (
        <header
            className={cn(
                "h-14 px-6 flex items-center justify-between sticky top-0 z-30 shrink-0 transition-colors bg-white/80 backdrop-blur-md border-b border-zinc-100",
                isStudio && "bg-zinc-950 border-zinc-800"
            )}
        >
            <div className="flex items-center gap-3">
            </div>

            <div className="flex items-center gap-4">
                <CreditsWidget
                    credits={credits}
                    totalCredits={totalCredits}
                    isStudio={isStudio}
                    subLoading={subLoading}
                />

                <Link
                    href="/generate"
                    className={cn(
                        "group relative flex items-center gap-2 px-4 py-2 rounded-xl transition-all duration-500 active:scale-95",
                        "bg-zinc-950 text-white shadow-lg shadow-zinc-200/50 hover:shadow-amber-500/20"
                    )}
                >
                    <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(251,191,36,0.1)_50%,transparent_75%)] bg-[length:250%_250%] animate-[bg-flow_4s_infinite]" />
                    <Wand2 className="h-3.5 w-3.5 text-amber-400 relative z-10 group-hover:rotate-12 transition-transform" />
                    <span className="text-xs font-black tracking-tight relative z-10">Créer</span>
                </Link>

                <button
                    className={cn(
                        "group relative h-9 w-9 rounded-xl flex items-center justify-center transition-all",
                        isStudio
                            ? "bg-zinc-900 text-zinc-500 hover:text-white"
                            : "bg-white border border-zinc-100 text-zinc-400 hover:text-zinc-900"
                    )}
                >
                    <Bell className="h-4 w-4 group-hover:animate-[bell_0.5s_ease-in-out]" />
                    <span className="absolute top-2.5 right-2.5 h-1.5 w-1.5 bg-amber-500 rounded-full border-2 border-white dark:border-zinc-950 shadow-sm animate-pulse" />
                </button>
            </div>
        </header>
    );
}
