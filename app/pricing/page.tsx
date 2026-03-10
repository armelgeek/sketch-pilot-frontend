"use client";

import { useState } from "react";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion";
import { Navbar } from "@/src/components/layout/navbar";
import { Footer } from "@/src/components/layout/footer";

const plans = [
  {
    name: "Free",
    monthlyPrice: 0,
    annualPrice: 0,
    credits: 0,
    highlighted: false,
    features: [
      "Essai gratuit",
      "Vidéos jusqu'à 5 min",
      "1 style visuel",
      "Export SD 480p",
      "Support communauté",
      "1 utilisateur",
    ],
    missing: ["API Access", "Marque blanche", "Support prioritaire"],
  },
  {
    name: "Starter",
    monthlyPrice: 9.99,
    annualPrice: 99.99,
    credits: 500,
    highlighted: false,
    features: [
      "500 crédits / mois",
      "Vidéos jusqu'à 10 min",
      "3 styles visuels",
      "Export HD 1080p",
      "Support email",
      "1 utilisateur",
    ],
    missing: ["API Access", "Marque blanche", "Support prioritaire"],
  },
  {
    name: "Pro",
    monthlyPrice: 29.99,
    annualPrice: 299.99,
    credits: 2000,
    highlighted: true,
    features: [
      "2 000 crédits / mois",
      "Vidéos illimitées",
      "12 styles visuels",
      "Export 4K",
      "Personnages personnalisés",
      "Support prioritaire",
      "3 utilisateurs",
    ],
    missing: ["Marque blanche"],
  },
  {
    name: "Enterprise",
    monthlyPrice: 99.99,
    annualPrice: 999.99,
    credits: 8000,
    highlighted: false,
    features: [
      "8 000 crédits / mois",
      "Accès API complet",
      "Marque blanche",
      "Rendu prioritaire",
      "Manager de compte dédié",
      "SLA garanti 99.9%",
      "Utilisateurs illimités",
    ],
    missing: [],
  },
];

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
  const [annual, setAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50">
      <Navbar />

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
              onClick={() => setAnnual(false)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                !annual
                  ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              }`}
            >
              Mensuel
            </button>
            <button
              onClick={() => setAnnual(true)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-2 ${
                annual
                  ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : "text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50"
              }`}
            >
              Annuel
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${annual ? "bg-green-500 text-white" : "bg-green-100 text-green-700"}`}>
                -20%
              </span>
            </button>
          </div>
        </div>

        {/* Pricing cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
          {plans.map((plan) => {
            const price = annual ? plan.annualPrice : plan.monthlyPrice;
            return (
              <Card
                key={plan.name}
                className={plan.highlighted ? "ring-2 ring-zinc-900 dark:ring-zinc-50 relative" : ""}
              >
                {plan.highlighted && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <Badge>Le plus populaire</Badge>
                  </div>
                )}
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>{plan.credits.toLocaleString()} crédits / mois</CardDescription>
                  <div className="mt-3">
                    <span className="text-4xl font-extrabold">${price.toFixed(2)}</span>
                    <span className="text-zinc-500 text-sm">/mois</span>
                    {annual && plan.monthlyPrice > 0 && (
                      <p className="text-xs text-green-600 mt-0.5">
                        Facturé ${(price * 12).toFixed(2)}/an
                      </p>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map((f) => (
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
                    <Link href={plan.name === "Free" ? "/register" : "/register"}>
                      {plan.name === "Free" ? "Commencer gratuitement" : "Commencer l'essai"}
                    </Link>
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
