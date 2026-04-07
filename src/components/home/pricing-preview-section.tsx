"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Check, ArrowRight, Sparkles, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useSubscription, PricingPlan } from "@/src/hooks/use-subscription";

interface PricingPreviewSectionProps {
  isAuthenticated?: boolean;
}

export function PricingPreviewSection({ isAuthenticated }: PricingPreviewSectionProps) {
  const router = useRouter();
  const [viewType, setViewType] = useState<"plans" | "packs">("plans");
  const [isAnnual, setIsAnnual] = useState(false);
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [packs, setPacks] = useState<any[]>([]);
  const [activePlan, setActivePlan] = useState<string | null>(null);

  const { getPlans, getPacks, upgradePlan, buyCreditPack, getCurrentSubscription, loading: subLoading } = useSubscription();
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [dbPlans, dbPacks, currentSub] = await Promise.all([
        getPlans(),
        getPacks(),
        isAuthenticated ? getCurrentSubscription() : null
      ]);
      if (dbPlans && dbPlans.length > 0) setPlans(dbPlans);
      if (dbPacks && dbPacks.length > 0) setPacks(dbPacks);
      if (currentSub && currentSub.status === "active") setActivePlan(currentSub.plan);
    };
    fetchData();
  }, [getPlans, getPacks, getCurrentSubscription, isAuthenticated]);

  const handleAction = async (planItem: { id: string; name?: string }, isPack: boolean) => {
    const id = planItem.id;
    if (!isAuthenticated) {
      router.push("/register");
      return;
    }

    // If it's a plan and the user already has this active plan, go to the subscription page
    if (!isPack && activePlan === id) {
      router.push("/subscription");
      return;
    }

    try {
      setIsProcessing(id);
      if (isPack) {
        await buyCreditPack(id);
      } else {
        await upgradePlan(id, isAnnual ? "year" : "month");
      }
    } catch (err) {
      console.error(err);
      setIsProcessing(null);
    }
  };

  const noContent = viewType === "plans" ? plans.length === 0 : packs.length === 0;

  const displayPlans = plans.map(p => {
    const amount = isAnnual ? p.priceYearlyAmount : p.priceMonthlyAmount;
    const subtext = isAnnual && p.priceYearlyAmount
      ? `soit ${Math.round(Number(p.priceYearlyAmount) / 12)}€ / mois (facturé annuellement)`
      : !isAnnual && p.priceMonthlyAmount ? "facturé mensuellement" : "";

    return {
      id: p.id,
      name: p.name,
      description: p.description,
      price: `${Math.round(Number(amount))}€`,
      period: isAnnual ? "/an" : "/mois",
      subtext: subtext,
      features: p.features || [],
      highlighted: p.isFeatured,
      badge: p.isFeatured ? "Plus Populaire" : undefined
    };
  });

  const displayPacks = packs.map(p => ({
    id: p.id,
    name: p.name,
    description: p.description || `${p.credits} crédits pour vos créations.`,
    price: `${Math.round(Number(p.priceAmount))}€`,
    period: "une seule fois",
    subtext: `soit ${(Number(p.priceAmount) / p.credits).toFixed(2)}€ / crédit`,
    features: [
      `${p.credits} crédits inclus`,
      "Accès à toutes les fonctionnalités",
      "Sans engagement",
      "Crédits valables sans limite"
    ],
    highlighted: p.isFeatured,
    badge: p.isFeatured ? "Meilleur Rapport" : undefined
  }));

  return (
    <section className="relative py-24 bg-[#FAFAFA] overflow-hidden border-t border-zinc-100" id="pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-8">
          <h2 className="text-sm font-black uppercase tracking-[0.4em] text-amber-500 mb-4">
            Tarification
          </h2>
          <p className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-zinc-950 mb-6">
            Simple. Transparent. Sans surprise.
          </p>
        </div>

        {/* ── VIEW TYPE TOGGLE ── */}
        <div className="flex flex-col items-center gap-6 mb-12">
          <div className="flex p-1 bg-zinc-200/50 rounded-full border border-zinc-200">
            <button
              onClick={() => setViewType("plans")}
              className={cn(
                "px-8 py-2.5 text-sm font-black rounded-full transition-all duration-300",
                viewType === "plans" ? "text-zinc-900 shadow-sm bg-white" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Abonnements
            </button>
            <button
              onClick={() => setViewType("packs")}
              className={cn(
                "px-8 py-2.5 text-sm font-black rounded-full transition-all duration-300",
                viewType === "packs" ? "text-zinc-900 shadow-sm bg-white" : "text-zinc-500 hover:text-zinc-700"
              )}
            >
              Packs de Crédits
            </button>
          </div>

          {/* ── ANNUAL / MONTHLY TOGGLE (Only for Plans) ── */}
          {viewType === "plans" && (
            <div className="flex items-center gap-3">
              <span className={cn("text-xs font-bold transition-colors", !isAnnual ? "text-zinc-900" : "text-zinc-400")}>
                Mensuel
              </span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-12 h-6 bg-zinc-200 rounded-full transition-colors border border-zinc-300"
              >
                <div className={cn(
                  "absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm",
                  isAnnual ? "translate-x-6" : "translate-x-0"
                )} />
              </button>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-bold transition-colors", isAnnual ? "text-zinc-900" : "text-zinc-400")}>
                  Annuel
                </span>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full uppercase tracking-widest font-black whitespace-nowrap">
                  -20%
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto mb-20 transition-opacity duration-300">
          {noContent ? (
            <div className="col-span-full py-20 bg-white border border-zinc-200 rounded-[2.5rem] flex flex-col items-center text-center px-6 shadow-sm">
              <div className="h-16 w-16 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-500 mb-6">
                <Sparkles className="h-8 w-8" />
              </div>
              <h3 className="text-2xl font-black text-zinc-950 mb-4">Offres en cours de préparation</h3>
              <p className="text-zinc-500 max-w-md mb-8 font-medium">
                Nous finalisons nos nouvelles offres pour vous offrir la meilleure expérience possible. Revenez très bientôt !
              </p>
              <Link
                href="mailto:contact@sketchpilot.ai"
                className="inline-flex items-center gap-2 h-12 px-8 rounded-full bg-zinc-950 text-white font-bold hover:bg-zinc-800 transition-all active:scale-95"
              >
                Être informé du lancement
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          ) : (viewType === "plans" ? displayPlans : displayPacks).map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col p-8 md:p-10 rounded-[2.5rem] transition-all duration-500",
                plan.highlighted
                  ? "bg-white border-2 border-amber-400 shadow-[0_20px_80px_-20px_rgba(245,158,11,0.2)] scale-100 md:scale-105 z-10"
                  : "bg-white border border-zinc-200 hover:border-zinc-300 shadow-sm"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase bg-amber-500 text-white px-5 py-2 rounded-full shadow-lg shadow-amber-500/20">
                    <Sparkles className="h-3 w-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-heading font-bold text-zinc-950 mb-3">{plan.name}</h3>
                <p className="text-zinc-500 text-sm h-10">{plan.description}</p>

                <div className="flex items-baseline gap-1 mt-6">
                  <span className="text-5xl font-heading font-extrabold text-zinc-950">{plan.price}</span>
                  {plan.period && <span className="text-xl font-bold text-zinc-500">{plan.period}</span>}
                </div>
                {/* Sous-texte facturation */}
                <div className="h-4 mt-2">
                  {plan.subtext && (
                    <p className="text-xs font-semibold text-amber-600 bg-amber-50 px-2 py-0.5 rounded inline-block">
                      {plan.subtext}
                    </p>
                  )}
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full",
                      plan.highlighted ? "bg-amber-100 text-amber-600" : "bg-zinc-100 text-zinc-600"
                    )}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium text-zinc-800">{feature}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => handleAction({ id: plan.id, name: plan.name }, viewType === "packs")}
                disabled={isProcessing !== null}
                className={cn(
                  "w-full flex items-center justify-center gap-2 h-14 rounded-full font-bold transition-all active:scale-95 group",
                  plan.highlighted
                    ? "bg-amber-500 text-white hover:bg-amber-600 shadow-[0_4px_20px_rgba(245,158,11,0.2)] disabled:bg-amber-400"
                    : "bg-zinc-950 text-white hover:bg-zinc-800 disabled:bg-zinc-700"
                )}
              >
                {isProcessing === plan.id ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <>
                    {!isAuthenticated ? "Démarrer" : (viewType === "plans" && activePlan === plan.id ? "Plan Actuel (Gérer)" : "S'abonner")}
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
