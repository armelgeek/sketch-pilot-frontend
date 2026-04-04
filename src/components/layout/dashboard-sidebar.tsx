"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard, Video, Zap, ChevronLeft, ChevronRight,
  LogOut, Plus, Settings, LifeBuoy, Search, ChevronsUpDown, User, CreditCard
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useSession, signOut } from "@/src/lib/auth-client";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger
} from "@/src/components/ui/dropdown-menu";
import { videosService } from "@/src/services/videos-service";

const navItems = [
  { href: "/dashboard", label: "Nouvelle video", icon: Plus },
  { href: "/videos", label: "Mes Vidéos", icon: Video }
];

const secondaryNavItems = [
  { href: "/settings", label: "Settings", icon: Settings },
  { href: "/help", label: "Get Help", icon: LifeBuoy }
];

export function DashboardSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const { data: session } = useSession();
  const [recentVideos, setRecentVideos] = useState<any[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const videos = await videosService.getAll();
        setRecentVideos(videos.slice(0, 3));
      } catch (err) {
        console.error("Failed to fetch recent videos:", err);
      }
    };
    fetchRecent();
  }, []);

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
        "flex flex-col h-screen sticky top-0 bg-zinc-50/50 border-r border-gray-200 transition-all duration-300 shrink-0 z-40",
        collapsed ? "w-16" : "w-64"
      )}
    >
      {/* Logo */}
      <div className={cn("flex items-center h-16 px-4 border-b border-zinc-200/40 bg-white/50 backdrop-blur-sm", collapsed ? "justify-center" : "justify-between")}>
        {!collapsed && (
          <Link href="/dashboard" className="flex items-center gap-2 font-black text-base text-zinc-900 hover:opacity-80 transition-opacity">
            <span className="text-lg font-bold tracking-tighter">✏️ Sketch Pilot</span>
          </Link>
        )}
        {collapsed && (
          <Link href="/dashboard" className="text-lg">✏️</Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="h-6 w-6 rounded-md hover:bg-zinc-200/50 flex items-center justify-center text-zinc-400 hover:text-zinc-600 transition-colors"
        >
          {collapsed ? <ChevronRight className="h-3.5 w-3.5" /> : <ChevronLeft className="h-3.5 w-3.5" />}
        </button>
      </div>

      {/* Navigation Content */}
      <div className="flex-1 flex flex-col min-h-0 overflow-y-auto overflow-x-hidden scrollbar-hide px-3 py-6">
        <div className="space-y-8">
          {/* Main Navigation */}
          <div>
            {!collapsed && (
              <h3 className="px-3 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-3 opacity-80">
                Navigation
              </h3>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname?.startsWith(item.href));
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-bold transition-all",
                      isActive
                        ? "bg-zinc-900 text-white shadow-lg shadow-zinc-200"
                        : "text-zinc-500 hover:bg-white hover:text-zinc-900 hover:shadow-sm hover:ring-1 hover:ring-zinc-200/50",
                      collapsed && "justify-center px-0 h-10 w-10 mx-auto"
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-white" : "text-zinc-400")} />
                    {!collapsed && <span>{item.label}</span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Recent Videos Section */}
          {recentVideos.length > 0 && (
            <div>
              {!collapsed && (
                <div className="flex items-center justify-between px-3 mb-3">
                  <h3 className="text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] opacity-80">
                    Récent
                  </h3>
                  <Link href="/videos" className="text-[10px] font-bold text-amber-600 hover:underline">Voir tout</Link>
                </div>
              )}
              <div>
                {recentVideos.map((video) => (
                  <Link
                    key={video.id}
                    href={`/generate/${video.id}/script`}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 text-[13px] font-bold transition-all group",
                      collapsed && "justify-center px-0 h-10 w-10 mx-auto"
                    )}
                    title={collapsed ? video.title || video.topic : undefined}
                  >
                    {!collapsed ? (
                      <>
                        <div className="h-6 w-6 shrink-0 rounded-lg bg-zinc-50 flex items-center justify-center border border-zinc-100 group-hover:bg-white transition-colors">
                          <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover:bg-amber-500 transition-colors" />
                        </div>
                        <span className="truncate text-zinc-600 group-hover:text-zinc-900 transition-colors">
                          {video.title || video.topic}
                        </span>
                      </>
                    ) : (
                      <div className="w-1.5 h-1.5 rounded-full bg-zinc-300 group-hover:bg-amber-500 transition-colors" />
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Secondary / Footer Navigation */}
      <div className="px-3 py-6 space-y-4 border-t border-zinc-200/40">
        {!collapsed && (
          <h3 className="px-3 text-[10px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-1 opacity-80">
            Support
          </h3>
        )}
        <nav className="space-y-1">
          {secondaryNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2 rounded-xl text-[13px] font-bold text-zinc-500 hover:bg-white hover:text-zinc-900 hover:shadow-sm hover:ring-1 hover:ring-zinc-200/50 transition-all",
                  collapsed && "justify-center px-0 h-10 w-10 mx-auto"
                )}
                title={collapsed ? item.label : undefined}
              >
                <Icon className="h-4 w-4 shrink-0 text-zinc-400" />
                {!collapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer (shadcn-style) */}
      <div className="p-2 border-t border-zinc-100">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className={cn(
              "flex items-center gap-2 w-full p-2 rounded-xl hover:bg-zinc-50 transition-all group focus:outline-none",
              collapsed && "justify-center"
            )}>
              <Avatar className="h-8 w-8 rounded-lg shrink-0 overflow-hidden shadow-sm">
                <AvatarImage src={session?.user?.image || ""} alt={userName} />
                <AvatarFallback className="bg-zinc-100 font-bold text-[10px] text-zinc-500 rounded-lg">{userInitials}</AvatarFallback>
              </Avatar>

              {!collapsed && (
                <>
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-xs font-bold text-zinc-900 truncate tracking-tight">{userName}</div>
                    <div className="text-[10px] text-zinc-400 truncate font-medium">{session?.user?.email}</div>
                  </div>
                  <ChevronsUpDown className="h-3.5 w-3.5 text-zinc-400 group-hover:text-zinc-600 transition-colors shrink-0" />
                </>
              )}
            </button>
          </DropdownMenuTrigger>

          <DropdownMenuContent align="end" side={collapsed ? "right" : "bottom"} className="w-56 p-1.5 rounded-2xl border-zinc-200 shadow-xl" sideOffset={8}>
            <DropdownMenuLabel className="px-3 py-2 mb-1">
              <p className="text-xs font-black text-zinc-900">{userName}</p>
              <p className="text-[10px] text-zinc-400 font-medium truncate">{session?.user?.email}</p>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-zinc-100 mx-1" />

            <DropdownMenuItem asChild className="rounded-xl h-9 px-3 cursor-pointer font-semibold text-xs gap-2">
              <Link href="/profile"><User className="h-3.5 w-3.5 opacity-60" /> Mon Profil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl h-9 px-3 cursor-pointer font-semibold text-xs gap-2">
              <Link href="/subscription"><CreditCard className="h-3.5 w-3.5 opacity-60" /> Abonnement</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="rounded-xl h-9 px-3 cursor-pointer font-semibold text-xs gap-2">
              <Link href="/settings"><Settings className="h-3.5 w-3.5 opacity-60" /> Paramètres</Link>
            </DropdownMenuItem>

            <DropdownMenuSeparator className="bg-zinc-100 mx-1" />

            <DropdownMenuItem
              onClick={handleSignOut}
              className="rounded-xl h-9 px-3 cursor-pointer text-red-600 font-black text-xs gap-2 focus:bg-red-50 focus:text-red-700"
            >
              <LogOut className="h-3.5 w-3.5" /> Déconnexion
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  );
}
