import { ReactNode } from "react";
import Link from "next/link";

export default function SubscriptionLayout({ children }: { children: ReactNode }) {

  return (
    <div className="space-y-6 py-3">
      <div>{children}</div>
    </div>
  );
}
