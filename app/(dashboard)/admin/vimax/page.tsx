"use client";

import { useVimaxStats, useVimaxEpisodes, useVimaxActions, useVimaxLessons } from "@/src/app/admin";
import Link from "next/link";
import { Brain, Zap, Activity, FileJson, RefreshCw, Star, Info, CheckCircle, Trash2, History, Eraser, ShieldCheck, AlertCircle, Lightbulb, ArrowRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Badge } from "@/src/components/ui/badge";

export default function VimaxAdminPage() {
    const { data: stats, isLoading: statsLoading } = useVimaxStats();
    const { data: episodes, isLoading: episodesLoading } = useVimaxEpisodes();
    const { data: lessons, isLoading: lessonsLoading } = useVimaxLessons();
    const { 
        triggerLearning, isLearning, 
        validateLesson, isValidating,
        deleteLesson, isDeleting,
        rollback, isRollingBack,
        consolidate, isConsolidating,
        learnFromEpisode, isLearningEpisode,
        refineLesson, isRefiningLesson
    } = useVimaxActions();

    const handleTriggerLearning = async () => {
        try {
            await triggerLearning({ seriesId: undefined });
        } catch (err) {
            console.error(err);
        }
    };

    const handleLearnFromEpisode = async (episodeId: string) => {
        const critique = prompt("Critique manuelle (ex: '@Clara doit être plus agressive. Ne pas mentionner Clara.'):");
        if (!critique) return;
        
        try {
            await learnFromEpisode({ id: episodeId, critique });
        } catch (err) {
            console.error(err);
        }
    };

    const handleRefineLesson = async (lessonId: string) => {
        const feedback = prompt("Raffinement de la règle (ex: 'Sois plus nuancé sur les transitions'):");
        if (!feedback) return;
        
        try {
            await refineLesson({ id: lessonId, feedback });
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter flex items-center gap-2">
                        <Brain className="h-8 w-8 text-purple-600" />
                        Vimax Brain Admin
                    </h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1">
                        Gestion de l'intelligence autonome et des journaux cinématiques.
                    </p>
                </div>
                <div className="flex gap-3">
                    <Link href="/admin/vimax/sagas">
                        <Button variant="outline" className="rounded-2xl font-bold border-zinc-200">
                             Exploration Sagas
                        </Button>
                    </Link>
                    <Button 
                        onClick={() => rollback()}
                        disabled={isRollingBack}
                        variant="outline"
                        className="rounded-2xl font-bold border-zinc-200 dark:border-zinc-800"
                    >
                        <History className={`h-4 w-4 mr-2 ${isRollingBack ? "animate-spin" : ""}`} />
                        Rollback
                    </Button>
                    <Button 
                        onClick={handleTriggerLearning} 
                        disabled={isLearning}
                        className="rounded-2xl font-bold bg-purple-600 hover:bg-purple-700 text-white shadow-lg shadow-purple-200 dark:shadow-none"
                    >
                        {isLearning ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Zap className="h-4 w-4 mr-2" />
                        )}
                        {isLearning ? "Apprentissage..." : "Lancer l'Apprentissage"}
                    </Button>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <StatCard 
                    title="Score Moyen" 
                    value={stats?.performance?.totalAvg?.toFixed(2) || "0.00"} 
                    description="Qualité narrative globale"
                    icon={Star}
                    color="text-amber-500"
                    bg="bg-amber-50 dark:bg-amber-950/30"
                    loading={statsLoading}
                />
                <StatCard 
                    title="Total Épisodes" 
                    value={stats?.performance?.totalCount || 0} 
                    description="Expériences collectées"
                    icon={Activity}
                    color="text-blue-500"
                    bg="bg-blue-50 dark:bg-blue-950/30"
                    loading={statsLoading}
                />
                <StatCard 
                    title="Épisodes Évalués" 
                    value={stats?.performance?.evaluatedCount || 0} 
                    description={`${(stats?.performance?.totalCount || 0) - (stats?.performance?.evaluatedCount || 0)} en attente d'audit`}
                    icon={Brain}
                    color="text-purple-500"
                    bg="bg-purple-50 dark:bg-purple-950/30"
                    loading={statsLoading}
                />
            </div>

            {/* Aspects Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <AspectCard 
                    title="Narratif" 
                    value={stats?.performance?.aspects?.Narrative?.avg || 0} 
                    count={stats?.performance?.aspects?.Narrative?.count || 0}
                    description="Arcs, Cohérence & Plans"
                    color="bg-purple-600"
                    loading={statsLoading}
                />
                <AspectCard 
                    title="Visuel" 
                    value={stats?.performance?.aspects?.Visual?.avg || 0} 
                    count={stats?.performance?.aspects?.Visual?.count || 0}
                    description="Image Prompts & Assets"
                    color="bg-pink-600"
                    loading={statsLoading}
                />
                <AspectCard 
                    title="Cinématique" 
                    value={stats?.performance?.aspects?.Cinematic?.avg || 0} 
                    count={stats?.performance?.aspects?.Cinematic?.count || 0}
                    description="Mises en scène & Animation"
                    color="bg-blue-600"
                    loading={statsLoading}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
                <div className="lg:col-span-2 space-y-6">
                    {/* Lessons Library Entry Point */}
                    <Card className="border-none shadow-xl shadow-zinc-100/50 dark:shadow-none bg-white rounded-3xl overflow-hidden group">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div>
                                <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                                     Bibliothèque d'Intelligence
                                </CardTitle>
                                <CardDescription>Patterns narratifs et directives du cerveau</CardDescription>
                            </div>
                            <Link href="/admin/vimax/lessons">
                                <Button size="sm" className="rounded-xl font-bold bg-purple-600 hover:bg-purple-700 text-white">
                                    Voir tout <ArrowRight className="h-4 w-4 ml-2" />
                                </Button>
                            </Link>
                        </CardHeader>
                        <CardContent>
                            <div className="grid grid-cols-2 gap-4 mt-2">
                                <div className="p-4 rounded-2xl bg-purple-50 flex items-center gap-3">
                                    <ShieldCheck className="h-6 w-6 text-purple-600" />
                                    <div>
                                        <div className="text-xl font-black text-purple-900">{lessons?.filter(l => l.verified).length || 0}</div>
                                        <div className="text-[10px] font-black text-purple-400 uppercase tracking-widest">Cortex (Stable)</div>
                                    </div>
                                </div>
                                <div className="p-4 rounded-2xl bg-amber-50 flex items-center gap-3">
                                    <Brain className="h-6 w-6 text-amber-500" />
                                    <div>
                                        <div className="text-xl font-black text-amber-900">{lessons?.filter(l => !l.verified).length || 0}</div>
                                        <div className="text-[10px] font-black text-amber-400 uppercase tracking-widest">Hippocampe</div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-6 p-6 bg-zinc-900 rounded-3xl text-white">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2 text-purple-400">
                                        <Eraser className="h-4 w-4" />
                                        <span className="font-black text-xs uppercase tracking-widest">Consolidation</span>
                                    </div>
                                    <Badge variant="outline" className="text-zinc-500 border-zinc-800 text-[8px] font-black">DARWIN 3.1</Badge>
                                </div>
                                <p className="text-[11px] text-zinc-400 leading-relaxed mb-4">
                                    La consolidation darwinienne analyse les leçons répétitives et les fusionne pour optimiser l'espace et la clarté opérationnelle.
                                </p>
                                <Button 
                                    onClick={() => consolidate()}
                                    disabled={isConsolidating}
                                    className="w-full rounded-xl bg-white text-zinc-900 hover:bg-zinc-100 font-bold text-xs"
                                >
                                    {isConsolidating ? <RefreshCw className="h-3 w-3 mr-2 animate-spin" /> : <Eraser className="h-3 w-3 mr-2" />}
                                    Démarrer la Consolidation
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Episodes List */}
                    <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900 rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-black tracking-tight flex items-center gap-2">
                                 Dernières Expériences
                            </CardTitle>
                            <CardDescription>Critiques et audits qualitatifs des agents</CardDescription>
                        </CardHeader>
                        <CardContent>
                            {episodesLoading ? (
                                <div className="space-y-4">
                                    <Skeleton className="h-12 w-full rounded-2xl" />
                                    <Skeleton className="h-12 w-full rounded-2xl" />
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {episodes?.map((ep) => (
                                        <div key={ep.id} className="flex items-center justify-between p-4 rounded-2xl border border-zinc-50 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors">
                                            <div className="flex items-center gap-4">
                                                <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold ${
                                                    ep.score > 8 ? "bg-green-100 text-green-700" : ep.score > 5 ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                                                }`}>
                                                    {ep.score}
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm">{ep.title}</div>
                                                    <div className="text-[10px] text-zinc-400 font-medium">Saga: {ep.seriesId} • {new Date(ep.timestamp).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 text-zinc-400">
                                                <Button 
                                                    onClick={() => handleLearnFromEpisode(ep.id)}
                                                    disabled={isLearningEpisode}
                                                    size="icon" 
                                                    variant="ghost" 
                                                    className="h-8 w-8 rounded-xl text-amber-500 hover:bg-amber-50"
                                                >
                                                    <Lightbulb className="h-4 w-4" />
                                                </Button>
                                                <Info className="h-4 w-4" />
                                                <span className="text-xs font-bold">{ep.defectsCount} défauts</span>
                                            </div>
                                        </div>
                                    ))}
                                    {(!episodes || episodes.length === 0) && (
                                        <div className="text-center py-12 text-zinc-400 font-medium italic">
                                            Aucun épisode enregistré pour le moment.
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    {/* Storage & Info */}
                    <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900 rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-black tracking-tight">Stockage JSON</CardTitle>
                            <CardDescription>Base de connaissances locale</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="flex flex-col items-center justify-center py-6 bg-zinc-50 dark:bg-zinc-800/50 rounded-3xl">
                                <FileJson className="h-12 w-12 text-zinc-300 mb-2" />
                                <div className="text-2xl font-black tracking-tighter">
                                    {stats?.storage?.sizeBytes ? (stats.storage.sizeBytes / 1024).toFixed(1) : 0} KB
                                </div>
                                <div className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Taille du Cerveau</div>
                            </div>

                            <div className="space-y-4">
                                <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800/30">
                                    <div className="flex gap-3">
                                        <Info className="h-5 w-5 text-amber-600 shrink-0" />
                                        <p className="text-xs text-amber-800 dark:text-amber-400 leading-relaxed">
                                            <strong>Note :</strong> L'apprentissage autonome scanne les épisodes récents et met à jour les patterns narratifs dans <code>vimax-brain.json</code> sans impacter la base de données.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Maintenance Card */}
                    <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900 rounded-3xl">
                        <CardHeader>
                            <CardTitle className="text-lg font-black tracking-tight">Maintenance</CardTitle>
                            <CardDescription>Outils de récupération & debug</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800/30">
                                <div className="flex gap-3 mb-3">
                                    <AlertCircle className="h-5 w-5 text-blue-600 shrink-0" />
                                    <p className="text-[10px] text-blue-800 dark:text-blue-400 font-medium">
                                        En cas de corruption des fichiers locaux, utilisez "Synchroniser" pour restaurer les plans depuis la DB.
                                    </p>
                                </div>
                                <Button 
                                    variant="secondary" 
                                    className="w-full rounded-xl font-bold bg-blue-600 text-white hover:bg-blue-700"
                                >
                                    Synchroniser Logs
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}

function AspectCard({ title, value, count, description, color, loading }: any) {
    if (loading) return <Skeleton className="h-40 rounded-3xl" />;

    return (
        <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
            <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="text-2xl font-black tracking-tighter">{value}%</div>
                        <div className="text-xs font-bold text-zinc-400 uppercase tracking-widest leading-none mt-1">{title}</div>
                    </div>
                    <div className="text-[10px] font-black bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-lg uppercase tracking-tight">
                        {count} episodes
                    </div>
                </div>
                
                <div className="h-2 w-full bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mb-4">
                    <div 
                        className={`h-full transition-all duration-1000 ${color}`} 
                        style={{ width: `${value}%` }}
                    />
                </div>

                <p className="text-[10px] text-zinc-400 font-medium">{description}</p>
            </CardContent>
        </Card>
    );
}

function StatCard({ title, value, description, icon: Icon, color, bg, loading }: any) {
    if (loading) return <Skeleton className="h-32 rounded-3xl" />;

    return (
        <Card className="border-none shadow-xl shadow-zinc-200/50 dark:shadow-none bg-white dark:bg-zinc-900 rounded-3xl overflow-hidden">
            <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-2xl ${bg}`}>
                        <Icon className={`h-6 w-6 ${color}`} />
                    </div>
                </div>
                <div>
                    <div className="text-4xl font-black tracking-tighter mb-1">{value}</div>
                    <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100">{title}</div>
                    <p className="text-[10px] text-zinc-400 mt-1 font-medium">{description}</p>
                </div>
            </CardContent>
        </Card>
    );
}
