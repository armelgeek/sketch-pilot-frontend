import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/src/components/ui/accordion";
import { faqs } from "./data";

export function FAQSection() {
  return (
    <section className="relative py-24 bg-white dark:bg-zinc-950 overflow-hidden border-y border-zinc-200/60 dark:border-zinc-800/60">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black tracking-tighter text-zinc-900 dark:text-zinc-50">
            Questions <span className="text-emerald-600 dark:text-emerald-400">fréquentes</span>
          </h2>
          <p className="mt-2 text-lg text-zinc-500 dark:text-zinc-400 font-medium">
            Tout ce que vous devez savoir pour démarrer votre aventure Sketch Pilot.
          </p>
        </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem
              key={i}
              value={`faq-${i}`}
              className="rounded-2xl border border-zinc-200/60 dark:border-zinc-800/60 px-6 bg-white dark:bg-zinc-900/50 transition-all hover:border-emerald-500/30"
            >
              <AccordionTrigger className="hover:no-underline py-6 font-black text-left text-zinc-900 dark:text-zinc-50 transition-colors hover:text-emerald-600 dark:hover:text-emerald-400">
                {faq.q}
              </AccordionTrigger>
              <AccordionContent className="pb-6 text-zinc-600 dark:text-zinc-400 font-medium leading-relaxed">
                {faq.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>

        <div className="mt-16 p-8 rounded-[2rem] bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 text-center">
          <p className="text-sm font-bold text-zinc-600 dark:text-zinc-400 mb-4">
            Vous avez une autre question ?
          </p>
          <button className="text-emerald-600 dark:text-emerald-400 font-black text-sm uppercase tracking-widest hover:underline">
            Contactez notre support →
          </button>
        </div>
      </div>
    </section>
  );
}
