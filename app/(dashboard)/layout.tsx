"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useSession } from "@/src/lib/auth-client";
import { Navbar } from "@/src/components/layout/navbar";
import { cn } from "@/src/lib/utils";

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
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!session) {
    return null;
  }

  const isAdminRoute = pathname?.startsWith("/admin");

  return (
    <div className="min-h-screen">
      {!isAdminRoute && <Navbar />}
      <main className={cn(!isAdminRoute && "pt-20")}>{children}</main>
    </div>
  );
}
