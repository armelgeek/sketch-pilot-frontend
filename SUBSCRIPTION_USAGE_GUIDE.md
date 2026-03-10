# Stripe Subscription Management - Usage Guide

## Overview

The `useStripeSubscription` hook provides a complete interface for managing Stripe subscriptions through Better Auth. It handles all common subscription operations including creating, switching, canceling, and restoring subscriptions.

## Getting Started

```typescript
import { useStripeSubscription } from "@/src/hooks";

export function MyComponent() {
  const { 
    loading, 
    error, 
    upgrade,
    switchPlan,
    cancel,
    restore,
    list,
    billingPortal,
    getActiveSubscription,
    clearError
  } = useStripeSubscription();

  // Your component logic here
}
```

## Usage Examples

### 1. Creating a Subscription (Upgrade)

When a user selects a plan or upgrades from free to a paid plan:

```typescript
const handleUpgrade = async (planName: string) => {
  try {
    await upgrade({
      plan: planName,                    // Plan name (e.g., "pro", "starter")
      annual: false,                     // Optional: annual billing
      seats: 1,                          // Optional: for team plans
      metadata: {                        // Optional: custom data
        source: "pricing_page"
      },
      successUrl: "/dashboard/success",  // Redirect after payment
      cancelUrl: "/dashboard/cancel",    // Redirect if cancelled
      disableRedirect: false,            // Auto-redirect to checkout
    });
  } catch (err) {
    console.error("Failed to upgrade:", err);
  }
};

// Usage in a button
<Button onClick={() => handleUpgrade("pro")}>
  Upgrade to Pro
</Button>
```

### 2. Switching Plans

Change from one plan to another. Better Auth handles prorating charges automatically:

```typescript
const handleSwitchPlan = async (newPlanName: string) => {
  // Get active subscription first
  const active = getActiveSubscription();
  if (!active?.id) return;

  try {
    await switchPlan(newPlanName, {
      subscriptionId: active.id,         // Required: current subscription
      scheduleAtPeriodEnd: false,        // Optional: defer until period end
      successUrl: "/dashboard",
      cancelUrl: "/pricing",
    });
  } catch (err) {
    console.error("Failed to switch plan:", err);
  }
};
```

**With Scheduled Changes (Plan Change at Period End):**

If you want the plan change to take effect at the next billing cycle instead of immediately:

```typescript
await switchPlan("enterprise", {
  subscriptionId: active.id,
  scheduleAtPeriodEnd: true,      // Schedule for period end
  successUrl: "/dashboard",
  cancelUrl: "/pricing",
});
// User keeps current plan until billing period ends
```

### 3. Scheduling Plan Changes at Period End

Defer plan changes to the end of the current billing period:

```typescript
const handleScheduleChange = async () => {
  const active = getActiveSubscription();
  if (!active?.id) return;

  try {
    const result = await switchPlan("enterprise", {
      subscriptionId: active.id,
      scheduleAtPeriodEnd: true,
      successUrl: "/dashboard",
      cancelUrl: "/dashboard",
    });
    
    // Check if a schedule is pending
    if (result?.stripeScheduleId) {
      console.log("Plan change scheduled for period end");
      console.log("Schedule ID:", result.stripeScheduleId);
    }
  } catch (err) {
    console.error("Failed to schedule change:", err);
  }
};
```

### 4. Listing Active Subscriptions

Retrieve all subscriptions for the current user:

```typescript
const handleListSubscriptions = async () => {
  try {
    const allSubscriptions = await list({
      referenceId: undefined,  // Optional: defaults to user ID
    });
    
    console.log("All subscriptions:", allSubscriptions);
    
    // Access from hook state
    const active = getActiveSubscription();
    console.log("Active subscription:", active);
  } catch (err) {
    console.error("Failed to fetch subscriptions:", err);
  }
};

// Fetch on component mount
useEffect(() => {
  list();
}, []);

// Check subscription in JSX
{subscriptions.length > 0 ? (
  <p>You have {subscriptions.length} subscription(s)</p>
) : (
  <p>No subscriptions found</p>
)}
```

### 5. Canceling a Subscription

Cancel the current subscription:

```typescript
const handleCancel = async () => {
  const active = getActiveSubscription();
  if (!active?.id) return;

  // Confirm with user
  if (!confirm("Are you sure? You'll lose access at period end.")) {
    return;
  }

  try {
    await cancel({
      subscriptionId: active.id,
      returnUrl: "/account/subscriptions",
    });
    
    // Refresh subscriptions
    await list();
    console.log("Subscription canceled");
    
    // Show message based on status
    if (active.cancelAtPeriodEnd) {
      alert("Your subscription will cancel at the end of billing period");
    }
  } catch (err) {
    console.error("Failed to cancel:", err);
  }
};

<Button 
  onClick={handleCancel} 
  variant="destructive"
  disabled={loading}
>
  Cancel Subscription
</Button>
```

### 6. Restoring a Subscription

Restore a subscription that was scheduled for cancellation:

```typescript
const handleRestore = async () => {
  const active = getActiveSubscription();
  if (!active?.id) return;

  // Only works if subscription is active but has pending cancellation
  if (!active.cancelAtPeriodEnd) {
    alert("This subscription is not scheduled for cancellation");
    return;
  }

  try {
    await restore({
      subscriptionId: active.id,
    });
    
    // Refresh subscriptions
    await list();
    console.log("Subscription restored");
  } catch (err) {
    console.error("Failed to restore:", err);
  }
};

{activeSubscription?.cancelAtPeriodEnd && (
  <Button onClick={handleRestore} variant="secondary">
    Undo Cancellation
  </Button>
)}
```

## Subscription Object Structure

```typescript
interface Subscription {
  id: string;                              // Unique subscription ID
  plan: string;                            // Plan name
  status: "active" | "canceled" | "trialing" | "past_due" | "incomplete";
  periodStart: Date | null;                // Billing period start
  periodEnd: Date | null;                  // Billing period end
  cancelAtPeriodEnd: boolean;              // Whether cancellation is scheduled
  cancelAt: Date | null;                   // When cancellation takes effect
  canceledAt: Date | null;                 // When cancellation was requested
  endedAt: Date | null;                    // When subscription ended
  seats: number | null;                    // Number of seats (team plans)
  trialStart: Date | null;                 // Trial period start
  trialEnd: Date | null;                   // Trial period end
  billingInterval: "month" | "year" | null;
  stripeScheduleId: string | null;         // ID of pending change schedule
  limits?: Record<string, number>;         // Plan limits (usage quotas)
}
```

## Common Patterns

### Subscription Status Display

```typescript
const getStatusBadge = (subscription: Subscription) => {
  const statusConfig = {
    active: { label: "Active", color: "green" },
    trialing: { label: "Trial", color: "blue" },
    canceled: { label: "Canceled", color: "red" },
    past_due: { label: "Past Due", color: "yellow" },
    incomplete: { label: "Incomplete", color: "gray" },
  };

  const config = statusConfig[subscription.status];
  return <Badge className={`bg-${config.color}-100`}>{config.label}</Badge>;
};
```

### Handling Billing Portal

```typescript
const handleBillingPortal = async () => {
  try {
    // This redirects to Stripe's hosted portal by default
    await billingPortal({
      returnUrl: window.location.href,
      disableRedirect: false,  // Auto-redirect
    });
  } catch (err) {
    console.error("Failed to open billing portal:", err);
  }
};

<Button onClick={handleBillingPortal}>
  Manage Billing
</Button>
```

### Error Handling

```typescript
{error && (
  <Alert variant="destructive">
    <AlertCircle className="h-4 w-4" />
    <AlertTitle>Error</AlertTitle>
    <AlertDescription>{error}</AlertDescription>
    <Button 
      onClick={clearError} 
      variant="outline" 
      size="sm" 
      className="mt-2"
    >
      Dismiss
    </Button>
  </Alert>
)}
```

### Loading States

```typescript
<Button disabled={loading}>
  {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
  {loading ? "Processing..." : "Upgrade Plan"}
</Button>
```

## Complete Example Component

See [SubscriptionManager](../subscription-manager.tsx) for a complete implementation showing all operations.

## Important Notes

1. **Trial Prevention**: Stripe automatically prevents users from getting multiple free trials across all plans.

2. **Reference IDs**: By default, subscriptions are associated with the user ID. You can use `referenceId` to associate with organizations or teams.

3. **Prorating**: When switching plans, Stripe automatically prorates charges based on the billing period.

4. **Webhook Handling**: Ensure your backend is configured to handle these Stripe webhook events:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

5. **Redirect Handling**: The `successUrl` parameter is modified internally by Better Auth to handle race conditions between checkout completion and webhook processing.

## Environment Variables

Ensure these are set in your `.env.local`:

```
NEXT_PUBLIC_API_URL=http://localhost:3000
```

Backend environment variables (needed on server):

```
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```
