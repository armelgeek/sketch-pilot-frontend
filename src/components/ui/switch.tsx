"use client";

import * as React from "react";
import { cn } from "@/src/lib/utils";

interface SwitchProps extends React.InputHTMLAttributes<HTMLInputElement> {
    checked?: boolean;
    onCheckedChange?: (checked: boolean) => void;
}

const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(
    ({ className, checked, onCheckedChange, ...props }, ref) => {
        return (
            <button
                type="button"
                role="switch"
                aria-checked={checked}
                data-state={checked ? "checked" : "unchecked"}
                onClick={() => onCheckedChange?.(!checked)}
                className={cn(
                    "peer inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-zinc-950 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-zinc-900 data-[state=unchecked]:bg-zinc-200 dark:focus-visible:ring-zinc-300 dark:ring-offset-zinc-950 dark:data-[state=checked]:bg-zinc-50 dark:data-[state=unchecked]:bg-zinc-800",
                    className
                )}
            >
                <span
                    data-state={checked ? "checked" : "unchecked"}
                    className={cn(
                        "pointer-events-none block h-5 w-5 rounded-full bg-white shadow-lg ring-0 transition-transform data-[state=checked]:translate-x-5 data-[state=unchecked]:translate-x-0 dark:bg-zinc-950"
                    )}
                />
            </button>
        );
    }
);
Switch.displayName = "Switch";

export { Switch };
