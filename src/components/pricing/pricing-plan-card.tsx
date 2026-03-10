"use client";

import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Check } from "lucide-react";
import type { PricingPlan } from "@/src/hooks/use-subscription";

interface PricingPlanCardProps {
  plan: PricingPlan;
  isHighlighted?: boolean;
  isCurrentPlan?: boolean;
  onSelect: (planId: string) => void;
  interval: "month" | "year";
  isLoading?: boolean;
}

export function PricingPlanCard({
  plan,
  isHighlighted,
  isCurrentPlan,
  onSelect,
  interval,
  isLoading
}: PricingPlanCardProps) {
  const price = interval === "year" ? plan.priceYearly : plan.priceMonthly;
  const displayPrice = interval === "year" ? plan.displayedYearly : plan.displayedMonthly;

  const features = [
    `Crédits illimités: ${interval === "year" ? "2000+/mois" : "500+/mois"}`,
    "Export HD 1080p",
    "Support prioritaire",
    "API Access"
  ];

  return (
    <Card className={isHighlighted ? "ring-2 ring-blue-500 dark:ring-blue-400 relative" : ""}>
      {isHighlighted && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="bg-blue-500">Populaire</Badge>
        </div>
      )}

      {isCurrentPlan && (
        <div className="absolute -top-3 right-4">
          <Badge variant="secondary">Plan actuel</Badge>
        </div>
      )}

      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        {plan.description && <CardDescription>{plan.description}</CardDescription>}

        <div className="mt-4 space-y-1">
          <div className="text-3xl font-bold">
            {plan.currency === "EUR" ? "€" : "$"}
            {(price / 100).toFixed(2)}
          </div>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            par {interval === "year" ? "an" : "mois"}
          </p>
          {interval === "year" && displayPrice > price && (
            <p className="text-sm text-green-600 dark:text-green-400">
              Économisez: ~{(((displayPrice - price) / displayPrice) * 100).toFixed(0)}%
            </p>
          )}
        </div>
      </CardHeader>

      <CardContent>
        <ul className="space-y-3">
          {features.map((feature) => (
            <li key={feature} className="flex items-center gap-2 text-sm">
              <Check className="h-4 w-4 text-green-600 dark:text-green-400 shrink-0" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          variant={isHighlighted ? "default" : "outline"}
          onClick={() => onSelect(plan.id)}
          disabled={isCurrentPlan || isLoading}
          size="lg"
        >
          {isCurrentPlan ? "Plan actuel" : isLoading ? "En cours..." : "Sélectionner"}
        </Button>
      </CardFooter>
    </Card>
  );
}
