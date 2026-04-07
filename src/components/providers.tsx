"use client";
import { QueryClient, QueryClientProvider, QueryCache, MutationCache } from "@tanstack/react-query";
import { useState } from "react";

import { ReactQueryDevtools } from "@tanstack/react-query-devtools";
import { InsufficientCreditsModal } from "@/src/components/organisms/insufficient-credits-modal";
import { useInsufficientCreditsStore } from "@/src/hooks/use-insufficient-credits-store";

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => {
    const handleGlobalError = (error: any) => {
      // Support numeric 402 or structured API error code INSUFFICIENT_CREDITS
      if (
        error?.message?.includes("402") ||
        error?.status === 402 ||
        error?.code === "INSUFFICIENT_CREDITS" ||
        error?.response?.status === 402
      ) {
        useInsufficientCreditsStore.getState().openModal();
      }
    };

    return new QueryClient({
      queryCache: new QueryCache({
        onError: handleGlobalError,
      }),
      mutationCache: new MutationCache({
        onError: handleGlobalError,
      }),
    });
  });

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <InsufficientCreditsModal />
      <ReactQueryDevtools initialIsOpen={false} position="bottom" />
    </QueryClientProvider>
  );
}
