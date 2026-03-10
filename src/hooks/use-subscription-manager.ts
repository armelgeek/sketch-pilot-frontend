import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/src/lib/auth-client";
import { usePricingPlans } from "@/src/hooks/use-pricing-plans";
import { useSubscription } from "@/src/hooks/use-subscription";

export interface SubscriptionStatus {
  status: "active" | "canceled" | "trialing" | "past_due" | "incomplete" | null;
  planName: string | null;
  periodEnd: string | null;
  autoRenew: boolean;
  remainingCredits: number;
  totalCredits: number;
}

export function useSubscriptionManager() {
  const { data: session } = useSession();
  const { fetchPlans, plans } = usePricingPlans();
  const subscription = useSubscription();
  
  const [subscriptionStatus, setSubscriptionStatus] = useState<SubscriptionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  // Charger les plans
  useEffect(() => {
    if (!plans.length && !subscription.loading) {
      fetchPlans();
    }
  }, [plans.length, fetchPlans, subscription.loading]);

  // Charger le statut d'abonnement
  useEffect(() => {
    if (session?.user && !hasLoadedRef.current) {
      hasLoadedRef.current = true;
      
      const loadSubscriptionStatus = async () => {
        setIsLoading(true);
        const current = await subscription.getCurrentSubscription();
        if (current) {
          setSubscriptionStatus({
            status: current.status,
            planName: current.planName,
            periodEnd: current.periodEnd,
            autoRenew: !current.isCanceled,
            remainingCredits: current.remainingCredits,
            totalCredits: current.totalCredits
          });
        }
        setIsLoading(false);
      };

      loadSubscriptionStatus();
    }
  }, [session?.user, subscription]);

  const handleUpgrade = useCallback(async (planId: string, interval: "month" | "year") => {
    try {
      await subscription.upgradePlan(planId, interval);
    } catch (err) {
      console.error("Upgrade failed:", err);
      throw err;
    }
  }, [subscription]);

  const handleCancel = useCallback(async () => {
    try {
      await subscription.cancelSubscription(false);
      // Recharger le statut après annulation
      const current = await subscription.getCurrentSubscription();
      if (current) {
        setSubscriptionStatus({
          status: current.status,
          planName: current.planName,
          periodEnd: current.periodEnd,
          autoRenew: !current.isCanceled,
          remainingCredits: current.remainingCredits,
          totalCredits: current.totalCredits
        });
      }
    } catch (err) {
      console.error("Cancellation failed:", err);
      throw err;
    }
  }, [subscription]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    const current = await subscription.getCurrentSubscription();
    if (current) {
      setSubscriptionStatus({
        status: current.status,
        planName: current.planName,
        periodEnd: current.periodEnd,
        autoRenew: !current.isCanceled,
        remainingCredits: current.remainingCredits,
        totalCredits: current.totalCredits
      });
    }
    setIsLoading(false);
  }, [subscription]);

  return {
    plan: plans,
    subscriptionStatus,
    isLoading: subscription.loading || isLoading,
    error: subscription.error,
    handleUpgrade,
    handleCancel,
    refresh
  };
}
