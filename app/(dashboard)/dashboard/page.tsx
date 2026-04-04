"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, RefreshCw, Sparkles, Globe } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/src/components/ui/select";
import { videosService } from "@/src/services/videos-service";
import type { VideoIdea, Video } from "@/src/services/videos-service";
import { useVideoProgress } from "@/src/hooks/use-video-progress";
import { useSSEProgress } from "@/src/contexts/sse-progress-context";
import { useSession, updateUser } from "@/src/lib/auth-client";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { CharacterStudio } from "./components/character-studio";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
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

      <div className="w-full max-w-xl space-y-6 mb-16">

        {/* Greeting */}
        <div className="text-center space-y-1">
          <h1 className="text-2xl font-semibold text-stone-800 tracking-tight">
            {greeting()}, {firstName}.
          </h1>
          <p className="text-sm text-stone-400">
            Décrivez votre sujet, on s'occupe du reste.
          </p>
        </div>

        {/* Config row */}
        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Niche */}
          <Select value={selectedPromptId} onValueChange={(val) => handleUpdatePreference({ defaultPromptId: val })}>
            <SelectTrigger className="h-8 text-xs font-medium bg-white border border-stone-200 rounded-lg px-3 gap-1.5 shadow-none focus:ring-0 w-auto">
              <Globe className="h-3.5 w-3.5 text-stone-400" />
              <span className="text-stone-700">{currentPrompt?.name || "Niche"}</span>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-stone-100 shadow-xl">
              {prompts.map((p) => (
                <SelectItem key={p.id} value={p.id} className="text-xs capitalize">{p.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Character */}
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
            <button className="h-8 flex items-center gap-1.5 bg-white border border-stone-200 rounded-lg px-3 text-xs font-medium text-stone-700 hover:border-stone-300 transition-colors">
              <Avatar className="h-4 w-4">
                <AvatarImage src={currentCharacter?.images?.[0] || currentCharacter?.thumbnailUrl} />
                <AvatarFallback className="bg-stone-100 text-[8px] font-black text-stone-400">
                  {currentCharacter?.name?.[0] || "?"}
                </AvatarFallback>
              </Avatar>
              {currentCharacter?.name || "Personnage"}
            </button>
          </CharacterStudio>

          {/* Language */}
          <Select value={language} onValueChange={(val) => handleUpdatePreference({ language: val })}>
            <SelectTrigger className="h-8 text-xs font-medium bg-white border border-stone-200 rounded-lg px-3 gap-1.5 shadow-none focus:ring-0 w-auto">
              <span>{language === "fr-FR" ? "🇫🇷 FR" : "🇺🇸 EN"}</span>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-stone-100 shadow-xl">
              <SelectItem value="fr-FR" className="text-xs">🇫🇷 Français</SelectItem>
              <SelectItem value="en-US" className="text-xs">🇺🇸 English</SelectItem>
            </SelectContent>
          </Select>

          {updatingPrefs && <RefreshCw className="h-3 w-3 text-stone-400 animate-spin" />}
        </div>

        {/* Main card */}
        <Card className="rounded-2xl border border-stone-200 shadow-sm bg-white overflow-hidden">
          <CardContent className="p-0">
            <div className="relative px-5 pt-5 pb-3">
              <Textarea
                placeholder="Ex : Les 5 erreurs que font les débutants en bourse…"
                className={cn(
                  "min-h-[100px] w-full resize-none border-none focus-visible:ring-0 shadow-none",
                  "bg-transparent text-base font-light text-stone-800 placeholder:text-stone-300",
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

            <div className="h-px bg-stone-100 mx-4" />

            <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-lg">
                  {["30", "60", "300"].map((d) => (
                    <button key={d} type="button" onClick={() => setDuration(d)}
                      className={cn("px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
                        duration === d ? "bg-white text-stone-800 shadow-sm" : "text-stone-400 hover:text-stone-600"
                      )}>
                      {d === "300" ? "5 min" : d === "60" ? "1 min" : "30s"}
                    </button>
                  ))}
                </div>
                <div className="flex items-center gap-0.5 bg-stone-100 p-0.5 rounded-lg">
                  {[{ val: "16:9", label: "YouTube" }, { val: "9:16", label: "TikTok" }].map((f) => (
                    <button key={f.val} type="button" onClick={() => setAspectRatio(f.val)}
                      className={cn("px-2.5 py-1 rounded-md text-[11px] font-medium transition-all",
                        aspectRatio === f.val ? "bg-white text-stone-800 shadow-sm" : "text-stone-400 hover:text-stone-600"
                      )}>
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
              <button type="button" onClick={handleGenerate} disabled={!script.trim() || generating}
                className={cn("h-8 w-8 rounded-full flex items-center justify-center transition-all",
                  script.trim() && !generating
                    ? "bg-stone-900 text-white hover:bg-stone-700 active:scale-95"
                    : "bg-stone-100 text-stone-300 cursor-not-allowed"
                )}>
                {generating ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <ChevronRight className="h-3.5 w-3.5" />}
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Suggestions */}
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" onClick={handleSuggestTopics} disabled={suggesting}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-stone-200 bg-white text-xs text-stone-500 hover:text-stone-800 hover:border-stone-300 transition-all">
            <Sparkles className={cn("h-3 w-3", suggesting && "animate-spin")} />
            {suggesting ? "Recherche…" : "Inspirations"}
          </button>
          {suggestions && suggestions.slice(0, 3).map((idea, i) => (
            <button key={i} type="button" onClick={() => { setScript(idea.script); setSuggestions(null); }}
              className="inline-flex items-center px-3 py-1.5 rounded-full border border-stone-200 bg-white text-xs text-stone-500 hover:text-stone-800 hover:border-stone-300 transition-all">
              {idea.title}
            </button>
          ))}
          {suggestions && (
            <button type="button" onClick={() => setSuggestions(null)}
              className="inline-flex items-center px-3 py-1.5 rounded-full text-xs text-stone-300 hover:text-stone-500 transition-colors">
              Effacer
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
