import { ReactNode } from "react";
import Link from "next/link";

export default function SubscriptionLayout({ children }: { children: ReactNode }) {
  const tabs = [
    { name: "Abonnement", href: "/subscription", value: "subscription" },
    { name: "Factures", href: "/subscription/invoices", value: "invoices" },
    { name: "Paiement", href: "/subscription/payment", value: "payment" }
  ];

  return (
    <div className="space-y-6">
      <div className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {tabs.map((tab) => (
            <Link key={tab.value} href={tab.href}>
              <button className="whitespace-nowrap px-3 py-2 text-sm font-medium border-b-2 border-transparent hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors">
                {tab.name}
              </button>
            </Link>
          ))}
        </div>
      </div>
      <div>{children}</div>
    </div>
  );
}
