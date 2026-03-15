"use client";

import { useSession } from "@/src/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search, Settings, LogOut, LayoutDashboard, Coins } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { useSubscriptionManager } from "@/src/hooks/use-subscription-manager";
import { Skeleton } from "@/src/components/ui/skeleton";
import { signOut } from "@/src/lib/auth-client";
import Link from "next/link";

export function AdminHeader() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const { subscriptionStatus, isLoading: subLoading } = useSubscriptionManager();

    if (!session) return null;

    const userName = session?.user?.name || session?.user?.email || "Admin";
    const userInitials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const getPageTitle = () => {
        const segment = pathname?.split("/").pop();
        switch (segment) {
            case "admin": return "Tableau de Bord";
            case "users": return "Utilisateurs";
            case "videos": return "Monitoring Vidéos";
            case "prompts": return "Gestion des Prompts";
            case "models": return "Modèles de Personnage";
            case "assets": return "Ressources";
            default: return "Administration";
        }
    };

    const handleSignOut = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login");
                },
            },
        });
    };

    return (
        <header className="h-20 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 px-8 flex items-center justify-between sticky top-0 z-30">
            <div className="flex items-center gap-4">
                <h2 className="text-xl font-black tracking-tight">{getPageTitle()}</h2>
            </div>

            <div className="flex items-center gap-6">
                {/* Credits Status */}
                <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-zinc-50 dark:bg-zinc-900 rounded-2xl border border-zinc-100 dark:border-zinc-800">
                    <Coins className="h-4 w-4 text-emerald-500" />
                    {subLoading ? (
                        <Skeleton className="h-4 w-12" />
                    ) : (
                        <span className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
                            {subscriptionStatus?.remainingCredits ?? 0} <span className="text-[10px] text-zinc-400 uppercase ml-1">Credits</span>
                        </span>
                    )}
                </div>

                {/* Global Search Button */}
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-zinc-400 hover:text-zinc-900 transition-colors">
                    <Search className="h-5 w-5" />
                </Button>

                {/* Notifications */}
                <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl text-zinc-400 hover:text-zinc-900 transition-colors relative">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-2.5 right-2.5 h-2 w-2 bg-red-500 rounded-full border-2 border-white dark:border-zinc-950" />
                </Button>

                <div className="h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-1" />

                {/* Admin Profile */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-3 hover:opacity-80 transition-opacity focus:outline-none">
                            <Avatar className="h-10 w-10 border-2 border-emerald-500/20 shadow-sm">
                                <AvatarImage src={session?.user?.image || ""} />
                                <AvatarFallback className="bg-emerald-50 text-emerald-700 font-bold text-xs">{userInitials}</AvatarFallback>
                            </Avatar>
                            <div className="hidden lg:flex flex-col items-start leading-tight">
                                <span className="text-sm font-black text-zinc-900 dark:text-zinc-50">{userName.split(" ")[0]}</span>
                                <span className="text-[10px] font-black uppercase tracking-tighter text-emerald-600">Administrator</span>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-[240px] p-2 mt-2 rounded-3xl border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop-blur-xl">
                        <DropdownMenuItem asChild className="rounded-xl h-11 px-3 cursor-pointer font-bold text-sm">
                            <Link href="/dashboard" className="flex items-center gap-2">
                                <LayoutDashboard className="h-4 w-4 opacity-50" /> Dashboard Public
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-xl h-11 px-3 cursor-pointer font-bold text-sm">
                            <Link href="/settings" className="flex items-center gap-2">
                                <Settings className="h-4 w-4 opacity-50" /> Paramètres
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="opacity-50" />
                        <DropdownMenuItem className="rounded-xl h-11 px-3 cursor-pointer text-red-600 dark:text-red-400 font-black text-sm" onClick={handleSignOut}>
                            <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
