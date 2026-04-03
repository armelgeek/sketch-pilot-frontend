"use client";

import { useState } from "react";
import { Plus, Minus } from "lucide-react";
import { cn } from "@/src/lib/utils";

const faqs = [
  {
    question: "Will YouTube detect this as AI?",
    answer: "No. Our visual engine synthesizes unique, handcrafted-style scenes, and the voiceover engine provides human-like intonation. Your videos are fully monetizable and original.",
  },
  {
    question: "What niches perform best?",
    answer: "Currently, our top creators are seeing massive success in Finance, Psychology, Productivity, History, and True Crime. The engine is custom-tuned for high-retention storytelling in these formats.",
  },
  {
    question: "Does the voiceover sound natural?",
    answer: "Yes, it's indistinguishable from a professional narrator. We use latest-generation audio models that infer natural pauses, breathing, and emotional inflection automatically based on your script context.",
  },
  {
    question: "Can I customize the script before rendering?",
    answer: "Absolutely. You get full edit access to the generated editorial script. Add your own facts, change the tone, or adjust pacing before you commit to generating the visual and audio assets.",
  },
  {
    question: "How does the pricing and credit system work?",
    answer: "1 credit equals 1 generated video. Pro users receive unlimited credits, empowering you to scale your channels rapidly without worrying about per-video costs.",
  },
];

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section className="py-24 md:py-32 bg-white border-t border-zinc-100" id="faq">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <div className="text-center md:text-left mb-16 md:mb-24 flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-100 pb-12">
          <div className="max-w-xl">
            <h2 className="text-[11px] font-bold uppercase tracking-[0.2em] text-amber-500 mb-4">
              FAQ
            </h2>
            <h3 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-zinc-950 tracking-tight leading-[1.1]">
              Questions? <br />
              <span className="text-zinc-400">We have answers.</span>
            </h3>
          </div>
        </div>

        <div className="space-y-2">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <button
                key={index}
                className={cn(
                  "w-full text-left group transition-all duration-300 border-b",
                  isOpen ? "border-zinc-900 pb-8 pt-6" : "border-zinc-200 pb-6 pt-6 hover:border-amber-500/50"
                )}
                onClick={() => setOpenIndex(isOpen ? null : index)}
              >
                <div className="flex items-start justify-between gap-6">
                  <span className={cn(
                    "text-xl md:text-2xl font-bold tracking-tight transition-colors duration-300",
                    isOpen ? "text-zinc-950" : "text-zinc-700 group-hover:text-amber-500"
                  )}>
                    {faq.question}
                  </span>
                  <div className={cn(
                    "mt-1 w-6 h-6 rounded-full flex items-center justify-center shrink-0 transition-colors duration-300",
                    isOpen ? "bg-amber-500 text-white" : "bg-zinc-100 text-zinc-400 group-hover:bg-amber-100 group-hover:text-amber-600"
                  )}>
                    {isOpen ? <Minus className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                  </div>
                </div>
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isOpen ? "grid-rows-[1fr] opacity-100 mt-5" : "grid-rows-[0fr] opacity-0 mt-0"
                  )}
                  style={{ display: "grid" }}
                >
                  <div className="overflow-hidden">
                    <p className="text-base md:text-lg text-zinc-500 leading-relaxed max-w-3xl pr-8">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}
