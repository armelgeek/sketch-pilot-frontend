"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { videosService, type Video } from "@/src/services/videos-service";
import { useVideoProgress } from "@/src/hooks/use-video-progress";

export default function GenerateContentPage() {
  const router = useRouter();

  const [script, setScript] = useState("");
  const [generating, setGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  // Generation Options State
  const [videoType, setVideoType] = useState<string>("explainer");
  const [duration, setDuration] = useState<string>("30");
  const [aspectRatio, setAspectRatio] = useState<string>("16:9");
  const [language, setLanguage] = useState<string>("fr-FR");
  const [style, setStyle] = useState<string>("motivational");

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
      const response = await videosService.generate(script, {
        videoType,
        duration: parseInt(duration, 10),
        aspectRatio,
        language,
        style,
        scriptOnly: true,
        videoGenre: videoType === "explainer" || videoType === "tutorial" ? "educational" : "general",
      });
      setError(null);
      // Synchronous redirect since we have the videoId and script immediately
      router.push(`/generate/${response.videoId}/script`);
    } catch (error: any) {
      setError(error.message || "Failed to start generation");
      setGenerating(false);
    }
  };

  useEffect(() => {
    if (isFinished && jobId && generatedVideoId) {
      // Small delay to let user see 100%
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
    <div className="relative min-h-screen mt-12">
      <div className="mesh-gradient" />

      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8 relative z-10">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-xl text-sm font-medium text-center shadow-lg">
            {error}
          </div>
        )}

        {/* Header */}
        <div className="text-center space-y-2 mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20 mb-4">
            Étape 1 sur 3
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-600 to-cyan-600 bg-clip-text text-transparent">
            Créez votre contenu
          </h1>
          <p className="text-zinc-500 text-lg">Entrez votre script ou décrivez votre sujet pour commencer</p>
        </div>

        {/* Content Form */}
        {!generating && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Card className="glass-pill border-none shadow-2xl overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="glow-border rounded-xl p-1 bg-white/50 dark:bg-black/20">
                  <Textarea
                    placeholder="Entrez votre script ici... L'IA générera automatiquement un storyboard complet."
                    className="min-h-[250px] resize-none border-none focus-visible:ring-0 bg-transparent text-lg"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                  />
                </div>
                {/* Toolbar */}
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                  <Select value={videoType} onValueChange={setVideoType}>
                    <SelectTrigger><SelectValue placeholder="Type" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="explainer">Vidéos explicatives</SelectItem>
                      <SelectItem value="story">Histoires</SelectItem>
                      <SelectItem value="tutorial">Tutoriels</SelectItem>
                      <SelectItem value="promo">Vidéos promotionnelles</SelectItem>
                      <SelectItem value="shorts">Formats courts (Shorts/Reels)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={duration} onValueChange={setDuration}>
                    <SelectTrigger><SelectValue placeholder="Durée cible" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">15 secondes</SelectItem>
                      <SelectItem value="30">30 secondes</SelectItem>
                      <SelectItem value="60">1 minute</SelectItem>
                      <SelectItem value="120">2 minutes</SelectItem>
                      <SelectItem value="300">5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={aspectRatio} onValueChange={setAspectRatio}>
                    <SelectTrigger><SelectValue placeholder="Format" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16:9">YouTube (16:9)</SelectItem>
                      <SelectItem value="9:16">TikTok / Reels (9:16)</SelectItem>
                      <SelectItem value="1:1">Instagram Post (1:1)</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger><SelectValue placeholder="Langue" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fr-FR">Français</SelectItem>
                      <SelectItem value="en-US">English (US)</SelectItem>
                      <SelectItem value="es-ES">Español</SelectItem>
                      <SelectItem value="de-DE">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger><SelectValue placeholder="Style narratif" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="motivational">Motivation</SelectItem>
                      <SelectItem value="educational">Éducatif</SelectItem>
                      <SelectItem value="storytelling">Storytelling</SelectItem>
                      <SelectItem value="tutorial">Tutoriel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end pt-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={!script.trim() || generating}
                    size="lg"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 rounded-xl shadow-lg shadow-emerald-500/20"
                  >
                    Générer le Storyboard <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Global Progress Screen (Shown when generating) */}
        {generating && (
          <div className="flex justify-center animate-in fade-in zoom-in-95 duration-700">
            <div className="w-full max-w-2xl px-4 lg:px-0">
              <Card className="glass-pill border-none shadow-[0_0_50px_rgba(16,185,129,0.1)] overflow-hidden relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 pointer-events-none" />
                <CardContent className="p-10 lg:p-16 flex flex-col items-center gap-8 relative z-10">
                  {/* High-tech Circular progress */}
                  <div className="relative h-48 w-48 animate-float">
                    <div className="absolute inset-0 rounded-full border-4 border-emerald-500/10 dark:border-emerald-500/5" />
                    <svg className="h-full w-full -rotate-90 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)]" viewBox="0 0 100 100">
                      <circle
                        cx="50" cy="50" r="44"
                        fill="none"
                        className="stroke-zinc-100 dark:stroke-zinc-800/50"
                        strokeWidth="6"
                      />
                      <circle
                        cx="50" cy="50" r="44"
                        fill="none"
                        className="stroke-emerald-500"
                        strokeWidth="8"
                        strokeLinecap="round"
                        strokeDasharray={`${2 * Math.PI * 44}`}
                        strokeDashoffset={`${2 * Math.PI * 44 * (1 - currentProgress / 100)}`}
                        style={{ transition: "stroke-dashoffset 0.8s cubic-bezier(0.4, 0, 0.2, 1)" }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-4xl font-black text-emerald-600 dark:text-emerald-400 tracking-tighter">
                        {currentProgress}%
                      </span>
                      <span className="text-[10px] uppercase font-bold text-zinc-400 tracking-widest mt-1">Status</span>
                    </div>
                  </div>

                  <div className="text-center space-y-3">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest border border-emerald-500/20 animate-pulse">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      Live Status
                    </div>
                    <p className="text-2xl font-bold tracking-tight text-zinc-800 dark:text-zinc-200">{currentMessage}</p>
                    {jobError && (
                      <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-2 rounded-xl text-sm font-medium">
                        {jobError}
                      </div>
                    )}
                    {!jobError && (
                      <p className="text-zinc-500 font-medium italic">
                        Création de votre histoire en cours...
                      </p>
                    )}
                  </div>

                  {/* Micro-activity bar */}
                  <div className="w-full h-1 bg-zinc-100 dark:bg-zinc-800 rounded-full overflow-hidden mt-4">
                    <div className="h-full bg-emerald-500 animate-[loading_2s_infinite]" style={{ width: '30%' }} />
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
