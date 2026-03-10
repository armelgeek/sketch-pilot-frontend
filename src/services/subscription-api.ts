const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000";

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  priceMonthly: number;
  priceYearly: number;
  displayedYearly: number;
  displayedMonthly: number;
  displayedYearlyBar: number;
  currency: string;
  stripeIds: Record<string, string>;
  createdAt: string;
  updatedAt: string;
}

export interface PlansResponse {
  success: boolean;
  data: SubscriptionPlan[];
}

export const subscriptionApi = {
  // Get current subscription
  getCurrentSubscription: async () => {
    const response = await fetch(`${API_BASE_URL}/api/subscription/current`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to fetch subscription");
    return response.json();
  },

  // Get usage stats
  getUsage: async () => {
    const response = await fetch(`${API_BASE_URL}/api/subscription/usage`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to fetch usage");
    return response.json();
  },

  // Get pricing plans
  getPlans: async () => {
    const response = await fetch(`${API_BASE_URL}/api/v1/subscription-plans`, {
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to fetch plans");
    return response.json();
  },

  // Upgrade subscription
  upgrade: async (planId: string, billingInterval: "month" | "year") => {
    const response = await fetch(`${API_BASE_URL}/api/subscription/upgrade`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ planId, billingInterval })
    });
    if (!response.ok) throw new Error("Failed to upgrade subscription");
    return response.json();
  },

  // Cancel subscription
  cancel: async (immediate: boolean = false) => {
    const response = await fetch(`${API_BASE_URL}/api/subscription/cancel`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ immediate })
    });
    if (!response.ok) throw new Error("Failed to cancel subscription");
    return response.json();
  },

  // Get invoices
  getInvoices: async () => {
    const response = await fetch(`${API_BASE_URL}/api/subscription/invoices`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to fetch invoices");
    return response.json();
  },

  // Get payment methods
  getPaymentMethods: async () => {
    const response = await fetch(`${API_BASE_URL}/api/subscription/payment-methods`, {
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to fetch payment methods");
    return response.json();
  },

  // Add payment method
  addPaymentMethod: async () => {
    const response = await fetch(`${API_BASE_URL}/api/subscription/payment-methods/add`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to add payment method");
    return response.json();
  },

  // Remove payment method
  removePaymentMethod: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/subscription/payment-methods/${id}`, {
      method: "DELETE",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to remove payment method");
    return response.json();
  },

  // Set default payment method
  setDefaultPaymentMethod: async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/api/subscription/payment-methods/${id}/default`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" }
    });
    if (!response.ok) throw new Error("Failed to set default payment method");
    return response.json();
  },

  // Update billing address
  updateBillingAddress: async (address: {
    firstname: string;
    lastname: string;
    address: string;
    postal: string;
    city: string;
    country: string;
  }) => {
    const response = await fetch(`${API_BASE_URL}/api/subscription/billing-address`, {
      method: "PUT",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(address)
    });
    if (!response.ok) throw new Error("Failed to update billing address");
    return response.json();
  }
};
