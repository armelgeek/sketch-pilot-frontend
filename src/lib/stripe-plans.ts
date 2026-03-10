export interface StripePlan {
  id: string;
  name: string;
  description: string;
  monthlyPrice: number;
  annualPrice: number;
  priceId: string;
  annualDiscountPriceId?: string;
  credits: number;
  features: string[];
  highlighted?: boolean;
  freeTrial?: number;
}

export const STRIPE_PLANS: StripePlan[] = [
  {
    id: "plan_starter",
    name: "Starter",
    description: "Pour les individus",
    monthlyPrice: 9.99,
    annualPrice: 90,
    priceId: process.env.PRICE_ID_STARTER_MONTHLY || "price_starter_month",
    annualDiscountPriceId:  process.env.PRICE_ID_STARTER_YEARLY || "price_starter_year",
    credits: 1000,
    features: [
      "1000 crédits/mois",
      "Vidéos jusqu'à 10 min",
      "3 styles visuels",
      "Export HD 1080p",
      "Support email",
    ],
  },
];

export function getPlanById(id: string): StripePlan | undefined {
  return STRIPE_PLANS.find(plan => plan.id === id);
}

export function getPlanByName(name: string): StripePlan | undefined {
  return STRIPE_PLANS.find(plan => plan.name.toLowerCase() === name.toLowerCase());
}
