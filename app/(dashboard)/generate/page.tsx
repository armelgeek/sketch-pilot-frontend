"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Clock, Globe, Layout, Sparkles, User, Wand2, Type, Music } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { videosService } from "@/src/services/videos-service";
import { useVideoProgress } from "@/src/hooks/use-video-progress";
import { AdminService } from "@/src/app/admin/api/admin-service";

const adminService = new AdminService();

export default function GenerateContentPage() {
  const router = useRouter();

  const [script, setScript] = useState("");
  const [generating, setGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  // Generation Options State
  const [prompts, setPrompts] = useState<any[]>([])
  const [characterModels, setCharacterModels] = useState<any[]>([])
  const [musicTracks, setMusicTracks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [selectedCharacterModelId, setSelectedCharacterModelId] = useState<string>('none')
  const [selectedMusicId, setSelectedMusicId] = useState<string>('none')
  const [duration, setDuration] = useState<string>("30");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [language, setLanguage] = useState<string>("fr-FR");
  const [style, setStyle] = useState<string>("storytelling");

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pData, mData, musicData] = await Promise.all([
          adminService.listPublicPrompts({ limit: 100 }),
          adminService.listModels(),
          adminService.listMusic()
        ])
        setPrompts(pData.data || [])
        setCharacterModels(mData || [])
        setMusicTracks(musicData || [])
        if (pData.data?.length > 0) setSelectedPromptId(pData.data[0].id)
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
        videoType: selectedPrompt?.name || "explainer",
        videoGenre: selectedPrompt?.name?.toLowerCase().includes("explicative") ? "educational" : "general",
        backgroundMusic: selectedMusicId !== 'none' ? selectedMusicId : undefined
      }

      if (selectedCharacterModelId !== 'none') {
        options.characterModelId = selectedCharacterModelId
      }

      const response = await videosService.generate(script, options);
      setError(null);
      router.push(`/generate/${response.videoId}/script`);
    } catch (error: any) {
      setError(error.message || "Failed to start generation");
      setGenerating(false);
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
                  <div className="flex items-center gap-2 mb-4 text-emerald-600 dark:text-emerald-400 font-bold text-sm uppercase tracking-wider">
                    <Wand2 className="h-4 w-4" />
                    Script & Narration
                  </div>
                  <div className="relative rounded-2xl bg-slate-50 dark:bg-slate-900/50 p-2 transition-all duration-300 group-focus-within:ring-2 ring-emerald-500/20 border border-slate-200 dark:border-slate-800">
                    <Textarea
                      placeholder="Il était une fois dans un futur proche... Expliquez-moi votre concept ou entrez votre texte final."
                      className="min-h-[400px] resize-none border-none focus-visible:ring-0 bg-transparent text-lg font-medium leading-relaxed"
                      value={script}
                      onChange={(e) => setScript(e.target.value)}
                    />
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

                  {/* Character Selection */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <User className="h-3 w-3" /> Personnage principal
                    </Label>
                    <Select value={selectedCharacterModelId} onValueChange={setSelectedCharacterModelId}>
                      <SelectTrigger className="h-14 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl px-4 hover:border-emerald-500 transition-colors">
                        <SelectValue placeholder="Choisir un avatar" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl border-emerald-500/20">
                        <SelectItem value="none" className="py-3">
                          <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8 border-2 border-slate-100 dark:border-slate-800">
                              <AvatarFallback className="bg-slate-100 dark:bg-slate-900 text-slate-400 text-[10px]">
                                <Sparkles className="h-4 w-4" />
                              </AvatarFallback>
                            </Avatar>
                            <div className="text-left">
                              <p className="font-bold text-sm">IA Libre</p>
                              <p className="text-[10px] text-slate-400 uppercase tracking-tight">Génération créative</p>
                            </div>
                          </div>
                        </SelectItem>
                        {characterModels.map((m) => (
                          <SelectItem key={m.id} value={m.id} className="py-3">
                            <div className="flex items-center gap-3">
                              <Avatar className="h-8 w-8 border-2 border-emerald-500/10">
                                <AvatarImage src={m.imageUrl} />
                                <AvatarFallback className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600">{m.name[0]}</AvatarFallback>
                              </Avatar>
                              <div className="text-left">
                                <p className="font-bold text-sm">{m.name}</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-tight">Profil mémorisé</p>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Prompt Model Selection */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold uppercase tracking-widest text-slate-400 flex items-center gap-1.5">
                      <Type className="h-3 w-3" /> Template Visuel
                    </Label>
                    <Select value={selectedPromptId} onValueChange={setSelectedPromptId}>
                      <SelectTrigger className="h-12 bg-white/50 dark:bg-slate-950/50 border-slate-200 dark:border-slate-800 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        {prompts.map((p) => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
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
                        </SelectContent>
                      </Select>
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
                    Continuer <ChevronRight className="ml-2 h-6 w-6 group-hover:translate-x-1 transition-transform" />
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
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-5xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
                        {currentProgress}%
                      </span>
                    </div>
                  </div>

                  <div className="text-center space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 animate-pulse">
                      Intelligence Artificielle Active
                    </div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100">{currentMessage}</h2>
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
    </div>
  );
}
