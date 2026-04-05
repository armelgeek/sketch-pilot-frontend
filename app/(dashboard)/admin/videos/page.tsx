"use client";

import { useState } from "react";
import { useAdminVideos, useAdminActions, AdminVideo } from "@/src/app/admin";
import {
    Search, Trash2, ExternalLink, Clock, CheckCircle2,
    AlertCircle, PlayCircle, ChevronLeft, ChevronRight,
    Filter, User, MoreHorizontal, Settings
} from "lucide-react";
import { Input } from "@/src/components/ui/input";
import { Progress } from "@/src/components/ui/progress";
import { ConfirmDialog } from "@/src/components/organisms/confirm-dialog";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

const STATUS_CONFIG: Record<string, { pill: string; dot: string; label: string; icon: React.ReactNode }> = {
    completed: { pill: "bg-amber-50 text-amber-600 border-amber-100/50", dot: "bg-amber-500", label: "Terminé", icon: <CheckCircle2 className="h-3 w-3" /> },
    failed: { pill: "bg-red-50 text-red-500 border-red-100/50", dot: "bg-red-500", label: "Échec", icon: <AlertCircle className="h-3 w-3" /> },
    generating: { pill: "bg-amber-50 text-amber-600 border-amber-100/50", dot: "bg-amber-500", label: "Génération", icon: <PlayCircle className="h-3 w-3" /> },
    processing: { pill: "bg-amber-50 text-amber-600 border-amber-100/50", dot: "bg-amber-500", label: "Traitement", icon: <PlayCircle className="h-3 w-3" /> },
    queued: { pill: "bg-zinc-50 text-zinc-500 border-zinc-200/50", dot: "bg-zinc-400", label: "En file", icon: <Clock className="h-3 w-3" /> },
};

const STATUS_OPTIONS = ["queued", "generating", "processing", "completed", "failed"];
const PAGE_SIZE = 12;

export default function AdminVideosPage() {
    const router = useRouter();
    const [page, setPage] = useState(1);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("");
    const [videoToDelete, setVideoToDelete] = useState<AdminVideo | null>(null);

    const { data: videosRes, isLoading } = useAdminVideos({ page, limit: PAGE_SIZE, search, status: statusFilter });
    const { deleteVideo, isPending } = useAdminActions();

    const videos: AdminVideo[] = videosRes?.data || [];
    const total: number = videosRes?.total || 0;

    const handleDelete = async () => {
        if (!videoToDelete) return;
        try { await deleteVideo(videoToDelete.id); setVideoToDelete(null); }
        catch (e) { console.error(e); }
    };

    const status = (s: string) => STATUS_CONFIG[s] ?? { pill: "bg-zinc-50 text-zinc-400", dot: "bg-zinc-300", label: s, icon: null };

    return (
        <div className="space-y-10 pb-20 max-w-[1600px] mx-auto">

            {/* ── Tabs Navigation & Search (Matched with Screenshot) ── */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-100/80">
                <div className="flex items-center gap-10">
                    {["Projects", "Characters", "Videos"].map((tab) => (
                        <button
                            key={tab}
                            onClick={() => tab === "Projects" ? router.push("/admin") : tab === "Videos" ? null : null}
                            className={cn(
                                "pb-4 text-[15px] font-black tracking-tight transition-all relative px-1",
                                tab === "Videos"
                                    ? "text-zinc-900 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-zinc-900"
                                    : "text-zinc-400 hover:text-zinc-600"
                            )}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div className="flex items-center gap-4 pb-4">
                    {/* Search Field */}
                    <div className="relative group">
                        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-300 group-focus-within:text-zinc-900 transition-colors" />
                        <Input
                            placeholder="Search videos..."
                            value={search}
                            onChange={e => { setSearch(e.target.value); setPage(1); }}
                            className="h-10 w-72 pl-10 rounded-xl bg-zinc-50 border-none shadow-none text-[13px] font-black text-zinc-900 placeholder:text-zinc-300 focus-visible:bg-white focus-visible:ring-1 focus-visible:ring-zinc-100 transition-all"
                        />
                    </div>

                    {/* Filter (Integrated) */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className={cn(
                                "h-10 w-10 flex items-center justify-center rounded-xl border border-zinc-100 bg-white text-zinc-400 hover:text-zinc-900 hover:border-zinc-200 transition-all",
                                statusFilter && "bg-zinc-900 text-white border-zinc-900 hover:bg-zinc-800"
                            )}>
                                <Filter className="h-4 w-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 p-1.5 rounded-2xl border-zinc-100 shadow-2xl">
                            <DropdownMenuItem onClick={() => { setStatusFilter(""); setPage(1); }} className="rounded-xl font-bold text-[11px] uppercase tracking-wider h-10 px-4">
                                All Statuses
                            </DropdownMenuItem>
                            {STATUS_OPTIONS.map(opt => (
                                <DropdownMenuItem key={opt} onClick={() => { setStatusFilter(opt); setPage(1); }} className="rounded-xl font-bold text-[11px] uppercase tracking-wider h-10 px-4">
                                    {opt}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* ── Pagination ── */}
            {total > PAGE_SIZE && (
                <div className="flex items-center justify-between pt-12 border-t border-zinc-100/60">
                    <p className="text-[11px] font-black text-zinc-300 uppercase tracking-[0.2em] tabular-nums">
                        Page {page} of {Math.ceil(total / PAGE_SIZE)}
                    </p>
                    <div className="flex items-center gap-1">
                        <button
                            disabled={page === 1}
                            onClick={() => setPage(p => p - 1)}
                            className="h-10 px-5 rounded-2xl border border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 disabled:opacity-30 transition-all"
                        >
                            Back
                        </button>
                        <div className="h-10 w-10 flex items-center justify-center font-black text-xs text-zinc-900">
                            {page}
                        </div>
                        <button
                            disabled={page * PAGE_SIZE >= total}
                            onClick={() => setPage(p => p + 1)}
                            className="h-10 px-5 rounded-2xl border border-zinc-100 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-900 hover:border-zinc-300 disabled:opacity-30 transition-all"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            <ConfirmDialog
                open={!!videoToDelete}
                onOpenChange={open => !open && setVideoToDelete(null)}
                onConfirm={handleDelete}
                isLoading={isPending}
                title="Delete Project"
                description={`Move "${videoToDelete?.topic}" to trash? This project will be permanently deleted.`}
                confirmText="Move to Trash"
                variant="destructive"
            />
        </div>
    );
}