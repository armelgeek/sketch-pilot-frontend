"use client";

import { useState } from "react";
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
  const { data: session, isPending } = useSession();

  return (
    <header className="fixed left-0 right-0 top-0 z-50 flex justify-center px-4 pt-6">
      <nav className="relative flex w-full max-w-6xl items-center justify-between gap-4 rounded-full border border-zinc-200/50 bg-white/70 px-4 py-2.5 shadow-xl shadow-zinc-200/20 backdrop-blur-xl transition-all duration-300 dark:border-zinc-800/50 dark:bg-black/40 dark:shadow-none">
        <div className="flex items-center gap-4">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-lg text-zinc-900 dark:text-zinc-50 hover:opacity-80 transition-opacity pl-1">
            <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-sm">
              <span className="text-sm">✏️</span>
            </div>
            <span className="tracking-tighter">Sketch Pilot</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-1 md:flex">
            <div className="mx-3 h-5 w-px bg-zinc-200 dark:bg-zinc-800"></div>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="rounded-full px-4 py-1.5 text-sm font-bold text-zinc-500 transition-all hover:bg-zinc-100 dark:hover:bg-zinc-900 hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>

        {/* Right side - Auth/Dashboard buttons */}
        <div className="hidden items-center gap-3 md:flex pl-2">
          {isPending ? (
            <div className="h-9 w-24 animate-pulse rounded-full bg-zinc-100 dark:bg-zinc-800" />
          ) : session ? (
            <Link
              href="/dashboard"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-zinc-900 px-5 py-2 text-sm font-black text-white transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-lg shadow-zinc-500/10 active:scale-95"
            >
              Tableau de bord
              <LayoutDashboard className="h-4 w-4 opacity-70 group-hover:rotate-12 transition-transform" />
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="rounded-full px-4 py-1.5 text-sm font-bold text-zinc-500 transition-all hover:text-zinc-900 dark:hover:text-zinc-100"
              >
                Se connecter
              </Link>
              <Link
                href="/register"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-emerald-600 px-5 py-2 text-sm font-black text-white transition-all hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 active:scale-95"
              >
                Commencer
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </>
          )}
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 transition-all hover:bg-zinc-100 active:scale-90"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="absolute top-full left-1 right-1 mt-3 rounded-3xl border border-zinc-200/60 bg-white/90 p-5 shadow-2xl backdrop-blur-2xl dark:border-zinc-800/60 dark:bg-zinc-950/90 md:hidden animate-in fade-in zoom-in-95 duration-200">
            <nav className="flex flex-col gap-2">
              <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 px-4 mb-2">Navigation</p>
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="rounded-2xl px-5 py-3.5 text-base font-bold text-zinc-600 transition-all hover:bg-zinc-50 hover:text-emerald-600 dark:text-zinc-400 dark:hover:bg-zinc-900/50 dark:hover:text-emerald-400"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
              <div className="my-3 h-px bg-zinc-100 dark:bg-zinc-800"></div>
              <div className="flex flex-col gap-3">
                {isPending ? (
                  <div className="h-14 w-full animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800" />
                ) : session ? (
                  <Link
                    href="/dashboard"
                    className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-zinc-900 px-5 py-4 text-base font-black text-white transition-all hover:bg-zinc-800 dark:bg-zinc-50 dark:text-zinc-900 dark:hover:bg-zinc-200 shadow-xl"
                    onClick={() => setMobileOpen(false)}
                  >
                    Tableau de bord
                    <LayoutDashboard className="h-5 w-5 opacity-70" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/login"
                      className="rounded-2xl px-5 py-3.5 text-base font-bold text-zinc-900 dark:text-zinc-50 transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900/50 text-center border border-zinc-100 dark:border-zinc-800"
                      onClick={() => setMobileOpen(false)}
                    >
                      Se connecter
                    </Link>
                    <Link
                      href="/register"
                      className="group inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-4 text-base font-black text-white transition-all hover:bg-emerald-500 shadow-xl shadow-emerald-500/20"
                      onClick={() => setMobileOpen(false)}
                    >
                      Commencer gratuitement
                      <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </div>
        )}
      </nav>
    </header>
  );
}
