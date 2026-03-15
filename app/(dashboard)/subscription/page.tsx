"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useStripeSubscription } from "@/src/hooks/use-stripe-subscription";
import { useSubscriptionManager } from "@/src/hooks/use-subscription-manager";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Progress } from "@/src/components/ui/progress";
import {
  AlertCircle,
  CheckCircle,
  Clock,
  AlertTriangle,
  Loader2,
  Zap,
  ArrowUpRight,
  ExternalLink,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Coins,
  X,
  CreditCard
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/src/lib/utils";

export default function SubscriptionPage() {
  const {
    loading: stripeLoading,
    error: stripeError,
    cancel,
    restore,
    list,
    billingPortal,
    getActiveSubscription,
    clearError
  } = useStripeSubscription();

  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";
  const packId = searchParams.get("packId");

  const [isProcessingPack, setIsProcessingPack] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const pollingCountRef = useRef(0);
  const initialCreditsRef = useRef<number | null>(null);

  const {
    subscriptionStatus,
    isLoading: managerLoading,
    handleCancel,
    buyCreditPack,
    refresh
  } = useSubscriptionManager();

  const handleBuyPack = async (packId: string) => {
    try {
      await buyCreditPack(packId);
    } catch (err) {
      console.error("Purchase failed:", err);
    }
  };

  const activeSubscription = getActiveSubscription();
  const loading = stripeLoading || managerLoading;

  useEffect(() => {
    list();
    refresh().then(status => {
      if (status) {
        initialCreditsRef.current = status.remainingCredits;
      }
    });

    // Success polling logic
    if (success) {
      setIsProcessingPack(true);

      const poll = async () => {
        if (pollingCountRef.current >= 5) { // Stop after 10 seconds (5 * 2s)
          setIsProcessingPack(false);
          return;
        }

        pollingCountRef.current += 1;
        const newStatus = await refresh();

        // If credits have increased, we are done
        if (newStatus && initialCreditsRef.current !== null && newStatus.remainingCredits > initialCreditsRef.current) {
          setIsProcessingPack(false);
          setShowSuccessBanner(true);
          return;
        }

        // Keep polling
        setTimeout(poll, 2000);
      };

      poll();
    }
  }, [success, list, refresh]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-emerald-500" />;
      case "trialing":
        return <Clock className="h-5 w-5 text-blue-500" />;
      case "past_due":
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case "canceled":
        return <AlertCircle className="h-5 w-5 text-rose-500" />;
      default:
        return <AlertCircle className="h-5 w-5 text-zinc-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Actif",
      trialing: "Essai gratuit",
      past_due: "Problème de paiement",
      canceled: "Annulé",
      incomplete: "En attente",
      unpaid: "Non payé"
    };
    return labels[status] || "Inconnu";
  };

  const handleCancelClick = async () => {
    if (!activeSubscription) return;
    if (!confirm("Voulez-vous vraiment annuler votre abonnement ? Vous garderez vos accès jusqu'à la fin de la période actuelle.")) {
      return;
    }

    try {
      await cancel({
        subscriptionId: activeSubscription.id,
        returnUrl: window.location.href,
      });
      await list();
      refresh();
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  const handleRestoreClick = async () => {
    if (!activeSubscription?.id) return;
    try {
      await restore({
        subscriptionId: activeSubscription.id,
      });
      await list();
      refresh();
    } catch (err) {
      console.error("Restore failed:", err);
    }
  };

  const handleBillingPortal = async () => {
    try {
      await billingPortal({
        returnUrl: window.location.href,
      });
    } catch (err) {
      console.error("Billing portal failed:", err);
    }
  };

  // Usage calculations
  const totalPlanCredits = subscriptionStatus?.totalCredits || 0;
  const usedPlanCredits = subscriptionStatus?.usedCredits || 0;
  const extraCredits = subscriptionStatus?.extraCredits || 0;
  const totalAvailable = subscriptionStatus?.remainingCredits || 0;

  const usagePercentage = totalPlanCredits > 0 ? (usedPlanCredits / totalPlanCredits) * 100 : 0;

  return (
    <div className="relative min-h-screen">
      <div className="mesh-gradient opacity-30 dark:opacity-20" />

      <div className="mx-auto max-w-7xl px-6 py-12 space-y-12 relative z-10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-4xl font-black tracking-tighter bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-500 dark:from-zinc-100 dark:via-zinc-200 dark:to-zinc-500 bg-clip-text text-transparent">
              Abonnement & Crédits
            </h1>
            <p className="text-zinc-500 font-medium">
              Gérez votre forfait, votre consommation et vos factures.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => { list(); refresh(); }}
              disabled={loading}
              className="rounded-2xl px-6 h-11 border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm font-bold shadow-sm"
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
              Actualiser
            </Button>
          </div>
        </div>

        {showSuccessBanner && (
          <Card className="border-emerald-200/50 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/20 backdrop-blur-sm animate-in zoom-in duration-300 rounded-[2rem] overflow-hidden">
            <CardContent className="pt-6 flex gap-4 items-start">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-xl">
                <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="flex-1">
                <p className="font-black text-emerald-900 dark:text-emerald-100">Achat confirmé !</p>
                <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80 font-medium">
                  Vos nouveaux crédits ont été ajoutés à votre compte. Bonne création !
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setShowSuccessBanner(false)} className="rounded-full">
                <X className="h-4 w-4" />
              </Button>
            </CardContent>
          </Card>
        )}

        {isProcessingPack && (
          <Card className="border-blue-200/50 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm rounded-[2rem] overflow-hidden">
            <CardContent className="pt-6 flex gap-4 items-start">
              <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-xl">
                <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-blue-900 dark:text-blue-100">Traitement de votre achat...</p>
                <p className="text-sm text-blue-700/80 dark:text-blue-300/80 font-medium">
                  Nous finalisons l'ajout de vos crédits. Cela ne prendra que quelques secondes.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {stripeError && (
          <Card className="border-rose-200/50 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20 backdrop-blur-sm rounded-[2rem] overflow-hidden">
            <CardContent className="pt-6 flex gap-4 items-start">
              <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-xl">
                <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
              </div>
              <div className="flex-1">
                <p className="font-bold text-rose-900 dark:text-rose-100">{stripeError}</p>
                <Button
                  onClick={clearError}
                  variant="link"
                  className="p-0 h-auto text-rose-700 dark:text-rose-300 text-sm mt-1 font-bold"
                >
                  Ignorer l'erreur
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content: Plan & Usage */}
          <div className="lg:col-span-2 space-y-10">
            {/* Current Plan & Status */}
            <Card className="overflow-hidden border-zinc-200/60 dark:border-zinc-800/60 shadow-2xl shadow-zinc-200/20 dark:shadow-none rounded-[2rem] bg-white/80 dark:bg-zinc-950/40 backdrop-blur-md">
              <div className="p-1 px-6 bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center justify-between border-b border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/80 dark:text-emerald-400/80">Account Protection</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                  </span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600/80 dark:text-emerald-400/80">Live</span>
                </div>
              </div>
              <CardHeader className="pb-6 pt-8 px-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                  <div className="flex items-center gap-5">
                    <div className="h-16 w-16 rounded-[1.5rem] bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-900/20 dark:to-emerald-950/20 flex items-center justify-center border border-emerald-200/50 dark:border-emerald-800/50 shadow-inner">
                      <Zap className="h-8 w-8 text-emerald-500 fill-emerald-500/20" />
                    </div>
                    <div>
                      <CardTitle className="text-3xl font-black capitalize tracking-tight text-zinc-900 dark:text-zinc-50">
                        {activeSubscription ? (activeSubscription.plan === 'plan_starter' ? 'Starter' : activeSubscription.plan) : "Forfait Gratuit"}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        {activeSubscription && getStatusIcon(activeSubscription.status)}
                        <span className="text-sm font-bold text-zinc-500 uppercase tracking-widest text-[10px]">
                          {activeSubscription ? getStatusLabel(activeSubscription.status) : "Utilisateur Standard"}
                        </span>
                      </div>
                    </div>
                  </div>
                  {activeSubscription && (
                    <div className="flex flex-col items-end sm:text-right">
                      <p className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
                        {activeSubscription.billingInterval === 'year' ? 'Annuel' : 'Mensuel'}
                      </p>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Facturation</p>
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="space-y-8 px-8 pb-8">
                {/* Usage Section */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center">
                        <Coins className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <h3 className="font-black text-xs uppercase tracking-widest text-zinc-500">Consommation</h3>
                    </div>
                    <span className="text-sm">
                      <span className="font-black text-2xl tracking-tighter text-emerald-500">{usedPlanCredits}</span>
                      <span className="text-zinc-300 dark:text-zinc-700 mx-2 text-xl font-light">/</span>
                      <span className="text-xl font-bold text-zinc-500 tracking-tight">{totalPlanCredits}</span>
                      <span className="ml-1 text-[10px] font-black uppercase tracking-widest text-zinc-400">Crédits</span>
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="h-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-full overflow-hidden border border-zinc-200/30 dark:border-zinc-700/30 p-1">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 via-emerald-400 to-emerald-600 rounded-full transition-all duration-1000 shadow-[0_0_12px_rgba(16,185,129,0.3)]"
                        style={{ width: `${Math.min(100, usagePercentage)}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] font-black uppercase tracking-widest text-zinc-500">
                      <span>Utilisation</span>
                      <span>{Math.round(usagePercentage)}% du quota mensuel</span>
                    </div>
                  </div>

                  {extraCredits > 0 && (
                    <div className="p-4 rounded-[1.5rem] bg-zinc-50/50 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2.5 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-2xl shadow-sm">
                          <Sparkles className="h-4 w-4 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400">Bonus à Vie</p>
                          <p className="text-[11px] text-zinc-500 font-medium">Crédits utilisables sans limite de temps</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-black text-emerald-500">+{extraCredits}</p>
                      </div>
                    </div>
                  )}

                  <div className="pt-4 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-800/50 pt-6">
                    <span className="text-zinc-400 font-black uppercase tracking-widest text-[10px]">Total Disponible</span>
                    <div className="flex items-center gap-2">
                      <div className="h-8 w-8 rounded-full bg-emerald-500 text-white flex items-center justify-center shadow-lg shadow-emerald-500/20">
                        <Zap className="h-4 w-4 fill-current" />
                      </div>
                      <span className="font-black text-3xl tracking-tighter text-zinc-900 dark:text-zinc-50">{totalAvailable}</span>
                      <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">Crédits</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-6 rounded-[1.5rem] bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60 group hover:border-emerald-500/30 transition-colors">
                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Cycle Actuel</p>
                    <div className="flex items-center gap-3">
                      <Clock className="h-5 w-5 text-emerald-500" />
                      <div className="space-y-0.5">
                        <p className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                          {activeSubscription?.cancelAtPeriodEnd ? "Expire le :" : "Renouvellement le :"}
                        </p>
                        <p className="text-lg font-black tracking-tight text-emerald-500">
                          {activeSubscription?.periodEnd
                            ? new Date(activeSubscription.periodEnd).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 rounded-[1.5rem] bg-zinc-50/50 dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60 flex flex-col justify-between group hover:border-zinc-900 dark:hover:border-zinc-50 transition-colors">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">Paiement & Sécurité</p>
                      <div className="flex items-center gap-3">
                        <CreditCard className="h-5 w-5 text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-50 transition-colors" />
                        <p className="text-xs font-bold text-zinc-500 leading-tight">Gérez vos factures et cartes bancaires via notre portail sécurisé.</p>
                      </div>
                    </div>
                    <Button
                      variant="link"
                      size="sm"
                      onClick={handleBillingPortal}
                      className="p-0 h-auto text-[11px] font-black text-zinc-900 dark:text-zinc-50 uppercase tracking-widest mt-4 flex items-center gap-1 justify-start w-fit hover:no-underline hover:opacity-70"
                    >
                      Portail Client <ExternalLink className="h-3 w-3" />
                    </Button>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4 pt-4">
                  {activeSubscription ? (
                    <>
                      <Link href="/pricing" className="flex-1 min-w-[150px]">
                        <Button variant="default" className="w-full h-14 transition-all hover:scale-[1.02] active:scale-95 shadow-xl shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-md rounded-2xl">
                          Changer de forfait
                          <ArrowUpRight className="ml-2 h-5 w-5" />
                        </Button>
                      </Link>

                      {!activeSubscription.cancelAtPeriodEnd ? (
                        <Button
                          variant="ghost"
                          onClick={handleCancelClick}
                          disabled={loading}
                          className="flex-1 min-w-[150px] h-14 font-black uppercase tracking-widest text-[10px] text-zinc-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-2xl"
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Annuler l'abonnement"}
                        </Button>
                      ) : (
                        <Button
                          variant="secondary"
                          onClick={handleRestoreClick}
                          disabled={loading}
                          className="flex-1 min-w-[150px] h-14 font-black bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 rounded-2xl"
                        >
                          {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Réactiver l'abonnement"}
                        </Button>
                      )}
                    </>
                  ) : (
                    <Link href="/pricing" className="w-full">
                      <Button className="w-full h-16 bg-emerald-600 hover:bg-emerald-500 font-black text-xl rounded-2xl shadow-2xl shadow-emerald-500/20 active:scale-95 transition-all">
                        Découvrir nos offres premium
                        <Sparkles className="ml-3 h-6 w-6 fill-current" />
                      </Button>
                    </Link>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Credit Packs Section */}
            <div className="space-y-8 pb-10">
              <div className="flex items-center justify-between px-2">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-2xl bg-zinc-900 dark:bg-zinc-50 flex items-center justify-center text-white dark:text-zinc-900 shadow-xl">
                    <ShoppingCart className="h-6 w-6" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-black tracking-tight leading-none text-zinc-900 dark:text-zinc-50">Achat de packs</h2>
                    <p className="text-xs text-zinc-500 font-medium mt-1.5 uppercase tracking-widest text-[10px]">Crédits valables à vie • Pas d'expiration</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                  { id: 'pack_100', credits: 100, price: 3, label: 'Essentiel', desc: 'Pour débuter' },
                  { id: 'pack_300', credits: 300, price: 7, label: 'Populaire', featured: true, savings: '22%', desc: 'Meilleur ratio' },
                  { id: 'pack_600', credits: 600, price: 12, label: 'Expert', savings: '33%', desc: 'Usage intensif' },
                ].map((pack) => (
                  <Card
                    key={pack.id}
                    className={cn(
                      "relative overflow-hidden transition-all duration-500 hover:shadow-2xl hover:-translate-y-2 group rounded-[2.5rem]",
                      pack.featured
                        ? "border-emerald-500/50 dark:border-emerald-500/30 shadow-2xl shadow-emerald-500/10 ring-2 ring-emerald-500/20 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm"
                        : "border-zinc-200/60 dark:border-zinc-800/60 bg-white/30 dark:bg-zinc-900/30 shadow-xl shadow-zinc-200/20 dark:shadow-none"
                    )}
                  >
                    {pack.featured && (
                      <div className="absolute top-0 right-0">
                        <div className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-bl-2xl shadow-lg">
                          Populaire
                        </div>
                      </div>
                    )}

                    <CardHeader className="pb-4 pt-8 px-6 text-center">
                      <div className="flex flex-col gap-1 items-center">
                        <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-emerald-500 transition-colors">
                          {pack.label}
                        </span>
                        <div className="flex items-baseline gap-1 mt-2">
                          <span className="text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">{pack.credits}</span>
                          <span className="text-xs font-bold text-zinc-500 flex items-center gap-0.5">
                            <Coins className="h-3.5 w-3.5" />
                          </span>
                        </div>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{pack.desc}</p>
                      </div>
                    </CardHeader>

                    <CardContent className="space-y-8 pt-2 px-6 pb-8 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-baseline gap-1">
                          <span className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">{pack.price}€</span>
                          <span className="text-[10px] text-zinc-400 font-black uppercase tracking-widest">TTC</span>
                        </div>
                        {pack.savings && (
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full w-fit">
                            -{pack.savings}
                          </span>
                        )}
                      </div>

                      <Button
                        onClick={() => handleBuyPack(pack.id)}
                        disabled={loading}
                        className={cn(
                          "w-full h-14 font-black text-md rounded-2xl transition-all active:scale-95 group-hover:shadow-xl shadow-inner",
                          pack.featured
                            ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/20"
                            : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900"
                        )}
                      >
                        {loading ? (
                          <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                          <span className="flex items-center gap-2">
                            Acheter maintenant
                            <ArrowUpRight className="h-4 w-4" />
                          </span>
                        )}
                      </Button>
                    </CardContent>

                    {/* Decorative background accent */}
                    <div className="absolute -bottom-10 -right-10 h-32 w-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all duration-700" />
                  </Card>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Info */}
          <div className="space-y-10">
            <Card className="border-emerald-200/50 dark:border-emerald-900/20 bg-emerald-50/50 dark:bg-emerald-950/20 backdrop-blur-md rounded-[2rem] overflow-hidden shadow-xl shadow-emerald-500/5">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2 text-zinc-900 dark:text-zinc-50">
                  <Zap className="h-4 w-4 text-emerald-500 fill-emerald-500/20" />
                  Règles de Credits
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="pb-4 border-b border-emerald-200/30 dark:border-emerald-800/20">
                  <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-1.5">Inclus mensuellement</p>
                  <p className="text-3xl font-black tracking-tighter text-emerald-600 dark:text-emerald-400">{totalPlanCredits} <span className="text-xs uppercase tracking-widest">Crédits</span></p>
                </div>
                <div className="space-y-4">
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug font-medium">Renouvellement automatique à chaque cycle de facturation.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug font-medium">Les crédits du forfait non utilisés expirent à la fin du cycle.</p>
                  </div>
                  <div className="flex items-start gap-3">
                    <div className="h-5 w-5 rounded-full bg-emerald-500/10 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle className="h-3 w-3 text-emerald-500" />
                    </div>
                    <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-snug font-medium">Les <span className="text-emerald-500 font-bold">Packs de Crédits</span> n'expirent jamais.</p>
                  </div>
                </div>
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full font-black uppercase tracking-widest text-[10px] bg-white dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 h-10 rounded-2xl shadow-sm"
                  asChild
                >
                  <Link href="/pricing">Politique tarifaire</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="border-zinc-200/60 dark:border-zinc-800/60 rounded-[2rem] bg-white/50 dark:bg-zinc-950/20 backdrop-blur-md">
              <CardHeader className="pb-2">
                <CardTitle className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Assistance Premium</CardTitle>
              </CardHeader>
              <CardContent className="pt-2">
                <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-5">
                  Une question sur votre facturation ? Notre équipe vous répond en moins de 24h.
                </p>
                <div className="p-4 rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900">
                  <a href="mailto:support@sketchpilot.com" className="text-sm font-black tracking-tight flex items-center justify-between">
                    Contact Support
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                </div>
              </CardContent>
            </Card>

            <div className="px-6 flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 transition-all duration-700 cursor-default">
              <ShieldCheck className="h-10 w-10 text-zinc-400" />
              <div className="space-y-0.5">
                <p className="text-[10px] font-black uppercase tracking-widest">Secured by Stripe</p>
                <p className="text-[10px] font-medium leading-tight">Paiements chiffrés AES-256</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
