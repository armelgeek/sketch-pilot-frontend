"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { useStripeSubscription } from "@/src/hooks/use-stripe-subscription";
import { useSubscriptionManager } from "@/src/hooks/use-subscription-manager";
import { Loader2, CheckCircle, AlertCircle, X } from "lucide-react";
import Link from "next/link";

// ─── Types ────────────────────────────────────────────────────────────────────

interface Pack {
  id: string;
  credits: number;
  price: number;
  savings?: string;
  featured?: boolean;
  desc: string;
}

const PACKS: Pack[] = [
  { id: "pack_100", credits: 100, price: 3, desc: "Pour débuter" },
  { id: "pack_300", credits: 300, price: 7, savings: "−22 %", featured: true, desc: "Meilleur ratio" },
  { id: "pack_600", credits: 600, price: 12, savings: "−33 %", desc: "Usage intensif" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Banner({
  type,
  title,
  body,
  onClose,
}: {
  type: "success" | "info" | "error";
  title: string;
  body?: string;
  onClose?: () => void;
}) {
  const styles = {
    success: "bg-emerald-50 border-emerald-200 text-emerald-800",
    info: "bg-blue-50 border-blue-200 text-blue-800",
    error: "bg-red-50 border-red-200 text-red-800",
  };
  const icons = {
    success: <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />,
    info: <Loader2 className="h-4 w-4 mt-0.5 shrink-0 animate-spin" />,
    error: <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />,
  };

  return (
    <div className={`flex items-start gap-3 border rounded-lg px-4 py-3 text-sm ${styles[type]}`}>
      {icons[type]}
      <div className="flex-1">
        <span className="font-medium">{title}</span>
        {body && <span className="ml-1 opacity-80">{body}</span>}
      </div>
      {onClose && (
        <button onClick={onClose} className="opacity-50 hover:opacity-100 transition-opacity">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-emerald-500 rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

function StatRow({ label, value, large }: { label: string; value: React.ReactNode; large?: boolean }) {
  return (
    <div className="flex justify-between items-center py-3 border-t border-zinc-100 text-sm">
      <span className="text-zinc-500">{label}</span>
      <span className={`font-medium text-zinc-900 ${large ? "text-lg" : ""}`}>{value}</span>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
  const {
    loading: stripeLoading,
    error: stripeError,
    cancel,
    restore,
    list,
    billingPortal,
    getActiveSubscription,
    clearError,
  } = useStripeSubscription();

  const searchParams = useSearchParams();
  const success = searchParams.get("success") === "true";

  const [isProcessingPack, setIsProcessingPack] = useState(false);
  const [showSuccessBanner, setShowSuccessBanner] = useState(false);
  const pollingCountRef = useRef(0);
  const initialCreditsRef = useRef<number | null>(null);

  const {
    subscriptionStatus,
    isLoading: managerLoading,
    buyCreditPack,
    refresh,
  } = useSubscriptionManager();

  const activeSubscription = getActiveSubscription();
  const loading = stripeLoading || managerLoading;

  // ── Credits ────────────────────────────────────────────────────────────────

  const totalPlanCredits = subscriptionStatus?.totalCredits ?? 0;
  const usedPlanCredits = subscriptionStatus?.usedCredits ?? 0;
  const extraCredits = subscriptionStatus?.extraCredits ?? 0;
  const totalAvailable = subscriptionStatus?.remainingCredits ?? 0;
  const usagePercentage = totalPlanCredits > 0 ? (usedPlanCredits / totalPlanCredits) * 100 : 0;

  // ── Polling after Stripe redirect ─────────────────────────────────────────

  useEffect(() => {
    list();
    refresh().then((status) => {
      if (status) initialCreditsRef.current = status.remainingCredits;
    });

    if (!success) return;

    setIsProcessingPack(true);
    const poll = async () => {
      if (pollingCountRef.current >= 5) { setIsProcessingPack(false); return; }
      pollingCountRef.current += 1;
      const newStatus = await refresh();
      if (newStatus && initialCreditsRef.current !== null && newStatus.remainingCredits > initialCreditsRef.current) {
        setIsProcessingPack(false);
        setShowSuccessBanner(true);
        return;
      }
      setTimeout(poll, 2000);
    };
    poll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleBuyPack = async (packId: string) => {
    try { await buyCreditPack(packId); }
    catch (err) { console.error("Purchase failed:", err); }
  };

  const handleCancel = async () => {
    if (!activeSubscription) return;
    if (!confirm("Annuler votre abonnement ? Vous garderez vos accès jusqu'à la fin de la période.")) return;
    try {
      await cancel({ subscriptionId: activeSubscription.id, returnUrl: window.location.href });
      await list();
      refresh();
    } catch (err) { console.error("Cancel failed:", err); }
  };

  const handleRestore = async () => {
    if (!activeSubscription?.id) return;
    try {
      await restore({ subscriptionId: activeSubscription.id });
      await list();
      refresh();
    } catch (err) { console.error("Restore failed:", err); }
  };

  const handleBillingPortal = async () => {
    try { await billingPortal({ returnUrl: window.location.href }); }
    catch (err) { console.error("Billing portal failed:", err); }
  };

  // ── Status helpers ─────────────────────────────────────────────────────────

  const statusLabel: Record<string, string> = {
    active: "Actif",
    trialing: "Essai gratuit",
    past_due: "Problème de paiement",
    canceled: "Annulé",
    incomplete: "En attente",
    unpaid: "Non payé",
  };

  const planLabel =
    activeSubscription?.plan === "plan_starter" ? "Starter" : (activeSubscription?.plan ?? "Forfait gratuit");

  const periodEnd = activeSubscription?.periodEnd
    ? new Date(activeSubscription.periodEnd).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="max-w-4xl mx-auto space-y-6 px-4 py-8">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Abonnement & Crédits</h1>
          <p className="text-sm text-zinc-500 mt-1">Gérez votre forfait, votre consommation et vos factures.</p>
        </div>
        <button
          onClick={() => { list(); refresh(); }}
          disabled={loading}
          className="text-sm text-zinc-500 hover:text-zinc-900 disabled:opacity-40 transition-colors flex items-center gap-1.5"
        >
          {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
          Actualiser
        </button>
      </div>

      {/* Banners */}
      {showSuccessBanner && (
        <Banner
          type="success"
          title="Achat confirmé !"
          body="Vos nouveaux crédits ont été ajoutés à votre compte."
          onClose={() => setShowSuccessBanner(false)}
        />
      )}
      {isProcessingPack && (
        <Banner type="info" title="Traitement en cours…" body="Finalisation de l'ajout de vos crédits." />
      )}
      {stripeError && (
        <Banner type="error" title={stripeError} onClose={clearError} />
      )}

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left column ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Plan card */}
          <div className="border border-zinc-200 rounded-xl bg-white p-6 space-y-5">

            {/* Plan name + status */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-lg font-semibold text-zinc-900">{planLabel}</p>
                {activeSubscription && (
                  <p className="text-sm text-zinc-500 mt-0.5">
                    Facturation {activeSubscription.billingInterval === "year" ? "annuelle" : "mensuelle"}
                  </p>
                )}
              </div>
              <span
                className={`text-xs font-medium px-2.5 py-1 rounded-full border ${activeSubscription?.status === "active"
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : "bg-zinc-50 text-zinc-500 border-zinc-200"
                  }`}
              >
                {activeSubscription ? (statusLabel[activeSubscription.status] ?? "Inconnu") : "Gratuit"}
              </span>
            </div>

            {/* Usage */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-500">Crédits utilisés ce mois</span>
                <span className="font-medium text-zinc-900">{usedPlanCredits} / {totalPlanCredits}</span>
              </div>
              <ProgressBar value={usagePercentage} />
            </div>

            {/* Stats */}
            <div>
              {periodEnd && (
                <StatRow
                  label={activeSubscription?.cancelAtPeriodEnd ? "Expire le" : "Renouvellement le"}
                  value={periodEnd}
                />
              )}
              {extraCredits > 0 && (
                <StatRow label="Crédits bonus (à vie)" value={`+${extraCredits}`} />
              )}
              <StatRow label="Total disponible" value={`${totalAvailable} crédits`} large />
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-1">
              <Link href="/pricing">
                <button className="px-4 py-2 text-sm font-medium rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white transition-colors">
                  Changer de forfait
                </button>
              </Link>

              {activeSubscription ? (
                activeSubscription.cancelAtPeriodEnd ? (
                  <button
                    onClick={handleRestore}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 hover:border-zinc-300 text-zinc-700 transition-colors disabled:opacity-40 flex items-center gap-2"
                  >
                    {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Réactiver l'abonnement
                  </button>
                ) : (
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium rounded-lg border border-zinc-200 hover:border-red-200 hover:text-red-600 text-zinc-500 transition-colors disabled:opacity-40 flex items-center gap-2"
                  >
                    {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Annuler l'abonnement
                  </button>
                )
              ) : null}

              <button
                onClick={handleBillingPortal}
                className="text-sm text-zinc-400 hover:text-zinc-700 underline underline-offset-2 transition-colors"
              >
                Portail de facturation ↗
              </button>
            </div>
          </div>

          {/* Credit packs */}
          <div>
            <div className="mb-4">
              <p className="text-base font-semibold text-zinc-900">Packs de crédits</p>
              <p className="text-sm text-zinc-500 mt-0.5">Valables à vie — pas d'expiration</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {PACKS.map((pack) => (
                <div
                  key={pack.id}
                  className={`border rounded-xl p-5 flex flex-col gap-3 transition-colors ${pack.featured
                      ? "border-emerald-300 bg-emerald-50/40"
                      : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                >
                  <div>
                    <p className="text-2xl font-semibold text-zinc-900">{pack.credits}</p>
                    <p className="text-xs text-zinc-500 mt-0.5">{pack.desc}</p>
                  </div>
                  <div className="flex items-baseline gap-2">
                    <p className="text-base font-medium text-zinc-900">{pack.price} €</p>
                    {pack.savings && (
                      <span className="text-xs font-medium text-emerald-600">{pack.savings}</span>
                    )}
                  </div>
                  <button
                    onClick={() => handleBuyPack(pack.id)}
                    disabled={loading}
                    className={`w-full py-2 text-sm font-medium rounded-lg transition-colors disabled:opacity-40 flex items-center justify-center gap-2 ${pack.featured
                        ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                        : "border border-zinc-200 hover:border-zinc-300 text-zinc-700"
                      }`}
                  >
                    {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Acheter"}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Sidebar ── */}
        <div className="space-y-4">

          {/* Credit rules */}
          <div className="border border-zinc-200 rounded-xl bg-white p-5 space-y-3">
            <p className="text-sm font-semibold text-zinc-900">Règles des crédits</p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              <span className="font-medium text-zinc-700">{totalPlanCredits} crédits</span> inclus par mois avec votre forfait.
            </p>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li className="flex gap-2"><span className="text-emerald-500 mt-0.5">•</span> Renouvellement automatique à chaque cycle.</li>
              <li className="flex gap-2"><span className="text-emerald-500 mt-0.5">•</span> Les crédits du forfait expirent en fin de cycle.</li>
              <li className="flex gap-2"><span className="text-emerald-500 mt-0.5">•</span> Les crédits achetés <span className="font-medium text-zinc-700 mx-0.5">n'expirent jamais</span>.</li>
            </ul>
            <Link href="/pricing">
              <button className="w-full mt-1 py-2 text-xs font-medium rounded-lg border border-zinc-200 hover:border-zinc-300 text-zinc-600 transition-colors">
                Politique tarifaire
              </button>
            </Link>
          </div>

          {/* Support */}
          <div className="border border-zinc-200 rounded-xl bg-white p-5 space-y-2">
            <p className="text-sm font-semibold text-zinc-900">Assistance</p>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Une question sur votre facturation ? Réponse sous 24 h.
            </p>
            <a
              href="mailto:support@sketchpilot.com"
              className="block text-sm font-medium text-zinc-900 hover:text-emerald-600 transition-colors mt-1"
            >
              support@sketchpilot.com →
            </a>
          </div>

        </div>
      </div>
    </div>
  );
}