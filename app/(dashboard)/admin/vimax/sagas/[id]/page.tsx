"use client";

import React from "react";
import { useParams } from "next/navigation";
import { 
  Film, 
  ChevronLeft, 
  Zap, 
  Activity, 
  FileJson, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle2, 
  Lightbulb, 
  BarChart3,
  MessageSquare,
  Play,
  ArrowLeft,
  Search,
  Eye,
  Settings,
  Check,
  MoreVertical,
  Loader2
} from "lucide-react";
import Link from "next/link";
import { useVimaxSagaDetail, useVimaxActions } from "@/src/app/admin/hooks/use-vimax-admin";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Skeleton } from "@/src/components/ui/skeleton";
import { Badge } from "@/src/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Progress } from "@/src/components/ui/progress";

export default function VimaxSagaDetailPage() {
  const { id } = useParams() as { id: string };
  const { data: saga, isLoading } = useVimaxSagaDetail(id);
  const { 
    triggerSagaAudit, 
    isAuditingSaga, 
    triggerLearning, 
    isLearning, 
    triggerVisualAudit, 
    isAuditingVisual,
    learnFromScene,
    isLearningScene,
    markAuditSceneAsProcessed,
    isMarkingProcessed,
    learnFromNarrative,
    isLearningNarrative,
    markNarrativeAuditProcessed,
    isMarkingNarrativeProcessed
  } = useVimaxActions();
  const [activeTab, setActiveTab] = React.useState("overview");
  const [critiqueScene, setCritiqueScene] = React.useState<{ epNum: number, sceneNum: number } | null>(null);
  const [manualCritique, setManualCritique] = React.useState("");

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64 rounded-2xl" />
        <Skeleton className="h-48 w-full rounded-3xl" />
        <div className="grid grid-cols-3 gap-6">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-32 rounded-3xl" />
        </div>
      </div>
    );
  }

  if (!saga) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-zinc-400">
        <AlertCircle className="h-16 w-16 mb-4 opacity-20" />
        <h2 className="text-2xl font-black mb-2">Saga introuvable</h2>
        <Link href="/admin/vimax/sagas">
          <Button variant="outline" className="rounded-xl font-bold">Retour à la liste</Button>
        </Link>
      </div>
    );
  }

  const handleAudit = async (section: "plan" | "all" = "all") => {
    try {
      await triggerSagaAudit({ id, section });
      alert("Audit lancé en arrière-plan. Les résultats apparaîtront dans l'onglet Audits d'ici quelques instants.");
    } catch (err) {
      console.error(err);
    }
  };

  const handleLearnFromScene = async (episodeNumber: number, sceneNumber: number, critique: string, auditFileName?: string) => {
    try {
      await learnFromScene({ seriesId: id, episodeNumber, sceneNumber, critique });
      
      // Si on apprend à partir d'un audit spécifique, on le marque comme traité
      if (auditFileName) {
        await markAuditSceneAsProcessed({ seriesId: id, fileName: auditFileName, sceneNumber });
      }
      
      alert("La nouvelle leçon visuelle a été intégrée au cerveau Vimax.");
      setCritiqueScene(null);
      setManualCritique("");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'apprentissage.");
    }
  };

  const handleLearnFromNarrative = async (feedback: any, auditFileName: string) => {
    try {
      await learnFromNarrative({ seriesId: id, feedback });
      await markNarrativeAuditProcessed({ seriesId: id, fileName: auditFileName, issue: feedback.issue });
      alert("La leçon narrative a été intégrée au cerveau Vimax.");
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'apprentissage narratif.");
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <Link href="/admin/vimax/sagas" className="flex items-center gap-2 text-zinc-400 hover:text-zinc-600 transition-colors mb-4 text-xs font-black uppercase tracking-widest">
            <ArrowLeft className="h-3 w-3" />
            Retour aux Sagas
          </Link>
          <h1 className="text-4xl font-black tracking-tighter mb-2 flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-600 flex items-center justify-center text-white shadow-lg shadow-amber-200">
               <Film className="h-6 w-6" />
            </div>
            {saga.title || saga.theme}
          </h1>
          <div className="flex items-center gap-3">
            <Badge className="bg-zinc-100 text-zinc-500 border-none font-black text-[10px] px-2 py-0.5 rounded-lg">
                ID: {id}
            </Badge>
            <Badge className={`${
                saga.status === 'stable' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
            } border-none font-black text-[10px] px-2 py-0.5 rounded-lg uppercase`}>
                {saga.status}
            </Badge>
          </div>
        </div>
        <div className="flex gap-3">
            <Button 
                variant="outline" 
                onClick={() => handleAudit("all")}
                disabled={isAuditingSaga}
                className="rounded-2xl font-bold border-zinc-200"
            >
                {isAuditingSaga ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Audit Global
            </Button>
            <Button 
                disabled={isLearning}
                onClick={() => triggerLearning({ seriesId: id })}
                className="rounded-2xl font-bold bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-100"
            >
                {isLearning ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Zap className="h-4 w-4 mr-2" />
                )}
                Dépanner / Fix-All
            </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <TabsList className="bg-zinc-100/50 p-1 rounded-2xl h-12 w-fit">
          <TabsTrigger value="overview" className="rounded-xl px-6 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="episodes" className="rounded-xl px-6 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Épisodes ({saga.episodes?.length})</TabsTrigger>
          <TabsTrigger value="audits" className="rounded-xl px-6 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Audits & Feedbacks ({saga.audits?.length})</TabsTrigger>
          <TabsTrigger value="config" className="rounded-xl px-6 font-bold text-sm data-[state=active]:bg-white data-[state=active]:shadow-sm">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-8 animate-in fade-in duration-500">
           {/* Summary Cards */}
           <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="rounded-3xl border-none shadow-xl shadow-zinc-100/50">
                 <CardHeader className="pb-2">
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                        <Activity className="h-3 w-3" /> Progression
                    </CardDescription>
                    <CardTitle className="text-2xl font-black">75%</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <Progress value={75} className="h-2 rounded-full bg-zinc-100" />
                    <p className="text-[10px] text-zinc-400 mt-2 font-bold uppercase tracking-tight">3 / 4 Épisodes produits</p>
                 </CardContent>
              </Card>

              <Card className="rounded-3xl border-none shadow-xl shadow-zinc-100/50">
                 <CardHeader className="pb-2">
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-purple-500 flex items-center gap-2">
                        <Zap className="h-3 w-3" /> Intelligence
                    </CardDescription>
                    <CardTitle className="text-2xl font-black">9.2/10</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <Progress value={92} className="h-2 rounded-full bg-zinc-100" />
                    <p className="text-[10px] text-zinc-400 mt-2 font-bold uppercase tracking-tight">Score de conformité moyen</p>
                 </CardContent>
              </Card>

              <Card className="rounded-3xl border-none shadow-xl shadow-zinc-100/50">
                 <CardHeader className="pb-2">
                    <CardDescription className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-2">
                        <AlertCircle className="h-3 w-3" /> Alertes
                    </CardDescription>
                    <CardTitle className="text-2xl font-black">{saga.audits?.reduce((acc: number, a: any) => acc + (a.feedbacks?.length || 0), 0) || 0}</CardTitle>
                 </CardHeader>
                 <CardContent>
                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-tight">Défauts narratifs ou visuels détectés</p>
                 </CardContent>
              </Card>
           </div>

           {/* Plan Section */}
           <Card className="rounded-3xl border-none shadow-xl shadow-zinc-100/50 overflow-hidden">
                <CardHeader className="bg-zinc-50/50 border-b border-zinc-100">
                    <div className="flex justify-between items-center">
                        <div>
                            <CardTitle className="text-xl font-black tracking-tighter">Saga Plan</CardTitle>
                            <CardDescription>Structure narrative et arcs directeurs</CardDescription>
                        </div>
                        <Button variant="ghost" size="sm" onClick={() => handleAudit("plan")} disabled={isAuditingSaga} className="rounded-xl font-bold text-amber-600 hover:bg-amber-50">
                            {isAuditingSaga ? (<Loader2 className="h-4 w-4 mr-2 animate-spin" />) : (<Search className="h-4 w-4 mr-2" />)}
                            Audit du Plan
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                    <div>
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300 mb-2">Idée de base</h4>
                        <p className="text-lg font-bold text-zinc-600 leading-relaxed italic">"{saga.basicIdea}"</p>
                    </div>

                    <div className="grid gap-6">
                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-300">Structure des Épisodes</h4>
                        {saga.episodeEvents?.map((ep: any, idx: number) => (
                            <div key={idx} className="flex gap-4 p-4 rounded-2xl bg-zinc-50/50 border border-zinc-100/50 hover:bg-white hover:shadow-lg transition-all duration-300">
                                <div className="h-10 w-10 shrink-0 rounded-xl bg-white border border-zinc-100 flex items-center justify-center font-black text-xs text-zinc-400">
                                    {idx + 1}
                                </div>
                                <div>
                                    <h5 className="font-black text-sm uppercase tracking-tight text-zinc-800">{ep.title || `Épisode ${idx + 1}`}</h5>
                                    <p className="text-xs text-zinc-500 font-medium leading-relaxed mt-1">{ep.eventDescription || ep.description}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
           </Card>
        </TabsContent>

        <TabsContent value="episodes" className="animate-in fade-in duration-500">
            <div className="grid gap-6">
                {saga.episodes?.map((ep: any, idx: number) => (
                    <Card key={ep.id} className="rounded-3xl border-zinc-100 hover:shadow-xl hover:shadow-zinc-100 transition-all group overflow-hidden">
                        <CardContent className="p-0">
                            <div className="flex flex-col md:flex-row">
                                {/* Left: Content */}
                                <div className="p-8 flex-1 space-y-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="h-8 w-8 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-black text-xs">
                                                {ep.episodeNumber || idx + 1}
                                            </div>
                                            <h3 className="font-black text-xl tracking-tight truncate max-w-md">
                                                {ep.title || `Épisode ${ep.episodeNumber}`}
                                            </h3>
                                        </div>
                                        <Badge className={`${
                                            ep.status === 'completed' ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                                        } border-none font-black text-[10px] px-2 py-0.5 rounded-lg uppercase`}>
                                            {ep.status || 'draft'}
                                        </Badge>
                                    </div>
                                    
                                    <p className="text-sm text-zinc-500 leading-relaxed italic border-l-4 border-zinc-100 pl-4">
                                        "{ep.summary}"
                                    </p>

                                    {/* Scenes Mini-Grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                                        {ep.scenes?.map((scene: any, sIdx: number) => (
                                            <div key={sIdx} className="aspect-video rounded-xl bg-zinc-100 overflow-hidden relative group/scene border border-zinc-200">
                                                {scene.imageUrl ? (
                                                    <img src={scene.imageUrl} alt={`Scene ${sIdx + 1}`} className="h-full w-full object-cover group-hover/scene:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <div className="h-full w-full flex items-center justify-center text-[8px] font-black text-zinc-400 uppercase tracking-widest text-center px-1">
                                                        Attente Rendu
                                                    </div>
                                                )}
                                                <div className="absolute top-1 left-1 bg-black/50 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                                                    #{sIdx + 1}
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="flex gap-2 pt-2">
                                        <Button 
                                            size="sm" 
                                            variant="outline" 
                                            onClick={() => triggerVisualAudit({ seriesId: id, episodeNumber: ep.episodeNumber })}
                                            disabled={isAuditingVisual}
                                            className="rounded-xl h-8 font-bold border-zinc-200"
                                        >
                                            {isAuditingVisual ? (<Loader2 className="h-3 w-3 mr-2 animate-spin" />) : (<Eye className="h-3 w-3 mr-2 text-zinc-400" />)}
                                            Audit Visuel
                                        </Button>
                                        <Button size="sm" variant="outline" className="rounded-xl h-9 px-4 text-xs font-black uppercase text-zinc-600 hover:text-blue-600 border-zinc-200">
                                            <Play className="h-3.5 w-3.5 mr-2" /> Play Preview
                                        </Button>
                                    </div>
                                </div>

                                {/* Right: Stats / Quick View */}
                                <div className="bg-zinc-50 md:w-72 p-8 border-l border-zinc-100 flex flex-col justify-between items-center gap-6">
                                    <div className="text-center space-y-2">
                                        <div className="h-20 w-20 rounded-full border-8 border-white shadow-xl bg-white flex items-center justify-center text-2xl font-black text-amber-600">
                                            {ep.score || "9.0"}
                                        </div>
                                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400">Score Qualité</p>
                                    </div>

                                    <div className="w-full space-y-4">
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-400">
                                            <span>Rythme</span>
                                            <span className="text-zinc-600 font-black">EXCELLENT</span>
                                        </div>
                                        <Progress value={90} className="h-1 bg-white" />
                                        
                                        <div className="flex justify-between items-center text-[10px] font-black uppercase text-zinc-400">
                                            <span>Détails</span>
                                            <span className="text-zinc-600 font-black">HIGH</span>
                                        </div>
                                        <Progress value={85} className="h-1 bg-white" />
                                    </div>
                                    
                                    <Badge variant="outline" className="rounded-lg font-black text-[9px] text-zinc-400 border-zinc-200">
                                        {ep.scenes?.length || 0} SCÈNES
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>

        <TabsContent value="audits" className="animate-in fade-in duration-500 space-y-8">
            <div className="flex justify-between items-end">
                <div>
                    <h3 className="text-2xl font-black tracking-tighter">Historique des Audits Intelligence</h3>
                    <p className="text-zinc-500 text-sm font-medium">Détections critiques et rapports de conformité visuelle.</p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" className="rounded-2xl font-bold border-zinc-200">
                        <BarChart3 className="h-4 w-4 mr-2" /> Analyser Trends
                    </Button>
                    <Button className="rounded-2xl font-bold bg-amber-600 text-white shadow-lg shadow-amber-100">
                        <Lightbulb className="h-4 w-4 mr-2" /> Extraire Leçons Globale
                    </Button>
                </div>
            </div>

            <div className="grid gap-8">
                {saga.audits?.map((audit: any, idx: number) => (
                    <Card key={idx} className="rounded-[2.5rem] border-zinc-100 overflow-hidden shadow-2xl shadow-zinc-100/50">
                        <CardHeader className={`bg-zinc-50/50 flex flex-row items-center justify-between p-6 border-b border-zinc-100 ${audit.type === 'visual' ? 'bg-blue-50/50' : ''}`}>
                            <div className="flex items-center gap-4">
                                <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${audit.type === 'visual' ? 'bg-blue-600 text-white' : 'bg-amber-600 text-white'}`}>
                                    {audit.type === 'visual' ? <Eye className="h-6 w-6" /> : <Activity className="h-6 w-6" />}
                                </div>
                                <div className="space-y-0.5">
                                    <CardTitle className="text-lg font-black tracking-tight">
                                        {audit.type === 'visual' ? `Audit Visuel Multimodal - Épisode ${audit.episodeNumber}` : 
                                         audit.file?.includes('plan') ? "Audit du Plan Narratif" : `Audit Narratif Épisode ${audit.episodeNumber}`}
                                    </CardTitle>
                                    <CardDescription className="text-[10px] uppercase font-black text-zinc-400 tracking-widest">
                                        {new Date(audit.timestamp || Date.now()).toLocaleString()}
                                    </CardDescription>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <Badge className={`${audit.type === 'visual' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'} border-none font-black text-[10px] px-3 py-1 rounded-xl`}>
                                    {audit.audits?.length || audit.feedbacks?.length || 0} ANALYSES
                                </Badge>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8">
                            <div className="grid gap-6">
                                {audit.type === 'visual' ? (
                                    <div className="grid md:grid-cols-2 gap-6">
                                        {audit.audits?.map((vAudit: any, vIdx: number) => (
                                            <div key={vIdx} className="p-6 rounded-3xl bg-zinc-50 border border-zinc-100 space-y-4">
                                                <div className="flex gap-4">
                                                    <div className="h-24 w-32 shrink-0 rounded-2xl bg-zinc-200 overflow-hidden border-2 border-white shadow-sm">
                                                        <img src={vAudit.imageUrl} className="h-full w-full object-cover" />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <div className="flex items-center gap-2">
                                                            <h5 className="font-black text-sm uppercase">Scène {vAudit.sceneNumber}</h5>
                                                            {vAudit.processed && (
                                                                <Badge className="bg-zinc-900 text-white border-none text-[8px] font-black">TRAITÉ</Badge>
                                                            )}
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                             <Badge className={`${vAudit.isValid ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'} border-none text-[8px] font-black`}>
                                                                {vAudit.isValid ? 'VALIDE' : 'DRIFT DÉTECTÉ'}
                                                             </Badge>
                                                             <span className="text-[10px] font-black text-zinc-400">ADN: {vAudit.visualDNA?.styleAdherence}% Adhérence</span>
                                                        </div>
                                                    </div>
                                                </div>
                                                {vAudit.issues?.length > 0 && (
                                                    <div className="space-y-2">
                                                        {vAudit.issues.map((issue: string, iIdx: number) => (
                                                            <div key={iIdx} className="flex gap-2 items-start text-xs font-bold text-red-600 bg-red-50 p-2 rounded-xl">
                                                                <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                                                                {issue}
                                                            </div>
                                                        ))}
                                                    </div>
                                                )}
                                                  <div className="pt-4 border-t border-zinc-100 space-y-4">
                                                      <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest flex items-center gap-2">
                                                          <MessageSquare className="h-3 w-3" /> Insights Détaillés
                                                      </div>
                                                      <div className="space-y-3">
                                                          {vAudit.details?.expectation_vs_reality && (
                                                              <div className="space-y-1">
                                                                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-tight">Attentes vs Réalité</p>
                                                                  <p className="text-[11px] font-medium text-zinc-600 leading-normal bg-white p-2 rounded-xl border border-zinc-100">{vAudit.details.expectation_vs_reality}</p>
                                                              </div>
                                                          )}
                                                          {vAudit.details?.identity_check && (
                                                              <div className="space-y-1">
                                                                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-tight">Vérification Personnages</p>
                                                                  <p className="text-[11px] font-medium text-zinc-600 leading-normal bg-white p-2 rounded-xl border border-zinc-100">{vAudit.details.identity_check}</p>
                                                              </div>
                                                          )}
                                                          {vAudit.details?.style_consistency && (
                                                              <div className="space-y-1">
                                                                  <p className="text-[9px] font-black uppercase text-zinc-400 tracking-tight">Cohérence de Style</p>
                                                                  <p className="text-[11px] font-medium text-zinc-600 leading-normal bg-white p-2 rounded-xl border border-zinc-100">{vAudit.details.style_consistency}</p>
                                                              </div>
                                                          )}
                                                      </div>
                                                  </div>

                                                  <div className="pt-2">
                                                      <div className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                          <Settings className="h-3 w-3" /> Visual DNA
                                                      </div>
                                                      <div className="grid grid-cols-2 gap-2">
                                                          <div className="bg-white p-2 rounded-xl text-[10px]">
                                                              <span className="text-zinc-400">Lighting:</span> <span className="font-black float-right uppercase">{vAudit.visualDNA?.lighting}</span>
                                                          </div>
                                                          <div className="bg-white p-2 rounded-xl text-[10px]">
                                                              <span className="text-zinc-400">Composition:</span> <span className="font-black float-right uppercase">{vAudit.visualDNA?.composition}</span>
                                                          </div>
                                                      </div>
                                                  </div>

                                                  <div className="pt-4 border-t border-zinc-100 flex gap-2">
                                                       <Button 
                                                           size="sm"
                                                           className={`flex-1 rounded-xl h-9 px-4 font-black text-[10px] ${vAudit.processed ? 'bg-zinc-100 text-zinc-400' : 'bg-zinc-900 text-white'}`}
                                                           onClick={() => handleLearnFromScene(audit.episodeNumber, vAudit.sceneNumber, vAudit.suggestedCorrection || vAudit.issues?.[0], audit.file)}
                                                           disabled={isLearningScene || isMarkingProcessed || vAudit.processed || (!vAudit.issues?.length && !vAudit.suggestedCorrection)}
                                                       >
                                                           {isLearningScene ? (
                                                             <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                                           ) : vAudit.processed ? (
                                                             <Check className="h-3 w-3 mr-1.5" />
                                                           ) : (
                                                             <Zap className="h-3 w-3 mr-1.5" />
                                                           )}
                                                           {vAudit.processed ? 'APPRIS' : 'APPRENDRE'}
                                                       </Button>
                                                      <Button 
                                                          variant="outline" 
                                                          size="sm" 
                                                          className="flex-1 rounded-xl h-9 px-4 font-black text-[10px] border-zinc-200"
                                                          onClick={() => {
                                                              setCritiqueScene({ epNum: audit.episodeNumber, sceneNum: vAudit.sceneNumber });
                                                              setManualCritique("");
                                                          }}
                                                      >
                                                          <MessageSquare className="h-3 w-3 mr-1.5" /> CRITIQUER
                                                      </Button>
                                                  </div>

                                                  {critiqueScene?.epNum === audit.episodeNumber && critiqueScene?.sceneNum === vAudit.sceneNumber && (
                                                      <div className="pt-4 space-y-3 animate-in slide-in-from-top-2 duration-300">
                                                          <textarea 
                                                              className="w-full bg-white border border-zinc-200 rounded-2xl p-4 text-xs font-medium focus:ring-2 focus:ring-zinc-900 outline-none min-h-[100px] text-zinc-900"
                                                              placeholder="Entrez votre critique pour cette scène..."
                                                              value={manualCritique}
                                                              onChange={(e) => setManualCritique(e.target.value)}
                                                          />
                                                          <div className="flex gap-2">
                                                               <Button 
                                                                   size="sm" 
                                                                   className="flex-1 rounded-xl h-8 font-black text-[10px] bg-amber-600 text-white"
                                                                   onClick={() => handleLearnFromScene(audit.episodeNumber, vAudit.sceneNumber, manualCritique, audit.file)}
                                                                   disabled={!manualCritique || isLearningScene || isMarkingProcessed}
                                                               >
                                                                   {isLearningScene ? <Loader2 className="h-3 w-3 mr-1.5 animate-spin" /> : null}
                                                                   SOUMETTRE LA CRITIQUE
                                                               </Button>
                                                              <Button 
                                                                  variant="ghost" 
                                                                  size="sm" 
                                                                  className="rounded-xl h-8 px-4 font-black text-[10px]"
                                                                  onClick={() => setCritiqueScene(null)}
                                                              >
                                                                  ANNULER
                                                              </Button>
                                                          </div>
                                                      </div>
                                                  )}
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    audit.feedbacks?.map((f: any, fIdx: number) => (
                                        <div key={fIdx} className="p-6 rounded-3xl bg-white border border-zinc-100 shadow-sm relative group overflow-hidden hover:shadow-xl transition-all duration-300">
                                            <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${f.priority === 'high' ? 'bg-red-500' : 'bg-amber-500'}`} />
                                            <div className="flex justify-between items-start mb-4">
                                                <div>
                                                    <div className="flex items-center gap-2 mb-1">
                                                      <h5 className="font-black text-lg text-zinc-800 tracking-tight">{f.issue}</h5>
                                                      {f.processed && (
                                                        <Badge className="bg-zinc-900 text-white border-none text-[8px] font-black">TRAITÉ</Badge>
                                                      )}
                                                    </div>
                                                    <Badge variant="outline" className="text-[9px] font-black px-2 uppercase opacity-50 rounded-lg">{f.priority} priority</Badge>
                                                </div>
                                                <Button variant="ghost" size="sm" className="rounded-xl h-8 w-8 p-0">
                                                    <Settings className="h-4 w-4 text-zinc-300" />
                                                </Button>
                                            </div>
                                            <p className="text-sm text-zinc-500 mb-4 leading-relaxed font-medium">{f.rationale}</p>
                                            <div className="p-5 bg-zinc-50/50 rounded-2xl mb-6 border border-dashed border-zinc-200">
                                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-2">Correction recommandée</p>
                                                <p className="text-sm font-bold text-zinc-700 italic border-l-2 border-amber-300 pl-4 py-1">"{f.example || f.correction}"</p>
                                            </div>
                                            <div className="flex gap-3">
                                                 <Button 
                                                   className={`rounded-2xl h-10 px-6 font-black text-xs shadow-lg shadow-zinc-200 ${f.processed ? 'bg-zinc-100 text-zinc-400' : 'bg-zinc-900 text-white'}`}
                                                   onClick={() => handleLearnFromNarrative(f, audit.file)}
                                                   disabled={f.processed || isLearningNarrative || isMarkingNarrativeProcessed}
                                                 >
                                                   {isLearningNarrative || isMarkingNarrativeProcessed ? (
                                                     <Loader2 className="h-3 w-3 mr-1.5 animate-spin" />
                                                   ) : null}
                                                   {f.processed ? 'APPRIS' : 'APPLIQUER MAINTENANT'}
                                                 </Button>
                                                <Button 
                                                  variant="ghost" 
                                                  className="rounded-2xl h-10 px-6 font-black text-xs text-zinc-400 hover:bg-zinc-50"
                                                  onClick={() => markNarrativeAuditProcessed({ seriesId: id, fileName: audit.file, issue: f.issue })}
                                                  disabled={f.processed || isMarkingNarrativeProcessed}
                                                >
                                                  {isMarkingNarrativeProcessed ? <Loader2 className="h-3 w-3 mr-1 animate-spin" /> : 'IGNORER'}
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
