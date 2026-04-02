"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Video, Wand2, ArrowRight, Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useOnboardingStore } from "@/src/app/onboarding/store";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { cn } from "@/src/lib/utils";

const SUGGESTED_TOPICS = [
    "Why the Roman Empire fell in 5 minutes",
    "How AI is changing the world of work",
    "5 life-changing habits of highly successful people",
    "The science of getting a perfect night's sleep",
    "How to start a profitable online business from scratch",
    "The history of money explained simply",
];

export function StepFirstVideo() {
    const router = useRouter();
    const { data, setFirstVideoTopic, completeOnboarding, prevStep } = useOnboardingStore();
    const [topic, setTopic] = useState(data.firstVideoTopic || "");
    const [custom, setCustom] = useState(false);
    const [loading, setLoading] = useState(false);

    const handleSelect = (t: string) => {
        setTopic(t);
        setCustom(false);
    };

    const handleLaunch = async () => {
        if (!topic.trim()) return;
        setLoading(true);
        setFirstVideoTopic(topic);
        completeOnboarding();
        // Navigate to generation page with topic pre-filled as query param
        router.push(`/generate?topic=${encodeURIComponent(topic)}`);
    };

    const handleSkip = () => {
        completeOnboarding();
        router.push("/dashboard");
    };

    return (
        <div className="flex flex-col items-center gap-8 w-full">
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-emerald-100 to-teal-100 dark:from-emerald-900/30 dark:to-teal-900/30 border border-emerald-200 dark:border-emerald-800 text-sm font-semibold text-emerald-700 dark:text-emerald-300">
                    <Video className="h-3.5 w-3.5" />
                    Step 3 of 3 — Almost there!
                </div>
                <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                    Create your first video 🎬
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg max-w-md">
                    Pick a topic below or write your own. We&apos;ll generate a full video in minutes.
                </p>
            </motion.div>

            {/* Suggested topics */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full max-w-xl"
            >
                {SUGGESTED_TOPICS.map((t, i) => (
                    <motion.button
                        key={t}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + i * 0.05 }}
                        onClick={() => handleSelect(t)}
                        className={cn(
                            "text-left px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                            topic === t && !custom
                                ? "border-zinc-900 dark:border-zinc-50 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-lg"
                                : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600"
                        )}
                    >
                        {t}
                    </motion.button>
                ))}

                {/* Custom topic input */}
                <motion.button
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.4 }}
                    onClick={() => { setCustom(true); setTopic(""); }}
                    className={cn(
                        "col-span-1 sm:col-span-2 flex items-center gap-3 px-4 py-3.5 rounded-xl border-2 text-sm font-medium transition-all duration-200",
                        custom
                            ? "border-violet-500 bg-violet-50 dark:bg-violet-950/30 text-violet-700 dark:text-violet-300"
                            : "border-dashed border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-500 hover:border-zinc-500"
                    )}
                >
                    <Pencil className="h-4 w-4 shrink-0" />
                    Write my own topic…
                </motion.button>
            </motion.div>

            {/* Custom input visible when clicked */}
            {custom && (
                <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    className="w-full max-w-xl"
                >
                    <Input
                        autoFocus
                        placeholder="e.g. The truth about cryptocurrency…"
                        value={topic}
                        onChange={(e) => setTopic(e.target.value)}
                        className="h-12 rounded-xl border-zinc-300 dark:border-zinc-700 font-medium text-sm"
                    />
                </motion.div>
            )}

            {/* Actions */}
            <div className="flex flex-col sm:flex-row items-center gap-3 w-full max-w-xl">
                <Button
                    variant="ghost"
                    onClick={prevStep}
                    className="text-zinc-500 font-semibold hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                    ← Back
                </Button>
                <div className="flex-1" />
                <Button
                    variant="ghost"
                    onClick={handleSkip}
                    className="text-zinc-400 font-medium text-sm"
                >
                    Skip for now
                </Button>
                <Button
                    onClick={handleLaunch}
                    disabled={!topic.trim() || loading}
                    size="lg"
                    className="h-14 px-8 rounded-2xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-black text-base shadow-xl shadow-violet-500/25 transition-all disabled:opacity-50"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <span className="h-4 w-4 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                            Launching…
                        </span>
                    ) : (
                        <span className="flex items-center gap-2">
                            <Wand2 className="h-5 w-5" />
                            Generate my video
                            <ArrowRight className="h-4 w-4" />
                        </span>
                    )}
                </Button>
            </div>
        </div>
    );
}
