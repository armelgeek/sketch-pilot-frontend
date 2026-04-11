"use client";

import React from "react";
import { ChevronDown, Sparkles, BookOpen, Film } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Series } from "@/src/services/series-service";
import { SeriesEpisodesDialog } from "./SeriesEpisodesDialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/src/components/ui/dropdown-menu";

interface SeriesSelectorProps {
    seriesList: Series[];
    selectedId: string;
    onSelect: (id: string) => void;
    onEdit?: (series: Series) => void;
    onAdd?: () => void;
}

export function SeriesSelector({ seriesList, selectedId, onSelect, onEdit, onAdd }: SeriesSelectorProps) {
    const [isEpisodesDialogOpen, setIsEpisodesDialogOpen] = React.useState(false);
    const selectedSeries = seriesList.find((s) => s.id === selectedId);

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button className={cn(
                    "group flex items-center gap-3 px-4 h-12 rounded-xl bg-white border border-stone-200 transition-all text-left outline-none",
                    "hover:border-blue-300 hover:shadow-md active:scale-[0.98]",
                    selectedSeries ? "ring-2 ring-blue-500/10 border-blue-200" : ""
                )}>
                    <div className={cn(
                        "h-8 w-8 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                        selectedSeries ? "bg-blue-50 text-blue-500" : "bg-stone-50 text-stone-400"
                    )}>
                        <Film className="h-4 w-4" />
                    </div>

                    <div className="flex-1 min-w-0 pr-2">
                        <p className="text-[10px] font-black uppercase tracking-widest text-stone-400 leading-none mb-1">
                            {selectedSeries ? `Épisode ${(selectedSeries.lastEpisodeNumber || 0) + 1}` : "Choisir une"}
                        </p>
                        <h3 className="text-sm font-bold text-stone-800 truncate leading-none">
                            {selectedSeries?.title || "Saga Narrative"}
                        </h3>
                    </div>

                    <ChevronDown className="h-4 w-4 text-stone-300 group-hover:text-stone-500 transition-colors" />
                </button>
            </DropdownMenuTrigger>

            <DropdownMenuContent align="start" className="w-[280px] p-2 rounded-2xl shadow-2xl border-stone-100 bg-white/95 backdrop-blur-md">
                <div className="px-3 py-2 border-b border-stone-50 mb-1">
                    <p className="text-[10px] font-black text-stone-400 uppercase tracking-widest">Vos Univers Actifs</p>
                </div>

                <div className="max-h-[300px] overflow-y-auto pr-1 customize-scrollbar">
                    {seriesList.map((s) => (
                        <DropdownMenuItem
                            key={s.id}
                            onClick={() => onSelect(s.id)}
                            className={cn(
                                "flex flex-col items-start gap-1 p-3 rounded-xl cursor-pointer transition-all mb-1",
                                selectedId === s.id ? "bg-blue-50 border border-blue-100" : "hover:bg-stone-50 border border-transparent"
                            )}
                        >
                            <div className="flex items-center justify-between w-full">
                                <span className={cn("font-bold text-sm", selectedId === s.id ? "text-blue-700" : "text-stone-800")}>
                                    {s.title}
                                </span>
                                {s.globalContext && (
                                    <BookOpen className="h-3 w-3 text-stone-300" />
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-[10px] font-semibold text-stone-400 bg-stone-100 px-1.5 py-0.5 rounded">
                                    {s.lastEpisodeNumber || 0} épisodes
                                </span>
                                {s.visualStyleModelId && (
                                    <span className="text-[10px] font-semibold text-blue-400 bg-blue-50 px-1.5 py-0.5 rounded">
                                        Style Unifié
                                    </span>
                                )}
                                {s.status === 'active' && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold text-blue-500 bg-blue-50/50 px-1.5 py-0.5 rounded uppercase tracking-tighter">
                                        <Sparkles className="h-2 w-2 animate-pulse" /> En cours
                                    </span>
                                )}
                            </div>
                        </DropdownMenuItem>
                    ))}
                </div>

                <div className="grid grid-cols-2 gap-2 mt-2 pt-2 border-t border-stone-50">
                    <button
                        onClick={onAdd}
                        className="flex items-center justify-center gap-2 h-10 rounded-xl bg-stone-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-stone-800 transition-all active:scale-95"
                    >
                        Créer
                    </button>
                    {selectedSeries && (
                        <button
                            onClick={() => setIsEpisodesDialogOpen(true)}
                            className="col-span-2 flex items-center justify-center gap-2 h-10 rounded-xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-200"
                        >
                            Voir les épisodes
                        </button>
                    )}
                </div>
            </DropdownMenuContent>

            <SeriesEpisodesDialog
                series={selectedSeries || null}
                isOpen={isEpisodesDialogOpen}
                onClose={() => setIsEpisodesDialogOpen(false)}
            />
        </DropdownMenu >
    );
}
