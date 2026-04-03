"use client";

import { useSession } from "@/src/lib/auth-client";
import { Footer } from "@/src/components/layout/footer";
import { NavbarPublic } from "@/src/components/layout/navbar";
import {
  HeroSection,
  PlatformsTicker,
  ProcessSection,
  VoiceoverSection,
  ConsistentCharacterSection,
  PricingPreviewSection,
  FAQSection
} from "@/src/components/home";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-zinc-950 selection:bg-amber-500/20 selection:text-amber-600 grain-overlay">
      <NavbarPublic />
      <main>
        <HeroSection isAuthenticated={!!session?.user} />
        <PlatformsTicker />
        <ProcessSection />
        <VoiceoverSection />
        <ConsistentCharacterSection />
        <PricingPreviewSection isAuthenticated={!!session?.user} />
        <FAQSection />
      </main>
      <Footer />
    </div>
  );
}
