"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
    BarChart3,
    Users,
    Video,
    MessageSquare,
    Layout,
    Mic2,
    Music,
    ArrowLeft,
    CreditCard
} from "lucide-react";
import { cn } from "@/src/lib/utils";

const menuItems = [
    { icon: BarChart3, label: "Vue d'ensemble", href: "/admin" },
    { icon: Users, label: "Utilisateurs", href: "/admin/users" },
    { icon: Video, label: "Vidéos", href: "/admin/videos" },
    { icon: MessageSquare, label: "Prompts", href: "/admin/prompts" },
    { icon: Layout, label: "Modèles", href: "/admin/models" },
    { icon: Mic2, label: "Voix", href: "/admin/assets?type=voices" },
    { icon: Music, label: "Musique", href: "/admin/assets?type=music" },
    { icon: CreditCard, label: "Tarification", href: "/admin/pricing" },
];

export function AdminSidebar() {
    const pathname = usePathname();

    return (
        <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-950/50 backdrop-blur-xl h-screen sticky top-0 flex flex-col">
            <div className="p-6">
                <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors mb-8 text-sm font-medium">
                    <ArrowLeft className="h-4 w-4" />
                    Retour au Dashboard
                </Link>

                <h1 className="text-xl font-black tracking-tighter mb-8 flex items-center gap-2">
                    <div className="h-8 w-8 rounded-lg bg-amber-600 flex items-center justify-center text-white">
                        <span className="text-xs">🛡️</span>
                    </div>
                    Admin Panel
                </h1>

                <nav className="space-y-1">
                    {menuItems.map((item) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all",
                                    isActive
                                        ? "bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400"
                                        : "text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900"
                                )}
                            >
                                <item.icon className={cn("h-4 w-4", isActive ? "opacity-100" : "opacity-70")} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>

            <div className="mt-auto p-6 border-t border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">System Online</span>
                </div>
            </div>
        </aside>
    );
}
