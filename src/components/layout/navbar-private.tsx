"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Globe, Menu, X, Coins, Zap, Shield, LayoutDashboard } from "lucide-react";
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
  const [scrolled, setScrolled] = useState(false);
  const { data: session } = useSession();
  const { subscriptionStatus, isLoading: subLoading } = useSubscriptionManager();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

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

  const userName = session?.user?.name || session?.user?.email || "User";
  const userInitials = userName
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-500 border-b",
        scrolled
          ? "bg-white/80 dark:bg-zinc-950/80 backdrop-blur-xl py-2 border-zinc-200 dark:border-zinc-800 shadow-sm"
          : "bg-white dark:bg-zinc-950 py-4 border-zinc-100 dark:border-zinc-900"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        <div className="flex items-center gap-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-black text-xl text-zinc-900 dark:text-zinc-50 hover:opacity-80 transition-all active:scale-95">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-lg shadow-zinc-500/20">
              <span className="text-base">✏️</span>
            </div>
            <span className="tracking-tighter hidden sm:inline-block">Sketch Pilot</span>
          </Link>

          {/* Nav Divider */}
          <div className="hidden md:block h-6 w-px bg-zinc-200 dark:bg-zinc-800 mx-2"></div>

          {/* Quick Stats Badge */}
          <div className="hidden lg:flex items-center gap-2 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 shadow-sm shadow-emerald-500/5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            {subscriptionStatus?.planName || "Plan Gratuit"}
          </div>
        </div>

        {/* Right side - User Actions */}
        <div className="flex items-center gap-4">
          {/* Credits Widget */}
          {subLoading ? (
            <Skeleton className="h-10 w-28 rounded-2xl" />
          ) : (
            <Link href="/subscription">
              <div className="group flex items-center gap-2.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 pl-1.5 pr-4 py-1.5 text-sm font-bold text-zinc-700 dark:text-zinc-300 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-200 dark:hover:border-emerald-800/50 active:scale-95 shadow-sm">
                <div className="h-7 w-7 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                  <Coins className="h-4 w-4 fill-current opacity-80" />
                </div>
                <div className="flex flex-col leading-none">
                  <span className="text-zinc-900 dark:text-zinc-100">{subscriptionStatus?.remainingCredits ?? 0}</span>
                  <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-tighter">Crédits</span>
                </div>
              </div>
            </Link>
          )}

          {/* User Profile Dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="rounded-2xl focus:outline-none transition-all hover:ring-4 hover:ring-zinc-100 dark:hover:ring-zinc-900 active:scale-95">
                <Avatar className="h-10 w-10 border-2 border-white dark:border-zinc-800 shadow-md">
                  <AvatarImage src={session?.user?.image || ""} alt={userName} />
                  <AvatarFallback className="bg-zinc-100 dark:bg-zinc-900 font-black text-[10px] text-zinc-600 dark:text-zinc-400">{userInitials}</AvatarFallback>
                </Avatar>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[280px] p-3 mt-4 rounded-[32px] border-zinc-200 dark:border-zinc-800 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-center gap-4 p-4 mb-3 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50">
                <Avatar className="h-12 w-12 shadow-sm">
                  <AvatarImage src={session?.user?.image || ""} alt={userName} />
                  <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">{userInitials}</AvatarFallback>
                </Avatar>
                <div className="flex flex-col min-w-0">
                  <div className="text-sm font-black text-zinc-900 dark:text-zinc-50 truncate">{userName}</div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate font-medium">{session?.user?.email}</div>
                </div>
              </div>

              <DropdownMenuSeparator className="opacity-50" />

              <div className="space-y-1 my-2">
                <DropdownMenuItem asChild className="rounded-xl h-11 px-4 cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-950/20 focus:text-emerald-600 dark:focus:text-emerald-400 font-bold text-sm">
                  <Link href="/subscription" className="flex items-center justify-between w-full">
                    <span>Abonnement & Facturation</span>
                    <Zap className="h-4 w-4 opacity-50" />
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl h-11 px-4 cursor-pointer font-bold text-sm">
                  <Link href="/profile">Gérer mon profil</Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className="rounded-xl h-11 px-4 cursor-pointer font-bold text-sm text-zinc-500">
                  <Link href="/settings">Paramètres du compte</Link>
                </DropdownMenuItem>

                {session?.user?.isAdmin && (
                  <>
                    <DropdownMenuSeparator className="opacity-50" />
                    <DropdownMenuItem asChild className="rounded-xl h-11 px-4 cursor-pointer focus:bg-emerald-50 dark:focus:bg-emerald-950/20 focus:text-emerald-600 dark:focus:text-emerald-400 font-black text-sm text-emerald-600">
                      <Link href="/admin" className="flex items-center justify-between w-full">
                        <span>Console Administrateur</span>
                        <Shield className="h-4 w-4 opacity-50" />
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
              </div>

              <DropdownMenuSeparator className="opacity-50" />

              <DropdownMenuItem className="rounded-xl h-11 px-4 mt-2 cursor-pointer text-red-600 dark:text-red-400 focus:bg-red-50 dark:focus:bg-red-950/20 focus:text-red-600 font-black text-sm" onClick={handleSignOut}>
                Se déconnecter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Mobile hamburger */}
          <button
            className="md:hidden flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all active:scale-90"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile menu overlay */}
        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800 p-6 md:hidden animate-in slide-in-from-top-4 duration-300">
            <div className="space-y-6">
              <div className="flex items-center justify-between p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm">
                <div className="flex flex-col">
                  <span className="text-[10px] uppercase tracking-wider font-black text-zinc-400">Solde Crédits</span>
                  <span className="text-3xl font-black text-zinc-900 dark:text-zinc-50">{subscriptionStatus?.remainingCredits ?? 0}</span>
                </div>
                <Link href="/subscription" onClick={() => setMobileOpen(false)}>
                  <Button className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl font-bold h-11 px-6 shadow-xl shadow-emerald-500/20">
                    Acheter
                  </Button>
                </Link>
              </div>

              <nav className="flex flex-col gap-1">
                <Link href="/dashboard" className="flex items-center gap-3 px-5 py-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 font-bold text-zinc-900 dark:text-zinc-50" onClick={() => setMobileOpen(false)}>
                  <LayoutDashboard className="h-5 w-5 opacity-50" /> Tableau de bord
                </Link>
                <Link href="/subscription" className="flex items-center gap-3 px-5 py-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 font-bold text-zinc-900 dark:text-zinc-50" onClick={() => setMobileOpen(false)}>
                  <Zap className="h-5 w-5 opacity-50" /> Abonnement
                </Link>
                <Link href="/profile" className="px-5 py-4 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900/50 font-bold text-zinc-900 dark:text-zinc-50" onClick={() => setMobileOpen(false)}>
                  Gérer Profil
                </Link>
                {session?.user?.isAdmin && (
                  <Link href="/admin" className="flex items-center justify-between px-5 py-4 rounded-2xl bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 font-black border border-emerald-500/10" onClick={() => setMobileOpen(false)}>
                    Administration <Shield className="h-5 w-5" />
                  </Link>
                )}
                <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-2" />
                <button
                  onClick={() => { handleSignOut(); setMobileOpen(false); }}
                  className="px-5 py-4 text-left rounded-2xl hover:bg-red-50 dark:hover:bg-red-950/20 font-black text-red-600 dark:text-red-400 transition-colors"
                >
                  Déconnexion
                </button>
              </nav>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
