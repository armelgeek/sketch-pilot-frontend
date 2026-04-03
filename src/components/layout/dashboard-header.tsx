"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
    Bell, LogOut, Plus, Coins, ChevronRight,
    Clapperboard, LayoutDashboard, Video, Library, Zap, Settings
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { useSession, signOut } from "@/src/lib/auth-client";
import { useSubscriptionManager } from "@/src/hooks/use-subscription-manager";
import { cn } from "@/src/lib/utils";

const NAV_LABELS: Record<string, { title: string; icon: React.FC<any> }> = {
    "/dashboard": { title: "Dashboard", icon: LayoutDashboard },
    "/generate": { title: "Studio", icon: Clapperboard },
    "/videos": { title: "Mes Vidéos", icon: Video },
    "/my-models": { title: "Ma Bibliothèque", icon: Library },
    "/subscription": { title: "Abonnement", icon: Zap },
};

function getPageInfo(pathname: string | null) {
    if (!pathname) return { title: "Dashboard", Icon: LayoutDashboard };
    for (const [key, val] of Object.entries(NAV_LABELS)) {
        if (pathname === key || (key !== "/dashboard" && pathname.startsWith(key))) {
            return { title: val.title, Icon: val.icon };
        }
    }
    return { title: "Dashboard", Icon: LayoutDashboard };
}

export function DashboardHeader() {
    const { data: session } = useSession();
    const pathname = usePathname();
    const router = useRouter();
    const { subscriptionStatus, isLoading: subLoading } = useSubscriptionManager();

    if (!session) return null;

    const userName = session.user?.name || session.user?.email || "User";
    const userInitials = userName
        .split(" ")
        .map((n: string) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const planName = subscriptionStatus?.planName || "Free";
    const credits = subscriptionStatus?.remainingCredits ?? 0;
    const isStudio = pathname?.startsWith("/generate/");

    const { title, Icon } = getPageInfo(pathname);

    const handleSignOut = async () => {
        await signOut({ fetchOptions: { onSuccess: () => router.push("/login") } });
    };

    return (
        <header
            className={cn(
                "h-14 border-b px-6 flex items-center justify-between sticky top-0 z-30 shrink-0 transition-colors",
                isStudio
                    ? "bg-zinc-950 border-zinc-800"
                    : "bg-white border-zinc-100 backdrop-blur-sm"
            )}
        >
            {/* ── Left: Icon + Page title ── */}
            <div className="flex items-center gap-3">
                <div className={cn(
                    "h-7 w-7 rounded-lg flex items-center justify-center",
                    isStudio ? "bg-emerald-500/15 text-emerald-400" : "bg-zinc-100 text-zinc-500"
                )}>
                    <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex items-center gap-2">
                    <span className={cn(
                        "text-sm font-black tracking-tight",
                        isStudio ? "text-white" : "text-zinc-900"
                    )}>
                        {title}
                    </span>
                    {isStudio && (
                        <>
                            <ChevronRight className="h-3 w-3 text-zinc-600" />
                            <span className="text-xs text-zinc-500 font-medium">Édition en cours</span>
                        </>
                    )}
                </div>
            </div>

            {/* ── Right: Actions ── */}
            <div className="flex items-center gap-2.5">
                {/* Credits pill */}
                <Link
                    href="/subscription"
                    className={cn(
                        "hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-black transition-colors",
                        isStudio
                            ? "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20"
                            : "bg-amber-50 border-amber-100 text-amber-700 hover:bg-amber-100"
                    )}
                >
                    <Coins className="h-3.5 w-3.5" />
                    {subLoading ? "…" : credits}
                    <span className={cn("text-[9px] font-medium ml-0.5", isStudio ? "text-amber-500/70" : "text-amber-500")}>
                        crédits
                    </span>
                </Link>

                {/* New Video button (hidden inside studio or on generate page) */}
                {!isStudio && pathname !== "/generate" && (
                    <Button
                        onClick={() => router.push("/generate")}
                        size="sm"
                        className="bg-zinc-900 hover:bg-zinc-700 text-white rounded-xl font-bold h-8 px-3 text-xs gap-1.5"
                    >
                        <Plus className="h-3.5 w-3.5" />
                        <span className="hidden sm:inline">Nouvelle vidéo</span>
                    </Button>
                )}

                {/* Notifications */}
                <button
                    className={cn(
                        "relative h-8 w-8 rounded-xl flex items-center justify-center transition-colors",
                        isStudio
                            ? "text-zinc-500 hover:text-zinc-200 hover:bg-zinc-800"
                            : "text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100"
                    )}
                >
                    <Bell className="h-4 w-4" />
                    <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 bg-red-500 rounded-full" />
                </button>

                <div className={cn("h-5 w-px mx-1", isStudio ? "bg-zinc-800" : "bg-zinc-200")} />

                {/* User dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none">
                            <Avatar className={cn("h-8 w-8 border-2", isStudio ? "border-zinc-700" : "border-zinc-100")}>
                                <AvatarImage src={session.user?.image || ""} alt={userName} />
                                <AvatarFallback className={cn("font-black text-[10px]", isStudio ? "bg-zinc-800 text-zinc-200" : "bg-zinc-100 text-zinc-600")}>
                                    {userInitials}
                                </AvatarFallback>
                            </Avatar>
                            <div className="hidden lg:flex flex-col items-start leading-tight">
                                <span className={cn("text-xs font-black", isStudio ? "text-zinc-100" : "text-zinc-900")}>
                                    {userName.split(" ")[0]}
                                </span>
                                <span className={cn("text-[9px] font-medium uppercase tracking-wider", isStudio ? "text-zinc-500" : "text-zinc-400")}>
                                    {planName}
                                </span>
                            </div>
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 p-1.5 mt-2 rounded-2xl border-zinc-200 shadow-xl">
                        <div className="px-3 py-2 mb-1">
                            <p className="text-xs font-black text-zinc-900">{userName}</p>
                            <p className="text-[10px] text-zinc-400">{session.user?.email}</p>
                        </div>
                        <DropdownMenuSeparator className="opacity-50" />
                        <DropdownMenuItem asChild className="rounded-xl h-9 px-3 cursor-pointer font-semibold text-sm">
                            <Link href="/subscription" className="flex items-center gap-2">
                                <Coins className="h-4 w-4 opacity-50" /> Abonnement & Crédits
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild className="rounded-xl h-9 px-3 cursor-pointer font-semibold text-sm">
                            <Link href="/videos" className="flex items-center gap-2">
                                <Video className="h-4 w-4 opacity-50" /> Mes vidéos
                            </Link>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="opacity-50" />
                        <DropdownMenuItem
                            className="rounded-xl h-9 px-3 cursor-pointer text-red-600 font-black text-sm"
                            onClick={handleSignOut}
                        >
                            <LogOut className="h-4 w-4 mr-2" /> Déconnexion
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
