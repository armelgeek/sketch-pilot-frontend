"use client";

import { useEffect, useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { AlertCircle, Edit2, Trash2, Plus } from "lucide-react";

interface PaymentMethod {
  id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

export default function PaymentPage() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadPaymentMethods();
  }, []);

  const loadPaymentMethods = async () => {
    setIsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/v1/payment-methods`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to load payment methods");
      const result = await response.json();
      setPaymentMethods(result.data || []);
    } catch (err) {
      console.error("Failed to load payment methods:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddPaymentMethod = async () => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/v1/payment-methods/setup`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to add payment method");
      const result = await response.json();
      if (result.data?.setupUrl) {
        window.location.href = result.data.setupUrl;
      }
    } catch (err) {
      console.error("Failed to add payment method:", err);
    }
  };

  const handleRemovePaymentMethod = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette méthode de paiement ?")) {
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/v1/payment-methods/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to remove payment method");
      setPaymentMethods(paymentMethods.filter((m) => m.id !== id));
    } catch (err) {
      console.error("Failed to remove payment method:", err);
    }
  };

  const handleSetDefault = async (id: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";
      const response = await fetch(`${apiUrl}/api/v1/payment-methods/${id}/default`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to set default payment method");
      await loadPaymentMethods();
    } catch (err) {
      console.error("Failed to set default payment method:", err);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-zinc-200 border-t-zinc-900 dark:border-zinc-800 dark:border-t-zinc-50 mx-auto mb-4" />
          <p className="text-zinc-600 dark:text-zinc-400">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Méthode de paiement</h1>
          <p className="text-zinc-600 dark:text-zinc-400">
            Gérez vos méthodes de paiement et vos informations de facturation
          </p>
        </div>
        <Button onClick={handleAddPaymentMethod} className="gap-2">
          <Plus className="h-4 w-4" />
          Ajouter une méthode
        </Button>
      </div>

      {paymentMethods.length === 0 ? (
        <Card className="border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950">
          <CardContent className="pt-6">
            <div className="flex gap-4">
              <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                  Pas de méthode de paiement
                </h3>
                <p className="text-sm text-amber-800 dark:text-amber-300 mb-4">
                  Vous devez ajouter une méthode de paiement pour vous abonner ou renouveler votre abonnement.
                </p>
                <Button onClick={handleAddPaymentMethod} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Ajouter une méthode
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {paymentMethods.map((method) => (
            <Card key={method.id} className={method.isDefault ? "ring-2 ring-green-500" : ""}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className="h-12 w-12 bg-zinc-200 dark:bg-zinc-700 rounded flex items-center justify-center text-2xl">
                      {method.brand === "visa" && "💳"}
                      {method.brand === "mastercard" && "💳"}
                      {method.brand === "amex" && "💳"}
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold capitalize">
                        {method.brand} ••••&nbsp;{method.last4}
                      </p>
                      <p className="text-sm text-zinc-600 dark:text-zinc-400">
                        Expire: {method.expMonth}/{method.expYear}
                      </p>
                    </div>
                    {method.isDefault && (
                      <Badge className="ml-auto">Par défaut</Badge>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {!method.isDefault && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetDefault(method.id)}
                      >
                        Par défaut
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemovePaymentMethod(method.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Billing Address */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Edit2 className="h-4 w-4" />
            Adresse de facturation
          </CardTitle>
          <CardDescription>
            Utilisée à titre informatif sur vos factures
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="space-y-4 max-w-md">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="firstname">Prénom</Label>
                <Input id="firstname" placeholder="Jean" />
              </div>
              <div>
                <Label htmlFor="lastname">Nom</Label>
                <Input id="lastname" placeholder="Dupont" />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Adresse</Label>
              <Input id="address" placeholder="123 Rue de la Paix" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="postal">Code postal</Label>
                <Input id="postal" placeholder="75001" />
              </div>
              <div>
                <Label htmlFor="city">Ville</Label>
                <Input id="city" placeholder="Paris" />
              </div>
            </div>
            <div>
              <Label htmlFor="country">Pays</Label>
              <Input id="country" placeholder="France" />
            </div>
            <Button type="submit">Enregistrer l&apos;adresse</Button>
          </form>
        </CardContent>
      </Card>

      {/* Help */}
      <Card className="bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
        <CardContent className="pt-6">
              <p>
                💡 <strong>Problème de paiement ?</strong>{" "}
                <a href="mailto:support@sketchpilot.com" className="text-blue-600 dark:text-blue-400 hover:underline">
                  Contactez notre support
                </a>
              </p>
        </CardContent>
      </Card>
    </div>
  );
}
