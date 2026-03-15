import { create } from "zustand";
import { persist } from "zustand/middleware";
import { UtmParams } from "./schema";

interface UtmState {
    utmParams: UtmParams;
    setUtmParams: (params: Partial<UtmParams>) => void;
    clearUtmParams: () => void;
}

export const useUtmStore = create<UtmState>()(
    persist(
        (set) => ({
            utmParams: {},
            setUtmParams: (params) =>
                set((state) => ({
                    utmParams: { ...state.utmParams, ...params },
                })),
            clearUtmParams: () => set({ utmParams: {} }),
        }),
        {
            name: "utm-storage",
        }
    )
);
