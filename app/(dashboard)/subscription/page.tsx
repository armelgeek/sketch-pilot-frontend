"use client";

import { useEffect, useState } from "react";
import { useSubscriptionManager } from "@/src/hooks/use-subscription-manager";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { AlertCircle, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import Link from "next/link";

export default function SubscriptionPage() {
  const { subscriptionStatus, handleCancel, isLoading } = useSubscriptionManager();
  const [isCanceling, setIsCanceling] = useState(false);

  const getStatusIcon = (status: string | null) => {
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

  const getStatusLabel = (status: string | null) => {
    const labels: Record<string, string> = {
      active: "Actif",
      trialing: "Essai gratuit",
      past_due: "Paiement en attente",
      canceled: "Annulé",
      incomplete: "En attente",
      unpaid: "Non payé"
    };
    return labels[status || ""] || "Inconnu";
  };

  const handleCancelClick = async () => {
    if (confirm("Êtes-vous sûr de vouloir annuler votre abonnement ? Vous pourrez vous réabonner à tout moment.")) {
      setIsCanceling(true);
      try {
        await handleCancel();
      } finally {
        setIsCanceling(false);
      }
    }
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold mb-2">Mon abonnement</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Gérez votre abonnement, vos crédits et vos factures
        </p>
      </div>

      {/* Current Plan Card */}
      {subscriptionStatus && (
        <Card className="border-2 border-blue-200 dark:border-blue-900 bg-blue-50 dark:bg-blue-950">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getStatusIcon(subscriptionStatus.status)}
                <div>
                  <CardTitle>{subscriptionStatus.planName || "Pas d'abonnement"}</CardTitle>
                  <CardDescription>{getStatusLabel(subscriptionStatus.status)}</CardDescription>
                </div>
              </div>
              {subscriptionStatus.autoRenew && subscriptionStatus.status !== "canceled" && (
                <Badge>Renouvellement automatique</Badge>
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Credits */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Crédits utilisés</p>
                <div className="space-y-2">
                  <p className="font-semibold text-lg">
                    {subscriptionStatus.totalCredits - subscriptionStatus.remainingCredits} / {subscriptionStatus.totalCredits}
                  </p>
                  <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{
                        width: `${
                          ((subscriptionStatus.totalCredits - subscriptionStatus.remainingCredits) /
                            subscriptionStatus.totalCredits) *
                          100
                        }%`
                      }}
                    />
                  </div>
                </div>
              </div>
              <div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-1">Renouvellement</p>
                <p className="font-semibold">
                  {subscriptionStatus.periodEnd
                    ? new Date(subscriptionStatus.periodEnd).toLocaleDateString("fr-FR")
                    : "-"}
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-4 border-t border-blue-200 dark:border-blue-800">
              <Link href="/pricing" className="flex-1">
                <Button variant="outline" className="w-full">
                  Changer de plan
                </Button>
              </Link>
              <Link href="/dashboard/subscription/invoices" className="flex-1">
                <Button variant="outline" className="w-full">
                  Factures
                </Button>
              </Link>
              {subscriptionStatus.autoRenew && subscriptionStatus.status !== "canceled" && (
                <Button
                  variant="destructive"
                  onClick={handleCancelClick}
                  disabled={isCanceling}
                  className="flex-1"
                >
                  {isCanceling ? "En cours..." : "Annuler"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Crédits</CardTitle>
            <CardDescription>Utilisation et allocation</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Crédits disponibles</p>
              <p className="text-3xl font-bold">{subscriptionStatus?.remainingCredits}</p>
            </div>
            <p className="text-sm text-zinc-600 dark:text-zinc-400">
              Les crédits sont utilisés pour générer des vidéos. Chaque plan renouvelle ses crédits le premier du mois.
            </p>
            <Link href="/dashboard" className="block">
              <Button variant="outline" className="w-full">
                Voir l'utilisation
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Paiement</CardTitle>
            <CardDescription>Méthode et historique</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-3">Prochain paiement</p>
              <p className="font-semibold">
                {subscriptionStatus?.periodEnd
                  ? new Date(subscriptionStatus.periodEnd).toLocaleDateString("fr-FR", {
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })
                  : "-"}
              </p>
            </div>
            <Link href="/dashboard/subscription/payment" className="block">
              <Button variant="outline" className="w-full">
                Gérer le paiement
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Help */}
      <Card>
        <CardHeader>
          <CardTitle>Besoin d'aide ?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            Vous avez des questions sur votre abonnement ? Consultez notre documentation ou contactez notre support.
          </p>
          <div className="flex gap-3">
            <Button variant="outline" asChild>
              <Link href="/docs">Documentation</Link>
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
