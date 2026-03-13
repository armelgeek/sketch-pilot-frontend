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
  X
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight mb-2 bg-gradient-to-r from-zinc-900 to-zinc-600 dark:from-zinc-100 dark:to-zinc-400 bg-clip-text text-transparent">
            Abonnement
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400">
            Gérez votre forfait, votre consommation et vos factures.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => { list(); refresh(); }}
            disabled={loading}
            className="rounded-full px-4 h-9 border-zinc-200 dark:border-zinc-800"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualiser"}
          </Button>
        </div>
      </div>

      {showSuccessBanner && (
        <Card className="border-emerald-200/50 dark:border-emerald-900/30 bg-emerald-50/50 dark:bg-emerald-950/20 backdrop-blur-sm animate-in zoom-in duration-300">
          <CardContent className="pt-6 flex gap-4 items-start">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-lg">
              <CheckCircle className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="flex-1">
              <p className="font-black text-emerald-900 dark:text-emerald-100">Achat confirmé !</p>
              <p className="text-sm text-emerald-700/80 dark:text-emerald-300/80">
                Vos nouveaux crédits ont été ajoutés à votre compte. Bonne création !
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setShowSuccessBanner(false)}>
              <X className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      )}

      {isProcessingPack && (
        <Card className="border-blue-200/50 dark:border-blue-900/30 bg-blue-50/50 dark:bg-blue-950/20 backdrop-blur-sm">
          <CardContent className="pt-6 flex gap-4 items-start">
            <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
              <Loader2 className="h-5 w-5 text-blue-600 dark:text-blue-400 animate-spin" />
            </div>
            <div className="flex-1">
              <p className="font-bold text-blue-900 dark:text-blue-100">Traitement de votre achat...</p>
              <p className="text-sm text-blue-700/80 dark:text-blue-300/80">
                Nous finalisons l'ajout de vos crédits. Cela ne prendra que quelques secondes.
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {stripeError && (
        <Card className="border-rose-200/50 dark:border-rose-900/30 bg-rose-50/50 dark:bg-rose-950/20 backdrop-blur-sm">
          <CardContent className="pt-6 flex gap-4 items-start">
            <div className="p-2 bg-rose-100 dark:bg-rose-900/50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-rose-600 dark:text-rose-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-rose-900 dark:text-rose-100">{stripeError}</p>
              <Button
                onClick={clearError}
                variant="link"
                className="p-0 h-auto text-rose-700 dark:text-rose-300 text-sm mt-1"
              >
                Ignorer l'erreur
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content: Plan & Usage */}
        <div className="lg:col-span-2 space-y-8">
          {/* Current Plan & Status */}
          <Card className="overflow-hidden border-zinc-200/60 dark:border-zinc-800/60 shadow-lg shadow-zinc-200/20 dark:shadow-none">
            <div className="p-1 px-6 bg-emerald-500/10 dark:bg-emerald-500/5 flex items-center gap-2 border-b border-zinc-200/60 dark:border-zinc-800/60">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600/80 dark:text-emerald-400/80">Protection de compte</span>
            </div>
            <CardHeader className="pb-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center border border-zinc-200 dark:border-zinc-700">
                    <Zap className="h-7 w-7 text-emerald-500 fill-emerald-500/20" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-black capitalize tracking-tight">
                      {activeSubscription ? (activeSubscription.plan === 'plan_starter' ? 'Starter' : activeSubscription.plan) : "Forfait Gratuit"}
                    </CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      {activeSubscription && getStatusIcon(activeSubscription.status)}
                      <span className="text-sm font-medium text-zinc-500">
                        {activeSubscription ? getStatusLabel(activeSubscription.status) : "Utilisateur Standard"}
                      </span>
                    </div>
                  </div>
                </div>
                {activeSubscription && (
                  <div className="flex flex-col items-end">
                    <p className="text-2xl font-bold">
                      {activeSubscription.billingInterval === 'year' ? 'Annuel' : 'Mensuel'}
                    </p>
                    <p className="text-xs text-zinc-500">Cycle de facturation</p>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="h-px bg-zinc-200/60 dark:bg-zinc-800/60 w-full" />

              {/* Usage Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Zap className="h-4 w-4 text-emerald-500" />
                    <h3 className="font-bold text-sm uppercase tracking-tight">Consommation du forfait</h3>
                  </div>
                  <span className="text-sm font-medium">
                    <span className="font-bold text-emerald-500">{usedPlanCredits}</span>
                    <span className="text-zinc-400 dark:text-zinc-600 mx-1">/</span>
                    <span className="text-zinc-500">{totalPlanCredits}</span>
                  </span>
                </div>

                <div className="space-y-2">
                  <Progress value={usagePercentage} className="h-3 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden border border-zinc-200/50 dark:border-zinc-700/50">
                    {/* The Progress component internally handles the fill color via CSS, but we can customize it if needed */}
                  </Progress>
                  <div className="flex justify-between text-[11px] text-zinc-500 font-medium">
                    <span>Crédits consommés ce mois</span>
                    <span>{Math.round(usagePercentage)}% du quota</span>
                  </div>
                </div>

                {extraCredits > 0 && (
                  <div className="mt-4 p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-dashed border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-md">
                        <Zap className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-emerald-700 dark:text-emerald-400">🎁 Cadeau de bienvenue</p>
                        <p className="text-[10px] text-zinc-500">Crédits bonus utilisables sans limite de temps</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-emerald-600 dark:text-emerald-400">+{extraCredits}</p>
                    </div>
                  </div>
                )}

                <div className="pt-2 flex items-center justify-between border-t border-zinc-100 dark:border-zinc-900 text-sm">
                  <span className="text-zinc-500 font-medium text-xs">Total disponible (Forfait + Bonus)</span>
                  <span className="font-black text-lg">{totalAvailable} crédits</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-2">Prochaine étape</p>
                  <p className="text-sm font-semibold">
                    {activeSubscription?.cancelAtPeriodEnd ? "Inactif le :" : "Renouvellement le :"}
                  </p>
                  <p className="text-xl font-bold mt-1 text-emerald-500">
                    {activeSubscription?.periodEnd
                      ? new Date(activeSubscription.periodEnd).toLocaleDateString("fr-FR", { day: 'numeric', month: 'long', year: 'numeric' })
                      : "N/A"}
                  </p>
                </div>
                <div className="p-4 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/50 flex flex-col justify-between">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1">Facturation & Paiement</p>
                    <p className="text-xs text-zinc-500 leading-tight">Gérez vos factures et moyens de paiement sur Stripe.</p>
                  </div>
                  <Button
                    variant="link"
                    size="sm"
                    onClick={handleBillingPortal}
                    className="p-0 h-auto text-[11px] font-bold text-emerald-600 hover:text-emerald-500 mt-2 flex items-center gap-1 justify-start w-fit"
                  >
                    Accéder au portail Stripe <ExternalLink className="h-2.5 w-2.5" />
                  </Button>
                </div>
              </div>

              <div className="flex flex-wrap gap-3 pt-6">
                {activeSubscription ? (
                  <>
                    <Link href="/pricing" className="flex-1 min-w-[140px]">
                      <Button variant="default" className="w-full h-11 transition-all hover:scale-[1.02] active:scale-95 shadow-lg shadow-emerald-500/20 bg-emerald-600 hover:bg-emerald-500 text-white font-bold">
                        Changer de plan
                        <ArrowUpRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>

                    {!activeSubscription.cancelAtPeriodEnd ? (
                      <Button
                        variant="ghost"
                        onClick={handleCancelClick}
                        disabled={loading}
                        className="flex-1 min-w-[140px] h-11 font-bold text-zinc-500 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Annuler l'abonnement"}
                      </Button>
                    ) : (
                      <Button
                        variant="secondary"
                        onClick={handleRestoreClick}
                        disabled={loading}
                        className="flex-1 min-w-[140px] h-11 font-bold bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400"
                      >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Réactiver l'abonnement"}
                      </Button>
                    )}
                  </>
                ) : (
                  <Link href="/pricing" className="w-full">
                    <Button className="w-full h-12 bg-emerald-600 hover:bg-emerald-500 font-bold text-lg">
                      Découvrir nos offres
                      <Zap className="ml-2 h-5 w-5 fill-current" />
                    </Button>
                  </Link>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Credit Packs Section */}
          <div className="space-y-6">
            <div className="flex items-center justify-between px-2">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/30 rounded-xl">
                  <ShoppingCart className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-black tracking-tight leading-none">Achat de packs</h2>
                  <p className="text-xs text-zinc-500 font-medium mt-1">Crédits valables à vie, sans expiration</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { id: 'pack_100', credits: 100, price: 3, label: 'Essentiel' },
                { id: 'pack_300', credits: 300, price: 7, label: 'Populaire', featured: true, savings: '22%' },
                { id: 'pack_600', credits: 600, price: 12, label: 'Expert', savings: '33%' },
              ].map((pack) => (
                <Card
                  key={pack.id}
                  className={cn(
                    "relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 group",
                    pack.featured
                      ? "border-emerald-500/50 dark:border-emerald-500/30 shadow-emerald-500/5 ring-1 ring-emerald-500/20"
                      : "border-zinc-200/60 dark:border-zinc-800/60"
                  )}
                >
                  {pack.featured && (
                    <div className="absolute top-0 right-0">
                      <div className="bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-bl-xl shadow-lg">
                        Populaire
                      </div>
                    </div>
                  )}

                  <CardHeader className="pb-2">
                    <div className="flex flex-col gap-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 group-hover:text-emerald-500 transition-colors">
                        Pack {pack.label}
                      </span>
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-black tracking-tighter">{pack.credits}</span>
                        <span className="text-xs font-bold text-zinc-500 flex items-center gap-0.5">
                          <Coins className="h-3 w-3" />
                          Crédits
                        </span>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-6 pt-2">
                    <div className="flex flex-col gap-0.5">
                      <div className="flex items-baseline gap-1">
                        <span className="text-2xl font-black text-zinc-900 dark:text-zinc-50">{pack.price}€</span>
                        <span className="text-[10px] text-zinc-500 font-medium lowercase">paiement unique</span>
                      </div>
                      {pack.savings && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded-full w-fit">
                          Économisez {pack.savings}
                        </span>
                      )}
                    </div>

                    <Button
                      onClick={() => handleBuyPack(pack.id)}
                      disabled={loading}
                      className={cn(
                        "w-full h-11 font-black transition-all group-hover:scale-[1.02] active:scale-95",
                        pack.featured
                          ? "bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                          : "bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-50 dark:hover:bg-zinc-200 dark:text-zinc-900 shadow-lg shadow-zinc-500/10 dark:shadow-none"
                      )}
                    >
                      {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <span className="flex items-center gap-2">
                          Acheter
                          <Sparkles className="h-3.5 w-3.5 fill-current" />
                        </span>
                      )}
                    </Button>
                  </CardContent>

                  {/* Decorative background accent */}
                  <div className="absolute -bottom-6 -right-6 h-20 w-20 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all duration-500" />
                </Card>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card className="border-emerald-200/50 dark:border-emerald-900/20 bg-emerald-50/30 dark:bg-emerald-950/10">
            <CardHeader>
              <CardTitle className="text-lg font-bold flex items-center gap-2">
                <Zap className="h-4 w-4 text-emerald-500" />
                Crédits & Forfait
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="pb-4 border-b border-emerald-200/30 dark:border-emerald-800/20">
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Total inclus par mois</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{totalPlanCredits} crédits</p>
              </div>
              <div className="space-y-3">
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-zinc-500 leading-tight font-medium">Renouvellement automatique à chaque cycle.</p>
                </div>
                <div className="flex items-start gap-2">
                  <CheckCircle className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <p className="text-[11px] text-zinc-500 leading-tight font-medium">Les crédits non utilisés ne sont pas reportés.</p>
                </div>
              </div>
              <Button
                variant="secondary"
                size="sm"
                className="w-full font-bold bg-white/50 dark:bg-white/5 hover:bg-white border border-emerald-200/50 dark:border-emerald-800/50 text-emerald-700 dark:text-emerald-400 h-9"
                asChild
              >
                <Link href="/pricing">Voir tous les détails</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-zinc-200/60 dark:border-zinc-800/60">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-zinc-500">Support Client</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-zinc-500 font-medium leading-relaxed mb-3">
                Besoin d'aide avec votre abonnement ou une facture spécifique ?
              </p>
              <a href="mailto:support@sketchpilot.com" className="text-sm font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                support@sketchpilot.com
              </a>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
