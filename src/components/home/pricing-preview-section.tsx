"use client";

import Link from "next/link";
import { Check, ArrowRight, Sparkles } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface PricingPreviewSectionProps {
  isAuthenticated?: boolean;
}

export function PricingPreviewSection({ isAuthenticated }: PricingPreviewSectionProps) {
  const plans = [
    {
      id: "free",
      name: "Starter",
      description: "Test the power of Sketch Pilot.",
      price: "$0",
      features: ["3 videos per month", "Watermark included", "720p export", "Basic niches access"],
      highlighted: false,
    },
    {
      id: "pro",
      name: "Pro",
      description: "For serious creators publishing weekly.",
      price: "$19",
      period: "/month",
      features: ["Unlimited videos", "No watermark", "1080p / 4K export", "Priority rendering", "Premium Kokoro voices"],
      highlighted: true,
      badge: "Most Popular",
    },
    {
      id: "studio",
      name: "Studio",
      description: "For agencies and mass automation.",
      price: "$49",
      period: "/month",
      features: ["Everything in Pro", "Full API access", "Bulk generation", "Complete white label"],
      highlighted: false,
    },
  ];

  return (
    <section className="relative py-32 bg-[#FAFAFA] overflow-hidden border-t border-zinc-100" id="pricing">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="max-w-2xl mx-auto text-center mb-20">
          <h2 className="text-sm font-black uppercase tracking-[0.4em] text-amber-500 mb-4">
            Pricing
          </h2>
          <p className="text-4xl md:text-5xl font-heading font-extrabold tracking-tight text-zinc-950 mb-6">
            Simple. Transparent. No surprises.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={cn(
                "relative flex flex-col p-10 rounded-[2.5rem] transition-all duration-500",
                plan.highlighted
                  ? "bg-white border-2 border-amber-400 shadow-[0_20px_80px_-20px_rgba(245,158,11,0.2)] scale-100 md:scale-105 z-10"
                  : "bg-white border border-zinc-200 hover:border-zinc-300 shadow-sm"
              )}
            >
              {plan.badge && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-20">
                  <span className="flex items-center gap-2 text-[10px] font-bold tracking-widest uppercase bg-amber-500 text-white px-5 py-2 rounded-full shadow-lg shadow-amber-500/20">
                    <Sparkles className="h-3 w-3" />
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-2xl font-heading font-bold text-zinc-950 mb-3">{plan.name}</h3>
                <p className="text-zinc-500 text-sm h-10">{plan.description}</p>
                <div className="flex items-baseline gap-1 mt-6">
                  <span className="text-5xl font-heading font-extrabold text-zinc-950">{plan.price}</span>
                  {plan.period && <span className="text-xl font-bold text-zinc-500">{plan.period}</span>}
                </div>
              </div>

              <div className="flex-1 space-y-4 mb-10">
                {plan.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-4">
                    <div className={cn(
                      "flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full",
                      plan.highlighted ? "bg-amber-100 text-amber-600" : "bg-zinc-100 text-zinc-600"
                    )}>
                      <Check className="h-3 w-3" />
                    </div>
                    <span className="text-sm font-medium text-zinc-800">{feature}</span>
                  </div>
                ))}
              </div>

              <Link
                href={isAuthenticated ? "/generate" : "/register"}
                className={cn(
                  "w-full flex items-center justify-center gap-2 h-14 rounded-full font-bold transition-all active:scale-95 group",
                  plan.highlighted
                    ? "bg-amber-500 text-white hover:bg-amber-600 shadow-[0_4px_20px_rgba(245,158,11,0.2)]"
                    : "bg-zinc-950 text-white hover:bg-zinc-800"
                )}
              >
                {isAuthenticated ? "Upgrade" : "Get Started"}
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
