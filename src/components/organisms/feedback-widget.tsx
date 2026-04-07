"use client";

import { useState } from "react";
import { MessageSquare, X, Bug, Lightbulb, ChevronDown, CheckCircle2, Loader2, Info } from "lucide-react";
import { cn } from "@/src/lib/utils";

type FeedbackType = "bug" | "idea" | "other";

export function FeedbackWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [type, setType] = useState<FeedbackType>("bug");
    const [message, setMessage] = useState("");
    const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim()) return;

        setStatus("submitting");

        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api";

            const response = await fetch(`${apiUrl}/v1/feedback`, {
                method: "POST",
                credentials: "include",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ type, message }),
            });

            if (!response.ok) {
                throw new Error("Erreur lors de l'envoi du feedback");
            }

            setStatus("success");
            setTimeout(() => {
                setIsOpen(false);
                setStatus("idle");
                setMessage("");
            }, 2500);
        } catch (error) {
            console.error(error);
            setStatus("error");
        }
    };

    const typeIcons = {
        bug: <Bug className="h-4 w-4 text-rose-500" />,
        idea: <Lightbulb className="h-4 w-4 text-amber-500" />,
        other: <Info className="h-4 w-4 text-blue-500" />
    };

    const typeLabels = {
        bug: "Signaler un bug",
        idea: "Suggérer une idée",
        other: "Autre"
    };

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
            {/* Popover */}
            {isOpen && (
                <div
                    className="mb-4 w-[340px] bg-white rounded-2xl shadow-xl border border-zinc-200/60 overflow-hidden transform transition-all duration-300 origin-bottom-right"
                    style={{ animation: "slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)" }}
                >
                    <div className="flex items-center justify-between px-4 py-3 bg-zinc-50 border-b border-zinc-100">
                        <h3 className="font-semibold text-sm text-zinc-900 flex items-center gap-2">
                            <MessageSquare className="h-4 w-4 text-emerald-600" />
                            Votre avis nous intéresse
                        </h3>
                        <button
                            onClick={() => setIsOpen(false)}
                            className="p-1 rounded-full text-zinc-400 hover:bg-zinc-200/50 hover:text-zinc-600 transition-colors"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="p-4">
                        {status === "success" ? (
                            <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                                <div className="h-12 w-12 rounded-full bg-emerald-50 flex items-center justify-center">
                                    <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="font-medium text-zinc-900">Merci pour votre retour !</p>
                                    <p className="text-xs text-zinc-500 mt-1">Nous allons l'analyser très vite.</p>
                                </div>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="relative">
                                    <button
                                        type="button"
                                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                                        className="w-full flex items-center justify-between px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg hover:border-zinc-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                    >
                                        <div className="flex items-center gap-2">
                                            {typeIcons[type]}
                                            <span className="text-zinc-700">{typeLabels[type]}</span>
                                        </div>
                                        <ChevronDown className="h-4 w-4 text-zinc-400" />
                                    </button>

                                    {isMenuOpen && (
                                        <div className="absolute top-full left-0 w-full mt-1 bg-white border border-zinc-200 rounded-lg shadow-lg py-1 z-10">
                                            {(Object.keys(typeLabels) as FeedbackType[]).map((t) => (
                                                <button
                                                    key={t}
                                                    type="button"
                                                    onClick={() => {
                                                        setType(t);
                                                        setIsMenuOpen(false);
                                                    }}
                                                    className="w-full flex items-center gap-2 px-3 py-2 text-sm hover:bg-zinc-50 text-zinc-700 transition-colors"
                                                >
                                                    {typeIcons[t]}
                                                    {typeLabels[t]}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <textarea
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder={type === "bug" ? "Décrivez le problème rencontré (actions effectuées, message d'erreur...)" : "Partagez votre idée d'amélioration..."}
                                    className="w-full h-28 px-3 py-2 text-sm bg-white border border-zinc-200 rounded-lg resize-none placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-colors"
                                    maxLength={500}
                                />

                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-medium text-zinc-400">
                                        {message.length} / 500
                                    </span>
                                    <button
                                        type="submit"
                                        disabled={!message.trim() || status === "submitting"}
                                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                                    >
                                        {status === "submitting" ? (
                                            <>
                                                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                                Envoi...
                                            </>
                                        ) : (
                                            "Envoyer"
                                        )}
                                    </button>
                                </div>
                                {status === "error" && (
                                    <p className="text-xs text-rose-500 mt-2 text-center">Une erreur est survenue. Veuillez réessayer.</p>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Floating Bubble */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center text-white shadow-lg shadow-emerald-600/30 transition-transform duration-300 hover:scale-105 active:scale-95 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2",
                    isOpen ? "bg-zinc-800 hover:bg-zinc-900 shadow-zinc-800/30" : "bg-emerald-600 hover:bg-emerald-700"
                )}
                aria-label="Ouvrir le widget de feedback"
            >
                {isOpen ? <X className="h-5 w-5" /> : <MessageSquare className="h-5 w-5" />}
            </button>
        </div>
    );
}
