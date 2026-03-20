"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, ArrowRight, LayoutDashboard } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useSession } from "@/src/lib/auth-client";

const navLinks = [
  { href: "/#features", label: "Fonctionnalités" },
  { href: "/pricing", label: "Tarifs" },
];

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

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500 flex justify-center",
        scrolled ? "pt-4 px-4" : "pt-6 px-4"
      )}
    >
      <div
        className={cn(
          "flex w-full items-center justify-between transition-all duration-500",
          scrolled
            ? "max-w-5xl bg-white/70 dark:bg-zinc-950/70 backdrop-blur-xl py-3 px-6 rounded-full border border-zinc-200/80 dark:border-zinc-800 shadow-[0_8px_30px_rgb(0,0,0,0.06)]"
            : "max-w-7xl bg-transparent py-3 px-6 lg:px-8 border border-transparent rounded-none"
        )}
      >
        <div className="flex items-center gap-8">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 font-black text-xl text-zinc-900 dark:text-zinc-50 hover:opacity-80 transition-all active:scale-95">
            <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-lg shadow-zinc-500/20">
              <span className="text-base">✏️</span>
            </div>
            <span className="tracking-tighter">Sketch Pilot</span>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden items-center gap-1 md:flex">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-2 text-sm font-bold text-zinc-500 transition-all hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side Actions */}
        <div className="hidden items-center gap-4 md:flex">
          {isPending ? (
            <div className="h-10 w-24 animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
          ) : session ? (
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-6 py-2.5 text-sm font-black text-white transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-xl shadow-zinc-500/10 active:scale-95"
            >
              Tableau de bord
              <LayoutDashboard className="h-4 w-4 opacity-70 group-hover:rotate-12 transition-transform" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-2xl px-5 py-2.5 text-sm font-bold text-zinc-500 transition-all hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-900"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-6 py-2.5 text-sm font-black text-white transition-all hover:bg-emerald-500 shadow-xl shadow-emerald-500/20 active:scale-95"
              >
                Commencer gratuitement
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          className="md:hidden flex h-11 w-11 items-center justify-center rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 transition-all active:scale-90"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="fixed inset-x-4 top-24 rounded-3xl bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 p-6 shadow-2xl md:hidden animate-in slide-in-from-top-4 duration-300">
          <nav className="flex flex-col gap-2">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-2xl px-5 py-4 text-base font-bold text-zinc-600 transition-all hover:bg-zinc-50 dark:text-zinc-400 dark:hover:bg-zinc-900"
                onClick={() => setMobileOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="my-4 h-px bg-zinc-100 dark:bg-zinc-800" />
            <div className="flex flex-col gap-3">
              {isPending ? (
                <div className="h-14 w-full animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
              ) : session ? (
                <Link
                  href="/dashboard"
                  className="group inline-flex items-center justify-center gap-3 rounded-2xl bg-zinc-900 px-5 py-4 text-base font-black text-white transition-all active:scale-95"
                  onClick={() => setMobileOpen(false)}
                >
                  Tableau de bord
                  <LayoutDashboard className="h-5 w-5 opacity-70" />
                </Link>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="rounded-2xl px-5 py-4 text-base font-bold text-zinc-900 dark:text-zinc-50 transition-all border border-zinc-200 dark:border-zinc-800 text-center"
                    onClick={() => setMobileOpen(false)}
                  >
                    Se connecter
                  </Link>
                  <Link
                    href="/register"
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-base font-black text-white transition-all shadow-xl shadow-emerald-500/20 active:scale-95"
                    onClick={() => setMobileOpen(false)}
                  >
                    Commencer gratuitement
                    <ArrowRight className="h-5 w-5 transition-transform" />
                  </Link>
                </>
              )}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
