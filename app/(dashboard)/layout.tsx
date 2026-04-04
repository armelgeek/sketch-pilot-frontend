"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { DashboardSidebar } from "@/src/components/layout/dashboard-sidebar";
import { DashboardHeader } from "@/src/components/layout/dashboard-header";
import { AdminSidebar } from "@/src/components/admin/admin-sidebar";
import { AdminHeader } from "@/src/components/admin/admin-header";
import { SSEProgressProvider } from "@/src/contexts/sse-progress-context";
import { SSEProgressOverlay } from "@/src/components/ui/sse-progress-overlay";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
      return;
    }
    if (!isPending && session && pathname === "/dashboard") {
      const userId = session.user?.id;
      if (userId) {
        const done = localStorage.getItem(`sketch_pilot_onboarded_${userId}`);
        if (!done) {
          router.push("/onboarding");
        }
      }
    }
  }, [session, isPending, router, pathname]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-300 border-t-zinc-900"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isAdminRoute = pathname?.startsWith("/admin");
  const isOnboarding = pathname === "/onboarding";

  if (isAdminRoute) {
    return (
      <div className="flex min-h-screen bg-[#FAFAFA]">
        <AdminSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <AdminHeader />
          <main className="flex-1 overflow-auto">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 py-8 pt-10">
              {children}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (isOnboarding) {
    return (
      <div className="min-h-screen bg-[#FAFAFA]">
        {children}
      </div>
    );
  }

  const isStudio = pathname?.startsWith("/generate/");

  return (
    <SSEProgressProvider>
      <SSEProgressOverlay />
      <div className="flex min-h-screen bg-[#FAFAFA]">
        <DashboardSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <main className="flex-1 overflow-auto">
            {isStudio ? (
              children
            ) : (
              <div className="px-6 py-8">
                {children}
              </div>
            )}
          </main>
        </div>
      </div>
    </SSEProgressProvider>
  );
}
