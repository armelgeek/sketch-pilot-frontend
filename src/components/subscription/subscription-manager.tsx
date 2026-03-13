"use client";

import { useEffect, useState } from "react";
import { useStripeSubscription } from "@/src/hooks/use-stripe-subscription";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import { STRIPE_PLANS } from "@/src/lib/stripe-plans";

export function SubscriptionManager() {
  const {
    loading,
    error,
    subscriptions,
    upgrade,
    switchPlan,
    cancel,
    restore,
    list,
    billingPortal,
    getActiveSubscription,
    clearError
  } = useStripeSubscription();

  const [showOptions, setShowOptions] = useState(false);
  const activeSubscription = getActiveSubscription();

  useEffect(() => {
    list();
  }, []);

  const handleUpgrade = async (planName: string) => {
    try {
      await upgrade({
        plan: planName,
        successUrl: `${window.location.origin}/subscription/success`,
        cancelUrl: `${window.location.origin}/subscription`,
      });
    } catch (err) {
      console.error("Upgrade failed:", err);
    }
  };

  const handleSwitchPlan = async (newPlanName: string) => {
    if (!activeSubscription?.id) {
      alert("No active subscription found");
      return;
    }

    try {
      await switchPlan(newPlanName, {
        subscriptionId: activeSubscription.id,
        successUrl: `${window.location.origin}/subscription`,
        cancelUrl: `${window.location.origin}/subscription`,
      });
    } catch (err) {
      console.error("Switch plan failed:", err);
    }
  };

  const handleCancel = async () => {
    if (!activeSubscription?.id) {
      alert("No active subscription found");
      return;
    }

    if (!confirm("Are you sure you want to cancel your subscription?")) {
      return;
    }

    try {
      await cancel({
        subscriptionId: activeSubscription.id,
        returnUrl: `${window.location.origin}/subscription`,
      });
      await list();
    } catch (err) {
      console.error("Cancel failed:", err);
    }
  };

  const handleRestore = async () => {
    if (!activeSubscription?.id) {
      alert("No subscription found");
      return;
    }

    try {
      await restore({
        subscriptionId: activeSubscription.id,
      });
      await list();
    } catch (err) {
      console.error("Restore failed:", err);
    }
  };

  const handleBillingPortal = async () => {
    try {
      await billingPortal({
        returnUrl: `${window.location.origin}/subscription`,
      });
    } catch (err) {
      console.error("Billing portal failed:", err);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "trialing":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "canceled":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  return (
    <div className="space-y-6">
      {/* Current Subscription */}
      {activeSubscription ? (
        <Card>
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>Manage your active subscription</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Plan</p>
                <p className="font-semibold capitalize">{activeSubscription.plan}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Status</p>
                <Badge className={getStatusColor(activeSubscription.status)}>
                  {activeSubscription.status}
                </Badge>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Billing Interval</p>
                <p className="font-semibold capitalize">{activeSubscription.billingInterval}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Period End</p>
                <p className="font-semibold text-sm">
                  {activeSubscription.periodEnd
                    ? new Date(activeSubscription.periodEnd).toLocaleDateString()
                    : "N/A"}
                </p>
              </div>
            </div>

            {activeSubscription.cancelAtPeriodEnd && (
              <div className="bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800 p-3 rounded flex gap-2">
                <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-200 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-yellow-900 dark:text-yellow-100">
                    Subscription will cancel at period end
                  </p>
                  <p className="text-sm text-yellow-800 dark:text-yellow-200">
                    {activeSubscription.cancelAt
                      ? `Cancellation date: ${new Date(activeSubscription.cancelAt).toLocaleDateString()}`
                      : "No specific date set"}
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => setShowOptions(!showOptions)} variant="outline">
                {showOptions ? "Hide Options" : "Show Options"}
              </Button>
              <Button onClick={handleBillingPortal} disabled={loading} variant="secondary">
                Manage Billing
              </Button>
            </div>

            {showOptions && (
              <div className="border-t pt-4 space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Switch Plan</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {STRIPE_PLANS.map((plan) => (
                      <Button
                        key={plan.id}
                        onClick={() => handleSwitchPlan(plan.name)}
                        disabled={loading || plan.name === activeSubscription.plan}
                        variant={plan.name === activeSubscription.plan ? "secondary" : "outline"}
                        className="text-sm"
                      >
                        {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Switch to {plan.name}
                      </Button>
                    ))}
                  </div>
                </div>

                {!activeSubscription.cancelAtPeriodEnd && (
                  <div>
                    <h4 className="font-semibold mb-2">Cancel Subscription</h4>
                    <Button
                      onClick={handleCancel}
                      disabled={loading}
                      variant="destructive"
                    >
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Cancel Subscription
                    </Button>
                  </div>
                )}

                {activeSubscription.cancelAtPeriodEnd && (
                  <div>
                    <h4 className="font-semibold mb-2">Restore Subscription</h4>
                    <Button
                      onClick={handleRestore}
                      disabled={loading}
                      variant="secondary"
                    >
                      {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                      Restore Subscription
                    </Button>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Active Subscription</CardTitle>
            <CardDescription>Choose a plan to get started</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {STRIPE_PLANS.map((plan) => (
                <Button
                  key={plan.id}
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={loading}
                  variant="outline"
                  className="w-full justify-start"
                >
                  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {plan.name} - ${plan.monthlyPrice}/month
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950">
          <CardContent className="pt-6 flex gap-2">
            <AlertCircle className="h-5 w-5 text-red-600 dark:text-red-200 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="font-semibold text-red-900 dark:text-red-100">{error}</p>
              <Button
                onClick={clearError}
                variant="ghost"
                size="sm"
                className="mt-2 text-red-700 dark:text-red-300 hover:bg-red-100 dark:hover:bg-red-900"
              >
                Dismiss
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Subscriptions List */}
      {subscriptions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
            <CardDescription>Your subscription history</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {subscriptions.map((sub) => (
                <div
                  key={sub.id}
                  className="flex justify-between items-center p-3 border rounded bg-gray-50 dark:bg-gray-900"
                >
                  <div>
                    <p className="font-semibold capitalize">{sub.plan}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {sub.billingInterval && `${sub.billingInterval}ly`}
                    </p>
                  </div>
                  <Badge className={getStatusColor(sub.status)}>
                    {sub.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
