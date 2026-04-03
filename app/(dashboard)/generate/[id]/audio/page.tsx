"use client";

import { use, useEffect } from "react";
import { useRouter } from "next/navigation";

// Audio & production settings are now part of the unified Studio (storyboard page)
export default function AudioRedirectPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();

    useEffect(() => {
        router.replace(`/generate/${resolvedParams.id}/storyboard`);
    }, [resolvedParams.id, router]);

    return (
        <div className="min-h-[50vh] flex items-center justify-center bg-zinc-950">
            <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-700 border-t-violet-500" />
        </div>
    );
}
