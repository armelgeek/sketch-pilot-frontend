"use client";

import React from "react";
import { cn } from "@/src/lib/utils";

export function HeaderButton({
    children,
    onClick,
    variant = "secondary",
    icon: Icon
}: {
    children: React.ReactNode;
    onClick?: () => void;
    variant?: "primary" | "secondary";
    icon?: React.ElementType;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "h-8 px-3 rounded-lg flex items-center gap-1.5 text-xs font-medium transition-all active:scale-95",
                variant === "primary"
                    ? "bg-stone-800 text-white hover:bg-stone-900"
                    : "border border-stone-200 text-stone-600 hover:text-stone-900 hover:bg-stone-50"
            )}
        >
            {Icon && <Icon className="h-3.5 w-3.5" />}
            {children}
        </button>
    );
}
