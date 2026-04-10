"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { seriesService, Series } from "@/src/services/series-service";
import { SeriesEpisodesDialog } from "@/src/components/series/SeriesEpisodesDialog";
import {
    Film,
    Sparkles,
    BookOpen,
    Plus,
    ChevronRight,
    Loader2,
    Search,
    Brain
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { useRouter } from "next/navigation";

export default function SeriesPage() {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSeries, setSelectedSeries] = useState<Series | null>(null);

    const { data: seriesList = [], isLoading } = useQuery({
        queryKey: ["series", "all"],
        queryFn: () => seriesService.getAll()
    });

    const filteredSeries = seriesList.filter(s =>
        s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <Loader2 className="h-10 w-10 text-blue-500 animate-spin" />
                <p className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Chargement de vos sagas...</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-6 py-10 space-y-10">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <div className="h-8 w-8 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200">
                            <Film className="h-4 w-4" />
                        </div>
                        <h1 className="text-3xl font-black tracking-tight text-zinc-900">Mes Sagas</h1>
                    </div>
                    <p className="text-zinc-500 max-w-lg font-medium"> Gérez vos univers narratifs et suivez le développement de vos histoires épisodiques.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Rechercher une saga..."
                            className="h-11 pl-10 pr-4 rounded-xl border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all w-64"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Button
                        onClick={() => router.push("/dashboard?mode=series&create=true")}
                        className="h-11 rounded-xl bg-zinc-900 text-white font-bold px-6 gap-2 hover:bg-zinc-800 transition-all"
                    >
                        <Plus className="h-4 w-4" /> Nouvelle Saga
                    </Button>
                </div>
            </div>

            {/* Series Grid */}
            {filteredSeries.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-zinc-200 rounded-[2rem] bg-zinc-50/50">
                    <div className="h-20 w-20 rounded-3xl bg-zinc-100 flex items-center justify-center text-zinc-300 mb-6">
                        <Brain className="h-10 w-10" />
                    </div>
                    <h3 className="text-xl font-bold text-zinc-900 mb-2">Aucune saga trouvée</h3>
                    <p className="text-zinc-500 max-w-xs mx-auto mb-8">Commencez par créer votre premier univers narratif pour lancer votre série de vidéos.</p>
                    <Button
                        onClick={() => router.push("/dashboard?mode=series&create=true")}
                        variant="outline"
                        className="rounded-xl px-10 h-12 font-bold"
                    >
                        Créer ma première saga
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {filteredSeries.map((series) => (
                        <div
                            key={series.id}
                            onClick={() => setSelectedSeries(series)}
                            className="group relative flex flex-col bg-white rounded-[2rem] border border-zinc-100 p-6 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                        >
                            {/* Visual background element */}
                            <div className="absolute -right-4 -top-4 h-24 w-24 bg-blue-50 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-start justify-between mb-6 relative z-10">
                                <div className={cn(
                                    "h-14 w-14 rounded-2xl flex items-center justify-center shadow-lg transition-colors",
                                    "bg-zinc-900 text-white group-hover:bg-blue-600 group-hover:shadow-blue-200"
                                )}>
                                    <Film className="h-6 w-6" />
                                </div>
                                <div className="text-right">
                                    <span className="block text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-1">Status</span>
                                    <span className={cn(
                                        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-tighter shadow-sm",
                                        "bg-blue-50 text-blue-600"
                                    )}>
                                        <Sparkles className="h-2.5 w-2.5 animate-pulse" /> Actif
                                    </span>
                                </div>
                            </div>

                            <div className="flex-1 space-y-3 relative z-10">
                                <h3 className="text-xl font-black text-zinc-900 tracking-tight group-hover:text-blue-600 transition-colors">
                                    {series.title}
                                </h3>
                                <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed font-medium">
                                    {series.description || "Aucune description fournie pour cet univers."}
                                </p>
                            </div>

                            <div className="mt-8 pt-6 border-t border-zinc-50 flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Épisodes</span>
                                        <span className="text-sm font-bold text-zinc-900">{(series as any).lastEpisodeNumber || 0}</span>
                                    </div>
                                    <div className="h-6 w-[1px] bg-zinc-100" />
                                    <div className="flex flex-col">
                                        <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Perso.</span>
                                        <span className="text-sm font-bold text-zinc-900">
                                            {Object.keys(series.characterRegistry || {}).length}
                                        </span>
                                    </div>
                                </div>

                                <div className="h-10 w-10 rounded-full bg-zinc-50 flex items-center justify-center text-zinc-400 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                    <ChevronRight className="h-5 w-5" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Episode Modal */}
            <SeriesEpisodesDialog
                series={selectedSeries}
                isOpen={!!selectedSeries}
                onClose={() => setSelectedSeries(null)}
            />
        </div>
    );
}
