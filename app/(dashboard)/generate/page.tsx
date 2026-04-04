"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Clock, Globe, Layout, Sparkles, User, Wand2, Type, Music, RefreshCw, Play, CheckCircle2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Palette } from "lucide-react";
import { videosService } from "@/src/services/videos-service";
import type { VideoIdea } from "@/src/services/videos-service";
import { useVideoProgress } from "@/src/hooks/use-video-progress";
import { useSSEProgress } from "@/src/contexts/sse-progress-context";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { useSession } from "@/src/lib/auth-client";
import { useSubscription } from "@/src/hooks/use-subscription";
import { cn } from "@/src/lib/utils";

const adminService = new AdminService();

export default function GenerateContentPage() {
  const router = useRouter();

  const [script, setScript] = useState("");
  const [generating, setGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const [prompts, setPrompts] = useState<any[]>([]);
  const [musicTracks, setMusicTracks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [selectedMusicId, setSelectedMusicId] = useState<string>("none");
  const [duration, setDuration] = useState<string>("60");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [language, setLanguage] = useState<string>("fr-FR");
  const [suggesting, setSuggesting] = useState(false);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [suggestions, setSuggestions] = useState<VideoIdea[] | null>(null);
  const [characterModels, setCharacterModels] = useState<any[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");

  const { data: session } = useSession();
  const { getCurrentSubscription } = useSubscription();
  const [activePlan, setActivePlan] = useState<string | null>(null);
  const user = session?.user as any;

  useEffect(() => {
    getCurrentSubscription().then(sub => setActivePlan(sub?.plan || null));
  }, [getCurrentSubscription]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pData, musicData, charData] = await Promise.all([
          adminService.listPublicPrompts({ limit: 100 }),
          adminService.listMusic(),
          adminService.listModels(),
        ]);
        setPrompts(pData.data || []);
        setMusicTracks(musicData || []);
        setCharacterModels(charData.data || []);
      } catch (err) {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const displayedPrompts = prompts.filter((p) => {
    if (activePlan === "creator") return true;
    if (user?.niche) return p.id === user.niche;
    return true; // Fallback to all if no plan and no niche
  });

  useEffect(() => {
    if (displayedPrompts.length > 0 && !selectedPromptId) {
      const savedPrompt = user?.niche || localStorage.getItem("sketchpilot-default-prompt");
      if (savedPrompt && displayedPrompts.some((p: any) => p.id === savedPrompt)) {
        setSelectedPromptId(savedPrompt);
      } else {
        setSelectedPromptId(displayedPrompts[0].id);
      }
    }
  }, [displayedPrompts, selectedPromptId, user?.niche]);

  useEffect(() => {
    if (characterModels.length > 0 && !selectedCharacterId) {
      if (user?.defaultCharacterId && characterModels.some(c => c.id === user.defaultCharacterId)) {
        setSelectedCharacterId(user.defaultCharacterId);
      } else {
        setSelectedCharacterId(characterModels[0].id);
      }
    }
  }, [characterModels, selectedCharacterId, user?.defaultCharacterId]);

  const handlePromptChange = (val: string) => {
    setSelectedPromptId(val);
    localStorage.setItem("sketchpilot-default-prompt", val);
  };

  const { progress: realProgress, message: realMessage, isFinished, videoId: generatedVideoId, error: jobError } =
    useVideoProgress(jobId);

  const { startProgress, updateProgress, stopProgress } = useSSEProgress();

  // Sync SSE progress → global overlay (overlay is started in handleGenerate)
  useEffect(() => {
    if (generating && jobId) {
      updateProgress(realProgress, realMessage);
    }
  }, [realProgress, realMessage, generating, jobId, updateProgress]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      startProgress({
        title: "Génération du script",
        onCancel: () => {
          setGenerating(false);
          setJobId(undefined);
          stopProgress();
        },
      });
      const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);
      const options: any = {
        promptId: selectedPromptId,
        duration: parseInt(duration, 10),
        aspectRatio,
        language,
        scriptOnly: true,
        videoType: selectedPrompt?.category || selectedPrompt?.name || "explainer",
        videoGenre:
          selectedPrompt?.category?.toLowerCase() === "storytelling" ? "storytelling"
            : selectedPrompt?.category?.toLowerCase() === "éducatif" ? "educational"
              : selectedPrompt?.category?.toLowerCase() === "marketing" ? "marketing"
                : "general",
        backgroundMusic: selectedMusicId !== "none" ? selectedMusicId : undefined,
        characterModelId: selectedCharacterId || undefined,
      };
      const response = await videosService.generate(script, options);
      setError(null);
      if (response.jobId) {
        setJobId(response.jobId);
      } else {
        router.push(`/generate/${response.videoId}/script`);
      }
    } catch (error: any) {
      setError(error.message || "Failed to start generation");
      setGenerating(false);
      stopProgress();
    }
  };

  const handleSuggestTopics = async () => {
    try {
      setSuggesting(true);
      setError(null);
      setSuggestions(null);
      const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);
      const response = await videosService.suggestTopics({
        language,
        videoType: selectedPrompt?.category || selectedPrompt?.name,
        videoGenre: selectedPrompt?.category?.toLowerCase() === "storytelling" ? "storytelling" : "general",
        aspectRatio,
        themeName: selectedPrompt?.name,
        themeDescription: selectedPrompt?.description,
        goals: selectedPrompt?.goals || [],
        duration: parseInt(duration, 10),
        characterModelId: selectedCharacterId || undefined,
      });
      setSuggestions(response.topics);
    } catch (err: any) {
      setError(err.message || "Impossible de générer des idées.");
    } finally {
      setSuggesting(false);
    }
  };

  const handleSelectSuggestion = (idea: VideoIdea) => {
    setScript(idea.script);
    setSuggestions(null);
  };

  const handleGenerateScriptFromTitle = async (titleToUse?: string) => {
    const title = titleToUse || script;
    if (!title.trim()) return;
    try {
      setGeneratingScript(true);
      setError(null);
      const response = await videosService.generateScriptFromTitle(title, {
        language,
        duration: parseInt(duration, 10),
        aspectRatio,
      });
      setScript(response.script);
      setSuggestions(null);
    } catch (err: any) {
      setError(err.message || "Impossible de générer le script.");
    } finally {
      setGeneratingScript(false);
    }
  };

  useEffect(() => {
    if (isFinished && jobId && generatedVideoId) {
      stopProgress();
      setTimeout(() => { router.push(`/generate/${generatedVideoId}/script`); }, 1000);
    } else if (isFinished && jobError) {
      setGenerating(false);
      stopProgress();
    }
  }, [isFinished, jobId, generatedVideoId, jobError, router, stopProgress]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-zinc-300 border-t-zinc-900" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight text-zinc-900">Créer une vidéo</h1>
        <p className="text-sm text-zinc-500 mt-0.5">Décrivez votre idée, l'IA s'occupe du reste.</p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium">
          {error}
        </div>
      )}

      <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-8", generating && "pointer-events-none opacity-60")}>
        {/* Script column */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border border-zinc-100 rounded-3xl shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-black text-zinc-900 uppercase tracking-widest">
                  <Wand2 className="h-4 w-4 text-zinc-950" />
                  Script & Narration
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSuggestTopics}
                    disabled={suggesting || generatingScript}
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] font-black uppercase tracking-widest rounded-xl border-zinc-100 hover:bg-zinc-50"
                  >
                    {suggesting ? <RefreshCw className="h-3 w-3 animate-spin mr-1.5" /> : <Sparkles className="h-3 w-3 mr-1.5 text-amber-500" />}
                    Idée (5 🪙)
                  </Button>
                  <Button
                    onClick={() => handleGenerateScriptFromTitle()}
                    disabled={suggesting || generatingScript || !script.trim()}
                    variant="outline"
                    size="sm"
                    className="h-8 text-[10px] font-black uppercase tracking-widest rounded-xl border-zinc-100 hover:bg-zinc-50"
                  >
                    {generatingScript ? <RefreshCw className="h-3 w-3 animate-spin mr-1.5" /> : <Type className="h-3 w-3 mr-1.5 text-blue-500" />}
                    Script (10 🪙)
                  </Button>
                </div>
              </div>

              {suggesting && (
                <div className="mb-6 space-y-3">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="h-16 rounded-2xl bg-zinc-50 animate-pulse border border-zinc-100" style={{ animationDelay: `${i * 100}ms` }} />
                  ))}
                </div>
              )}
              {suggestions && (
                <div className="mb-6 space-y-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Suggestions IA</span>
                    <button onClick={() => setSuggestions(null)} className="text-[10px] text-zinc-400 hover:text-zinc-600 font-bold uppercase">Masquer</button>
                  </div>
                  {suggestions.map((idea, i) => {
                    const lines = idea.script.split("\n").map((l) => l.trim()).filter(Boolean);
                    const preview = lines.find((l) => l !== "Intro" && l !== "Center" && l !== "Outro") || "";
                    return (
                      <div key={i} className="group p-4 rounded-2xl border border-zinc-100 hover:border-zinc-300 bg-white transition-all cursor-pointer shadow-sm hover:shadow-md">
                        <button onClick={() => handleSelectSuggestion(idea)} className="text-left w-full">
                          <p className="text-sm font-black text-zinc-900 mb-1.5 line-clamp-1 group-hover:text-amber-600 transition-colors">{idea.title}</p>
                          {preview && <p className="text-xs text-zinc-500 line-clamp-2 leading-relaxed">{preview.slice(0, 120)}…</p>}
                        </button>
                        <div className="flex justify-end mt-3 border-t border-zinc-50 pt-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={(e) => { e.stopPropagation(); handleGenerateScriptFromTitle(idea.title); }}
                            disabled={generatingScript}
                            className="h-7 text-[9px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 hover:bg-zinc-50 rounded-lg"
                          >
                            {generatingScript ? <RefreshCw className="h-2.5 w-2.5 animate-spin mr-1.5" /> : <Play className="h-2.5 w-2.5 mr-1.5" />}
                            Générer le script complet
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              <div className="relative rounded-2xl bg-zinc-50/50 border border-zinc-100 group transition-all focus-within:border-zinc-300 focus-within:bg-white focus-within:shadow-inner">
                <Textarea
                  placeholder="Tapez votre idée ici… (ex: 'Un tutoriel sur les bienfaits du café' ou 'L'histoire d'un voyageur dans le temps')"
                  className="min-h-[460px] resize-none border-none focus-visible:ring-0 bg-transparent text-base font-medium leading-relaxed px-6 py-6"
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                />
                {script.length > 5 && script.length < 200 && !generatingScript && (
                  <div className="absolute bottom-4 right-4">
                    <Button
                      onClick={() => handleGenerateScriptFromTitle()}
                      size="sm"
                      className="rounded-xl bg-zinc-950 hover:bg-zinc-800 text-white text-[11px] font-black h-10 px-5 shadow-xl shadow-zinc-200"
                    >
                      <Sparkles className="h-3.5 w-3.5 mr-2 text-amber-400" />
                      DÉVELOPPER L'IDÉE
                    </Button>
                  </div>
                )}
                {generatingScript && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-[4px] rounded-2xl flex flex-col items-center justify-center gap-4 z-20">
                    <div className="relative">
                      <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center">
                        <RefreshCw className="h-6 w-6 text-amber-600 animate-spin" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-white animate-pulse" />
                    </div>
                    <div className="flex flex-col items-center">
                      <span className="font-black text-zinc-900 text-sm uppercase tracking-tighter">Rédaction en cours</span>
                      <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest mt-1">L'IA structure votre narration...</span>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Settings column */}
        <div className="space-y-6">
          <Card className="bg-white border border-zinc-100 rounded-3xl shadow-sm sticky top-6">
            <CardContent className="p-6 space-y-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Configuration Vidéo</p>

                {displayedPrompts.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <Label className="text-xs font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                      <Palette className="h-3.5 w-3.5 text-amber-500" /> Style de Vidéo
                      {activePlan !== "creator" && (
                        <span className="ml-auto text-[9px] text-zinc-400 font-bold bg-zinc-100 px-2 py-0.5 rounded-full">PLAN BASIQUE</span>
                      )}
                    </Label>
                    <Select value={selectedPromptId} onValueChange={handlePromptChange}>
                      <SelectTrigger className="bg-zinc-50 border-zinc-100 rounded-xl h-12 text-xs font-bold text-zinc-900 focus:ring-zinc-200">
                        <SelectValue placeholder="Sélectionner un style" />
                      </SelectTrigger>
                      <SelectContent className="border-zinc-100 shadow-2xl rounded-2xl max-h-64">
                        {displayedPrompts.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="text-xs font-bold focus:bg-zinc-900 focus:text-white rounded-lg py-2.5">
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {activePlan !== "creator" && displayedPrompts.length === 1 && (
                      <p className="text-[10px] font-medium text-zinc-500 leading-relaxed">
                        Pour débloquer d'autres styles, passez à l'abonnement supérieur.
                      </p>
                    )}
                  </div>
                )}

                {characterModels.length > 0 && (
                  <div className="space-y-4 mb-6">
                    <Label className="text-xs font-black text-zinc-900 uppercase tracking-widest flex items-center gap-2">
                      <User className="h-3.5 w-3.5 text-amber-500" /> Personnage
                    </Label>
                    <div className="grid grid-cols-3 gap-3">
                      {characterModels.slice(0, 6).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedCharacterId(m.id)}
                          className={cn(
                            "group relative flex flex-col items-center gap-2 p-2.5 rounded-2xl border-2 transition-all duration-300",
                            selectedCharacterId === m.id
                              ? "border-zinc-950 bg-zinc-50 shadow-md ring-4 ring-zinc-50"
                              : "border-zinc-50 bg-white hover:border-zinc-200"
                          )}
                        >
                          <Avatar className="h-12 w-12 border-2 border-white shadow-sm transition-transform group-hover:scale-105">
                            <AvatarImage src={m.images?.[0]} className="object-cover" />
                            <AvatarFallback className="bg-zinc-100 text-zinc-900 font-black text-sm uppercase">{m.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-[9px] font-black truncate w-full text-center uppercase tracking-tight text-zinc-600 group-hover:text-zinc-950 transition-colors">{m.name}</span>
                          {selectedCharacterId === m.id && (
                            <div className="absolute -top-1 -right-1 h-5 w-5 bg-zinc-950 rounded-full flex items-center justify-center border-2 border-white">
                              <CheckCircle2 className="h-3 w-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="space-y-5 border-t border-zinc-50 pt-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 ml-1">
                        <Clock className="h-3 w-3" /> Durée
                      </Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="bg-zinc-50 border-zinc-100 rounded-xl h-11 text-xs font-bold text-zinc-700 focus:ring-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-zinc-100">
                          <SelectItem value="15" className="font-bold">15 secondes</SelectItem>
                          <SelectItem value="30" className="font-bold">30 secondes</SelectItem>
                          <SelectItem value="60" className="font-bold">1 minute</SelectItem>
                          <SelectItem value="120" className="font-bold">2 minutes</SelectItem>
                          <SelectItem value="300" className="font-bold text-amber-600">5 minutes 🔥</SelectItem>
                          <SelectItem value="600" className="font-bold">10 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 ml-1">
                        <Layout className="h-3 w-3" /> Format
                      </Label>
                      <Select value={aspectRatio} onValueChange={setAspectRatio}>
                        <SelectTrigger className="bg-zinc-50 border-zinc-100 rounded-xl h-11 text-xs font-bold text-zinc-700 focus:ring-zinc-200">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-2xl border-zinc-100">
                          <SelectItem value="16:9" className="font-bold">YouTube (16:9)</SelectItem>
                          <SelectItem value="9:16" className="font-bold">TikTok / Reels (9:16)</SelectItem>
                          <SelectItem value="1:1" className="font-bold">Square (1:1)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 flex items-center gap-1.5 ml-1">
                      <Globe className="h-3 w-3" /> Langue Narration
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="bg-zinc-50 border-zinc-100 rounded-xl h-11 text-xs font-bold text-zinc-700 focus:ring-zinc-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-zinc-100">
                        <SelectItem value="fr-FR" className="font-bold">Français 🇫🇷</SelectItem>
                        <SelectItem value="en-US" className="font-bold">English 🇺🇸</SelectItem>
                        <SelectItem value="es-ES" className="font-bold">Español 🇪🇸</SelectItem>
                        <SelectItem value="de-DE" className="font-bold">Deutsch 🇩🇪</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Button
                  onClick={handleGenerate}
                  disabled={!script.trim() || generating}
                  className="w-full h-14 bg-zinc-950 hover:bg-zinc-800 text-white font-black rounded-2xl shadow-2xl shadow-zinc-300 transition-all active:scale-95 group uppercase tracking-widest text-xs"
                >
                  <Wand2 className="h-4 w-4 mr-2 text-amber-400 group-hover:rotate-12 transition-transform" />
                  Créer la vidéo
                  <ChevronRight className="ml-2 h-4 w-4 opacity-50 group-hover:translate-x-1 transition-all" />
                </Button>
                <p className="text-[9px] text-center text-zinc-400 font-bold uppercase tracking-widest mt-4">
                  Coût estimé : ~85 crédits 🪙
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
