"use client";

import { useSession } from "@/src/lib/auth-client";
import { NavbarPublic } from "@/src/components/layout/navbar";
import { Footer } from "@/src/components/layout/footer";
import { PricingPreviewSection } from "@/src/components/home/pricing-preview-section";
import { FAQSection } from "@/src/components/home/faq-section";

export default function PricingPage() {
  const { data: session } = useSession();
  const isAuthenticated = !!session?.user;

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-950 selection:bg-amber-500/20 selection:text-amber-600 grain-overlay">
      <NavbarPublic />

      <main className="pt-20">
        <PricingPreviewSection isAuthenticated={isAuthenticated} />
        <FAQSection />
      </main>

      <Footer />
    </div>
  );
}
