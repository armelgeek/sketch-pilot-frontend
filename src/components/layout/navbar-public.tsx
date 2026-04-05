"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, LayoutDashboard, Shield, User } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useSession } from "@/src/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";

export function NavbarPublic() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { data: session, isPending } = useSession();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const userName = session?.user?.name || session?.user?.email || "User";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <header
      className={cn(
        "fixed left-0 right-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "bg-white/80 backdrop-blur-xl border-b border-zinc-200 py-4 shadow-sm"
          : "bg-transparent py-6"
      )}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
        {/* Left: Logo */}
        <div className="flex-1 flex justify-start">
          <Link href="/" className="flex items-center gap-2 font-heading font-extrabold text-2xl text-zinc-950 hover:opacity-80 transition-all active:scale-95 group">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500 text-white shadow-[0_4px_15px_-3px_rgba(245,158,11,0.4)] group-hover:rotate-6 transition-transform">
              <span className="text-sm">✏️</span>
            </div>
            <span className="tracking-tight uppercase">Sketch Pilot</span>
          </Link>
        </div>

        {/* Center: Desktop Navigation */}
        <nav className="hidden md:flex flex-1 items-center justify-center gap-8">
          <Link href="#features" className="text-sm font-bold text-zinc-600 hover:text-amber-500 transition-colors">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-bold text-zinc-600 hover:text-amber-500 transition-colors">
            Pricing
          </Link>
          <Link href="#faq" className="text-sm font-bold text-zinc-600 hover:text-amber-500 transition-colors">
            FAQ
          </Link>
        </nav>

        {/* Right: CTA & Mobile Toggle */}
        <div className="flex-1 flex justify-end items-center gap-4">
          <div className="hidden md:flex items-center gap-4">
            {!isPending && session ? (
              <div className="flex items-center gap-5">

                <Link href="/dashboard" className="transition-all hover:scale-105 active:scale-95">
                  <Avatar className="h-9 w-9 border-2 border-white shadow-md ring-1 ring-zinc-100">
                    <AvatarImage src={session?.user?.image || ""} alt={userName} />
                    <AvatarFallback className="bg-zinc-100 text-[10px] font-black text-zinc-500">{userInitials}</AvatarFallback>
                  </Avatar>
                </Link>
                {(session.user as any)?.isAdmin && (
                  <Link
                    href="/admin"
                    className="flex items-center gap-2 text-sm font-bold text-amber-600 hover:text-amber-500 transition-colors"
                  >
                    <Shield className="h-4 w-4" />
                    Admin
                  </Link>
                )}


                <Link
                  href="/dashboard"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-amber-600 active:scale-95 no-underline shadow-[0_4px_15px_-3px_rgba(245,158,11,0.4)]"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>

              </div>
            ) : isPending ? (
              <div className="h-10 w-32 bg-zinc-100 animate-pulse rounded-full" />
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-sm font-bold text-zinc-600 hover:text-amber-500 transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-amber-600 active:scale-95 no-underline shadow-[0_4px_15px_-3px_rgba(245,158,11,0.4)]"
                >
                  Get Started
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Link>
              </>
            )}
          </div>

          <button
            className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-950 transition-all active:scale-95"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileOpen && (
          <div className="absolute top-full left-0 right-0 bg-white border-b border-zinc-200 p-6 md:hidden animate-in slide-in-from-top-4 duration-300 shadow-2xl">
            <div className="flex flex-col gap-6">
              {!isPending && session && (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-zinc-50 border border-zinc-100">
                  <Avatar className="h-12 w-12 border-2 border-white shadow-sm">
                    <AvatarImage src={session?.user?.image || ""} alt={userName} />
                    <AvatarFallback className="bg-zinc-200 text-xs font-black text-zinc-500">{userInitials}</AvatarFallback>
                  </Avatar>
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-black text-zinc-900 truncate">{userName}</span>
                    <span className="text-[10px] font-bold text-zinc-400 truncate uppercase tracking-widest">{session?.user?.email}</span>
                  </div>
                </div>
              )}

              <nav className="flex flex-col gap-4">
                <Link
                  href="#features"
                  className="text-lg font-heading font-bold text-zinc-950"
                  onClick={() => setMobileOpen(false)}
                >
                  Features
                </Link>
                <Link
                  href="#pricing"
                  className="text-lg font-heading font-bold text-zinc-950"
                  onClick={() => setMobileOpen(false)}
                >
                  Pricing
                </Link>
                <Link
                  href="#faq"
                  className="text-lg font-heading font-bold text-zinc-950"
                  onClick={() => setMobileOpen(false)}
                >
                  FAQ
                </Link>
              </nav>

              <div className="h-px bg-zinc-100 w-full" />

              <div className="flex flex-col gap-4">
                {!isPending && session ? (
                  <>
                    {(session.user as any)?.isAdmin && (
                      <Link
                        href="/admin"
                        className="flex items-center justify-between gap-2 rounded-xl bg-amber-50 px-5 py-4 text-lg font-black text-amber-600 border border-amber-100"
                        onClick={() => setMobileOpen(false)}
                      >
                        Console Admin
                        <Shield className="h-5 w-5" />
                      </Link>
                    )}
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 py-4 text-base font-bold text-white shadow-xl shadow-amber-500/20"
                      onClick={() => setMobileOpen(false)}
                    >
                      Get Started
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="text-lg font-body font-bold text-zinc-600"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/register"
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 py-4 text-base font-bold text-white shadow-[0_4px_15px_-3px_rgba(245,158,11,0.4)]"
                      onClick={() => setMobileOpen(false)}
                    >
                      Get Started
                      <ArrowRight className="h-5 w-5" />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
