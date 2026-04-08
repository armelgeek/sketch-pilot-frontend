"use client";

import { useRouter } from "next/navigation";
import {
    Clapperboard, MoreVertical, Trash2, Pencil,
    Eye, Layers, Calendar
} from "lucide-react";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem,
    DropdownMenuTrigger, DropdownMenuSeparator
} from "@/src/components/ui/dropdown-menu";
import { cn } from "@/src/lib/utils";
import { Series, seriesService } from "@/src/services/series-service";

interface SeriesCardProps {
    series: Series;
    onDelete?: () => void;
}

export function SeriesCard({ series, onDelete }: SeriesCardProps) {
    const router = useRouter();
    const [isEditing, setIsEditing] = useState(false);
    const [currentTitle, setCurrentTitle] = useState(series.title);
    const [tempTitle, setTempTitle] = useState(currentTitle);

    const handleRename = async () => {
        if (!tempTitle.trim() || tempTitle === currentTitle) {
            setIsEditing(false);
            return;
        }
        try {
            await seriesService.updateSeries(series.id, { title: tempTitle });
            setCurrentTitle(tempTitle);
            setIsEditing(false);
        } catch {
            alert("Erreur lors du renommage.");
            setTempTitle(currentTitle);
            setIsEditing(false);
        }
    };

    const handleDelete = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!window.confirm("Supprimer cette série ? Les vidéos liées ne seront pas supprimées mais perdront leur lien avec cette série.")) return;
        try {
            await seriesService.deleteSeries(series.id);
            onDelete?.();
        } catch {
            alert("Erreur lors de la suppression.");
        }
    };

    const date = series.createdAt
        ? new Date(series.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" })
        : "Récemment";

    return (
        <div
            className={cn(
                "group relative flex flex-col gap-4 p-5 rounded-[2rem] bg-white",
                "border border-zinc-100 shadow-sm",
                "transition-all duration-300 hover:shadow-xl hover:-translate-y-1 cursor-pointer"
            )}
            onClick={() => router.push(`/series/${series.id}`)}
        >
            {/* Header / Icon */}
            <div className="flex items-start justify-between">
                <div className="h-14 w-14 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-lg shadow-zinc-200 group-hover:scale-110 transition-transform duration-300">
                    <Clapperboard className="h-6 w-6" />
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 rounded-xl hover:bg-zinc-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <MoreVertical className="h-4 w-4 text-zinc-400" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48 p-1.5 rounded-2xl shadow-xl border-zinc-100">
                        <DropdownMenuItem
                            className="rounded-xl h-10 px-3 text-xs font-semibold gap-2.5 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); setIsEditing(true); }}
                        >
                            <Pencil className="h-3.5 w-3.5 opacity-50" /> Renommer
                        </DropdownMenuItem>
                        <DropdownMenuItem
                            className="rounded-xl h-10 px-3 text-xs font-semibold gap-2.5 cursor-pointer"
                            onClick={(e) => { e.stopPropagation(); router.push(`/series/${series.id}`); }}
                        >
                            <Eye className="h-3.5 w-3.5 opacity-50" /> Voir les épisodes
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="mx-2 my-1" />
                        <DropdownMenuItem
                            className="rounded-xl h-10 px-3 text-xs font-semibold gap-2.5 cursor-pointer text-red-500 hover:bg-red-50"
                            onClick={handleDelete}
                        >
                            <Trash2 className="h-3.5 w-3.5" /> Supprimer
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            {/* Content */}
            <div className="flex flex-col gap-2 mt-2">
                {isEditing ? (
                    <input
                        autoFocus
                        value={tempTitle}
                        onChange={(e) => setTempTitle(e.target.value)}
                        onBlur={handleRename}
                        onKeyDown={(e) => e.key === "Enter" && handleRename()}
                        className="h-8 w-full rounded-xl border border-zinc-200 px-3 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-zinc-900"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <h3 className="font-bold text-lg text-zinc-900 line-clamp-1 tracking-tight">
                        {currentTitle}
                    </h3>
                )}

                {series.description && (
                    <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed font-medium">
                        {series.description}
                    </p>
                )}
            </div>

            {/* Footer / Stats */}
            <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-50 uppercase tracking-widest">
                <div className="flex items-center gap-1.5 text-zinc-400">
                    <Layers className="h-3 w-3" />
                    <span className="text-[10px] font-bold">
                        {series.videos?.length || 0} Épisodes
                    </span>
                </div>
                <div className="flex items-center gap-1.5 text-zinc-400">
                    <Calendar className="h-3 w-3" />
                    <span className="text-[10px] font-bold">{date}</span>
                </div>
            </div>
        </div>
    );
}
