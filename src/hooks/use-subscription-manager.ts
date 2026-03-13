import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "@/src/lib/auth-client";
import { usePricingPlans } from "@/src/hooks/use-pricing-plans";
import { useSubscription } from "@/src/hooks/use-subscription";
import { useCreditStore } from "./use-credit-store";

export interface SubscriptionStatus {
  status: "active" | "canceled" | "trialing" | "past_due" | "incomplete" | "unpaid" | "incomplete_expired" | "paused" | null;
  planName: string | null;
  periodEnd: string | null;
  autoRenew: boolean;
  remainingCredits: number;
  totalCredits: number;
  usedCredits: number;
  extraCredits: number;
}

export function useSubscriptionManager() {
  const { data: session } = useSession();
  const { fetchPlans, plans } = usePricingPlans();
  const subscription = useSubscription();

  const { status: subscriptionStatus, setStatus: setSubscriptionStatus } = useCreditStore();
  const [isLoading, setIsLoading] = useState(false);
  const hasLoadedRef = useRef(false);

  // Charger les plans au montage
  useEffect(() => {
    fetchPlans();
  }, [fetchPlans]);

  // Charger le statut d'abonnement
  useEffect(() => {
    if (session?.user && !hasLoadedRef.current) {
      hasLoadedRef.current = true;

      const loadSubscriptionStatus = async () => {
        setIsLoading(true);
        try {
          const [currentSub, creditInfo] = await Promise.all([
            subscription.getCurrentSubscription(),
            subscription.getCredits()
          ]);

          if (currentSub || creditInfo) {
            const typedSub = currentSub as any;
            setSubscriptionStatus({
              status: (typedSub?.status as any) || "active",
              planName: creditInfo?.plan || typedSub?.plan || "Free",
              periodEnd: typedSub?.periodEnd ? new Date(typedSub.periodEnd).toISOString() : (creditInfo?.resetDate || null),
              autoRenew: typedSub ? !typedSub.cancelAtPeriodEnd : true,
              remainingCredits: creditInfo?.totalAvailable ?? 0,
              totalCredits: creditInfo?.videosMonthlyLimit ?? 0,
              usedCredits: creditInfo?.videosThisMonth ?? 0,
              extraCredits: creditInfo?.extraCredits ?? 0
            });
          }
        } catch (err) {
          console.error("Failed to load subscription status:", err);
        } finally {
          setIsLoading(false);
        }
      };

      loadSubscriptionStatus();
    }
  }, [session?.user, subscription]);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const [currentSub, creditInfo] = await Promise.all([
        subscription.getCurrentSubscription(),
        subscription.getCredits()
      ]);

      if (currentSub || creditInfo) {
        const typedSub = currentSub as any;
        const newStatus: SubscriptionStatus = {
          status: (typedSub?.status as any) || "active",
          planName: creditInfo?.plan || typedSub?.plan || "Free",
          periodEnd: typedSub?.periodEnd ? new Date(typedSub.periodEnd).toISOString() : (creditInfo?.resetDate || null),
          autoRenew: typedSub ? !typedSub.cancelAtPeriodEnd : true,
          remainingCredits: creditInfo?.totalAvailable ?? 0,
          totalCredits: creditInfo?.videosMonthlyLimit ?? 0,
          usedCredits: creditInfo?.videosThisMonth ?? 0,
          extraCredits: creditInfo?.extraCredits ?? 0
        };
        setSubscriptionStatus(newStatus);
        return newStatus;
      }
      return null;
    } catch (err) {
      console.error("Refresh failed:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [subscription]);

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
      await refresh();
    } catch (err) {
      console.error("Cancellation failed:", err);
      throw err;
    }
  }, [subscription, refresh]);

  return {
    plan: plans,
    subscriptionStatus,
    isLoading: subscription.loading || isLoading,
    error: subscription.error,
    handleUpgrade,
    handleCancel,
    buyCreditPack: subscription.buyCreditPack,
    refresh
  };
}
