"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
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
      router.push("/login");
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
    <section className="bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Tarifs simples et transparents</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {displayPlans.map((plan) => (
            <Card
              key={plan.id}
              className={plan.highlighted ? "ring-2 ring-zinc-900 dark:ring-zinc-50 relative" : ""}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge>Populaire</Badge>
                </div>
              )}
              <CardHeader className="pb-2">
                <CardTitle>{plan.name}</CardTitle>
                <div className="text-3xl font-extrabold mt-1">
                  ${plan.monthlyPrice}
                  <span className="text-sm font-normal text-zinc-500">/mois</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 mb-6">
                  {plan.features?.map((f: string) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-green-600 shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {error && (
                  <p className="text-sm text-red-500 mb-2">{error}</p>
                )}
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan.id)}
                  disabled={loading}
                >
                  {loading ? "Traitement..." : "Commencer"}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            href="/pricing"
            className="text-sm font-medium text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-50 underline underline-offset-4"
          >
            Voir tous les détails →
          </Link>
        </div>
      </div>
    </section>
  );
}
