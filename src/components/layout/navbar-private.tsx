"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Menu, X, Coins, Zap } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";
import { useSession, signOut } from "@/src/lib/auth-client";
import { useSubscriptionManager } from "@/src/hooks/use-subscription-manager";
import { Skeleton } from "@/src/components/ui/skeleton";

export function NavbarPrivate() {
  const router = useRouter();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { data: session } = useSession();
  const { subscriptionStatus, isLoading: subLoading } = useSubscriptionManager();

  const handleSignOut = async () => {
    await signOut({
      fetchOptions: {
        onSuccess: () => {
          router.push("/login");
        },
      },
    });
  };

  if (!session) {
    return null;
  }

  const userName = session.user.name || session.user.email || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-6">
      <nav className="relative flex w-full max-w-6xl items-center justify-between gap-4 rounded-full border border-zinc-200/50 bg-white/70 px-4 py-2.5 shadow-xl shadow-zinc-200/20 backdrop-blur-xl transition-all duration-300 dark:border-zinc-800/50 dark:bg-black/40 dark:shadow-none">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-zinc-900 dark:text-zinc-50 hover:opacity-80 transition-opacity pl-1">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-sm">
              <span className="text-sm">✏️</span>
            </div>
            <span className="tracking-tighter hidden sm:inline-block">Sketch Pilot</span>
          </Link>

          {/* Separator */}
          <div className="hidden md:block mx-2 h-5 w-px bg-zinc-200 dark:bg-zinc-800"></div>

          {/* Status Badge */}
          <div className="hidden lg:flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/5 px-3 py-1 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {subscriptionStatus?.planName || "Plan Gratuit"}
          </div>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Credits badge */}
          {subLoading ? (
            <Skeleton className="h-9 w-28 rounded-full" />
          ) : (
            <Link href="/subscription">
              <div className="group flex items-center gap-2 rounded-full bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 pl-1 pr-3 py-1 text-sm font-bold text-zinc-700 dark:text-zinc-300 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-200 dark:hover:border-emerald-800/50 active:scale-95 shadow-sm">
                <div className="h-7 w-7 rounded-full bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Coins className="h-4 w-4 fill-current opacity-80" />
                </div>
                <span>{subscriptionStatus?.remainingCredits ?? 0} <span className="text-[10px] text-zinc-400 font-medium uppercase tracking-wider ml-0.5 hidden xs:inline-block">Crédits</span></span>
              </div>
            </Link>
          )}

          {/* Desktop specific */}
          <div className="hidden md:flex items-center gap-3">
            <Button variant="ghost" size="icon" className="rounded-full h-9 w-9 text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 transition-colors">
              <Globe className="h-4 w-4" />
            </Button>
          </div>

          {/* User Profile */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-full focus:outline-none transition-all hover:scale-105 active:scale-95">
                <Avatar className="h-9 w-9 border-2 border-transparent hover:border-emerald-500/50 transition-all shadow-sm">
                  <AvatarImage src={session.user.image || ""} alt={userName} />
                  <AvatarFallback className="bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 font-black text-[10px] text-zinc-600 dark:text-zinc-400">{userInitials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[240px] p-2 mt-4 rounded-3xl border-zinc-200/60 dark:border-zinc-800/60 shadow-2xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-3 p-3 mb-2 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/30">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={session.user.image || ""} alt={userName} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <div className="text-sm font-black text-zinc-900 dark:text-zinc-50 truncate">{userName}</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-medium">{session.user.email}</div>
                </div>
              </div>

              <DropdownMenuSeparator className="opacity-50" />

              <div className="my-1">
                <DropdownMenuItem asChild className="rounded-xl h-11 px-3 cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-950/20 focus:text-emerald-600 dark:focus:text-emerald-400 font-bold text-sm">
                  <Link href="/subscription" className="flex items-center justify-between w-full">
                    <span>Abonnement</span>
                    <Zap className="h-3.5 w-3.5 opacity-50" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl h-11 px-3 cursor-pointer mb-0.5 font-bold text-sm">
                  <Link href="/profile">Profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl h-11 px-3 cursor-pointer font-bold text-sm text-zinc-500">
                  <Link href="/settings">Paramètres</Link>
                </DropdownMenuItem>
              </div>

              <DropdownMenuSeparator className="opacity-50" />

              <DropdownMenuItem className="rounded-xl h-11 px-3 mt-1 cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20 focus:text-red-600 font-black text-sm" onClick={handleSignOut}>
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50/50 dark:bg-zinc-900/50 border border-zinc-200/50 dark:border-zinc-800/50 transition-all active:scale-90"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="absolute top-full left-1 right-1 mt-3 rounded-3xl border border-zinc-200/60 bg-white/90 p-5 shadow-2xl backdrop-blur-2xl dark:border-zinc-800/60 dark:bg-zinc-950/90 md:hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-bold text-zinc-400">Vos crédits</span>
                  <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{subscriptionStatus?.remainingCredits ?? 0}</span>
                </div>
                <Link href="/subscription" onClick={() => setMobileOpen(false)}>
                  <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold px-5 shadow-lg shadow-emerald-500/20">
                    Acheter
                  </Button>
                </Link>
              </div>
              <nav className="flex flex-col gap-1">
                <Link href="/subscription" className="px-5 py-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 font-bold text-zinc-900 dark:text-zinc-50 transition-colors" onClick={() => setMobileOpen(false)}>
                  Abonnement
                </Link>
                <Link href="/profile" className="px-5 py-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 font-bold text-zinc-900 dark:text-zinc-50 transition-colors" onClick={() => setMobileOpen(false)}>
                  Profil
                </Link>
                <Link href="/settings" className="px-5 py-4 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 font-bold text-zinc-500 transition-colors" onClick={() => setMobileOpen(false)}>
                  Paramètres
                </Link>
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  className="px-5 py-4 text-left rounded-xl hover:bg-red-50 dark:hover:bg-red-950/20 font-black text-red-600 dark:text-red-400 transition-colors"
                >
                  Déconnexion
                </button>
              </nav>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}
