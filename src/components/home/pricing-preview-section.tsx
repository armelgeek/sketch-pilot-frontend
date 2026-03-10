"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { usePricingPlans } from "@/src/hooks/use-pricing-plans";

interface PricingPreviewSectionProps {
  isAuthenticated?: boolean;
}

export function PricingPreviewSection({ isAuthenticated }: PricingPreviewSectionProps) {
  const { plans, loading, error, fetchPlans } = usePricingPlans();

  useEffect(() => {
    fetchPlans();
  }, []);

  if (loading) {
    return (
      <section className="bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-zinc-500 dark:text-zinc-400">Chargement des tarifs...</p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    return (
      <section className="bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="text-center">
            <p className="text-red-500">Erreur lors du chargement des tarifs</p>
          </div>
        </div>
      </section>
    );
  }

  const displayPlans = plans.length > 0 ? plans : [];

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
                  ${plan.price}
                  <span className="text-sm font-normal text-zinc-500">{plan.billingPeriod || "/mois"}</span>
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
                <Button
                  className="w-full"
                  variant={plan.highlighted ? "default" : "outline"}
                  asChild
                >
                  <Link href={isAuthenticated ? "/generate" : "/pricing"}>
                    {isAuthenticated ? "Créer maintenant" : "Commencer"}
                  </Link>
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
