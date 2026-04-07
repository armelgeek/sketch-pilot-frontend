import { create } from "zustand";

interface InsufficientCreditsStore {
    isOpen: boolean;
    openModal: () => void;
    closeModal: () => void;
}

export const useInsufficientCreditsStore = create<InsufficientCreditsStore>((set) => ({
    isOpen: false,
    openModal: () => set({ isOpen: true }),
    closeModal: () => set({ isOpen: false }),
}));
