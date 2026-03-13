"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { STRIPE_PLANS } from "@/src/lib/stripe-plans";
import { useSubscription } from "@/src/hooks/use-subscription";
import { useSession } from "@/src/lib/auth-client";

interface PricingPreviewSectionProps {
  isAuthenticated?: boolean;
}

export function PricingPreviewSection({ isAuthenticated }: PricingPreviewSectionProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const { upgradePlan, loading } = useSubscription();
  const [error, setError] = useState<string | null>(null);
  const displayPlans = STRIPE_PLANS;

  const handleSubscribe = async (planId: string) => {
    setError(null);

    if (!session?.user) {
      router.push("/register");
      return;
    }

    try {
      await upgradePlan(planId, "month");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Subscription failed");
    }
  };

  if (displayPlans.length === 0) {
    return null;
  }

  return (
    <section className="relative py-24 bg-white dark:bg-zinc-950 overflow-hidden border-y border-zinc-200/60 dark:border-zinc-800/60">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
            Tarification <span className="text-emerald-600 dark:text-emerald-400">sans surprise</span>
          </h2>
          <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400 max-w-2xl mx-auto font-medium">
            Choisissez le plan qui correspond à votre ambition. Pas de frais cachés,
            commencez à créer dès aujourd&apos;hui.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {displayPlans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative group flex flex-col p-8 rounded-[2.5rem] bg-white dark:bg-zinc-900/50 border-2 transition-all duration-300",
                plan.highlighted
                  ? "border-emerald-600 dark:border-emerald-500 shadow-2xl shadow-emerald-500/10 scale-105 z-10"
                  : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-xl"
              )}
            >
              {plan.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-emerald-500/20">
                  Le plus populaire
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 tracking-tight mb-2">{plan.name}</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-5xl font-black text-zinc-900 dark:text-zinc-50 tracking-tighter">${plan.monthlyPrice}</span>
                  <span className="text-sm font-bold text-zinc-400 uppercase tracking-widest">/mois</span>
                </div>
              </div>

              <div className="space-y-4 mb-10 flex-grow">
                {plan.features?.map((f: string) => (
                  <div key={f} className="flex items-center gap-3 group/item">
                    <div className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <Check className="h-3 w-3 transition-transform group-hover/item:scale-125" />
                    </div>
                    <span className="text-sm font-bold text-zinc-600 dark:text-zinc-300">{f}</span>
                  </div>
                ))}
              </div>

              {error && (
                <p className="text-[11px] font-bold text-red-600 dark:text-red-400 mb-4 bg-red-50 dark:bg-red-950/20 p-2 rounded-xl text-center">{error}</p>
              )}

              <Button
                className={cn(
                  "w-full h-14 rounded-2xl font-black text-lg transition-all active:scale-95 shadow-lg",
                  plan.highlighted
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                    : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-900"
                )}
                onClick={() => handleSubscribe(plan.id)}
                disabled={loading}
              >
                {loading ? "Chargement..." : "S'abonner maintenant"}
              </Button>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link
            href="/pricing"
            className="group inline-flex items-center gap-2 text-sm font-black text-zinc-400 hover:text-emerald-600 transition-colors"
          >
            Curer tous les détails techniques
            <div className="h-px w-8 bg-current transition-all group-hover:w-12" />
          </Link>
        </div>
      </div>
    </section>
  );
}
