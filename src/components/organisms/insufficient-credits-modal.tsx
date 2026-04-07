"use client";

import { Coins, ArrowRight, Zap } from "lucide-react";
import Link from "next/link";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { useInsufficientCreditsStore } from "@/src/hooks/use-insufficient-credits-store";

export function InsufficientCreditsModal() {
    const { isOpen, closeModal } = useInsufficientCreditsStore();

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && closeModal()}>
            <DialogContent className="sm:max-w-[425px] overflow-hidden p-0 border-zinc-100 dark:border-zinc-800">
                <div className="relative overflow-hidden bg-gradient-to-b from-amber-50 to-white dark:from-zinc-900 dark:to-zinc-950 pb-6">
                    {/* Background pattern */}
                    <div className="absolute inset-0 bg-[linear-gradient(to_right,#f59e0b10_1px,transparent_1px),linear-gradient(to_bottom,#f59e0b10_1px,transparent_1px)] bg-[size:1rem_1rem] opacity-30" />

                    <div className="pt-8 px-6 relative z-10 flex flex-col items-center text-center">
                        <div className="h-16 w-16 bg-amber-100 dark:bg-amber-900/40 rounded-full flex items-center justify-center mb-6 ring-8 ring-amber-50 dark:ring-amber-950/50">
                            <div className="h-12 w-12 bg-gradient-to-br from-amber-400 to-amber-600 rounded-full flex items-center justify-center shadow-lg shadow-amber-500/30">
                                <Coins className="h-6 w-6 text-white" />
                            </div>
                        </div>

                        <DialogHeader className="space-y-3">
                            <DialogTitle className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-50">
                                Crédits épuisés
                            </DialogTitle>
                            <DialogDescription className="text-[15px] leading-relaxed text-zinc-600 dark:text-zinc-400 max-w-[300px] mx-auto">
                                Vous avez atteint la limite de votre solde de crédits. Mettez à niveau votre forfait pour continuer à créer.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="w-full mt-8 space-y-3">
                            <Link
                                href="/subscription"
                                onClick={closeModal}
                                className="group w-full relative flex h-12 items-center justify-center gap-2 overflow-hidden rounded-xl bg-zinc-900 dark:bg-amber-500 text-white dark:text-zinc-950 text-sm font-semibold transition-all hover:bg-zinc-800 dark:hover:bg-amber-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 disabled:opacity-50"
                            >
                                <div className="absolute inset-0 flex h-full w-full justify-center [transform:skew(-12deg)_translateX(-100%)] group-hover:duration-1000 group-hover:[transform:skew(-12deg)_translateX(100%)]">
                                    <div className="relative h-full w-8 bg-white/20" />
                                </div>
                                <Zap className="w-4 h-4" />
                                <span>Voir nos forfaits</span>
                                <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover:translate-x-1" />
                            </Link>

                            <button
                                onClick={closeModal}
                                className="w-full text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100 py-2 transition-colors"
                            >
                                Plus tard
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}
