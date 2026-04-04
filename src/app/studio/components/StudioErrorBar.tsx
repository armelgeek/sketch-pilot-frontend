"use client";

import { AlertCircle, X } from "lucide-react";
import { useStudioStore } from "../store";

export function StudioErrorBar() {
    const { error, setError } = useStudioStore();

    if (!error) return null;

    return (
        <div role="alert" className="flex items-center gap-3 px-4 py-2 bg-red-50 border-b border-red-200 text-red-600 text-xs shrink-0">
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            <span className="flex-1">{error}</span>
            <button
                onClick={() => setError(null)}
                aria-label="Fermer"
                className="text-red-400 hover:text-red-600 transition-colors">
                <X className="h-3.5 w-3.5" />
            </button>
        </div>
    );
}
