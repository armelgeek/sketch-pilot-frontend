import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/src/lib/auth-client";

export interface PricingPlan {
  id: string;
  name: string;
  description?: string | null;
  monthlyLimit: number;
  priceMonthlyId?: string | null;
  priceYearlyId?: string | null;
  priceMonthlyAmount?: string | null;
  priceYearlyAmount?: string | null;
  currency?: string | null;
  isDefault: boolean;
  isFeatured: boolean;
  features?: string[] | null;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  priceAmount?: string | null;
  currency?: string | null;
  stripePriceId: string;
  isFeatured: boolean;
  description?: string | null;
}

export interface UpgradeParams {
  planId: string;
  billingInterval: "month" | "year";
}

export function useSubscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const getCurrentSubscription = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await authClient.subscription.list();
      if (error) throw new Error(error.message);
      const active = data?.find(sub => sub.status === "active" || sub.status === "trialing");
      return active || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching subscription";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getUsage = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await authClient.subscription.list();
      if (error) throw new Error(error.message);
      const active = data?.find(sub => sub.status === "active" || sub.status === "trialing");
      return active?.limits || null;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching usage";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const upgradePlan = useCallback(
    async (planId: string, billingInterval: "month" | "year") => {
      setLoading(true);
      setError(null);
      try {
        const { data, error } = await authClient.subscription.upgrade({
          plan: planId,
          annual: billingInterval === "year",
          successUrl: `${window.location.origin}/dashboard`,
          cancelUrl: `${window.location.origin}/pricing`
        });

        if (error) throw new Error(error.message);

        if (data?.url) {
          window.location.href = data.url;
        }

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Upgrade failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [router]
  );

  const cancelSubscription = useCallback(async (immediate = false) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await authClient.subscription.cancel({
        returnUrl: `${window.location.origin}/subscription`
      });
      if (error) throw new Error(error.message);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cancellation failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000") + "/api";
      const response = await fetch(`${apiUrl}/v1/invoices`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to fetch invoices");
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching invoices";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCredits = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000") + "/api";
      const response = await fetch(`${apiUrl}/v1/credits`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to fetch credits");
      const data = await response.json();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching credits";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const buyCreditPack = useCallback(async (packId: string) => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000") + "/api";
      const response = await fetch(`${apiUrl}/v1/credits/checkout`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packId,
          successUrl: `${window.location.origin}/dashboard?success=true&packId=${packId}`,
          cancelUrl: `${window.location.origin}/subscription?canceled=true`
        })
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to initiate purchase");
      }

      const { checkoutUrl } = await response.json();
      if (checkoutUrl) {
        window.location.href = checkoutUrl;
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "Purchase failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getCreditHistory = useCallback(async (page = 1, limit = 10) => {
    setLoading(true)
    setError(null)
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000') + '/api'
      const response = await fetch(`${apiUrl}/v1/credits/history?page=${page}&limit=${limit}`, {
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' }
      })
      if (!response.ok) throw new Error('Failed to fetch credit history')
      const data = await response.json()
      // Return full paginated response
      return {
        transactions: data.transactions ?? [],
        total: data.total ?? 0,
        page: data.page ?? 1,
        pages: data.pages ?? 1,
        limit: data.limit ?? limit,
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Error fetching credit history'
      setError(message)
      return { transactions: [], total: 0, page: 1, pages: 1, limit }
    } finally {
      setLoading(false)
    }
  }, [])

  const getPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000") + "/api";
      const response = await fetch(`${apiUrl}/v1/pricing/plans`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to fetch plans");
      const { plans } = await response.json();
      return plans as PricingPlan[];
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching plans";
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const getPacks = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000") + "/api";
      const response = await fetch(`${apiUrl}/v1/pricing/packs`, {
        credentials: "include",
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to fetch packs");
      const { packs } = await response.json();
      return packs as CreditPack[];
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching packs";
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getCurrentSubscription,
    getUsage,
    getCredits,
    buyCreditPack,
    upgradePlan,
    cancelSubscription,
    getInvoices,
    getCreditHistory,
    getPlans,
    getPacks
  };
}
