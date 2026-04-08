"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import {
    ChevronLeft, Clapperboard, Layers,
    Calendar, Video as VideoIcon, Plus, Loader2, AlertCircle
} from "lucide-react";
import { seriesService, type Series } from "@/src/services/series-service";
import { VideoCard } from "@/src/components/organisms/video-card";
import { Button } from "@/src/components/ui/button";

export default function SeriesDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params);
    const [series, setSeries] = useState<Series | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadSeries();
    }, [id]);

    const loadSeries = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await seriesService.getById(id);
            setSeries(data);
        } catch (err) {
            setError("Impossible de charger les détails de cette série.");
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    if (error || !series) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6 text-center">
                <AlertCircle className="h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-xl font-bold text-zinc-900 mb-2">Une erreur est survenue</h2>
                <p className="text-zinc-500 mb-6">{error || "Série introuvable."}</p>
                <Link href="/series">
                    <Button variant="outline" className="rounded-xl px-6">Retour aux séries</Button>
                </Link>
            </div>
        );
    }

    const date = series.createdAt
        ? new Date(series.createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" })
        : "Inconnue";

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-10 pb-32">

                {/* Navigation Back */}
                <Link href="/series" className="inline-flex items-center gap-2 text-zinc-400 hover:text-zinc-900 font-bold transition-colors group">
                    <div className="h-8 w-8 rounded-full border border-zinc-100 flex items-center justify-center group-hover:bg-zinc-50 transition-all">
                        <ChevronLeft className="h-4 w-4" />
                    </div>
                    <span className="text-sm">Toutes les séries</span>
                </Link>

                {/* Series Header Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 border-b border-zinc-50 pb-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-2xl bg-zinc-900 flex items-center justify-center text-white shadow-xl shadow-zinc-200">
                                <Clapperboard className="h-8 w-8" />
                            </div>
                            <h1 className="text-4xl font-black tracking-tight text-zinc-900 lg:text-5xl">{series.title}</h1>
                        </div>

                        <p className="text-lg text-zinc-500 max-w-3xl leading-relaxed font-medium">
                            {series.description || "Aucune description fournie pour cette série."}
                        </p>

                        <div className="flex flex-wrap items-center gap-6 pt-2">
                            <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                                <Calendar className="h-3.5 w-3.5" />
                                <span>Créée le {date}</span>
                            </div>
                            <div className="flex items-center gap-2 text-zinc-400 font-bold uppercase tracking-widest text-[10px]">
                                <VideoIcon className="h-3.5 w-3.5" />
                                <span>{series.videos?.length || 0} Épisodes</span>
                            </div>
                        </div>
                    </div>

                    <Link href={`/dashboard?seriesId=${series.id}`}>
                        <button className="flex items-center gap-3 h-14 px-8 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-sm font-black transition-all shadow-2xl shadow-amber-500/20 active:scale-95 whitespace-nowrap">
                            <Plus className="h-5 w-5" /> Nouvel épisode
                        </button>
                    </Link>
                </div>

                {/* Episodes Grid */}
                <div>
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-black tracking-tight text-zinc-900 flex items-center gap-3">
                            <Layers className="h-6 w-6 text-zinc-300" /> Épisodes de la série
                        </h2>
                    </div>

                    {series.videos && series.videos.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                            {series.videos.map((v) => (
                                <VideoCard
                                    key={v.id}
                                    video={v}
                                    showActions={true}
                                    onDelete={() => {
                                        setSeries({
                                            ...series,
                                            videos: series.videos?.filter(item => item.id !== v.id)
                                        });
                                    }}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="border-4 border-dashed border-zinc-50 rounded-[3rem] bg-zinc-50/30 flex flex-col items-center justify-center py-32 text-center px-6">
                            <div className="h-20 w-20 rounded-3xl bg-white shadow-xl border border-zinc-50 flex items-center justify-center mb-6">
                                <VideoIcon className="h-8 w-8 text-zinc-200" />
                            </div>
                            <h3 className="text-xl font-black text-zinc-900 tracking-tight">Aucun épisode</h3>
                            <p className="text-zinc-500 font-bold mt-2 mb-8 max-w-sm">
                                Cette série est encore vide. Commencez par générer le premier épisode pour lancer votre saga.
                            </p>
                            <Link href={`/dashboard?seriesId=${series.id}`}>
                                <Button className="h-12 px-8 rounded-xl bg-zinc-900 text-white font-black hover:bg-zinc-800 transition-all">
                                    Lancer l'épisode 1
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
