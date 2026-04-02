"use client";

import React from "react";
import Link from "next/link";

const Logo = () => {
    return (
        <div className="flex items-center gap-2">
            <svg width="28" height="28" viewBox="0 0 531 531" fill="none" xmlns="http://www.w3.org/2000/svg" className="text-emerald-600 dark:text-emerald-400">
                <path d="M80 101.11V430.33L265.85 265.72L80 101.11Z" fill="currentColor"></path>
                <path d="M175.47 101V430.22L361.32 265.61L175.47 101Z" fill="currentColor" fill-opacity="0.75"></path>
                <path d="M265.74 101V430.22L451.59 265.61L265.74 101Z" fill="currentColor" fill-opacity="0.5"></path>
            </svg>
            <span className="text-foreground flex origin-left items-center text-xl font-bold max-sm:hidden">
                Sketch Pilot
            </span>
        </div>
    );
};

export default Logo;
