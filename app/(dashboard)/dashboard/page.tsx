"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  ChevronRight, Plus, RefreshCw, Sparkles, Globe, Wand2
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { videosService } from "@/src/services/videos-service";
import type { VideoIdea, Video } from "@/src/services/videos-service";
import { useVideoProgress } from "@/src/hooks/use-video-progress";
import { useSSEProgress } from "@/src/contexts/sse-progress-context";
import { useSession, updateUser } from "@/src/lib/auth-client";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { CharacterStudio } from "./components/character-studio";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger
} from "@/src/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Label } from "@/src/components/ui/label";
import { cn } from "@/src/lib/utils";

const adminService = new AdminService();

export default function DashboardPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [script, setScript] = useState("");
  const [generating, setGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const [prompts, setPrompts] = useState<any[]>([]);
  const [characterModels, setCharacterModels] = useState<any[]>([]);
  const [personalModels, setPersonalModels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [duration, setDuration] = useState<string>("60");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [language, setLanguage] = useState<string>("fr-FR");
  const [suggesting, setSuggesting] = useState(false);
  const [generatingScript, setGeneratingScript] = useState(false);
  const [suggestions, setSuggestions] = useState<VideoIdea[] | null>(null);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [recentVideos, setRecentVideos] = useState<Video[]>([]);
  const [updatingPrefs, setUpdatingPrefs] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [pData, charData, myData, vData] = await Promise.all([
          adminService.listPublicPrompts({ limit: 100 }),
          adminService.listStandardModels(),
          adminService.listModels(),
          videosService.getAll()
        ]);
        setPrompts(pData.data || []);
        setCharacterModels(charData.data || []);
        setPersonalModels(myData.data || []);
        setRecentVideos((vData || []).slice(0, 3));

        if (pData.data?.length > 0 && !selectedPromptId) setSelectedPromptId(pData.data[0].id);
        if (charData.data?.length > 0 && !selectedCharacterId) setSelectedCharacterId(charData.data[0].id);
      } catch (err) {
        // silently fail
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [session?.user?.defaultPromptId, session?.user?.defaultCharacterId]);

  useEffect(() => {
    if (session?.user?.language) setLanguage(session.user.language);
    if (session?.user?.defaultPromptId) setSelectedPromptId(session.user.defaultPromptId);
    if (session?.user?.defaultCharacterId) setSelectedCharacterId(session.user.defaultCharacterId);
  }, [session?.user?.language, session?.user?.defaultPromptId, session?.user?.defaultCharacterId]);

  const { progress: realProgress, message: realMessage, isFinished, videoId: generatedVideoId, error: jobError } =
    useVideoProgress(jobId);

  const { startProgress, updateProgress, stopProgress } = useSSEProgress();

  useEffect(() => {
    if (generating && jobId) updateProgress(realProgress, realMessage);
  }, [realProgress, realMessage, generating, jobId, updateProgress]);

  const handleGenerate = async () => {
    try {
      setGenerating(true);
      setError(null);
      let finalScript = script;

      if (script.trim().length > 0 && script.trim().length < 150) {
        startProgress({
          title: "Rédaction du script...",
          onCancel: () => { setGenerating(false); stopProgress(); },
        });
        try {
          const response = await videosService.generateScriptFromTitle(script, {
            language, duration: parseInt(duration, 10), aspectRatio,
          });
          finalScript = response.script;
          setScript(finalScript);
        } catch (err) { /* fall back */ }
      }

      startProgress({
        title: "Initialisation de la vidéo...",
        onCancel: () => { setGenerating(false); setJobId(undefined); stopProgress(); },
      });

      const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);
      const options: any = {
        promptId: selectedPromptId,
        duration: parseInt(duration, 10),
        aspectRatio,
        language,
        scriptOnly: true,
        videoType: selectedPrompt?.category || selectedPrompt?.name || "explainer",
        videoGenre: (selectedPrompt?.category || "").toLowerCase().includes("storytelling") ? "storytelling" : "general",
        characterModelId: selectedCharacterId || session?.user?.defaultCharacterId || undefined,
      };

      const response = await videosService.generate(finalScript, options);
      if (response.jobId) {
        setJobId(response.jobId);
      } else {
        router.push(`/generate/${response.videoId}/script`);
      }
    } catch (error: any) {
      setError(error.message || "Échec du lancement");
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
        characterModelId: selectedCharacterId || session?.user?.defaultCharacterId || undefined,
      });
      setSuggestions(response.topics);
    } catch (err: any) {
      setError(err.message || "Impossible de générer des idées.");
    } finally {
      setSuggesting(false);
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

  const greeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Bonjour";
    if (hour < 18) return "Bon après-midi";
    return "Bonsoir";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[40vh]">
        <div className="animate-spin rounded-full h-6 w-6 border-2 border-stone-200 border-t-stone-400" />
      </div>
    );
  }

  const firstName = session?.user?.name?.split(" ")[0] || "là";

  const handleUpdatePreference = async (updates: { language?: string; defaultPromptId?: string; defaultCharacterId?: string }) => {
    try {
      setUpdatingPrefs(true);
      await updateUser(updates);
      // Update local state if needed
      if (updates.language) setLanguage(updates.language);
      if (updates.defaultPromptId) setSelectedPromptId(updates.defaultPromptId);
      if (updates.defaultCharacterId) setSelectedCharacterId(updates.defaultCharacterId);
    } catch (err) {
      console.error("Failed to update preference:", err);
    } finally {
      setUpdatingPrefs(false);
    }
  };

  const currentPrompt = prompts.find(p => p.id === selectedPromptId);
  const currentCharacter = [...characterModels, ...personalModels].find(c => c.id === selectedCharacterId);

  return (
    <div className="min-h-[calc(100vh-3.5rem)] bg-stone-50 -m-6 p-6 flex flex-col items-center justify-center">

      <div className="w-full max-w-2xl space-y-10 mb-16">

        {/* Greeting */}
        <div className="text-center space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-stone-400">
            Studio de création
          </p>
          <h1 className="text-3xl md:text-4xl font-light text-stone-800 tracking-tight">
            {greeting()}, <span className="font-semibold">{firstName}.</span>
          </h1>
          <p className="text-sm text-stone-400 font-light">
            Décrivez votre sujet, on s'occupe du reste.
          </p>
        </div>

        {/* Studio Configuration Bar (Unified Pill) */}
        <div className="flex justify-center -mt-4 animate-in fade-in slide-in-from-top-2 duration-1000">
          <div className="flex items-center p-1.5 bg-white/40 backdrop-blur-md rounded-full border border-stone-200/50 shadow-lg shadow-stone-200/20">

            {/* Niche Selector */}
            <Select value={selectedPromptId} onValueChange={(val) => handleUpdatePreference({ defaultPromptId: val })}>
              <SelectTrigger className="h-10 border-none bg-transparent hover:bg-white/60 rounded-full px-5 flex items-center gap-2.5 transition-all focus:ring-0 shadow-none group">
                <Globe className="h-3.5 w-3.5 text-stone-400 group-hover:text-stone-600 transition-colors" />
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-0.5">Niche</span>
                  <span className="text-[11px] font-extrabold text-stone-700 whitespace-nowrap">
                    {currentPrompt?.name || "Choisir"}
                  </span>
                </div>
                <ChevronRight className="h-3 w-3 text-stone-300 group-hover:text-stone-400 transition-colors rotate-90 ml-1" />
              </SelectTrigger>
              <SelectContent className="rounded-[2rem] border-stone-100 shadow-2xl p-2 min-w-[220px]">
                {prompts.map((p) => (
                  <SelectItem key={p.id} value={p.id} className="text-xs font-bold rounded-2xl p-3 hover:bg-stone-50 transition-colors cursor-pointer capitalize">
                    {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Divider */}
            <div className="w-px h-6 bg-stone-200/60 mx-1" />

            {/* Character Selector (The Studio Trigger) */}
            <CharacterStudio
              selectedId={selectedCharacterId}
              characterModels={characterModels}
              personalModels={personalModels}
              onSelect={(id) => handleUpdatePreference({ defaultCharacterId: id })}
              onCreated={(newChar) => {
                setPersonalModels(prev => [newChar, ...prev]);
                handleUpdatePreference({ defaultCharacterId: newChar.id });
              }}
            >
              <button className="h-10 border-none bg-transparent hover:bg-white/60 rounded-full px-5 flex items-center gap-3 transition-all group">
                <div className="relative">
                  <Avatar className="h-7 w-7 border-2 border-white shadow-sm">
                    <AvatarImage src={currentCharacter?.images?.[0] || currentCharacter?.thumbnailUrl} />
                    <AvatarFallback className="bg-stone-100 text-[10px] font-black text-stone-400 uppercase">
                      {currentCharacter?.name?.[0] || <Wand2 className="h-3 w-3" />}
                    </AvatarFallback>
                  </Avatar>
                  <div className="absolute -bottom-1 -right-1 h-3.5 w-3.5 rounded-full bg-stone-800 border-2 border-white flex items-center justify-center">
                    <Sparkles className="h-1.5 w-1.5 text-white fill-current" />
                  </div>
                </div>
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-0.5">Personnage</span>
                  <span className="text-[11px] font-extrabold text-stone-700 whitespace-nowrap">
                    {currentCharacter?.name || "Sélectionner"}
                  </span>
                </div>
                <ChevronRight className="h-3 w-3 text-stone-300 group-hover:text-stone-400 transition-colors ml-1" />
              </button>
            </CharacterStudio>

            {/* Divider */}
            <div className="w-px h-6 bg-stone-200/60 mx-1" />

            {/* Language Selector */}
            <Select value={language} onValueChange={(val) => handleUpdatePreference({ language: val })}>
              <SelectTrigger className="h-10 border-none bg-transparent hover:bg-white/60 rounded-full px-5 flex items-center gap-2.5 transition-all focus:ring-0 shadow-none group">
                <div className="flex flex-col items-start leading-none text-left">
                  <span className="text-[9px] font-black uppercase tracking-widest text-stone-400 mb-0.5">Langue</span>
                  <span className="text-[11px] font-extrabold text-stone-700 uppercase tracking-tighter">
                    {language === "fr-FR" ? "Français" : "English"}
                  </span>
                </div>
                <ChevronRight className="h-3 w-3 text-stone-300 group-hover:text-stone-400 transition-colors rotate-90 ml-1" />
              </SelectTrigger>
              <SelectContent className="rounded-[2rem] border-stone-100 shadow-2xl p-2 min-w-[140px]">
                <SelectItem value="fr-FR" className="text-xs font-bold rounded-2xl p-3">🇫🇷 Français</SelectItem>
                <SelectItem value="en-US" className="text-xs font-bold rounded-2xl p-3">🇺🇸 English</SelectItem>
              </SelectContent>
            </Select>

          </div>
          {updatingPrefs && (
            <div className="ml-3 flex items-center">
              <RefreshCw className="h-3 w-3 text-stone-400 animate-spin" />
            </div>
          )}
        </div>

        {/* Main card */}
        <div className="relative group">
          {/* Very subtle shadow ring on focus */}
          <div className="absolute -inset-px rounded-2xl bg-gradient-to-b from-stone-200 to-stone-100 opacity-0 group-focus-within:opacity-100 transition duration-500" />

          <Card className="rounded-2xl border border-stone-200 shadow-sm bg-white overflow-hidden relative">
            <CardContent className="p-0">

              {/* Textarea area */}
              <div className="relative px-6 pt-6 pb-4">
                <Textarea
                  placeholder="Ex : Les 5 erreurs que font les débutants en bourse…"
                  className={cn(
                    "min-h-[120px] w-full resize-none border-none focus-visible:ring-0 shadow-none",
                    "bg-transparent text-lg font-light text-stone-800 placeholder:text-stone-300",
                    "leading-relaxed p-0"
                  )}
                  value={script}
                  onChange={(e) => setScript(e.target.value)}
                />
                {generatingScript && (
                  <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex items-center justify-center rounded-xl z-10">
                    <RefreshCw className="h-5 w-5 text-stone-400 animate-spin" />
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="h-px bg-stone-100 mx-4" />

              {/* Controls row */}
              <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
                <div className="flex flex-wrap items-center gap-2">

                  {/* Duration */}
                  <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-lg">
                    {["30", "60", "300"].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setDuration(d)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-[11px] font-medium transition-all",
                          duration === d
                            ? "bg-white text-stone-800 shadow-sm"
                            : "text-stone-400 hover:text-stone-600"
                        )}
                      >
                        {d === "300" ? "5 min" : d === "60" ? "1 min" : "30s"}
                      </button>
                    ))}
                  </div>

                  {/* Format */}
                  <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-lg">
                    {[
                      { val: "16:9", label: "YouTube" },
                      { val: "9:16", label: "TikTok" },
                    ].map((f) => (
                      <button
                        key={f.val}
                        type="button"
                        onClick={() => setAspectRatio(f.val)}
                        className={cn(
                          "px-3 py-1.5 rounded-md text-[11px] font-medium transition-all",
                          aspectRatio === f.val
                            ? "bg-white text-stone-800 shadow-sm"
                            : "text-stone-400 hover:text-stone-600"
                        )}
                      >
                        {f.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Send */}
                <button
                  type="button"
                  onClick={handleGenerate}
                  disabled={!script.trim() || generating}
                  className={cn(
                    "h-9 w-9 rounded-full flex items-center justify-center transition-all",
                    script.trim() && !generating
                      ? "bg-stone-800 text-white hover:bg-stone-700 shadow-sm hover:shadow-md active:scale-95"
                      : "bg-stone-100 text-stone-300 cursor-not-allowed"
                  )}
                >
                  {generating
                    ? <RefreshCw className="h-4 w-4 animate-spin" />
                    : <ChevronRight className="h-4 w-4" />
                  }
                </button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Suggestions row */}
        <div className="flex flex-wrap justify-center gap-2">
          <button
            type="button"
            onClick={handleSuggestTopics}
            disabled={suggesting}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-stone-200 bg-white text-xs font-medium text-stone-500 hover:text-stone-800 hover:border-stone-300 hover:shadow-sm transition-all"
          >
            <Sparkles className={cn("h-3 w-3", suggesting && "animate-spin")} />
            {suggesting ? "Recherche…" : "Inspirations"}
          </button>

          {suggestions && suggestions.slice(0, 3).map((idea, i) => (
            <button
              key={i}
              type="button"
              onClick={() => { setScript(idea.script); setSuggestions(null); }}
              className="inline-flex items-center px-4 py-2 rounded-full border border-stone-200 bg-white text-xs font-medium text-stone-500 hover:text-stone-800 hover:border-stone-300 hover:shadow-sm transition-all"
            >
              {idea.title}
            </button>
          ))}

          {suggestions && (
            <button
              type="button"
              onClick={() => setSuggestions(null)}
              className="inline-flex items-center px-4 py-2 rounded-full text-xs text-stone-300 hover:text-stone-500 transition-colors"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Recent Videos Section */}
        {recentVideos.length > 0 && (
          <div className="pt-10 w-full animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <div className="flex items-center justify-between mb-6 px-1">
              <h3 className="text-sm font-bold text-stone-400 uppercase tracking-widest">Générations récentes</h3>
              <Button variant="link" onClick={() => router.push("/videos")} className="text-xs text-stone-400 hover:text-stone-800 font-bold p-0">
                Voir tout
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentVideos.map((video) => (
                <Card key={video.id} className="rounded-2xl border border-stone-100 bg-white/50 hover:bg-white transition-all cursor-pointer overflow-hidden group" onClick={() => router.push(`/generate/${video.id}/script`)}>
                  <div className="aspect-video bg-stone-100 relative">
                    {video.thumbnailUrl && <img src={video.thumbnailUrl} alt={video.title} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />}
                    <div className="absolute inset-0 bg-stone-900/0 group-hover:bg-stone-900/10 transition-colors" />
                  </div>
                  <div className="p-3">
                    <p className="text-xs font-bold text-stone-800 line-clamp-1">{video.title || "Sans titre"}</p>
                    <p className="text-[10px] text-stone-400 font-medium mt-0.5 capitalize">{video.status}</p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <p className="fixed bottom-6 text-[10px] tracking-widest uppercase text-stone-300 font-medium">
        Sketch Pilot · v2.0
      </p>
    </div>
  );
}
