"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useUtmStore } from "../store";
import { UtmParams } from "../schema";

export function useUtmTracking() {
    const searchParams = useSearchParams();
    const setUtmParams = useUtmStore((state) => state.setUtmParams);

    useEffect(() => {
        const params: Partial<UtmParams> = {};

        const utmSource = searchParams.get("utm_source");
        const utmMedium = searchParams.get("utm_medium");
        const utmCampaign = searchParams.get("utm_campaign");
        const utmTerm = searchParams.get("utm_term");
        const utmContent = searchParams.get("utm_content");

        if (utmSource) params.utmSource = utmSource;
        if (utmMedium) params.utmMedium = utmMedium;
        if (utmCampaign) params.utmCampaign = utmCampaign;
        if (utmTerm) params.utmTerm = utmTerm;
        if (utmContent) params.utmContent = utmContent;

        if (Object.keys(params).length > 0) {
            setUtmParams(params);
        }
    }, [searchParams, setUtmParams]);
}
