"use client";

import { useEffect, useState } from "react";
import { useSubscriptionManager } from "@/src/hooks/use-subscription-manager";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Badge } from "@/src/components/ui/badge";
import { PricingPlanCard } from "./pricing-plan-card";

export function PricingSelector() {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const { plan, subscriptionStatus, isLoading, handleUpgrade } = useSubscriptionManager();

  const handleSelectPlan = async (planId: string) => {
    setSelectedPlan(planId);
    try {
      await handleUpgrade(planId, interval);
    } catch (err) {
      console.error("Selection failed:", err);
      setSelectedPlan(null);
    }
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
            <TabsTrigger value="year">Facturation annuelle</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Current Status */}
      {subscriptionStatus && (
        <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Plan actuel</p>
                <p className="font-semibold">{subscriptionStatus.planName || "Aucun"}</p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Statut</p>
                <Badge variant="secondary" className="capitalize">
                  {subscriptionStatus.status || "Inactif"}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Crédits restants</p>
                <p className="font-semibold">
                  {subscriptionStatus.remainingCredits} / {subscriptionStatus.totalCredits}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">Renouvellement</p>
                <p className="font-semibold">{subscriptionStatus.autoRenew ? "Actif" : "Arrêté"}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plan.map((p) => (
          <PricingPlanCard
            key={p.id}
            plan={p}
            isHighlighted={p.name === "Professional"}
            isCurrentPlan={subscriptionStatus?.planName === p.name}
            onSelect={handleSelectPlan}
            interval={interval}
            isLoading={selectedPlan === p.id && isLoading}
          />
        ))}
      </div>

      {/* FAQ or CTA */}
      <div className="text-center pt-8">
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4">
          Essai gratuit de 14 jours sur tous les plans. Pas de carte bancaire requise.
        </p>
        <Button variant="outline" asChild>
          <a href="#faq">Voir les questions fréquentes</a>
        </Button>
      </div>
    </div>
  );
}
