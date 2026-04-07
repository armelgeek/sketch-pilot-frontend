import { useCallback, useState } from "react";
import type { PricingPlan } from "./use-subscription";

export function usePricingPlans() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPlans = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const apiUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000") + "/api";
      const response = await fetch(`${apiUrl}/v1/pricing/plans`, {
        headers: { "Content-Type": "application/json" }
      });
      if (!response.ok) throw new Error("Failed to fetch plans");
      const data = await response.json();
      setPlans(data.plans || []);
      return data.plans;
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
