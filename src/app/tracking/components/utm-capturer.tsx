"use client";

import { Suspense } from "react";
import { useUtmTracking } from "../hooks/use-utm-tracking";

function UtmCapturerInner() {
    useUtmTracking();
    return null;
}

export function UtmCapturer() {
    return (
        <Suspense fallback={null}>
            <UtmCapturerInner />
        </Suspense>
    );
}
