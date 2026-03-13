"use client";

import { Check } from "lucide-react";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { STRIPE_PLANS } from "@/src/lib/stripe-plans";

interface PlanSelectorProps {
  selectedPlanId: string | null;
  onSelectPlan: (planId: string) => void;
  billingInterval: "month" | "year";
  onIntervalChange: (interval: "month" | "year") => void;
}

export function PlanSelector({ 
  selectedPlanId, 
  onSelectPlan,
  billingInterval,
  onIntervalChange
}: PlanSelectorProps) {
  return (
    <div className="space-y-6 mb-6">
      <div>
        <label className="text-sm font-medium mb-3 block">{"Choisissez un plan d'abonnement"}</label>
        
        {/* Billing Interval Toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            type="button"
            variant={billingInterval === "month" ? "default" : "outline"}
            size="sm"
            onClick={() => onIntervalChange("month")}
          >
            Mensuel
          </Button>
          <Button
            type="button"
            variant={billingInterval === "year" ? "default" : "outline"}
            size="sm"
            onClick={() => onIntervalChange("year")}
          >
            Annuel (-20%)
          </Button>
        </div>

        {/* Plans Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {STRIPE_PLANS.map((plan) => {
            const price = billingInterval === "year" ? plan.annualPrice : plan.monthlyPrice;
            const isSelected = selectedPlanId === plan.id;

            return (
              <div
                key={plan.id}
                onClick={() => onSelectPlan(plan.id)}
                className={`relative cursor-pointer rounded-lg border-2 transition-all p-4 ${
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
                    : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                }`}
              >
                {plan.highlighted && (
                  <Badge className="absolute -top-2 -right-2 bg-blue-500">Populaire</Badge>
                )}
                
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-semibold">{plan.name}</h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400">{plan.description}</p>
                  </div>
                  {isSelected && (
                    <Check className="h-5 w-5 text-blue-500" />
                  )}
                </div>

                <div className="mb-3">
                  {price > 0 ? (
                    <>
                      <span className="text-2xl font-bold">${price.toFixed(2)}</span>
                      <span className="text-sm text-zinc-500 dark:text-zinc-400">/{billingInterval === "year" ? "an" : "mois"}</span>
                    </>
                  ) : (
                    <span className="text-2xl font-bold">Gratuit</span>
                  )}
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                    {plan.credits} crédits/mois
                  </p>
                </div>

                <ul className="space-y-1 text-xs">
                  {plan.features.slice(0, 2).map((feature) => (
                    <li key={feature} className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400">
                      <Check className="h-3 w-3 text-green-600" />
                      {feature}
                    </li>
                  ))}
                  {plan.features.length > 2 && (
                    <li className="text-zinc-500 dark:text-zinc-500 text-xs ml-4">
                      +{plan.features.length - 2} autre(s)
                    </li>
                  )}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
