"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion";
import { NavbarPublic } from "@/src/components/layout/navbar";
import { Footer } from "@/src/components/layout/footer";
import { STRIPE_PLANS } from "@/src/lib/stripe-plans";
import { useSubscription } from "@/src/hooks/use-subscription";
import { useSession } from "@/src/lib/auth-client";

const faqs = [
  {
    q: "Les crédits non utilisés sont-ils reportés ?",
    a: "Non, les crédits sont réinitialisés à chaque début de mois. Nous recommandons de choisir le plan adapté à votre utilisation.",
  },
  {
    q: "Puis-je changer de plan à tout moment ?",
    a: "Oui, vous pouvez upgrader ou downgrader votre plan à tout moment. Le changement prend effet au prochain cycle de facturation.",
  },
  {
    q: "Comment sont comptés les crédits ?",
    a: "1 crédit = environ 1 minute de vidéo générée. Le nombre exact dépend de la résolution et de la complexité.",
  },
  {
    q: "Y a-t-il une période d'essai ?",
    a: "Oui, nous offrons 14 jours d'essai gratuit avec 50 crédits. Aucune carte bancaire requise.",
  },
  {
    q: "Proposez-vous des remises pour les associations ou l'éducation ?",
    a: "Oui, nous offrons 50% de réduction pour les établissements éducatifs et les associations à but non lucratif. Contactez-nous.",
  },
];

export default function PricingPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const { upgradePlan, loading } = useSubscription();
  const [billingInterval, setBillingInterval] = useState<"month" | "year">("month");
  const [error, setError] = useState<string | null>(null);
  const displayPlans = STRIPE_PLANS;

  const handleSubscribe = async (planId: string) => {
    setError(null);
    
    if (!session?.user) {
      router.push("/register");
      return;
    }

    try {
      await upgradePlan(planId, billingInterval);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Subscription failed");
    }
  };

  if (displayPlans.length === 0) {
    return null;
  }

  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <NavbarPublic />

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-extrabold tracking-tight">Choisissez votre plan</h1>
          <p className="mt-4 text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">
            Des tarifs transparents adaptés à chaque créateur. Changez ou annulez à tout moment.
          </p>

          {/* Monthly/Annual toggle */}
          <div className="mt-6 inline-flex items-center gap-3 rounded-full border border-zinc-200 dark:border-zinc-800 p-1 bg-white dark:bg-zinc-900">
            <button
              onClick={() => setBillingInterval("month")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                billingInterval === "month"
                  ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setBillingInterval("year")}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                billingInterval === "year"
                  ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              }`}
            >
              Annuel
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${billingInterval === "year" ? "bg-green-500 text-white" : "bg-green-100 text-green-700"}`}>
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {displayPlans.map((plan) => {
            const price = billingInterval === "year" ? plan.annualPrice : plan.monthlyPrice;
            return (
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
                    ${price}
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
            );
          })}
        </div>

        {/* FAQ */}
        <div className="mt-20 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-center mb-8">Questions fréquentes</h2>
          <Accordion type="single" collapsible>
            {faqs.map((faq, i) => (
              <AccordionItem key={i} value={`faq-${i}`}>
                <AccordionTrigger>{faq.q}</AccordionTrigger>
                <AccordionContent>{faq.a}</AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>

      <Footer />
    </div>
  );
}
