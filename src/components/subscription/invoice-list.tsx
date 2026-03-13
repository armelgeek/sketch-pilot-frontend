"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Download, Eye, Receipt, Loader2, AlertCircle } from "lucide-react";

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

export function InvoiceList() {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadInvoices();
    }, []);

    const loadInvoices = async () => {
        setIsLoading(true);
        setError(null);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
            const response = await fetch(`${apiUrl}/api/v1/invoices`, {
                credentials: "include",
                headers: { "Content-Type": "application/json" }
            });
            if (!response.ok) throw new Error("Failed to load invoices");
            const result = await response.json();
            if (result?.data) {
                setInvoices(result.data);
            }
        } catch (err) {
            console.error("Failed to load invoices:", err);
            setError("Impossible de charger les factures");
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
            <Badge variant={variants[status] || "secondary"} className="text-[10px] h-5">
                {labels[status] || status}
            </Badge>
        );
    };

    if (isLoading) {
        return (
            <Card>
                <CardContent className="py-10 flex flex-col items-center justify-center">
                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400 mb-2" />
                    <p className="text-sm text-zinc-500">Chargement de l'historique...</p>
                </CardContent>
            </Card>
        );
    }

    if (error) {
        return (
            <Card className="border-red-100 bg-red-50/50">
                <CardContent className="py-6 flex gap-3 items-center text-red-600">
                    <AlertCircle className="h-5 w-5" />
                    <p className="text-sm font-medium">{error}</p>
                    <Button variant="ghost" size="sm" onClick={loadInvoices} className="ml-auto">
                        Réessayer
                    </Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className="overflow-hidden border-zinc-200/60 dark:border-zinc-800/60">
            <CardHeader className="bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-zinc-200/60 dark:border-zinc-800/60">
                <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-zinc-500" />
                    <CardTitle className="text-lg">Historique de facturation</CardTitle>
                </div>
                <CardDescription>Consultez et téléchargez vos factures récentes</CardDescription>
            </CardHeader>
            <CardContent className="p-0">
                {invoices.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-sm text-zinc-500">Aucune facture trouvée.</p>
                    </div>
                ) : (
                    <div className="divide-y divide-zinc-200/60 dark:divide-zinc-800/60">
                        {invoices.slice(0, 5).map((invoice) => (
                            <div key={invoice.id} className="p-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors group">
                                <div className="flex items-center justify-between gap-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-2 mb-1">
                                            <p className="font-bold text-sm">
                                                {invoice.currency === "EUR" ? "€" : "$"}
                                                {(invoice.amount / 100).toFixed(2)}
                                            </p>
                                            {getStatusBadge(invoice.status)}
                                            {invoice.isRefund && <Badge variant="outline" className="text-[10px] h-5">Remboursement</Badge>}
                                        </div>
                                        <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                                            <span>{invoice.planName || "Abonnement"}</span>
                                            <span className="h-1 w-1 rounded-full bg-zinc-300" />
                                            <span>{invoice.periodStart ? new Date(invoice.periodStart).toLocaleDateString("fr-FR", { month: 'short', day: 'numeric', year: 'numeric' }) : ""}</span>
                                        </div>
                                    </div>
                                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        {invoice.invoiceUrl && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                <a href={invoice.invoiceUrl} target="_blank" rel="noopener noreferrer" title="Voir la facture">
                                                    <Eye className="h-4 w-4 text-zinc-500" />
                                                </a>
                                            </Button>
                                        )}
                                        {invoice.invoiceUrl && (
                                            <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                                                <a href={invoice.invoiceUrl} download title="Télécharger">
                                                    <Download className="h-4 w-4 text-zinc-500" />
                                                </a>
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
            {invoices.length > 5 && (
                <div className="p-3 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-200/60 dark:border-zinc-800/60 text-center">
                    <Button variant="link" size="sm" className="text-xs text-zinc-500" asChild>
                        <a href="/subscription/invoices">Voir toutes les factures</a>
                    </Button>
                </div>
            )}
        </Card>
    );
}
