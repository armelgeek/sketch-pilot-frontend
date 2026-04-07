"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import { useStripeSubscription } from "@/src/hooks/use-stripe-subscription";
import { useSubscriptionManager } from "@/src/hooks/use-subscription-manager";
import {
  Loader2, CheckCircle, AlertCircle, X,
  ArrowUpRight, ArrowDownRight, RefreshCcw,
} from "lucide-react";
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

const FALLBACK_PACKS: Pack[] = [
  { id: "pack_50", credits: 50, price: 4.99, desc: "Idéal pour dépanner" },
  { id: "pack_150", credits: 150, price: 9.99, savings: "−33 %", featured: true, desc: "Le plus populaire" },
  { id: "pack_500", credits: 500, price: 24.99, savings: "−50 %", desc: "Pour les gros volumes" },
];

// ─── Sub-components ───────────────────────────────────────────────────────────

function Banner({
  type, title, body, onClose,
}: {
  type: "success" | "info" | "error";
  title: string;
  body?: string;
  onClose?: () => void;
}) {
  const styles = {
    success: "bg-amber-50 border-amber-200 text-amber-800",
    info: "bg-zinc-50  border-zinc-200  text-zinc-700",
    error: "bg-red-50   border-red-200   text-red-800",
  };
  const Icon = {
    success: CheckCircle,
    info: Loader2,
    error: AlertCircle,
  }[type];

  return (
    <div className={`flex items-start gap-3 border rounded-xl px-4 py-3 text-sm ${styles[type]}`}>
      <Icon className={`h-4 w-4 mt-0.5 shrink-0 ${type === "info" ? "animate-spin" : ""}`} />
      <div className="flex-1">
        <span className="font-semibold">{title}</span>
        {body && <span className="ml-1 opacity-70">{body}</span>}
      </div>
      {onClose && (
        <button onClick={onClose} className="opacity-40 hover:opacity-80 transition-opacity">
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
      <div
        className="h-full bg-amber-500 rounded-full transition-all duration-700"
        style={{ width: `${Math.min(100, value)}%` }}
      />
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

export default function SubscriptionPage() {
  const {
    loading: stripeLoading,
    error: stripeError,
    cancel, restore, list, billingPortal,
    getActiveSubscription, clearError,
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
    getCreditHistory,
    getPacks,
    refresh,
  } = useSubscriptionManager();

  const [packs, setPacks] = useState<Pack[]>([]);
  const [loadingPacks, setLoadingPacks] = useState(false);

  const [history, setHistory] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyMeta, setHistoryMeta] = useState({ total: 0, pages: 1 });
  const HISTORY_LIMIT = 10;

  const fetchHistory = useCallback(async (page: number) => {
    setLoadingHistory(true);
    const data = await getCreditHistory(page, HISTORY_LIMIT);
    setHistory(data.transactions || []);
    setHistoryMeta({ total: data.total, pages: data.pages });
    setHistoryPage(page);
    setLoadingHistory(false);
  }, [getCreditHistory]);

  useEffect(() => { fetchHistory(1); }, [fetchHistory]);

  const fetchPacks = useCallback(async () => {
    if (!getPacks) return;
    setLoadingPacks(true);
    const dbPacks = await getPacks();
    if (dbPacks && dbPacks.length > 0) {
      setPacks(dbPacks.map((p: any) => ({
        id: p.id,
        credits: p.credits,
        price: Number(p.priceAmount),
        desc: p.description || "",
        featured: p.isFeatured,
        savings: p.credits >= 500 ? "−50 %" : p.credits >= 150 ? "−33 %" : undefined
      })));
    } else {
      setPacks(FALLBACK_PACKS);
    }
    setLoadingPacks(false);
  }, [getPacks]);

  useEffect(() => { fetchPacks(); }, [fetchPacks]);

  const activeSubscription = getActiveSubscription();
  const loading = stripeLoading || managerLoading;

  const totalPlanCredits = subscriptionStatus?.totalCredits ?? 0;
  const usedPlanCredits = subscriptionStatus?.usedCredits ?? 0;
  const extraCredits = subscriptionStatus?.extraCredits ?? 0;
  const totalAvailable = subscriptionStatus?.remainingCredits ?? 0;
  const usagePercentage = totalPlanCredits > 0 ? (usedPlanCredits / totalPlanCredits) * 100 : 0;

  useEffect(() => {
    list();
    refresh().then((s: any) => { if (s) initialCreditsRef.current = s.remainingCredits; });
    if (!success) return;
    setIsProcessingPack(true);
    const poll = async () => {
      if (pollingCountRef.current >= 5) { setIsProcessingPack(false); return; }
      pollingCountRef.current += 1;
      const s = await refresh();
      if (s && initialCreditsRef.current !== null && s.remainingCredits > initialCreditsRef.current) {
        setIsProcessingPack(false);
        setShowSuccessBanner(true);
        return;
      }
      setTimeout(poll, 2000);
    };
    poll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [success]);

  const handleBuyPack = async (id: string) => { try { await buyCreditPack(id); } catch { } };
  const handleBillingPortal = async () => { try { await billingPortal({ returnUrl: window.location.href }); } catch { } };
  const handleCancel = async () => {
    if (!activeSubscription) return;
    if (!confirm("Annuler votre abonnement ? Vous garderez vos accès jusqu'à la fin de la période.")) return;
    try { await cancel({ subscriptionId: activeSubscription.id, returnUrl: window.location.href }); await list(); refresh(); } catch { }
  };
  const handleRestore = async () => {
    if (!activeSubscription?.id) return;
    try { await restore({ subscriptionId: activeSubscription.id }); await list(); refresh(); } catch { }
  };

  const statusLabel: Record<string, string> = {
    active: "Actif", trialing: "Essai gratuit", past_due: "Paiement en retard",
    canceled: "Annulé", incomplete: "En attente", unpaid: "Non payé",
  };

  const planLabel = activeSubscription?.plan === "plan_starter"
    ? "Starter"
    : (activeSubscription?.plan ?? "Forfait gratuit");

  const periodEnd = activeSubscription?.periodEnd
    ? new Date(activeSubscription.periodEnd).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
    : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Abonnement & Crédits</h1>
          <p className="text-sm text-zinc-500 mt-0.5">Forfait, consommation et factures.</p>
        </div>
        <button
          onClick={() => { list(); refresh(); }}
          disabled={loading}
          className="text-sm text-zinc-400 hover:text-zinc-700 disabled:opacity-40 transition-colors flex items-center gap-1.5"
        >
          {loading
            ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
            : <RefreshCcw className="h-3.5 w-3.5" />}
          Actualiser
        </button>
      </div>

      {/* Banners */}
      {showSuccessBanner && (
        <Banner type="success" title="Achat confirmé !" body="Vos crédits ont été ajoutés." onClose={() => setShowSuccessBanner(false)} />
      )}
      {isProcessingPack && (
        <Banner type="info" title="Traitement en cours…" body="Finalisation de l'ajout de vos crédits." />
      )}
      {stripeError && <Banner type="error" title={stripeError} onClose={clearError} />}

      {/* Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* ── Left ── */}
        <div className="lg:col-span-2 space-y-6">

          {/* Plan card */}
          <div className="border border-zinc-200 rounded-2xl bg-white p-6 space-y-5">

            <div className="flex items-start justify-between">
              <div>
                <p className="text-base font-semibold text-zinc-900">{planLabel}</p>
                {activeSubscription && (
                  <p className="text-sm text-zinc-400 mt-0.5">
                    Facturation {activeSubscription.billingInterval === "year" ? "annuelle" : "mensuelle"}
                  </p>
                )}
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${activeSubscription?.status === "active"
                ? "bg-amber-50 text-amber-700 border-amber-200"
                : "bg-zinc-50 text-zinc-500 border-zinc-200"
                }`}>
                {activeSubscription ? (statusLabel[activeSubscription.status] ?? "Inconnu") : "Gratuit"}
              </span>
            </div>

            {/* Usage */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-zinc-400">Crédits utilisés ce mois</span>
                <span className="font-medium text-zinc-900">{usedPlanCredits} / {totalPlanCredits}</span>
              </div>
              <ProgressBar value={usagePercentage} />
            </div>

            {/* Stats */}
            <div className="divide-y divide-zinc-100 text-sm">
              {periodEnd && (
                <div className="flex justify-between py-3">
                  <span className="text-zinc-400">{activeSubscription?.cancelAtPeriodEnd ? "Expire le" : "Renouvellement"}</span>
                  <span className="font-medium text-zinc-900">{periodEnd}</span>
                </div>
              )}
              {extraCredits > 0 && (
                <div className="flex justify-between py-3">
                  <span className="text-zinc-400">Crédits bonus</span>
                  <span className="font-medium text-zinc-900">+{extraCredits}</span>
                </div>
              )}
              <div className="flex justify-between py-3">
                <span className="text-zinc-400">Total disponible</span>
                <span className="text-lg font-semibold text-zinc-900">{totalAvailable} crédits</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap items-center gap-3 pt-1">
              {activeSubscription ? (
                <button
                  onClick={handleBillingPortal}
                  disabled={loading}
                  className="px-5 py-2 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors flex items-center gap-2"
                >
                  {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                  Gérer mon offre
                </button>
              ) : (
                <Link href="/pricing">
                  <button className="px-5 py-2 text-sm font-semibold rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-colors">
                    S'abonner
                  </button>
                </Link>
              )}

              {activeSubscription && (
                activeSubscription.cancelAtPeriodEnd ? (
                  <button
                    onClick={handleRestore}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium rounded-xl border border-zinc-200 hover:border-zinc-300 text-zinc-600 transition-colors disabled:opacity-40 flex items-center gap-2"
                  >
                    {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Réactiver
                  </button>
                ) : (
                  <button
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium rounded-xl border border-zinc-200 hover:border-red-200 hover:text-red-600 text-zinc-400 transition-colors disabled:opacity-40 flex items-center gap-2"
                  >
                    {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Annuler l'abonnement
                  </button>
                )
              )}

              <button
                onClick={handleBillingPortal}
                className="text-sm text-zinc-400 hover:text-zinc-700 underline underline-offset-2 transition-colors"
              >
                Portail de facturation ↗
              </button>
            </div>
          </div>

          {/* Credit packs */}
          <div className="space-y-4">
            <div>
              <p className="text-base font-semibold text-zinc-900">Packs de crédits</p>
              <p className="text-sm text-zinc-400 mt-0.5">Valables à vie — pas d'expiration</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {loadingPacks && packs.length === 0 ? (
                <div className="col-span-full py-10 flex justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-zinc-300" />
                </div>
              ) : packs.map((pack) => (
                <div
                  key={pack.id}
                  className={`border rounded-2xl p-5 flex flex-col gap-3 transition-all ${pack.featured
                    ? "border-amber-300 bg-amber-50/40"
                    : "border-zinc-200 bg-white hover:border-zinc-300"
                    }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-2xl font-bold text-zinc-900">{pack.credits}</p>
                      {pack.savings && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                          {pack.savings}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">{pack.desc || (pack as any).description}</p>
                  </div>

                  <p className="text-lg font-bold text-zinc-900 mt-auto">{pack.price} €</p>

                  <button
                    onClick={() => handleBuyPack(pack.id)}
                    disabled={loading}
                    className={`w-full py-2 text-sm font-semibold rounded-xl transition-all disabled:opacity-40 flex items-center justify-center gap-2 active:scale-95 ${pack.featured
                      ? "bg-zinc-900 hover:bg-zinc-800 text-white"
                      : "bg-white border border-zinc-200 hover:border-zinc-300 text-zinc-800"
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
          <div className="border border-zinc-200 rounded-2xl bg-white p-5 space-y-3">
            <p className="text-sm font-semibold text-zinc-900">Règles des crédits</p>
            <ul className="space-y-2 text-xs text-zinc-500">
              <li className="flex gap-2">
                <span className="text-amber-500 shrink-0">•</span>
                <span><span className="font-medium text-zinc-700">{totalPlanCredits} crédits</span> inclus par mois avec votre forfait.</span>
              </li>
              <li className="flex gap-2"><span className="text-amber-500 shrink-0">•</span> Renouvellement automatique chaque cycle.</li>
              <li className="flex gap-2"><span className="text-amber-500 shrink-0">•</span> Les crédits du forfait expirent en fin de cycle.</li>
              <li className="flex gap-2">
                <span className="text-amber-500 shrink-0">•</span>
                <span>Les crédits achetés <span className="font-medium text-zinc-700">n'expirent jamais</span>.</span>
              </li>
            </ul>
            <Link href="/pricing">
              <button className="w-full mt-1 py-2 text-xs font-medium rounded-xl border border-zinc-200 hover:border-zinc-300 text-zinc-500 transition-colors">
                Politique tarifaire
              </button>
            </Link>
          </div>

          <div className="border border-zinc-200 rounded-2xl bg-white p-5 space-y-2">
            <p className="text-sm font-semibold text-zinc-900">Assistance</p>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Une question sur votre facturation ? Réponse sous 24 h.
            </p>

            <a href="mailto:support@sketchpilot.com"
              className="block text-sm font-medium text-zinc-900 hover:text-amber-600 transition-colors mt-1"
            >
              support@sketchpilot.com →
            </a>
          </div>
        </div>
      </div>

      {/* ── Transaction History (full width) ── */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-base font-semibold text-zinc-900">Historique des transactions</p>
            <p className="text-sm text-zinc-400 mt-0.5">
              {historyMeta.total > 0 ? `${historyMeta.total} transaction${historyMeta.total > 1 ? "s" : ""}` : "Achats et consommations de crédits"}
            </p>
          </div>
          {loadingHistory && <Loader2 className="h-4 w-4 animate-spin text-zinc-300" />}
        </div>

        <div className="border border-zinc-200 rounded-2xl bg-white overflow-hidden">
          {loadingHistory && history.length === 0 ? (
            <div className="p-10 flex justify-center">
              <Loader2 className="h-5 w-5 animate-spin text-zinc-300" />
            </div>
          ) : history.length === 0 ? (
            <p className="p-10 text-center text-sm text-zinc-400">Aucune transaction enregistrée.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="border-b border-zinc-100">
                  <tr className="text-[11px] text-zinc-400 uppercase tracking-widest">
                    <th className="px-5 py-3.5 font-semibold">Date & Heure</th>
                    <th className="px-5 py-3.5 font-semibold">Description</th>
                    <th className="px-5 py-3.5 font-semibold">Type</th>
                    <th className="px-5 py-3.5 font-semibold text-right">Crédits</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-50">
                  {history.map((tx) => {
                    const date = new Date(tx.createdAt);
                    const isCredit = tx.amount > 0;
                    return (
                      <tr key={tx.id} className="hover:bg-zinc-50/60 transition-colors group">
                        {/* Date */}
                        <td className="px-5 py-4 text-zinc-500 text-xs whitespace-nowrap">
                          <span className="block font-medium text-zinc-700">
                            {date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short", year: "numeric" })}
                          </span>
                          <span className="text-zinc-400">
                            {date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </td>

                        {/* Description */}
                        <td className="px-5 py-4">
                          <span className="font-medium text-zinc-800 text-sm block">
                            {tx.description || tx.type}
                          </span>
                          {tx.packId && (
                            <span className="text-xs text-zinc-400">Pack : {tx.packId}</span>
                          )}
                          {tx.videoId && (
                            <span className="text-xs text-zinc-400">Vidéo : {tx.videoId.slice(0, 8)}…</span>
                          )}
                          {tx.metadata?.reason && (
                            <span className="text-xs text-zinc-400 block">{tx.metadata.reason}</span>
                          )}
                        </td>

                        {/* Type badge */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          {tx.type === "topup" || tx.type === "welcome_bonus" ? (
                            <span className="inline-flex items-center gap-1 text-amber-700 bg-amber-50 border border-amber-100 px-2.5 py-1 rounded-lg text-xs font-semibold">
                              <ArrowUpRight className="h-3 w-3" />
                              {tx.type === "welcome_bonus" ? "Bonus" : "Rechargement"}
                            </span>
                          ) : tx.type === "refund" ? (
                            <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-lg text-xs font-semibold">
                              <RefreshCcw className="h-3 w-3" /> Remboursement
                            </span>
                          ) : tx.type === "admin_adjustment" ? (
                            <span className="inline-flex items-center gap-1 text-purple-700 bg-purple-50 border border-purple-100 px-2.5 py-1 rounded-lg text-xs font-semibold">
                              Admin
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-zinc-500 bg-zinc-100 border border-zinc-200 px-2.5 py-1 rounded-lg text-xs font-semibold">
                              <ArrowDownRight className="h-3 w-3" /> Consommation
                            </span>
                          )}
                        </td>

                        {/* Credits */}
                        <td className="px-5 py-4 text-right">
                          <span className={`text-sm font-bold tabular-nums ${isCredit ? "text-amber-600" : "text-zinc-500"}`}>
                            {isCredit ? "+" : ""}{tx.amount}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {historyMeta.pages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-zinc-100 bg-zinc-50/50">
              <span className="text-xs text-zinc-400">
                Page {historyPage} sur {historyMeta.pages} · {historyMeta.total} transaction{historyMeta.total > 1 ? "s" : ""}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchHistory(historyPage - 1)}
                  disabled={historyPage <= 1 || loadingHistory}
                  className="px-3 py-1.5 text-xs font-medium border border-zinc-200 rounded-lg hover:border-zinc-300 text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  ← Précédent
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(historyMeta.pages, 7) }, (_, i) => {
                    const page = i + 1;
                    return (
                      <button
                        key={page}
                        onClick={() => fetchHistory(page)}
                        disabled={loadingHistory}
                        className={`w-8 h-8 text-xs rounded-lg font-medium transition-colors ${page === historyPage
                          ? "bg-zinc-900 text-white"
                          : "text-zinc-500 hover:bg-zinc-100"
                          }`}
                      >
                        {page}
                      </button>
                    );
                  })}
                </div>
                <button
                  onClick={() => fetchHistory(historyPage + 1)}
                  disabled={historyPage >= historyMeta.pages || loadingHistory}
                  className="px-3 py-1.5 text-xs font-medium border border-zinc-200 rounded-lg hover:border-zinc-300 text-zinc-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Suivant →
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}