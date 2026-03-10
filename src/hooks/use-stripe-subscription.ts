import { useCallback, useState } from "react";
import { authClient } from "@/src/lib/auth-client";

export interface Subscription {
  id: string;
  plan: string;
  status: "active" | "canceled" | "trialing" | "past_due" | "incomplete";
  periodStart: Date | null;
  periodEnd: Date | null;
  cancelAtPeriodEnd: boolean;
  cancelAt: Date | null;
  canceledAt: Date | null;
  endedAt: Date | null;
  seats: number | null;
  trialStart: Date | null;
  trialEnd: Date | null;
  billingInterval: "month" | "year" | null;
  stripeScheduleId: string | null;
  limits?: Record<string, number>;
}

export interface UpgradeOptions {
  plan: string;
  annual?: boolean;
  referenceId?: string;
  subscriptionId?: string;
  metadata?: Record<string, any>;
  seats?: number;
  locale?: string;
  scheduleAtPeriodEnd?: boolean;
  successUrl: string;
  cancelUrl: string;
  returnUrl?: string;
  disableRedirect?: boolean;
}

export interface CancelOptions {
  referenceId?: string;
  subscriptionId?: string;
  returnUrl: string;
}

export interface RestoreOptions {
  referenceId?: string;
  subscriptionId?: string;
}

export interface ListOptions {
  referenceId?: string;
}

export function useStripeSubscription() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);

  const upgrade = useCallback(async (options: UpgradeOptions) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: upgradeError } = await authClient.subscription.upgrade({
        plan: options.plan,
        annual: options.annual,
        referenceId: options.referenceId,
        subscriptionId: options.subscriptionId,
        metadata: options.metadata,
        seats: options.seats,
        locale: options.locale,
        successUrl: options.successUrl,
        cancelUrl: options.cancelUrl,
        returnUrl: options.returnUrl,
        disableRedirect: options.disableRedirect ?? false,
        scheduleAtPeriodEnd: options.scheduleAtPeriodEnd ?? false,
      });

      if (upgradeError) {
        setError(upgradeError.message || "Failed to upgrade subscription");
        throw upgradeError;
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Upgrade failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const switchPlan = useCallback(
    async (newPlan: string, options?: { 
      subscriptionId: string; 
      scheduleAtPeriodEnd?: boolean;
      successUrl: string;
      cancelUrl: string;
      returnUrl?: string;
    }) => {
      if (!options?.subscriptionId) {
        throw new Error("subscriptionId is required when switching plans");
      }

      return upgrade({
        plan: newPlan,
        subscriptionId: options.subscriptionId,
        successUrl: options.successUrl,
        cancelUrl: options.cancelUrl,
        returnUrl: options.returnUrl,
        scheduleAtPeriodEnd: options.scheduleAtPeriodEnd,
        disableRedirect: false,
      });
    },
    [upgrade]
  );

  const cancel = useCallback(async (options: CancelOptions) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: cancelError } = await authClient.subscription.cancel({
        referenceId: options.referenceId,
        subscriptionId: options.subscriptionId,
        returnUrl: options.returnUrl,
      });

      if (cancelError) {
        setError(cancelError.message || "Failed to cancel subscription");
        throw cancelError;
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Cancellation failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const restore = useCallback(async (options: RestoreOptions) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: restoreError } = await authClient.subscription.restore({
        referenceId: options.referenceId,
        subscriptionId: options.subscriptionId,
      });

      if (restoreError) {
        setError(restoreError.message || "Failed to restore subscription");
        throw restoreError;
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Restore failed";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const list = useCallback(async (options?: ListOptions) => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: listError } = await authClient.subscription.list({
        query: {
          referenceId: options?.referenceId,
        },
      });

      if (listError) {
        setError(listError.message || "Failed to fetch subscriptions");
        throw listError;
      }

      if (data && Array.isArray(data)) {
        setSubscriptions(data as Subscription[]);
      }

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to fetch subscriptions";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const billingPortal = useCallback(
    async (options: {
      locale?: string;
      referenceId?: string;
      returnUrl: string;
      disableRedirect?: boolean;
    }) => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: portalError } = await authClient.subscription.billingPortal({
          locale: options.locale,
          referenceId: options.referenceId,
          returnUrl: options.returnUrl,
          disableRedirect: options.disableRedirect ?? false,
        });

        if (portalError) {
          setError(portalError.message || "Failed to create billing portal session");
          throw portalError;
        }

        if (data?.url && !options.disableRedirect) {
          window.location.href = data.url;
        }

        return data;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Billing portal failed";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const getActiveSubscription = useCallback(() => {
    return subscriptions.find(
      (sub) => sub.status === "active" || sub.status === "trialing"
    );
  }, [subscriptions]);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    subscriptions,
    getActiveSubscription,
    clearError,
    upgrade,
    switchPlan,
    cancel,
    restore,
    list,
    billingPortal,
  };
}
