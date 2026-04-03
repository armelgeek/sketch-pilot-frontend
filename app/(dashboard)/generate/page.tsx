"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Clock, Globe, Layout, Sparkles, User, Wand2, Type, Music, RefreshCw, Play } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
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
        if (pData.data?.length > 0) setSelectedPromptId(pData.data[0].id);
        if (charData.data?.length > 0) setSelectedCharacterId(charData.data[0].id);
      } catch (err) {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const { progress: realProgress, message: realMessage, isFinished, videoId: generatedVideoId, error: jobError } =
    useVideoProgress(jobId);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
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
      setTimeout(() => { router.push(`/generate/${generatedVideoId}/script`); }, 1000);
    } else if (isFinished && jobError) {
      setGenerating(false);
    }
  }, [isFinished, jobId, generatedVideoId, jobError, router]);

  const currentProgress = generating ? realProgress : 0;
  const currentMessage = generating ? realMessage : "";

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

      {!generating && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Script column */}
          <div className="lg:col-span-2 space-y-4">
            <Card className="bg-white border border-zinc-100 rounded-2xl shadow-none">
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2 text-sm font-bold text-zinc-700">
                    <Wand2 className="h-4 w-4 text-zinc-400" />
                    Script / Narration
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      onClick={handleSuggestTopics}
                      disabled={suggesting || generatingScript}
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px] font-bold uppercase tracking-widest rounded-lg border-zinc-200 hover:border-zinc-300"
                    >
                      {suggesting ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <Sparkles className="h-3 w-3 mr-1" />}
                      Idée (5 🪙)
                    </Button>
                    <Button
                      onClick={() => handleGenerateScriptFromTitle()}
                      disabled={suggesting || generatingScript || !script.trim()}
                      variant="outline"
                      size="sm"
                      className="h-7 text-[10px] font-bold uppercase tracking-widest rounded-lg border-zinc-200 hover:border-zinc-300"
                    >
                      {generatingScript ? <RefreshCw className="h-3 w-3 animate-spin mr-1" /> : <Type className="h-3 w-3 mr-1" />}
                      Script (10 🪙)
                    </Button>
                  </div>
                </div>

                {suggesting && (
                  <div className="mb-4 space-y-2">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-14 rounded-xl bg-zinc-50 animate-pulse" style={{ animationDelay: `${i * 100}ms` }} />
                    ))}
                  </div>
                )}
                {suggestions && (
                  <div className="mb-4 space-y-2">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Suggestions IA</span>
                      <button onClick={() => setSuggestions(null)} className="text-[10px] text-zinc-400 hover:text-zinc-600 font-bold">Fermer</button>
                    </div>
                    {suggestions.map((idea, i) => {
                      const lines = idea.script.split("\n").map((l) => l.trim()).filter(Boolean);
                      const preview = lines.find((l) => l !== "Intro" && l !== "Center" && l !== "Outro") || "";
                      return (
                        <div key={i} className="p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 bg-white transition-all cursor-pointer">
                          <button onClick={() => handleSelectSuggestion(idea)} className="text-left w-full">
                            <p className="text-sm font-bold text-zinc-900 mb-1">{idea.title}</p>
                            {preview && <p className="text-xs text-zinc-500 line-clamp-2">{preview.slice(0, 100)}…</p>}
                          </button>
                          <div className="flex justify-end mt-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => { e.stopPropagation(); handleGenerateScriptFromTitle(idea.title); }}
                              disabled={generatingScript}
                              className="h-6 text-[9px] font-bold uppercase tracking-widest text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg"
                            >
                              {generatingScript ? <RefreshCw className="h-2.5 w-2.5 animate-spin mr-1" /> : <Sparkles className="h-2.5 w-2.5 mr-1" />}
                              Générer script
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="relative rounded-xl bg-zinc-50 border border-zinc-100">
                  <Textarea
                    placeholder="Il était une fois… Décrivez votre concept ou collez votre texte final."
                    className="min-h-[360px] resize-none border-none focus-visible:ring-0 bg-transparent text-sm font-medium leading-relaxed"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                  />
                  {script.length > 5 && script.length < 150 && !generatingScript && (
                    <div className="absolute bottom-3 right-3">
                      <Button
                        onClick={() => handleGenerateScriptFromTitle()}
                        size="sm"
                        className="rounded-lg bg-zinc-900 hover:bg-zinc-700 text-white text-xs font-bold h-8 px-3"
                      >
                        <Sparkles className="h-3 w-3 mr-1.5" />
                        Développer
                      </Button>
                    </div>
                  )}
                  {generatingScript && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-xl flex items-center justify-center gap-2 z-20">
                      <RefreshCw className="h-4 w-4 text-zinc-600 animate-spin" />
                      <span className="font-bold text-zinc-700 text-sm">Rédaction en cours…</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Settings column */}
          <div className="space-y-4">
            <Card className="bg-white border border-zinc-100 rounded-2xl shadow-none">
              <CardContent className="p-5 space-y-5">
                <p className="text-xs font-black uppercase tracking-widest text-zinc-400">Configuration</p>

                {prompts.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-500">Template visuel</Label>
                    <Select value={selectedPromptId} onValueChange={setSelectedPromptId}>
                      <SelectTrigger className="bg-zinc-50 border-zinc-200 rounded-xl h-10 text-sm">
                        <SelectValue placeholder="Choisir un style…" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {prompts.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            <span className="font-semibold">{p.name}</span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label className="text-xs font-bold text-zinc-500 flex items-center gap-1.5">
                    <Music className="h-3 w-3" /> Musique de fond
                  </Label>
                  <Select value={selectedMusicId} onValueChange={setSelectedMusicId}>
                    <SelectTrigger className="bg-zinc-50 border-zinc-200 rounded-xl h-10 text-sm">
                      <SelectValue placeholder="Aucune musique" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      <SelectItem value="none">Aucune</SelectItem>
                      {musicTracks.map((m) => (
                        <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {characterModels.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs font-bold text-zinc-500 flex items-center gap-1.5">
                      <User className="h-3 w-3" /> Personnage
                    </Label>
                    <div className="grid grid-cols-3 gap-2">
                      {characterModels.slice(0, 6).map((m) => (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setSelectedCharacterId(m.id)}
                          className={cn(
                            "flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all",
                            selectedCharacterId === m.id
                              ? "border-zinc-900 bg-zinc-50"
                              : "border-zinc-100 bg-white hover:border-zinc-300"
                          )}
                        >
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={m.images?.[0]} />
                            <AvatarFallback className="bg-zinc-100 text-zinc-600 font-black text-sm">{m.name[0]}</AvatarFallback>
                          </Avatar>
                          <span className="text-[9px] font-black truncate w-full text-center uppercase tracking-tight">{m.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                      <Clock className="h-3 w-3" /> Durée
                    </Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="bg-zinc-50 border-zinc-200 rounded-xl h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="15">15s</SelectItem>
                        <SelectItem value="30">30s</SelectItem>
                        <SelectItem value="60">1 min</SelectItem>
                        <SelectItem value="120">2 min</SelectItem>
                        <SelectItem value="300">5 min</SelectItem>
                        <SelectItem value="600">10 min</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                      <Layout className="h-3 w-3" /> Format
                    </Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="bg-zinc-50 border-zinc-200 rounded-xl h-9 text-xs">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">YouTube</SelectItem>
                        <SelectItem value="9:16">TikTok</SelectItem>
                        <SelectItem value="1:1">Instagram</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1">
                    <Globe className="h-3 w-3" /> Langue
                  </Label>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="bg-zinc-50 border-zinc-200 rounded-xl h-9 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr-FR">Français</SelectItem>
                      <SelectItem value="en-US">English</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button
                  onClick={handleGenerate}
                  disabled={!script.trim() || generating}
                  className="w-full h-11 bg-zinc-900 hover:bg-zinc-700 text-white font-black rounded-xl shadow-sm group"
                >
                  <Play className="h-4 w-4 mr-2" />
                  Générer (~85 🪙)
                  <ChevronRight className="ml-2 h-4 w-4 group-hover:translate-x-0.5 transition-transform" />
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {generating && (
        <div className="flex justify-center py-12">
          <Card className="w-full max-w-xl bg-white border border-zinc-100 rounded-2xl shadow-none">
            <CardContent className="p-12 flex flex-col items-center gap-8">
              <div className="relative h-44 w-44">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" className="stroke-zinc-100" strokeWidth="7" />
                  <circle
                    cx="50" cy="50" r="42" fill="none"
                    className="stroke-zinc-900"
                    strokeWidth="7"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - currentProgress / 100)}`}
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black tracking-tighter text-zinc-900">{currentProgress}%</span>
                  {currentMessage && <span className="text-[10px] font-semibold text-zinc-400 text-center max-w-[80px] mt-1">{currentMessage}</span>}
                </div>
              </div>
              <div className="text-center space-y-2">
                <p className="font-black text-zinc-900">Génération en cours…</p>
                <p className="text-sm text-zinc-400 font-medium">L'IA travaille sur votre vidéo</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
