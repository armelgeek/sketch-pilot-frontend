"use client";

import { X, Sparkles, Loader2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Textarea } from "@/src/components/ui/textarea";
import { useStudioStore } from "../store";

interface InsertSceneModalProps {
    onInsert: () => void;
}

export function InsertSceneModal({ onInsert }: InsertSceneModalProps) {
    const {
        isInserting,
        setIsInserting,
        newNarration,
        setNewNarration,
        generating,
    } = useStudioStore();

    if (!isInserting) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm"
            role="dialog"
            aria-modal="true">
            <div className="w-full max-w-md bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-2xl">
                <div className="flex items-center gap-3 px-5 py-4 border-b border-zinc-100">
                    <div className="h-8 w-8 rounded-xl bg-emerald-50 flex items-center justify-center">
                        <Sparkles className="h-4 w-4 text-emerald-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-bold text-zinc-900">Nouvelle Scène</h3>
                        <p className="text-[10px] text-zinc-400">L'IA génère les prompts visuels automatiquement</p>
                    </div>
                    <button
                        onClick={() => setIsInserting(false)}
                        className="ml-auto text-zinc-300 hover:text-zinc-600 transition-colors">
                        <X className="h-4 w-4" />
                    </button>
                </div>
                <div className="p-5 space-y-4">
                    <div>
                        <label htmlFor="new-narration" className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1.5 block">
                            Narration
                        </label>
                        <Textarea
                            id="new-narration"
                            placeholder="Ex: Le chat saute sur le canapé…"
                            value={newNarration}
                            onChange={(e) => setNewNarration(e.target.value)}
                            className="min-h-[100px] bg-zinc-50 border-zinc-200 text-zinc-900 resize-none focus:border-emerald-400 text-sm" />
                    </div>
                    <div className="flex justify-end gap-2">
                        <Button
                            variant="ghost"
                            onClick={() => { setIsInserting(false); setNewNarration(""); }}
                            className="text-zinc-500 hover:bg-zinc-100 rounded-lg text-xs h-8">
                            Annuler
                        </Button>
                        <Button
                            onClick={onInsert}
                            disabled={!newNarration.trim() || generating}
                            className="bg-emerald-500 hover:bg-emerald-400 text-white font-bold rounded-lg px-4 h-8 text-xs gap-1.5">
                            {generating
                                ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                : "Générer la scène"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
