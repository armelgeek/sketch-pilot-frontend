import { useCallback, useState } from "react";
import { subscriptionApi } from "@/src/services/subscription-api";
import type { PricingPlan } from "./use-subscription";

export function usePricingPlans() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await subscriptionApi.getPlans();
      setPlans(data.data || []);
      return data.data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Error fetching plans";
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    plans,
    loading,
    error,
    fetchPlans
  };
}
