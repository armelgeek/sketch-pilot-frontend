"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Sparkles, BookOpen, Megaphone, Laugh, GraduationCap, Briefcase } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useOnboardingStore } from "@/src/app/onboarding/store";
import { Button } from "@/src/components/ui/button";
import { useSession } from "@/src/lib/auth-client";

const GOALS = [
    { id: "education", label: "Education & Learning", icon: GraduationCap, color: "from-violet-500 to-purple-600" },
    { id: "marketing", label: "Marketing & Promo", icon: Megaphone, color: "from-pink-500 to-rose-600" },
    { id: "storytelling", label: "Storytelling", icon: BookOpen, color: "from-amber-500 to-orange-600" },
    { id: "entertainment", label: "Entertainment", icon: Laugh, color: "from-emerald-500 to-teal-600" },
    { id: "business", label: "Business Explainers", icon: Briefcase, color: "from-blue-500 to-indigo-600" },
    { id: "other", label: "Just Exploring", icon: Sparkles, color: "from-zinc-500 to-zinc-600" },
];

export function StepWelcome() {
    const { data: session } = useSession();
    const { data, setGoals, nextStep } = useOnboardingStore();
    const [selected, setSelected] = useState<string[]>(data.goals);

    const firstName = session?.user?.name?.split(" ")[0] || "there";

    const toggle = (id: string) => {
        setSelected((prev) =>
            prev.includes(id) ? prev.filter((g) => g !== id) : [...prev, id]
        );
    };

    const handleNext = () => {
        setGoals(selected);
        nextStep();
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full">
            {/* Greeting */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center space-y-3"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-violet-100 to-pink-100 dark:from-violet-900/30 dark:to-pink-900/30 border border-violet-200 dark:border-violet-800 text-sm font-semibold text-violet-700 dark:text-violet-300 mb-2">
                    <Sparkles className="h-3.5 w-3.5" />
                    Welcome aboard
                </div>
                <h1 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                    Hey {firstName}, let&apos;s get started! 👋
                </h1>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg max-w-md">
                    What will you mainly use this platform for? Pick all that apply.
                </p>
            </motion.div>

            {/* Goal Cards */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="grid grid-cols-2 sm:grid-cols-3 gap-3 w-full max-w-xl"
            >
                {GOALS.map((goal, i) => {
                    const isSelected = selected.includes(goal.id);
                    const Icon = goal.icon;
                    return (
                        <motion.button
                            key={goal.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.15 + i * 0.05 }}
                            onClick={() => toggle(goal.id)}
                            className={cn(
                                "relative flex flex-col items-center gap-3 p-5 rounded-2xl border-2 transition-all duration-200 font-semibold text-sm",
                                isSelected
                                    ? "border-zinc-900 dark:border-zinc-50 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-xl scale-[1.02]"
                                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md"
                            )}
                        >
                            <div
                                className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center text-white",
                                    isSelected ? `bg-gradient-to-br ${goal.color}` : "bg-zinc-100 dark:bg-zinc-800"
                                )}
                            >
                                <Icon className={cn("h-5 w-5", !isSelected && "text-zinc-500")} />
                            </div>
                            {goal.label}
                            {isSelected && (
                                <span className="absolute top-2.5 right-2.5 h-2 w-2 rounded-full bg-emerald-400" />
                            )}
                        </motion.button>
                    );
                })}
            </motion.div>

            <Button
                onClick={handleNext}
                size="lg"
                className="h-14 px-10 rounded-2xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-black text-base hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xl transition-all"
            >
                Continue →
            </Button>
        </div>
    );
}
