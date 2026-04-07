"use client";

import Link from "next/link";
import { Twitter, Youtube, Instagram } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-white border-t border-zinc-100 pt-20 pb-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Logo & Tagline */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center justify-start gap-3 font-heading font-extrabold text-2xl text-zinc-950 mb-6 hover:opacity-80 transition-opacity group">
              <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-amber-500 text-white shadow-[0_4px_15px_-3px_rgba(245,158,11,0.4)] group-hover:rotate-6 transition-transform">
                <span className="text-sm">✏️</span>
              </div>
              <span className="tracking-tight uppercase">Sketch Pilot</span>
            </Link>
            <p className="text-zinc-500 font-medium max-w-xs leading-relaxed">
              The first AI studio that generates complete faceless YouTube videos. No camera, no editing.
            </p>
          </div>

          {/* Links */}
          <div className="md:col-span-1">
            <h4 className="text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-zinc-900 mb-6">Liens</h4>
            <nav className="flex flex-col gap-4">
              <Link href="/contact" className="text-sm font-medium text-zinc-500 hover:text-amber-500 transition-colors">Contact</Link>
            </nav>
          </div>

          {/* Socials */}
          <div className="md:col-span-1">
            <h4 className="text-[10px] font-heading font-bold uppercase tracking-[0.2em] text-zinc-900 mb-6">Socials</h4>
            <div className="flex gap-4">
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-50 border border-zinc-200 text-zinc-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all hover:scale-110 active:scale-95">
                <Twitter className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-50 border border-zinc-200 text-zinc-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all hover:scale-110 active:scale-95">
                <Youtube className="h-4 w-4" />
              </a>
              <a href="#" className="h-10 w-10 flex items-center justify-center rounded-full bg-zinc-50 border border-zinc-200 text-zinc-500 hover:bg-amber-50 hover:border-amber-200 hover:text-amber-600 transition-all hover:scale-110 active:scale-95">
                <Instagram className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center justify-between border-t border-zinc-100 pt-8 gap-4">
          <p className="text-xs font-medium text-zinc-400">
            © 2025 Griboo · Sketch Pilot
          </p>
          <div className="flex items-center gap-2 text-xs font-medium text-zinc-400">
            Made with <span className="text-amber-500">❤️</span> for creators
          </div>
        </div>
      </div>
    </footer>
  );
}
