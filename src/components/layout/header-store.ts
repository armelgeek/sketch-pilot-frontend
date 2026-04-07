"use client";

import { create } from "zustand";
import type { LucideIcon } from "lucide-react";
import React from "react";

interface HeaderState {
    actions: React.ReactNode | null;
    status: React.ReactNode | null;
    customTitle: string | null;
    customIcon: LucideIcon | null;
    customBreadcrumb: { label: string; href?: string }[] | null;

    setHeaderDetails: (details: Partial<Omit<HeaderState, "setHeaderDetails" | "resetHeaderDetails">>) => void;
    resetHeaderDetails: () => void;
}

export const useHeaderStore = create<HeaderState>((set) => ({
    actions: null,
    status: null,
    customTitle: null,
    customIcon: null,
    customBreadcrumb: null,

    setHeaderDetails: (details) => set((state) => ({ ...state, ...details })),
    resetHeaderDetails: () => set({
        actions: null,
        status: null,
        customTitle: null,
        customIcon: null,
        customBreadcrumb: null,
    }),
}));
