"use client";

import { useEffect, useState } from "react";
import { subscriptionApi } from "@/src/services/subscription-api";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Download, Eye } from "lucide-react";

interface Invoice {
  id: string;
  periodStart: string | null;
  periodEnd: string | null;
  amount: number;
  currency: string;
  status: string;
  paidAt: string | null;
  invoiceUrl: string | null;
  planName?: string;
  isRefund?: boolean;
}

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    setIsLoading(true);
    try {
      const result = await subscriptionApi.getInvoices();
      if (result?.data) {
        setInvoices(result.data);
      }
    } catch (err) {
      console.error("Failed to load invoices:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "destructive" | "outline"> = {
      paid: "default",
      pending: "secondary",
      failed: "destructive",
      refunded: "outline"
    };
    const labels: Record<string, string> = {
      paid: "Payée",
      pending: "En attente",
      failed: "Échouée",
      refunded: "Remboursée"
    };
    return (
      <Badge variant={variants[status] || "secondary"}>
        {labels[status] || status}
      </Badge>
    );
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-50 mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">Chargement des factures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Factures</h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Historique de vos paiements et factures
        </p>
      </div>

      {invoices.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-zinc-600 dark:text-zinc-400">
              Aucune facture disponible pour le moment.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {invoices.map((invoice) => (
            <Card key={invoice.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <p className="font-semibold text-lg">
                        {invoice.currency === "EUR" ? "€" : "$"}
                        {(invoice.amount / 100).toFixed(2)}
                      </p>
                      {getStatusBadge(invoice.status)}
                      {invoice.isRefund && <Badge variant="outline">Remboursement</Badge>}
                    </div>
                    <p className="text-sm text-zinc-600 dark:text-zinc-400">
                      {invoice.planName && `${invoice.planName} • `}
                      Facture {invoice.id}
                    </p>
                    <p className="text-xs text-zinc-500 dark:text-zinc-500 mt-1">
                      {invoice.periodStart &&
                        new Date(invoice.periodStart).toLocaleDateString("fr-FR")}
                      {invoice.periodStart && invoice.periodEnd && " - "}
                      {invoice.periodEnd &&
                        new Date(invoice.periodEnd).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {invoice.invoiceUrl && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="gap-2"
                        >
                          <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer">
                            <Eye className="h-4 w-4" />
                            <span className="hidden sm:inline">Voir</span>
                          </a>
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          asChild
                          className="gap-2"
                        >
                          <a href={invoice.invoiceUrl} download target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                            <span className="hidden sm:inline">Télécharger</span>
                          </a>
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
          <p className="text-sm text-zinc-700 dark:text-zinc-300">
            💡 <strong>Besoin d&apos;une facture spécifique ?</strong>{" "}
            <a href="mailto:support@sketchpilot.com" className="text-blue-600 dark:text-blue-400 hover:underline">
              Contactez notre support
            </a>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
