"use client";

import { useEffect } from "react";
import { useStripeSubscription } from "@/src/hooks/use-stripe-subscription";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, AlertTriangle, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SubscriptionPage() {
  const {
    loading,
    error,
    subscriptions,
    cancel,
    restore,
    list,
    billingPortal,
    getActiveSubscription,
    clearError
  } = useStripeSubscription();

  const activeSubscription = getActiveSubscription();

  useEffect(() => {
    list();
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "active":
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case "trialing":
        return <Clock className="h-5 w-5 text-blue-600" />;
      case "past_due":
        return <AlertTriangle className="h-5 w-5 text-amber-600" />;
      case "canceled":
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      default:
        return <AlertCircle className="h-5 w-5 text-zinc-400" />;
    }
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, string> = {
      active: "Actif",
      trialing: "Essai gratuit",
      past_due: "Paiement en attente",
      canceled: "Annulé",
      incomplete: "En attente",
      unpaid: "Non payé"
    };
    return labels[status] || "Inconnu";
  };

  const handleCancelClick = async () => {
    if (!activeSubscription) return;
    if (!confirm("Êtes-vous sûr de vouloir annuler votre abonnement ? Vous pourrez vous réabonner à tout moment.")) {
      return;
    }

    try {
      await cancel({
        subscriptionId: activeSubscription.id,
        returnUrl: window.location.href,
      });
      await list();
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mon abonnement</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Gérez votre abonnement et vos paramètres de facturation
        </p>
      </div>

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6 flex gap-3">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-200 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 dark:text-red-100">{error}</p>
              <Button
                onClick={clearError}
                variant="ghost"
                size="sm"
                className="mt-2 text-red-700 dark:text-red-300"
              >
                Fermer
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Current Plan Card */}
      {activeSubscription ? (
        <Card className="border-2 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(activeSubscription.status)}
                <div>
                  <CardTitle className="capitalize">{activeSubscription.plan}</CardTitle>
                  <CardDescription>{getStatusLabel(activeSubscription.status)}</CardDescription>
                </div>
              </div>
              {!activeSubscription.cancelAtPeriodEnd && (
                <Badge>Renouvellement automatique</Badge>
              )}
              {activeSubscription.cancelAtPeriodEnd && (
                <Badge variant="destructive">Annulation programmée</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Period Info */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Début de la période</p>
                <p className="font-semibold text-sm">
                  {activeSubscription.periodStart
                    ? new Date(activeSubscription.periodStart).toLocaleDateString("fr-FR")
                    : "-"}
                </p>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Fin de la période</p>
                <p className="font-semibold text-sm">
                  {activeSubscription.periodEnd
                    ? new Date(activeSubscription.periodEnd).toLocaleDateString("fr-FR")
                    : "-"}
                </p>
              </div>
            </div>

            {/* Trial Info */}
            {activeSubscription.trialStart && activeSubscription.trialEnd && (
              <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded border border-blue-200 dark:border-blue-800">
                <p className="text-sm font-semibold mb-1">Période d'essai</p>
                <p className="text-xs text-zinc-700 dark:text-zinc-300">
                  Du {new Date(activeSubscription.trialStart).toLocaleDateString("fr-FR")} au{" "}
                  {new Date(activeSubscription.trialEnd).toLocaleDateString("fr-FR")}
                </p>
              </div>
            )}

            {/* Warning if Canceled */}
            {activeSubscription.cancelAtPeriodEnd && (
              <div className="bg-yellow-50 dark:bg-yellow-950 p-4 rounded border border-yellow-200 dark:border-yellow-800">
                <p className="text-sm font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Votre abonnement sera annulé
                </p>
                <p className="text-xs text-yellow-800 dark:text-yellow-200 mb-3">
                  {activeSubscription.cancelAt
                    ? `À partir du ${new Date(activeSubscription.cancelAt).toLocaleDateString("fr-FR")}`
                    : "À la fin de cette période"}
                </p>
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-wrap gap-3 pt-4 border-t border-blue-200 dark:border-blue-800">
              <Link href="/pricing" className="flex-1 min-w-[150px]">
                <Button variant="outline" className="w-full">
                  Changer de plan
                </Button>
              </Link>
              <Button 
                variant="secondary" 
                onClick={handleBillingPortal}
                disabled={loading}
                className="flex-1 min-w-[150px]"
              >
                {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                Portail de facturation
              </Button>
              
              {!activeSubscription.cancelAtPeriodEnd && (
                <Button
                  variant="destructive"
                  onClick={handleCancelClick}
                  disabled={loading}
                  className="flex-1 min-w-[150px]"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Annuler
                </Button>
              )}

              {activeSubscription.cancelAtPeriodEnd && (
                <Button
                  variant="secondary"
                  onClick={handleRestoreClick}
                  disabled={loading}
                  className="flex-1 min-w-[150px]"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Annuler l'annulation
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Pas d'abonnement actif</CardTitle>
            <CardDescription>Commencez par choisir un plan</CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/pricing">
              <Button className="w-full">
                Voir les plans
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Intervalle de facturation</CardTitle>
            <CardDescription>Votre cycle de facturation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {activeSubscription ? (
              <>
                <div>
                  <p className="text-sm text-zinc-600 dark:text-zinc-400">Fréquence</p>
                  <p className="text-lg font-bold capitalize">{activeSubscription.billingInterval}uel</p>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400">
                  Votre abonnement se renouvelle automatiquement à la fin de chaque période.
                </p>
              </>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Choisissez un plan pour commencer
              </p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Historique</CardTitle>
            <CardDescription>Vos abonnements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {subscriptions.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {subscriptions.map((sub) => (
                  <div key={sub.id} className="p-2 bg-zinc-100 dark:bg-zinc-800 rounded text-sm">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold capitalize">{sub.plan}</span>
                      <Badge variant="outline" className="capitalize">{sub.status}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Aucun historique</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
            </Button>
            <Button variant="outline" asChild>
              <a href="mailto:support@sketchpilot.com">Contacter le support</a>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
