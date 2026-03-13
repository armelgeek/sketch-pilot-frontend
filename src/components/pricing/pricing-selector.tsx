"use client";

import { useEffect, useState } from "react";
import { useStripeSubscription } from "@/src/hooks/use-stripe-subscription";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Badge } from "@/src/components/ui/badge";
import { STRIPE_PLANS } from "@/src/lib/stripe-plans";
import { Loader2, AlertCircle } from "lucide-react";

export function PricingSelector() {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const {
    loading,
    error,
    subscriptions,
    upgrade,
    getActiveSubscription,
    clearError
  } = useStripeSubscription();

  const activeSubscription = getActiveSubscription();

  useEffect(() => {
    // Clear any previous selection errors
    clearError();
  }, [interval]);

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    clearError();
    try {
      await upgrade({
        plan: planId,
        annual: interval === "year",
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/pricing`,
        disableRedirect: false,
      });
    } catch (err) {
      console.error("Selection failed:", err);
      setSelectedPlan(null);
    }
  };

  const getPlanPrice = (plan: typeof STRIPE_PLANS[0]) => {
    return interval === "year" ? plan.annualPrice : plan.monthlyPrice;
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h2 className="text-3xl font-bold">Tarifs transparents</h2>
        <p className="text-zinc-500 dark:text-zinc-400">Choisissez le plan qui vous convient</p>
      </div>

      {/* Billing Interval Toggle */}
      <div className="flex justify-center">
        <Tabs value={interval} onValueChange={(v) => setInterval(v as "month" | "year")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="month">Facturation mensuelle</TabsTrigger>
            <TabsTrigger value="year">Facturation annuelle (-20%)</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Current Status */}
      {activeSubscription && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Plan actuel</p>
                <p className="font-semibold capitalize">{activeSubscription.plan}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Statut</p>
                <Badge variant="secondary" className="capitalize">
                  {activeSubscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Renouvellement</p>
                <p className="font-semibold">
                  {activeSubscription.periodEnd
                    ? new Date(activeSubscription.periodEnd).toLocaleDateString('fr-FR')
                    : "N/A"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-200 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 dark:text-red-100">{error}</p>
              <Button
                onClick={clearError}
                variant="ghost"
                size="sm"
                className="mt-2 text-red-700 dark:text-red-300"
              >
                Fermer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {STRIPE_PLANS.map((plan) => {
          const price = getPlanPrice(plan);
          const isActive = activeSubscription?.plan === plan.name;

          return (
            <Card
              key={plan.id}
              className={plan.highlighted ? "ring-2 ring-blue-500 relative" : ""}
            >
              {plan.highlighted && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <Badge className="bg-blue-500">Populaire</Badge>
                </div>
              )}
              {isActive && (
                <div className="absolute -top-3 right-4">
                  <Badge variant="secondary">Plan actuel</Badge>
                </div>
              )}

              <CardHeader className="pb-2">
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <p className="text-sm text-zinc-500 dark:text-zinc-400">{plan.description}</p>

                <div className="mt-4 space-y-1">
                  <div className="text-3xl font-bold">
                    {price > 0 ? `$${price.toFixed(2)}` : "Gratuit"}
                  </div>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400">
                    {price > 0 ? `par ${interval === "year" ? "an" : "mois"}` : "Pour toujours"}
                  </p>
                  {interval === "year" && plan.monthlyPrice > 0 && (
                    <p className="text-sm text-green-600 dark:text-green-400">
                      Économisez: ${((plan.monthlyPrice - plan.annualPrice / 12) * 12).toFixed(0)}/an
                    </p>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <span className="text-green-600">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>

                <Button
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={loading || isActive || selectedPlan === plan.id}
                  variant={plan.highlighted ? "default" : "outline"}
                  className="w-full"
                >
                  {(loading || selectedPlan === plan.id) && (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  )}
                  {isActive ? "Plan actuel" : (loading && selectedPlan === plan.id) ? "Traitement..." : "Choisir"}
                </Button>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* CTA */}
      <div className="text-center pt-8">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Essai gratuit de 14 jours sur tous les plans. Pas de carte bancaire requise.
        </p>
      </div>
    </div>
  );
}
