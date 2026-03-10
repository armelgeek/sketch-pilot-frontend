import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { subscriptionApi } from "@/src/services/subscription-api";

export interface PricingPlan {
  id: string;
  name: string;
  description?: string;
  priceMonthly: number;
  priceYearly: number;
  displayedYearly: number;
  displayedMonthly: number;
  displayedYearlyBar: number;
  currency: string;
  features?: string[];
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
      const data = await subscriptionApi.getCurrentSubscription();
      return data.data;
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
      const data = await subscriptionApi.getUsage();
      return data.data;
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
        const data = await subscriptionApi.upgrade(planId, billingInterval);
        
        // Rediriger vers Stripe checkout si session créée
        if (data.data?.stripeSessionUrl) {
          router.push(data.data.stripeSessionUrl);
        }
        
        return data.data;
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
      const data = await subscriptionApi.cancel(immediate);
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
      const data = await subscriptionApi.getInvoices();
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching invoices";
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getCurrentSubscription,
    getUsage,
    upgradePlan,
    cancelSubscription,
    getInvoices
  };
}
