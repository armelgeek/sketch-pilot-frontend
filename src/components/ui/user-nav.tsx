"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
    User,
    Settings,
    LogOut,
    LayoutDashboard,
    Zap,
    Shield
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { useSession, signOut } from "@/src/lib/auth-client";

const UserNav = () => {
    const router = useRouter();
    const { data: session } = useSession();

    const handleSignOut = async () => {
        await signOut({
            fetchOptions: {
                onSuccess: () => {
                    router.push("/login");
                },
            },
        });
    };

    if (!session?.user) return null;

    const userName = session.user.name || session.user.email || "Utilisateur";
    const userInitials = userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className="rounded-2xl focus:outline-none transition-all hover:ring-4 hover:ring-zinc-100 dark:hover:ring-zinc-900 active:scale-95">
                    <Avatar className="h-9 w-9 border-2 border-white dark:border-zinc-800 shadow-md">
                        <AvatarImage src={session.user.image || ""} alt={userName} />
                        <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900 font-bold text-[10px] text-zinc-600 dark:text-zinc-400">
                            {userInitials}
                        </AvatarFallback>
                    </Avatar>
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56 p-2 rounded-2xl border-zinc-200 dark:border-zinc-800 shadow-xl">
                <div className="flex items-center gap-3 p-3 mb-1">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={session.user.image || ""} alt={userName} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">{userInitials}</AvatarFallback>
                    </Avatar>
                    <div className="flex flex-col min-w-0">
                        <div className="text-sm font-bold truncate">{userName}</div>
                        <div className="text-[10px] text-zinc-500 truncate">{session.user.email}</div>
                    </div>
                </div>

                <DropdownMenuSeparator />

                <div className="space-y-1 my-1">
                    <DropdownMenuItem asChild className="rounded-xl h-10 px-3 cursor-pointer">
                        <Link href="/dashboard" className="flex items-center gap-2 w-full">
                            <LayoutDashboard size={16} className="opacity-70" />
                            <span>Tableau de bord</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl h-10 px-3 cursor-pointer">
                        <Link href="/subscription" className="flex items-center gap-2 w-full">
                            <Zap size={16} className="opacity-70" />
                            <span>Abonnement</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl h-10 px-3 cursor-pointer">
                        <Link href="/profile" className="flex items-center gap-2 w-full">
                            <User size={16} className="opacity-70" />
                            <span>Profil</span>
                        </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="rounded-xl h-10 px-3 cursor-pointer">
                        <Link href="/settings" className="flex items-center gap-2 w-full">
                            <Settings size={16} className="opacity-70" />
                            <span>Paramètres</span>
                        </Link>
                    </DropdownMenuItem>
                </div>

                <DropdownMenuSeparator />

                <DropdownMenuItem
                    className="rounded-xl h-10 px-3 mt-1 cursor-pointer text-red-600 focus:bg-red-50 focus:text-red-600 font-bold"
                    onClick={handleSignOut}
                >
                    <div className="flex items-center gap-2 w-full">
                        <LogOut size={16} />
                        <span>Se déconnecter</span>
                    </div>
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};

export default UserNav;
