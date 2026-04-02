"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Footer } from "@/src/components/layout/footer";
import { NavbarPublic } from "@/src/components/layout/navbar";
import { useSession } from "@/src/lib/auth-client";
import {
  HeroSection,
  LiveDemoSection,
  FeaturesSection,
  HowItWorksSection,
  GallerySection,
  PricingPreviewSection,
  TestimonialsSection,
  FAQSection,
  FinalCTASection,
} from "@/src/components/home";

export default function HomePage() {
  const { data: session } = useSession();

  return (
    <div className="force-light-theme bg-background text-foreground relative flex h-fit flex-col">
      <NavbarPublic />
      <HeroSection isAuthenticated={!!session?.user} />
      <LiveDemoSection />
      <FeaturesSection />
      <HowItWorksSection />
      <GallerySection />
      <PricingPreviewSection isAuthenticated={!!session?.user} />
      <TestimonialsSection />
      <FAQSection />
      <FinalCTASection isAuthenticated={!!session?.user} />
      <Footer />
    </div>
  );
}
