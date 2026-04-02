"use client";

import Logo from "@/src/components/ui/logo";
import UserNav from "@/src/components/ui/user-nav";
import useTheme from '@/src/hooks/useTheme';
import { Menu, PlusIcon, X, ChevronDown } from "lucide-react";
import { useSession } from "@/src/lib/auth-client";
import Link from "next/link";
import React, { Suspense, useEffect, useState } from 'react';
import FeedbackDialog from "./FeedbackDialog";
import { cn } from "@/src/lib/utils";

function Navbar() {
  const { data: session, isPending } = useSession();
  const status = isPending ? "loading" : session?.user ? "authenticated" : "unauthenticated";

  const [mobileOpen, setMobileOpen] = useState(false);
  const themeColor = useTheme();

  return (
    <>
      <header className="bg-background/80 fixed inset-x-0 top-0 z-50 flex w-screen border-b border-zinc-200 backdrop-blur-md" style={{ height: '80px' }}>
        <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 lg:px-8">
          {/* Logo & Mobile Menu Trigger */}
          <div className="flex items-center gap-2">
            <button
              className="inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium outline-none transition-all hover:bg-accent hover:text-accent-foreground size-9 md:hidden"
              onClick={() => setMobileOpen(!mobileOpen)}
            >
              <Menu className="size-5" />
              <span className="sr-only">Menu</span>
            </button>

            <Link href="/" className="flex items-center gap-2">
              <Logo />
            </Link>
          </div>

          {/* Desktop Navigation Menu */}
          <div className="hidden md:flex items-center">
            <nav className="flex items-center justify-center gap-1">
              <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                Features <ChevronDown className="ml-1 size-3 transition duration-300 group-hover:rotate-180" />
              </button>
              <button className="group inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                Solutions <ChevronDown className="ml-1 size-3 transition duration-300 group-hover:rotate-180" />
              </button>
              <Link href="#pricing" className="inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                Pricing
              </Link>
              <Link href="/posts" className="inline-flex h-9 w-max items-center justify-center rounded-md px-4 py-2 text-sm font-medium transition-colors hover:bg-zinc-100 dark:hover:bg-zinc-800">
                Blog
              </Link>
            </nav>
          </div>

          {/* Right side actions */}
          <div className="flex items-center gap-4">
            {status === "authenticated" ? (
              <>
                <div className="hidden sm:flex items-center gap-3">
                  <Link
                    href="/editor"
                    className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-bold transition-all bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 h-8 rounded-md px-4 active:scale-95 gap-2"
                  >
                    <PlusIcon size={14} />
                    Get started
                  </Link>
                </div>
                <UserNav />
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-bold transition-all  shadow-sm  h-8 rounded-md px-4 active:scale-95"
                >
                  Se connecter
                </Link>
                <Link
                  href="/register"
                  className="inline-flex shrink-0 items-center justify-center whitespace-nowrap text-sm font-bold transition-all bg-emerald-600 text-white shadow-sm hover:bg-emerald-500 h-8 rounded-md px-4 active:scale-95"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[60] bg-white dark:bg-zinc-950 md:hidden animate-in fade-in duration-200">
          <div className="flex flex-col h-full">
            <div className="flex items-center justify-between p-4 border-b">
              <Logo />
              <button
                onClick={() => setMobileOpen(false)}
                className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              <nav className="flex flex-col gap-2">
                <Link href="#features" className="text-lg font-bold p-2 rounded-xl hover:bg-zinc-50" onClick={() => setMobileOpen(false)}>Features</Link>
                <Link href="#solutions" className="text-lg font-bold p-2 rounded-xl hover:bg-zinc-50" onClick={() => setMobileOpen(false)}>Solutions</Link>
                <Link href="#pricing" className="text-lg font-bold p-2 rounded-xl hover:bg-zinc-50" onClick={() => setMobileOpen(false)}>Pricing</Link>
                <Link href="/posts" className="text-lg font-bold p-2 rounded-xl hover:bg-zinc-50" onClick={() => setMobileOpen(false)}>Blog</Link>
              </nav>
              <div className="pt-6 border-t space-y-4">
                {status === "unauthenticated" && (
                  <>
                    <Link href="/login" className="block text-center p-4 font-bold rounded-2xl border" onClick={() => setMobileOpen(false)}>Se connecter</Link>
                    <Link href="/register" className="block text-center p-4 font-bold bg-emerald-600 text-white rounded-2xl" onClick={() => setMobileOpen(false)}>Get Started</Link>
                  </>
                )}
                {status === "authenticated" && (
                  <Link href="/editor" className="block text-center p-4 font-bold bg-emerald-600 text-white rounded-2xl" onClick={() => setMobileOpen(false)}>Créer un projet</Link>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export { Navbar as NavbarPublic };
export default Navbar;
