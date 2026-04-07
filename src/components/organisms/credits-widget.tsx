"use client";

import { cn } from "@/src/lib/utils";
import Link from "next/link";

interface CreditsWidgetProps {
    credits: number;
    totalCredits: number;
    subLoading?: boolean;
}

export function CreditsWidget({
    credits,
    totalCredits,
    subLoading = false,
}: CreditsWidgetProps) {
    const pct = totalCredits > 0 ? (credits / totalCredits) * 100 : 0;
    const isLow = pct < 10;

    return (
        <div
            className={cn(
                "relative inline-flex items-center gap-2.5 px-3.5 h-[42px] overflow-hidden",
                "rounded-full font-sans min-w-[220px]",
                "bg-white border",
                isLow
                    ? "border-red-200"
                    : "border-black/[0.12]"
            )}
        >
            {/* Coin icon */}
            <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                className="shrink-0"
            >
                <circle
                    cx="7" cy="7" r="6.5"
                    stroke={isLow ? "#e05a3a" : "#c9b35b"}
                    strokeWidth="1"
                />
                <circle
                    cx="7" cy="7" r="4"
                    fill={isLow ? "#e05a3a" : "#e8c84a"}
                    opacity="0.6"
                />
            </svg>

            {/* Text */}
            <div className="flex flex-col justify-center leading-snug">
                {subLoading ? (
                    <>
                        <div className="w-24 h-2 rounded bg-gray-100 mb-1" />
                        <div className="w-16 h-2 rounded bg-gray-50" />
                    </>
                ) : (
                    <>
                        <span className="text-[12px] text-gray-400 tracking-[0.01em]">
                            Passer à l'offre Pro
                        </span>
                        <span
                            className={cn(
                                "text-[11px] font-medium",
                                isLow ? "text-red-500" : "text-gray-300"
                            )}
                        >
                            {isLow
                                ? `Only ${credits.toLocaleString()} credits left`
                                : `${credits.toLocaleString()} free credits left`}
                        </span>
                    </>
                )}
            </div>

            {/* Upgrade button */}
            <div className="ml-auto">
                <Link href={'/subscription'}
                    className={cn(
                        "rounded-full px-3.5 py-1 text-[12px] font-medium tracking-[0.01em] border-none cursor-pointer transition-opacity",
                        subLoading
                            ? "bg-gray-100 text-transparent cursor-default"
                            : isLow
                                ? "bg-red-500 text-white hover:bg-red-600"
                                : "bg-gray-900 text-white hover:bg-gray-700"
                    )}
                >
                    Upgrade
                </Link>
            </div>

            {/* Progress bar */}
            <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-black/[0.05]">
                <div
                    className="h-full rounded-r-[1px] transition-[width] duration-700 ease-out"
                    style={{
                        width: `${Math.max(4, pct)}%`,
                        background: isLow ? "#e05a3a" : "#e8c84a",
                    }}
                />
            </div>
        </div>
    );
}