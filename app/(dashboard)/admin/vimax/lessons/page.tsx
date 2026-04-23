"use client";

import React, { useState } from "react";
import { 
  useVimaxLessons, 
  useVimaxActions, 
  useVimaxStats 
} from "@/src/app/admin";
import { 
  Brain, 
  Search, 
  Filter, 
  RefreshCw, 
  Trash2, 
  CheckCircle, 
  ShieldCheck, 
  Zap, 
  Eraser, 
  ChevronLeft,
  Info,
  Clock,
  ArrowRight,
  TrendingUp,
  Database
} from "lucide-react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";

export default function VimaxLessonsPage() {
    const { data: lessons, isLoading: lessonsLoading } = useVimaxLessons();
    const { data: stats } = useVimaxStats();
    const { 
        validateLesson, isValidating,
        deleteLesson, isDeleting,
        consolidate, isConsolidating,
        refineLesson, isRefiningLesson
    } = useVimaxActions();

    const [search, setSearch] = useState("");
    const [aspectFilter, setAspectFilter] = useState("all");

    const filteredLessons = lessons?.filter(lesson => {
        const matchesSearch = lesson.directive.toLowerCase().includes(search.toLowerCase()) || 
                             lesson.agentName.toLowerCase().includes(search.toLowerCase());
        const matchesAspect = aspectFilter === "all" || 
                             (lesson.tags?.includes(aspectFilter.toLowerCase()));
        return matchesSearch && matchesAspect;
    });

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
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex justify-between items-start">
                <div>
                    <Link href="/admin/vimax" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-600 transition-colors mb-4 text-xs font-black uppercase tracking-widest">
                        <ChevronLeft className="h-3 w-3" />
                        Retour au Dashboard
                    </Link>
                    <h1 className="text-4xl font-black tracking-tighter mb-2 flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-purple-600 flex items-center justify-center text-white shadow-lg shadow-purple-200">
                           <Brain className="h-6 w-6" />
                        </div>
                        Bibliothèque d'Intelligence
                    </h1>
                    <p className="text-zinc-500 font-medium max-w-2xl">
                        Consultez et gérez les leçons apprises par Vimax. Optimisez le Cortex via la consolidation darwinienne.
                    </p>
                </div>

                <div className="flex gap-3">
                    <Button 
                        onClick={() => consolidate()}
                        disabled={isConsolidating}
                        className="rounded-2xl font-black bg-zinc-900 text-white shadow-xl hover:bg-black px-6"
                    >
                        {isConsolidating ? (
                            <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        ) : (
                            <Eraser className="h-4 w-4 mr-2" />
                        )}
                        Consolider le Cerveau
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <Card className="rounded-3xl border-none shadow-xl shadow-zinc-100/50 bg-white">
                    <CardContent className="p-6">
                        <div className="text-3xl font-black tracking-tighter">{lessons?.length || 0}</div>
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Leçons Totales</div>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-none shadow-xl shadow-zinc-100/50 bg-white">
                    <CardContent className="p-6">
                        <div className="text-3xl font-black tracking-tighter text-purple-600">
                            {lessons?.filter(l => l.verified).length || 0}
                        </div>
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Cortex (Stable)</div>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-none shadow-xl shadow-zinc-100/50 bg-white">
                    <CardContent className="p-6">
                        <div className="text-3xl font-black tracking-tighter text-amber-500">
                            {lessons?.filter(l => !l.verified).length || 0}
                        </div>
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Hippocampe (Draft)</div>
                    </CardContent>
                </Card>
                <Card className="rounded-3xl border-none shadow-xl shadow-zinc-100/50 bg-white">
                    <CardContent className="p-6">
                        <div className="text-3xl font-black tracking-tighter text-blue-500">
                            {stats?.performance?.totalAvg?.toFixed(1) || "0.0"}
                        </div>
                        <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mt-1">Score Qualité</div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Library UI */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                {/* Filters Sidebar */}
                <div className="space-y-6">
                    <div className="space-y-4">
                        <h3 className="text-xs font-black uppercase tracking-widest text-zinc-400">Recherche & Filtres</h3>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input 
                                placeholder="Rechercher une directive..." 
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-10 rounded-xl border-zinc-200 bg-white" 
                            />
                        </div>
                        
                        <div className="grid grid-cols-1 gap-2">
                            {['All', 'Narrative', 'Visual', 'Cinematic'].map((aspect) => (
                                <button
                                    key={aspect}
                                    onClick={() => setAspectFilter(aspect)}
                                    className={`flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                                        aspectFilter === aspect 
                                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-100' 
                                            : 'bg-white hover:bg-zinc-50 text-zinc-600 border border-zinc-100'
                                    }`}
                                >
                                    <span className="text-xs font-black uppercase tracking-tight">{aspect}</span>
                                    {aspectFilter === aspect && <ArrowRight className="h-3 w-3" />}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 bg-zinc-900 rounded-3xl text-white space-y-4 shadow-2xl">
                        <div className="flex items-center gap-2 text-purple-400">
                            <Zap className="h-5 w-5" />
                            <h3 className="font-black text-sm uppercase">Consolidation Brain 3.0</h3>
                        </div>
                        <p className="text-[11px] text-zinc-400 leading-relaxed">
                            L'IA analyse vos feedbacks et les patterns récurrents pour fusionner les leçons similaires et éliminer les contradictions.
                        </p>
                        <Button 
                            variant="outline" 
                            className="w-full rounded-xl border-zinc-800 hover:bg-zinc-800 text-xs font-black"
                            onClick={() => consolidate()}
                            disabled={isConsolidating}
                        >
                            DÉARRIVER LES CONTRADICTIONS
                        </Button>
                    </div>
                </div>

                {/* Lessons Grid/List */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 text-xs font-black text-zinc-400 uppercase tracking-widest">
                            <Database className="h-4 w-4" />
                            {filteredLessons?.length || 0} résultat(s)
                        </div>
                        <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400">
                            <span className="flex items-center gap-1"><Clock className="h-3 w-3" /> Récents en premier</span>
                        </div>
                    </div>

                    {lessonsLoading ? (
                        <div className="grid gap-4">
                            <Skeleton className="h-24 rounded-3xl" />
                            <Skeleton className="h-24 rounded-3xl" />
                            <Skeleton className="h-24 rounded-3xl" />
                        </div>
                    ) : (
                        <div className="grid gap-4">
                            {filteredLessons?.map((lesson) => (
                                <Card key={lesson.id} className="rounded-3xl border-none shadow-xl shadow-zinc-100/50 hover:shadow-zinc-200/50 bg-white overflow-hidden group transition-all duration-500">
                                    <CardContent className="p-0">
                                        <div className="flex">
                                            <div className={`w-1.5 ${lesson.verified ? 'bg-purple-600' : 'bg-amber-400'}`} />
                                            <div className="p-6 flex-1 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                                <div className="space-y-3 flex-1">
                                                    <div className="flex items-center gap-3">
                                                        <Badge variant="outline" className="text-[9px] font-black uppercase px-2 py-0.5 rounded-lg opacity-60">
                                                            {lesson.agentName}
                                                        </Badge>
                                                        {lesson.tags?.map((tag: string) => (
                                                            <Badge key={tag} className="bg-zinc-100 text-zinc-400 border-none text-[8px] font-black uppercase px-2">
                                                                {tag}
                                                            </Badge>
                                                        ))}
                                                        {lesson.verified && (
                                                            <Badge className="bg-purple-600 text-white border-none text-[9px] font-black flex items-center gap-1">
                                                                <ShieldCheck className="h-3 w-3" /> CORTEX
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <h3 className="text-lg font-black text-zinc-800 tracking-tight leading-snug">
                                                        {lesson.directive}
                                                    </h3>
                                                    <p className="text-xs text-zinc-400 font-medium italic">
                                                        {lesson.example || "Pas d'exemple spécifique enregistré."}
                                                    </p>
                                                </div>

                                                <div className="flex items-center gap-2">
                                                    <div className="flex flex-col items-end mr-4 text-right">
                                                        <div className="text-[10px] font-black text-zinc-300 uppercase tracking-widest">Confiance</div>
                                                        <div className="text-sm font-black text-zinc-600">{(lesson.confidence * 100).toFixed(0)}%</div>
                                                    </div>
                                                    
                                                    <div className="flex gap-2">
                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-10 w-10 rounded-2xl hover:bg-blue-50 text-blue-500"
                                                            onClick={() => handleRefineLesson(lesson.id)}
                                                            disabled={isRefiningLesson}
                                                        >
                                                            {isRefiningLesson ? <RefreshCw className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                                                        </Button>
                                                        
                                                        {!lesson.verified && (
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                className="h-10 w-10 rounded-2xl hover:bg-green-50 text-green-600"
                                                                onClick={() => validateLesson(lesson.id)}
                                                                disabled={isValidating}
                                                            >
                                                                {isValidating ? <RefreshCw className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                                                            </Button>
                                                        )}

                                                        <Button 
                                                            variant="ghost" 
                                                            size="icon" 
                                                            className="h-10 w-10 rounded-2xl hover:bg-red-50 text-red-400"
                                                            onClick={() => deleteLesson(lesson.id)}
                                                            disabled={isDeleting}
                                                        >
                                                            {isDeleting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                                        </Button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}

                            {filteredLessons?.length === 0 && (
                                <div className="p-20 text-center space-y-4">
                                    <div className="inline-flex h-16 w-16 items-center justify-center rounded-3xl bg-zinc-50 text-zinc-200">
                                        <Search className="h-8 w-8" />
                                    </div>
                                    <div className="space-y-1">
                                        <p className="font-black text-zinc-400">Aucun résultat trouvé</p>
                                        <p className="text-xs text-zinc-300">Ajustez vos filtres ou effectuez une nouvelle recherche.</p>
                                    </div>
                                    <Button variant="outline" onClick={() => { setSearch(""); setAspectFilter("all"); }} className="rounded-xl font-bold">Réinitialiser</Button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
