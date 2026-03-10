import { steps } from "./data";

export function HowItWorksSection() {
  return (
    <section className="bg-white dark:bg-zinc-900 border-y border-zinc-200 dark:border-zinc-800">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold">Comment ça marche ?</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((s) => (
            <div key={s.n} className="flex flex-col items-center text-center gap-4">
              <div className="text-5xl font-extrabold text-zinc-200 dark:text-zinc-700">{s.n}</div>
              <h3 className="text-lg font-semibold">{s.title}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
