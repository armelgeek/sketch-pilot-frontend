"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { useOnboardingStore } from "@/src/app/onboarding/store";
import { OnboardingWizard } from "@/src/components/onboarding/onboarding-wizard";
import Logo from "@/src/components/ui/logo";

export default function OnboardingPage() {
    const router = useRouter();
    const { data: session, isPending } = useSession();
    const { completed } = useOnboardingStore();

    // If user already finished onboarding, send them to dashboard
    useEffect(() => {
        if (completed) {
            router.replace("/dashboard");
        }
    }, [completed, router]);

    // Loading state
    if (isPending) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-zinc-900 dark:border-zinc-50" />
            </div>
        );
    }

    // Must be logged in
    if (!session) {
        router.replace("/login");
        return null;
    }

    if (completed) return null;

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 via-white to-zinc-100 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
            {/* Decorative blobs */}
            <div className="pointer-events-none fixed inset-0 overflow-hidden">
                <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-violet-300/20 dark:bg-violet-700/10 blur-3xl" />
                <div className="absolute bottom-0 right-0 h-80 w-80 rounded-full bg-pink-300/20 dark:bg-pink-700/10 blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full bg-amber-200/10 dark:bg-amber-700/5 blur-3xl" />
            </div>

            {/* Logo bar */}
            <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-10">
                <Logo />
                <span className="text-xs font-semibold text-zinc-400">Setup · 2 min</span>
            </div>

            {/* Wizard */}
            <div className="relative z-10 pt-20 w-full">
                <OnboardingWizard />
            </div>
        </div>
    );
}
