"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useOnboardingStore, ONBOARDING_STEPS } from "@/src/app/onboarding/store";
import { StepWelcome } from "./step-welcome";
import { StepPersona } from "./step-persona";
import { StepFirstVideo } from "./step-first-video";
import { cn } from "@/src/lib/utils";

const STEP_COMPONENTS = [StepWelcome, StepPersona, StepFirstVideo];

export function OnboardingWizard() {
    const { step } = useOnboardingStore();

    const StepComponent = STEP_COMPONENTS[step];

    return (
        <div className="flex flex-col items-center gap-10 w-full max-w-2xl mx-auto px-4 pb-16">
            {/* Step Indicator */}
            <div className="flex items-center gap-2 pt-10">
                {ONBOARDING_STEPS.map((s, i) => (
                    <div key={s.id} className="flex items-center gap-2">
                        <motion.div
                            animate={{
                                scale: i === step ? 1.1 : 1,
                                backgroundColor: i < step ? "#10b981" : i === step ? "#09090b" : "#e4e4e7",
                            }}
                            transition={{ type: "spring", stiffness: 400, damping: 25 }}
                            className={cn(
                                "h-8 w-8 rounded-full flex items-center justify-center text-xs font-black",
                                i <= step ? "text-white dark:text-zinc-900" : "text-zinc-400"
                            )}
                            style={{
                                backgroundColor:
                                    i < step
                                        ? "#10b981"
                                        : i === step
                                            ? "var(--tw-color-zinc-900, #09090b)"
                                            : "#e4e4e7",
                            }}
                        >
                            {i < step ? "✓" : i + 1}
                        </motion.div>
                        <span
                            className={cn(
                                "text-xs font-semibold hidden sm:block",
                                i === step
                                    ? "text-zinc-900 dark:text-zinc-50"
                                    : "text-zinc-400 dark:text-zinc-600"
                            )}
                        >
                            {s.label}
                        </span>
                        {i < ONBOARDING_STEPS.length - 1 && (
                            <div className="w-8 sm:w-12 h-0.5 bg-zinc-200 dark:bg-zinc-800 rounded-full mx-1" />
                        )}
                    </div>
                ))}
            </div>

            {/* Step Content */}
            <div className="w-full">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -30 }}
                        transition={{ duration: 0.25, ease: "easeInOut" }}
                    >
                        <StepComponent />
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
