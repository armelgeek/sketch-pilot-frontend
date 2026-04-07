"use client";

import Link from "next/link";

import { useRef } from "react"

import { usePathname } from "next/navigation";
import { Bell, Clapperboard, Video, Zap, LayoutDashboard, Wand2, ChevronRight, Film } from "lucide-react";
import { useSession } from "@/src/lib/auth-client";
import { useSubscriptionManager } from "@/src/hooks/use-subscription-manager";
import { cn } from "@/src/lib/utils";

import type { LucideIcon } from "lucide-react";

interface PageInfo {
    title: string;
    Icon: LucideIcon;
    breadcrumb?: { label: string; href?: string }[];
}

const NAV_LABELS: Record<string, PageInfo> = {
    "/dashboard": {
        title: "Tableau de Bord",
        Icon: LayoutDashboard
    },
    "/studio/character-pro": {
        title: "Portrait Studio",
        Icon: Wand2,
        breadcrumb: [{ label: "AI Studio", href: "/studio" }]
    },
    "/studio": {
        title: "AI Studio",
        Icon: Wand2,
        breadcrumb: [{ label: "Configuration Active" }]
    },
    "/characters": {
        title: "Mes Personnages",
        Icon: Wand2,
        breadcrumb: [{ label: "Ma Librairie" }]
    },
    "/videos": {
        title: "Mes Vidéos",
        Icon: Film,
        breadcrumb: [{ label: "Dashboard", href: "/dashboard" }]
    },
    "/subscription": {
        title: "Abonnement",
        Icon: Zap,
        breadcrumb: [{ label: "Dashboard", href: "/dashboard" }]
    },
};

function getPageInfo(pathname: string | null): PageInfo {
    if (!pathname) return { title: "Dashboard", Icon: LayoutDashboard };

    // Check exact matches first
    if (NAV_LABELS[pathname]) return NAV_LABELS[pathname];

    // Special case for dashboard root
    if (pathname === "/dashboard") return NAV_LABELS["/dashboard"];

    // Check startsWith for other routes
    for (const [key, val] of Object.entries(NAV_LABELS)) {
        if (key !== "/dashboard" && pathname.startsWith(key)) {
            return val;
        }
    }

    return { title: "Dashboard", Icon: LayoutDashboard };
}

import { CreditsWidget } from "@/src/components/organisms/credits-widget";
import React, { useEffect } from "react";
import { useHeaderStore } from "./header-store";

export function DashboardHeader() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const { subscriptionStatus, isLoading: subLoading } = useSubscriptionManager();
    const { actions, status, customTitle, customIcon, customBreadcrumb, resetHeaderDetails } = useHeaderStore();

    // Reset when pathname changes (optional, but usually safer)
    useEffect(() => {
        resetHeaderDetails();
    }, [pathname, resetHeaderDetails]);

    // ─── Hide Conditions ──────────────────────────────────────────────────────────
    const isStudioGeneration = pathname?.startsWith("/generate/");

    if (isStudioGeneration) return null;
    if (!session) return null;

    const navInfo = getPageInfo(pathname);
    const title = customTitle || navInfo.title;
    const Icon = customIcon || navInfo.Icon;
    const breadcrumb = customBreadcrumb || navInfo.breadcrumb;

    const credits = subscriptionStatus?.remainingCredits ?? 0;
    const totalCredits = subscriptionStatus?.totalCredits ?? 0;

    return (
        <header className="h-12 px-6 flex items-center border-b border-stone-200 bg-white sticky top-0 z-30 shrink-0">
            <div className="w-full flex items-center justify-between gap-4">

                {/* Left: breadcrumb + title */}
                <div className="flex items-center gap-1.5 min-w-0 text-[10px] uppercase tracking-[0.05em] font-bold text-stone-400">
                    {breadcrumb?.map((item, i) => (
                        <React.Fragment key={i}>
                            {item.href
                                ? <Link href={item.href} className="hover:text-stone-600 transition-colors">{item.label}</Link>
                                : <span>{item.label}</span>
                            }
                            <ChevronRight className="h-3 w-3 opacity-30 shrink-0" />
                        </React.Fragment>
                    ))}
                    <div className="flex items-center gap-1.5 min-w-0">
                        {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                        <span className="text-stone-700 truncate">{title}</span>
                    </div>
                </div>

                {/* Right: Status + Credits + Actions */}
                <div className="flex items-center gap-4 shrink-0">
                    {status && <div className="flex items-center gap-2">{status}</div>}

                    <CreditsWidget
                        credits={credits}
                        totalCredits={totalCredits}
                        subLoading={subLoading}
                    />

                    {actions && (
                        <>
                            <div className="h-4 w-px bg-stone-100 mx-1" />
                            <div className="flex items-center gap-2">
                                {actions}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </header>
    );
}
