"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Check, Sparkles, Zap, Coins, ArrowRight } from "lucide-react";
import { useSubscriptionManager } from "@/src/hooks/use-subscription-manager";
import { cn } from "@/src/lib/utils";

export default function OnboardingPage() {
  const router = useRouter();
  const [viewType, setViewType] = useState<"plans" | "packs">("plans");
  const [isAnnual, setIsAnnual] = useState(false);
  const {
    subscriptionStatus,
    isLoading,
    getPlans,
    getPacks,
    handleUpgrade,
    buyCreditPack,
    refresh
  } = useSubscriptionManager();

  const [plans, setPlans] = useState<any[]>([]);
  const [packs, setPacks] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const [p, k] = await Promise.all([getPlans(), getPacks()]);
      if (p) setPlans(p);
      if (k) setPacks(k);
    };
    fetchData();
  }, [getPlans, getPacks]);

  // Si l'utilisateur finit par avoir des crédits (ex: après un achat Stripe réussi qui redirige ici)
  useEffect(() => {
    const checkAccess = async () => {
      if (subscriptionStatus) {
        const hasCredits = subscriptionStatus.remainingCredits > 0;
        const hasActiveSub = subscriptionStatus.status === "active" || subscriptionStatus.status === "trialing";
        if (hasCredits || hasActiveSub) {
          router.push("/dashboard");
        }
      }
    };
    checkAccess();
  }, [subscriptionStatus, router]);

  if (isLoading && plans.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] flex flex-col py-12 px-6">
      <div className="max-w-5xl mx-auto w-full">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-100 text-amber-700 text-xs font-black uppercase tracking-widest mb-4">
            <Sparkles className="h-3 w-3" />
            Dernière étape
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-zinc-950 mb-4 tracking-tight">
            La puissance du Studio, <br className="hidden md:block" />
            <span className="text-amber-500">sans compromis.</span>
          </h1>
          <p className="text-zinc-500 max-w-xl mx-auto font-medium leading-relaxed">
            Accédez à notre moteur IA haute performance dès maintenant.
            Testez vos premières idées pour seulement 5€ sans aucun engagement.
          </p>
        </div>

        {/* Toggle */}
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

          {viewType === "plans" && (
            <div className="flex items-center gap-3">
              <span className={cn("text-xs font-black", !isAnnual ? "text-zinc-900" : "text-zinc-400")}>Mensuel</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className="relative w-11 h-6 bg-zinc-200 rounded-full border border-zinc-300"
              >
                <div className={cn(
                  "absolute top-0.5 left-0.5 w-4.5 h-4.5 bg-white rounded-full transition-transform shadow-sm",
                  isAnnual ? "translate-x-5" : "translate-x-0"
                )} />
              </button>
              <div className="flex items-center gap-2">
                <span className={cn("text-xs font-black", isAnnual ? "text-zinc-900" : "text-zinc-400")}>Annuel</span>
                <span className="text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-black">-20%</span>
              </div>
            </div>
          )}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {(viewType === "plans" ? plans : packs).map((item: any) => {
            const price = viewType === "plans"
              ? (isAnnual ? Math.round(Number(item.priceYearlyAmount)) : Math.round(Number(item.priceMonthlyAmount)))
              : Math.round(Number(item.priceAmount));
            const subtext = viewType === "plans"
              ? (isAnnual ? "par an" : "par mois")
              : "une seule fois";

            const isFeatured = item.isFeatured;
            const isDiscovery = viewType === "packs" && price <= 5;

            return (
              <div
                key={item.id}
                className={cn(
                  "relative p-8 rounded-[2rem] flex flex-col transition-all duration-300",
                  isFeatured || isDiscovery
                    ? "bg-white border-2 border-amber-400 shadow-xl shadow-amber-500/10 scale-105 z-10"
                    : "bg-white border border-zinc-200"
                )}
              >
                {isDiscovery && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap">
                    <span className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase bg-zinc-950 text-white px-5 py-2 rounded-full shadow-lg">
                      <Zap className="h-3 w-3 fill-amber-400 text-amber-400" />
                      Idéal pour tester
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <h3 className="text-xl font-black text-zinc-900 mb-2">{item.name}</h3>
                  <p className="text-sm text-zinc-400 font-medium h-10 line-clamp-2">
                    {isDiscovery ? "La meilleure façon de découvrir le Studio sans engagement." : item.description}
                  </p>
                </div>

                <div className="mb-8">
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black text-zinc-950">{price}€</span>
                    <span className="text-zinc-400 font-bold text-sm">/{subtext}</span>
                  </div>
                </div>

                <div className="flex-1 space-y-4 mb-8">
                  {(item.features || [
                    `${item.credits || item.monthlyLimit} crédits inclus`,
                    "Voix ultra-réalistes",
                    "Qualité Full HD",
                    "Support prioritaire"
                  ]).map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="h-5 w-5 rounded-full bg-amber-50 text-amber-500 flex items-center justify-center flex-shrink-0">
                        <Check className="h-3 w-3" />
                      </div>
                      <span className="text-xs font-bold text-zinc-700">{f}</span>
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => viewType === "plans" ? handleUpgrade(item.id, isAnnual ? "year" : "month") : buyCreditPack(item.id)}
                  className={cn(
                    "w-full h-12 rounded-2xl flex items-center justify-center gap-2 font-black transition-all active:scale-95",
                    isFeatured || isDiscovery ? "bg-amber-500 text-white shadow-lg shadow-amber-500/20" : "bg-zinc-950 text-white"
                  )}
                >
                  Choisir
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            );
          })}
        </div>

        <p className="text-center text-zinc-400 text-xs font-medium">
          Paiement sécurisé par Stripe. Vous pouvez annuler votre forfait à tout moment.
        </p>
      </div>
    </div>
  );
}
