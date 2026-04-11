"use client";

import { useCallback } from "react";
import type { Locale } from "@/src/i18n/request";

export function useLocale() {
    const setLocale = useCallback((locale: Locale) => {
        document.cookie = `locale=${locale};path=/;max-age=31536000;SameSite=Lax`;
        window.location.reload();
    }, []);

    const getCurrentLocale = useCallback((): Locale => {
        const match = document.cookie.match(/(?:^|;\s*)locale=([^;]*)/);
        return (match?.[1] as Locale) ?? "fr";
    }, []);

    return { setLocale, getCurrentLocale };
}
