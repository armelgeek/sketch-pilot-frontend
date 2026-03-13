import { create } from "zustand";
import { SubscriptionStatus } from "./use-subscription-manager";

interface CreditStore {
    status: SubscriptionStatus | null;
    setStatus: (status: SubscriptionStatus | null) => void;
}

export const useCreditStore = create<CreditStore>((set) => ({
    status: null,
    setStatus: (status) => set({ status }),
}));
