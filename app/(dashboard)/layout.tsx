"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { DashboardSidebar } from "@/src/components/layout/dashboard-sidebar";
import { AdminSidebar } from "@/src/components/admin/admin-sidebar";
import { AdminHeader } from "@/src/components/admin/admin-header";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session, isPending } = useSession();

  useEffect(() => {
    if (!isPending && !session) {
      router.push("/login");
    }
  }, [session, isPending, router]);

  if (isPending) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAFA] grain-overlay">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-amber-500 border-t-transparent"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isAdminRoute = pathname?.startsWith("/admin");

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

  return (
    <div className="flex min-h-screen bg-[#FAFAFA] selection:bg-amber-500/20 selection:text-amber-600 grain-overlay">
      <DashboardSidebar />
      <main className="flex-1 overflow-auto min-w-0">
        <div className="mx-auto max-w-5xl px-6 py-8">
          {children}
        </div>
      </main>
    </div>
  );
}

