"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Wand2, Upload, SkipForward, User, ImageIcon, Loader2, X } from "lucide-react";
import { useOnboardingStore } from "@/src/app/onboarding/store";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { cn } from "@/src/lib/utils";
import type { PersonaMethod } from "@/src/app/onboarding/schema";

type Method = PersonaMethod | undefined;

const STYLE_PRESETS = [
    "A friendly anime guide character, bright eyes, energetic",
    "A sleek professional in a modern suit, confident look",
    "A cartoon explorer with a backpack and adventurous spirit",
    "A wise elderly professor with round glasses and a warm smile",
];

export function StepPersona() {
    const { data, setPersonaMethod, setPersonaPrompt, setPersonaImageUrl, nextStep, prevStep } =
        useOnboardingStore();

    const [method, setMethod] = useState<Method>(data.personaMethod);
    const [prompt, setPrompt] = useState(data.personaPrompt || "");
    const [previewUrl, setPreviewUrl] = useState<string | null>(data.personaImageUrl || null);
    const [generating, setGenerating] = useState(false);
    const [uploadError, setUploadError] = useState<string | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);

    const selectMethod = (m: PersonaMethod) => {
        setMethod(m);
        setPersonaMethod(m);
        setPreviewUrl(null);
        setUploadError(null);
    };

    const handleGenerate = async () => {
        if (!prompt.trim()) return;
        setGenerating(true);
        setPersonaPrompt(prompt);
        // Placeholder: In production this would call an AI image generation endpoint
        // For now we store the prompt and move on — generation can happen in background
        await new Promise((r) => setTimeout(r, 1200));
        setGenerating(false);
        nextStep();
    };

    const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (!file.type.startsWith("image/")) {
            setUploadError("Please upload a valid image file (JPG, PNG, WebP).");
            return;
        }
        if (file.size > 10 * 1024 * 1024) {
            setUploadError("File too large. Max size is 10 MB.");
            return;
        }
        setUploadError(null);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
        setPersonaImageUrl(url);
    };

    const handleContinue = () => {
        if (method === "skip") {
            nextStep();
            return;
        }
        if (method === "upload" && previewUrl) {
            nextStep();
            return;
        }
        if (method === "ai_generate") {
            handleGenerate();
        }
    };

    const canContinue =
        method === "skip" ||
        (method === "upload" && !!previewUrl) ||
        (method === "ai_generate" && prompt.trim().length > 0);

    return (
        <div className="flex flex-col items-center gap-8 w-full">
            {/* Header */}
            <motion.div
                initial={{ opacity: 0, y: -12 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center space-y-3"
            >
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-100 to-orange-100 dark:from-amber-900/30 dark:to-orange-900/30 border border-amber-200 dark:border-amber-800 text-sm font-semibold text-amber-700 dark:text-amber-300">
                    <User className="h-3.5 w-3.5" />
                    Step 2 of 3 — Your Character
                </div>
                <h2 className="text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
                    Define your persona ✨
                </h2>
                <p className="text-zinc-500 dark:text-zinc-400 font-medium text-lg max-w-md">
                    Your character will appear in your videos. Generate one with AI, upload a photo, or skip.
                </p>
            </motion.div>

            {/* Method Selection */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
                className="grid grid-cols-1 sm:grid-cols-3 gap-4 w-full max-w-xl"
            >
                {[
                    {
                        id: "ai_generate" as PersonaMethod,
                        icon: Wand2,
                        label: "Generate with AI",
                        desc: "Describe your character and let AI create it",
                        gradient: "from-violet-500 to-indigo-600",
                    },
                    {
                        id: "upload" as PersonaMethod,
                        icon: Upload,
                        label: "Upload an image",
                        desc: "Use your own photo or illustration",
                        gradient: "from-pink-500 to-rose-600",
                    },
                    {
                        id: "skip" as PersonaMethod,
                        icon: SkipForward,
                        label: "Skip for now",
                        desc: "You can add a character later",
                        gradient: "from-zinc-400 to-zinc-600",
                    },
                ].map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = method === opt.id;
                    return (
                        <button
                            key={opt.id}
                            onClick={() => selectMethod(opt.id)}
                            className={cn(
                                "flex flex-col gap-3 p-5 rounded-2xl border-2 text-left transition-all duration-200",
                                isSelected
                                    ? "border-zinc-900 dark:border-zinc-50 bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 shadow-xl"
                                    : "border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:border-zinc-400 dark:hover:border-zinc-600 hover:shadow-md"
                            )}
                        >
                            <div
                                className={cn(
                                    "h-10 w-10 rounded-xl flex items-center justify-center text-white shrink-0",
                                    `bg-gradient-to-br ${opt.gradient}`
                                )}
                            >
                                <Icon className="h-5 w-5" />
                            </div>
                            <div>
                                <p className="font-bold text-sm">{opt.label}</p>
                                <p className={cn("text-xs mt-0.5", isSelected ? "opacity-70" : "text-zinc-400 dark:text-zinc-500")}>
                                    {opt.desc}
                                </p>
                            </div>
                        </button>
                    );
                })}
            </motion.div>

            {/* Dynamic Content */}
            <AnimatePresence mode="wait">
                {method === "ai_generate" && (
                    <motion.div
                        key="ai-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full max-w-xl space-y-3"
                    >
                        <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-400">
                            Describe your character
                        </p>
                        <Textarea
                            placeholder="e.g. A friendly anime guide with bright blue eyes and a warm smile…"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            rows={3}
                            className="resize-none rounded-xl border-zinc-300 dark:border-zinc-700 font-medium text-sm"
                        />
                        {/* Style Presets */}
                        <div className="flex flex-wrap gap-2">
                            {STYLE_PRESETS.map((p) => (
                                <button
                                    key={p}
                                    onClick={() => setPrompt(p)}
                                    className={cn(
                                        "text-xs px-3 py-1.5 rounded-full border font-medium transition-colors duration-150",
                                        prompt === p
                                            ? "bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 border-transparent"
                                            : "border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-zinc-400 dark:hover:border-zinc-500"
                                    )}
                                >
                                    {p.length > 40 ? p.slice(0, 40) + "…" : p}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}

                {method === "upload" && (
                    <motion.div
                        key="upload-form"
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="w-full max-w-xl"
                    >
                        <input
                            ref={fileRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleUpload}
                        />
                        {previewUrl ? (
                            <div className="relative">
                                <img
                                    src={previewUrl}
                                    alt="Persona preview"
                                    className="w-full max-h-64 object-cover rounded-2xl shadow-lg"
                                />
                                <button
                                    onClick={() => { setPreviewUrl(null); setPersonaImageUrl(""); }}
                                    className="absolute top-3 right-3 h-8 w-8 flex items-center justify-center rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={() => fileRef.current?.click()}
                                className="w-full border-2 border-dashed border-zinc-300 dark:border-zinc-700 rounded-2xl p-10 flex flex-col items-center gap-3 text-zinc-400 hover:border-zinc-500 hover:text-zinc-600 dark:hover:border-zinc-500 dark:hover:text-zinc-300 transition-colors"
                            >
                                <ImageIcon className="h-10 w-10" />
                                <p className="text-sm font-semibold">Click to browse</p>
                                <p className="text-xs">JPG, PNG, WebP · Max 10 MB</p>
                            </button>
                        )}
                        {uploadError && (
                            <p className="text-xs text-red-500 mt-2 font-medium">{uploadError}</p>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Navigation */}
            <div className="flex items-center gap-3 w-full max-w-xl">
                <Button
                    variant="ghost"
                    onClick={prevStep}
                    className="text-zinc-500 font-semibold hover:text-zinc-900 dark:hover:text-zinc-100"
                >
                    ← Back
                </Button>
                <div className="flex-1" />
                <Button
                    onClick={handleContinue}
                    disabled={!canContinue || generating}
                    size="lg"
                    className="h-14 px-8 rounded-2xl bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900 font-black text-base hover:bg-zinc-800 dark:hover:bg-zinc-200 shadow-xl transition-all disabled:opacity-50"
                >
                    {generating ? (
                        <span className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Saving…
                        </span>
                    ) : (
                        "Continue →"
                    )}
                </Button>
            </div>
        </div>
    );
}
