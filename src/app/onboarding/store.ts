import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { OnboardingData, PersonaMethod } from "./schema";

interface OnboardingState {
    /** Whether the user has completed onboarding */
    completed: boolean;
    /** Current wizard step index (0-based) */
    step: number;
    /** Collected data */
    data: OnboardingData;

    // Actions
    setStep: (step: number) => void;
    nextStep: () => void;
    prevStep: () => void;

    setGoals: (goals: string[]) => void;
    setPersonaMethod: (method: PersonaMethod) => void;
    setPersonaPrompt: (prompt: string) => void;
    setPersonaImageUrl: (url: string) => void;
    setFirstVideoTopic: (topic: string) => void;
    setFirstVideoType: (type: string) => void;

    completeOnboarding: () => void;
    resetOnboarding: () => void;
}

const TOTAL_STEPS = 3;

export const useOnboardingStore = create<OnboardingState>()(
    persist(
        (set) => ({
            completed: false,
            step: 0,
            data: { goals: [] },

            setStep: (step) => set({ step: Math.max(0, Math.min(step, TOTAL_STEPS - 1)) }),
            nextStep: () =>
                set((s) => ({ step: Math.min(s.step + 1, TOTAL_STEPS - 1) })),
            prevStep: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),

            setGoals: (goals) => set((s) => ({ data: { ...s.data, goals } })),
            setPersonaMethod: (method) =>
                set((s) => ({ data: { ...s.data, personaMethod: method } })),
            setPersonaPrompt: (prompt) =>
                set((s) => ({ data: { ...s.data, personaPrompt: prompt } })),
            setPersonaImageUrl: (url) =>
                set((s) => ({ data: { ...s.data, personaImageUrl: url } })),
            setFirstVideoTopic: (topic) =>
                set((s) => ({ data: { ...s.data, firstVideoTopic: topic } })),
            setFirstVideoType: (type) =>
                set((s) => ({ data: { ...s.data, firstVideoType: type } })),

            completeOnboarding: () => set({ completed: true }),
            resetOnboarding: () =>
                set({ completed: false, step: 0, data: { goals: [] } }),
        }),
        {
            name: "stech-onboarding",
        }
    )
);

export const ONBOARDING_STEPS = [
    { id: "welcome", label: "Welcome" },
    { id: "persona", label: "Your Character" },
    { id: "first-video", label: "First Video" },
] as const;
