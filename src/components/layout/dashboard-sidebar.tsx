"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, Video, Library, Zap, ChevronLeft, ChevronRight, LogOut, Coins, Plus } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useSession, signOut } from "@/src/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { useSubscriptionManager } from "@/src/hooks/use-subscription-manager";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/generate", label: "Générer", icon: Plus },
  { href: "/videos", label: "Mes Vidéos", icon: Video },
  { href: "/subscription", label: "Abonnement", icon: Zap },
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  const { subscriptionStatus } = useSubscriptionManager();

  const handleSignOut = async () => {
    await signOut({ fetchOptions: { onSuccess: () => router.push("/login") } });
  };

  const userName = session?.user?.name || session?.user?.email || "User";
  const userInitials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <aside
      className={cn(
        "flex flex-col h-screen sticky top-0 bg-white border-r border-zinc-100 transition-all duration-300 shrink-0 z-40",
        collapsed ? "w-16" : "w-60"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-14 px-4 border-b border-zinc-100", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-black text-base text-zinc-900 hover:opacity-80 transition-opacity">
            <span className="text-lg">✏️</span>
            <span className="tracking-tight">Sketch Pilot</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="text-lg">✏️</Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-6 w-6 rounded-md hover:bg-zinc-100 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Credits */}
      <div className={cn("mx-3 mt-3", collapsed && "mx-2")}>
        <Link
          href="/subscription"
          className={cn(
            "flex items-center gap-2 rounded-xl bg-zinc-50 border border-zinc-100 px-3 py-2 hover:bg-zinc-100 transition-colors",
            collapsed && "justify-center px-2"
          )}
          title={collapsed ? `${subscriptionStatus?.remainingCredits ?? 0} crédits` : undefined}
        >
          <div className="h-6 w-6 rounded-lg bg-amber-100 flex items-center justify-center text-amber-600 shrink-0">
            <Coins className="h-3.5 w-3.5" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-none min-w-0">
              <span className="text-xs font-black text-zinc-900">{subscriptionStatus?.remainingCredits ?? 0} crédits</span>
              <span className="text-[10px] text-zinc-400 font-medium truncate">{subscriptionStatus?.planName || "Plan Gratuit"}</span>
            </div>
          )}
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold transition-all",
                isActive
                  ? "bg-zinc-900 text-white"
                  : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900",
                collapsed && "justify-center px-2"
              )}
              title={collapsed ? item.label : undefined}
            >
              <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-zinc-400")} />
              {!collapsed && <span>{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* User Footer */}
      <div className="border-t border-zinc-100 p-3">
        {!collapsed ? (
          <div className="flex items-center gap-2.5">
            <Avatar className="h-7 w-7 shrink-0">
              <AvatarImage src={session?.user?.image || ""} alt={userName} />
              <AvatarFallback className="bg-zinc-100 font-black text-[10px] text-zinc-600">{userInitials}</AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-zinc-900 truncate">{userName}</div>
              <div className="text-[10px] text-zinc-400 truncate">{session?.user?.email}</div>
            </div>
            <button
              onClick={handleSignOut}
              className="h-6 w-6 rounded-md hover:bg-red-50 flex items-center justify-center text-zinc-400 hover:text-red-500 transition-colors shrink-0"
              title="Se déconnecter"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        ) : (
          <button
            onClick={handleSignOut}
            className="flex items-center justify-center h-8 w-8 rounded-lg hover:bg-red-50 text-zinc-400 hover:text-red-500 transition-colors mx-auto"
            title="Se déconnecter"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </aside>
  );
}
