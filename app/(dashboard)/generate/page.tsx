"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Clock, Globe, Layout, Sparkles, User, Wand2, Type, Music, Grid3X3, RefreshCw } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { videosService } from "@/src/services/videos-service";
import type { VideoIdea } from "@/src/services/videos-service";
import { useVideoProgress } from "@/src/hooks/use-video-progress";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { cn } from "@/src/lib/utils";

const adminService = new AdminService();

export default function GenerateContentPage() {
  const router = useRouter();

  const [script, setScript] = useState("");
  const [generating, setGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  // Generation Options State
  const [prompts, setPrompts] = useState<any[]>([])
  const [musicTracks, setMusicTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [selectedMusicId, setSelectedMusicId] = useState<string>('none')
  const [duration, setDuration] = useState<string>("30");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [language, setLanguage] = useState<string>("fr-FR");
  const [style, setStyle] = useState<string>("storytelling");
  const [suggesting, setSuggesting] = useState(false);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [suggestions, setSuggestions] = useState<VideoIdea[] | null>(null);
  const [characterDescription, setCharacterDescription] = useState<string>("A middle-aged man with short hair, wearing a simple button-down shirt.");
  const [characterType, setCharacterType] = useState<string>("man");
  const [characterModels, setCharacterModels] = useState<any[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pData, musicData, charData] = await Promise.all([
          adminService.listPublicPrompts({ limit: 100 }),
          adminService.listMusic(),
          adminService.listModels()
        ])
        setPrompts(pData.data || [])
        setMusicTracks(musicData || [])
        setCharacterModels(charData.data || [])
        if (pData.data?.length > 0) setSelectedPromptId(pData.data[0].id)
        if (charData.data?.length > 0) {
          setSelectedCharacterId(charData.data[0].id)
          setCharacterType('avatar')
        }
        setLoading(false)
      } catch (err) {
        console.error("[Generate] Failed to fetch initial data:", err);
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const {
    progress: realProgress,
    message: realMessage,
    isFinished,
    videoId: generatedVideoId,
    error: jobError
  } = useVideoProgress(jobId);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      const selectedPrompt = prompts.find(p => p.id === selectedPromptId);
      const options: any = {
        promptId: selectedPromptId,
        maxDuration: parseInt(duration, 10),
        aspectRatio,
        language,
        style,
        scriptOnly: true,
        videoType: selectedPrompt?.category || selectedPrompt?.name || "explainer",
        videoGenre: selectedPrompt?.category?.toLowerCase() === "storytelling" ? "storytelling" :
          selectedPrompt?.category?.toLowerCase() === "éducatif" ? "educational" :
            selectedPrompt?.category?.toLowerCase() === "marketing" ? "marketing" : "general",
        backgroundMusic: selectedMusicId !== 'none' ? selectedMusicId : undefined,
        characterDescription: characterType === 'custom' || !selectedCharacterId ? characterDescription : undefined,
        characterModelId: selectedCharacterId || undefined
      }

      const response = await videosService.generate(script, options);
      setError(null);
      router.push(`/generate/${response.videoId}/script`);
    } catch (error: any) {
      setError(error.message || "Failed to start generation");
      setGenerating(false);
    }
  };

  const getEstimatedImages = (dur: string) => {
    const d = parseInt(dur, 10);
    if (d <= 30) return 5;
    if (d <= 60) return 8;
    if (d <= 120) return 12;
    if (d <= 300) return 18; // 5m
    if (d <= 600) return 22; // 10m
    if (d <= 900) return 25; // 15m
    return 30; // Max allowed
  };
  const handleSuggestTopics = async () => {
    try {
      setSuggesting(true);
      setError(null);
      setSuggestions(null);
      const selectedPrompt = prompts.find(p => p.id === selectedPromptId);
      const response = await videosService.suggestTopics({
        language,
        videoType: selectedPrompt?.category || selectedPrompt?.name,
        videoGenre: selectedPrompt?.category?.toLowerCase() === "storytelling" ? "storytelling" : "general",
        aspectRatio,
        themeName: selectedPrompt?.name,
        themeDescription: selectedPrompt?.description,
        goals: selectedPrompt?.goals || [],
        duration: parseInt(duration, 10),
        characterDescription: characterType === 'custom' || !selectedCharacterId ? characterDescription : undefined,
        characterModelId: selectedCharacterId || undefined
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
    if (!title.trim()) {
      setError("Veuillez entrer un titre ou un sujet.");
      return;
    }

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
      setTimeout(() => {
        router.push(`/generate/${generatedVideoId}/script`);
      }, 1000);
    } else if (isFinished && jobError) {
      setGenerating(false);
    }
  }, [isFinished, jobId, generatedVideoId, jobError, router]);

  const currentProgress = generating ? realProgress : 0;
  const currentMessage = generating ? realMessage : "";

  return (
    <div className="relative min-h-screen py-10">
      <div className="mesh-gradient opacity-30" />

      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-medium text-center shadow-lg animate-in fade-in zoom-in-95 duration-300">
            {error}
          </div>
        )}

        {/* Header Section */}
        <div className="text-center space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20 mb-2">
            <Sparkles className="h-3 w-3" />
            Étape 1 sur 3 : Conception
          </div>
          <h1 className="text-5xl font-black tracking-tight text-slate-900 dark:text-white sm:text-6xl">
            Donnez vie à vos <span className="text-emerald-500">Idées</span>
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-xl max-w-2xl mx-auto font-medium">
            Décrivez votre vision ou collez votre script. Notre IA se charge du reste.
          </p>
        </div>

        {/* Main Interface */}
        {!generating && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Input Column */}
            <div className="lg:col-span-2 space-y-6">
              <Card className="glass-pill border border-emerald-500/10 shadow-2xl overflow-hidden group">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">
                      <Wand2 className="h-4 w-4" />
                      Script & Narration
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        onClick={handleSuggestTopics}
                        disabled={suggesting || generatingScript}
                        variant="outline"
                        className="h-8 text-[10px] font-bold uppercase tracking-widest border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all rounded-full group"
                      >
                        {suggesting ? (
                          <RefreshCw className="h-3 w-3 animate-spin mr-1.5" />
                        ) : (
                          <Sparkles className="h-3 w-3 mr-1.5 group-hover:scale-125 transition-transform" />
                        )}
                        Générer une idée (5 🪙)
                      </Button>

                      <Button
                        onClick={() => handleGenerateScriptFromTitle()}
                        disabled={suggesting || generatingScript || !script.trim()}
                        variant="outline"
                        className="h-8 text-[10px] font-bold uppercase tracking-widest border-emerald-500/20 bg-emerald-500/5 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 transition-all rounded-full group mx-2"
                      >
                        {generatingScript ? (
                          <RefreshCw className="h-3 w-3 animate-spin mr-1.5" />
                        ) : (
                          <Type className="h-3 w-3 mr-1.5 group-hover:scale-125 transition-transform" />
                        )}
                        Générer Script (10 🪙)
                      </Button>
                    </div>
                  </div>

                  {suggesting && (
                    <div className="mb-6 grid grid-cols-1 gap-3">
                      {[1, 2, 3].map((i) => (
                        <div
                          key={i}
                          className="h-16 w-full rounded-xl bg-slate-100/50 dark:bg-slate-800/50 border border-slate-200/50 dark:border-slate-800/50 animate-pulse flex items-center px-4 gap-3"
                          style={{ animationDelay: `${i * 150}ms` }}
                        >
                          <div className="h-4 w-4 rounded-full bg-emerald-500/20" />
                          <div className="h-3 bg-slate-200 dark:bg-slate-700 rounded-full flex-1 max-w-[80%]" />
                        </div>
                      ))}
                    </div>
                  )}
                  {suggestions && (
                    <div className="mb-6 grid grid-cols-1 gap-3 animate-in fade-in slide-in-from-top-4 duration-500">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-2">Suggestions de l'IA</span>
                        <button onClick={() => setSuggestions(null)} className="text-[10px] text-zinc-400 hover:text-zinc-600 font-bold">Fermer</button>
                      </div>
                      {suggestions.map((idea, i) => {
                        // Extract a short preview: first non-empty line after the title line
                        const lines = idea.script.split('\n').map(l => l.trim()).filter(Boolean);
                        const previewLine = lines.find(l => l !== 'Intro' && l !== 'Center' && l !== 'Outro') || '';
                        const preview = previewLine.length > 120 ? previewLine.slice(0, 120) + '…' : previewLine;
                        return (
                          <div key={i} className="flex flex-col gap-2 p-4 rounded-xl border border-emerald-500/10 bg-emerald-500/5 hover:bg-emerald-500/10 hover:border-emerald-500/30 transition-all group relative overflow-hidden">
                            <button
                              onClick={() => handleSelectSuggestion(idea)}
                              className="text-left flex-1"
                            >
                              <div className="absolute top-0 right-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <ChevronRight className="h-4 w-4 text-emerald-500" />
                              </div>
                              <p className="text-sm font-bold text-slate-800 dark:text-slate-100 pr-6 mb-1">{idea.title}</p>
                              {preview && (
                                <p className="text-xs text-slate-500 dark:text-slate-400 italic leading-relaxed line-clamp-2">{preview}</p>
                              )}
                            </button>
                            <div className="flex justify-end mt-2">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleGenerateScriptFromTitle(idea.title);
                                }}
                                disabled={generatingScript}
                                className="h-7 text-[9px] font-bold uppercase tracking-widest text-emerald-500 hover:text-emerald-600 hover:bg-emerald-500/10 rounded-full"
                              >
                                {generatingScript ? (
                                  <RefreshCw className="h-2 w-2 animate-spin mr-1" />
                                ) : (
                                  <Sparkles className="h-2 w-2 mr-1" />
                                )}
                                Générer script complet
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}

                  <div className="relative rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-2 transition-all duration-300 group-focus-within:ring-2 ring-emerald-500/20 border border-slate-200 dark:border-slate-800">
                    <Textarea
                      placeholder="Il était une fois dans un futur proche... Expliquez-moi votre concept ou entrez votre texte final."
                      className="min-h-[400px] resize-none border-none focus-visible:ring-0 bg-transparent text-lg font-medium leading-relaxed"
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                    />

                    {/* Magic Expansion Button Overlay */}
                    {script.length > 0 && script.length < 150 && !generatingScript && (
                      <div className="absolute bottom-4 right-4 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <Button
                          onClick={() => handleGenerateScriptFromTitle()}
                          size="sm"
                          className="rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg border-none flex items-center gap-1.5 px-4 font-bold h-9"
                        >
                          <Sparkles className="h-4 w-4" />
                          Transformer en script complet
                        </Button>
                      </div>
                    )}

                    {generatingScript && (
                      <div className="absolute inset-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-[2px] rounded-2xl flex flex-col items-center justify-center gap-3 animate-in fade-in duration-300 z-20">
                        <div className="flex items-center gap-2 px-6 py-3 bg-white dark:bg-slate-900 rounded-full shadow-2xl border border-emerald-500/20">
                          <RefreshCw className="h-5 w-5 text-emerald-500 animate-spin" />
                          <span className="font-bold text-emerald-600 dark:text-emerald-400">Expansion du script par l'IA...</span>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Controls Column */}
            <div className="space-y-6">
              <Card className="glass-pill border border-emerald-500/10 shadow-xl overflow-hidden backdrop-blur-xl">
                <CardContent className="p-6 space-y-6">
                  <div className="flex items-center gap-2 mb-2 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">
                    <Layout className="h-4 w-4" />
                    Configuration
                  </div>


                  {/* Category Selection */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Grid3X3 className="h-3 w-3" /> Catégorie de Contenu
                    </Label>
                    <div className="flex flex-wrap gap-2">
                      {["All", ...new Set(prompts.map(p => p.category).filter(Boolean)), ...(prompts.some(p => !p.category) ? ["Autres"] : [])].map((cat) => (
                        <button
                          key={cat}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat);
                            setSelectedPromptId(""); // Reset prompt on category change
                          }}
                          className={cn(
                            "px-4 py-2 rounded-xl text-xs font-bold transition-all border-2",
                            selectedCategory === cat
                              ? "bg-black border-black text-white shadow-lg"
                              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-slate-300"
                          )}
                        >
                          {cat === "All" ? "Tous" : cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Prompt Model Selection */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Type className="h-3 w-3" /> Template Visuel {selectedCategory !== "All" && `(${selectedCategory})`}
                    </Label>
                    <Select value={selectedPromptId} onValueChange={setSelectedPromptId}>
                      <SelectTrigger className="h-12 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl">
                        <SelectValue placeholder="Choisir un style visuel..." />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {prompts
                          .filter(p =>
                            selectedCategory === "All" ||
                            p.category === selectedCategory ||
                            (selectedCategory === "Autres" && !p.category)
                          )
                          .map((p) => (
                            <SelectItem key={p.id} value={p.id} className="py-3">
                              <div className="flex flex-col">
                                <span className="font-bold">{p.name}</span>
                                {p.tags && p.tags.length > 0 && (
                                  <span className="text-[9px] text-slate-400 italic">#{p.tags.join(' #')}</span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        {prompts.filter(p =>
                          selectedCategory === "All" ||
                          p.category === selectedCategory ||
                          (selectedCategory === "Autres" && !p.category)
                        ).length === 0 && (
                            <div className="p-4 text-center text-xs text-slate-400 font-medium">
                              Aucun template disponible pour cette catégorie.
                            </div>
                          )}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Music Selection */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Music className="h-3 w-3" /> Musique de fond
                    </Label>
                    <Select value={selectedMusicId} onValueChange={setSelectedMusicId}>
                      <SelectTrigger className="h-12 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl">
                        <SelectValue placeholder="Aucune musique" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="none">Aucune musique</SelectItem>
                        {musicTracks.map((m) => (
                          <SelectItem key={m.id} value={m.id}>
                            <div className="flex flex-col items-start">
                              <span className="font-bold">{m.name}</span>
                              {m.tags && m.tags.length > 0 && (
                                <span className="text-[10px] text-zinc-400 uppercase italic">
                                  {m.tags.join(", ")}
                                </span>
                              )}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Character Identity */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <User className="h-3 w-3" /> Personnage Principal
                    </Label>

                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                      {/* Character Models (Avatars) */}
                      {characterModels.map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => {
                            setSelectedCharacterId(m.id);
                            setCharacterType('avatar');
                          }}
                          className={cn(
                            "group flex flex-col items-center gap-2 p-2 rounded-2xl transition-all border-2",
                            selectedCharacterId === m.id
                              ? "bg-emerald-500/10 border-emerald-500 shadow-lg"
                              : "bg-white dark:bg-slate-900 border-slate-100 dark:border-slate-800 text-slate-500 hover:border-emerald-500/30"
                          )}
                        >
                          <Avatar className={cn(
                            "h-12 w-12 border-2 transition-transform duration-300 group-hover:scale-110",
                            selectedCharacterId === m.id ? "border-emerald-500" : "border-transparent"
                          )}>
                            <AvatarImage src={m.images?.[0]} />
                            <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold">{m.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-[9px] font-black truncate w-full text-center uppercase tracking-tight">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Options Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <Clock className="h-3 w-3" /> Durée
                      </Label>
                      <Select value={duration} onValueChange={setDuration}>
                        <SelectTrigger className="bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="15">15s</SelectItem>
                          <SelectItem value="30">30s</SelectItem>
                          <SelectItem value="60">1m</SelectItem>
                          <SelectItem value="120">2m</SelectItem>
                          <SelectItem value="300">5m</SelectItem>
                          <SelectItem value="600">10m</SelectItem>
                          <SelectItem value="900">15m</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 mt-1 px-1 flex items-center gap-1">
                        <Sparkles className="h-2.5 w-2.5" />
                        Est. {getEstimatedImages(duration)} images
                      </p>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <Layout className="h-3 w-3" /> Format
                      </Label>
                      <Select value={aspectRatio} onValueChange={setAspectRatio}>
                        <SelectTrigger className="bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="16:9">YouTube</SelectItem>
                          <SelectItem value="9:16">TikTok</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                        <Globe className="h-3 w-3" /> Langue
                      </Label>
                      <Select value={language} onValueChange={setLanguage}>
                        <SelectTrigger className="bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="fr-FR">Français</SelectItem>
                          <SelectItem value="en-US">English</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={!script.trim() || generating}
                    className="w-full mt-4 h-14 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-lg rounded-2xl shadow-xl shadow-emerald-500/20 group relative overflow-hidden transition-all active:scale-95"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent group-hover:translate-x-full transition-transform duration-500 pointer-events-none" />
                    DÉMARRER (~85 🪙) <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>
        )}

        {/* Global Progress Screen */}
        {generating && (
          <div className="flex justify-center py-20 animate-in fade-in zoom-in-95 duration-700">
            <div className="w-full max-w-2xl">
              <Card className="glass-pill border-none shadow-[0_0_80px_rgba(16,185,129,0.15)] overflow-hidden relative backdrop-blur-3xl">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 to-cyan-500/10 pointer-events-none" />
                <CardContent className="p-12 lg:p-20 flex flex-col items-center gap-10 relative z-10">
                  <div className="relative h-56 w-56 animate-float">
                    <div className="absolute inset-0 rounded-full border-8 border-emerald-500/5 shadow-inner" />
                    <svg className="h-full w-full -rotate-90 drop-shadow-[0_0_20px_rgba(16,185,129,0.4)]" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        className="stroke-slate-100 dark:stroke-slate-800"
                        strokeWidth="8"
                      />
                      <circle
                        cx="50" cy="50" r="42"
                        fill="none"
                        className="stroke-emerald-500"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 42}`}
                        strokeDashoffset={`${2 * Math.PI * 42 * (1 - currentProgress / 100)}`}
                        style={{ transition: "stroke-dashoffset 1s ease-out" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 px-4">
                      <span className="text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
                        {currentProgress}%
                      </span>
                      {currentMessage && (
                        <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 text-center leading-tight tracking-tight">
                          {currentMessage}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 animate-pulse">
                      Intelligence Artificielle Active
                    </div>
                    <p className="text-slate-500 font-medium italic animate-pulse">
                      La production de votre chef-d'œuvre est en cours...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div >
  );
}
