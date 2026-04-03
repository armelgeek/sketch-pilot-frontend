"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  CheckCircle2,
  ChevronRight,
  Sparkles,
  User,
  Video,
  ArrowRight,
  Play,
  Clock,
  Globe,
  Layout,
  Wand2,
  RefreshCw,
  Plus,
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { useSession } from "@/src/lib/auth-client";
import { videosService } from "@/src/services/videos-service";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { cn } from "@/src/lib/utils";
import { useVideoProgress } from "@/src/hooks/use-video-progress";

const adminService = new AdminService();

const STEPS = [
  { id: 1, label: "Votre personnage", icon: User },
  { id: 2, label: "Votre vidéo", icon: Video },
  { id: 3, label: "Génération", icon: Sparkles },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  const [step, setStep] = useState(1);

  // Step 1 – Character
  const [characterModels, setCharacterModels] = useState<any[]>([]);
  const [selectedCharacterId, setSelectedCharacterId] = useState<string>("");
  const [modelsLoading, setModelsLoading] = useState(true);

  // Step 2 – Video config
  const [prompts, setPrompts] = useState<any[]>([]);
  const [selectedPromptId, setSelectedPromptId] = useState<string>("");
  const [script, setScript] = useState("");
  const [duration, setDuration] = useState("60");
  const [aspectRatio, setAspectRatio] = useState("16:9");
  const [language, setLanguage] = useState("fr-FR");
  const [generatingScript, setGeneratingScript] = useState(false);

  // Step 3 – Generation
  const [generating, setGenerating] = useState(false);
  const [jobId, setJobId] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);

  const { progress, message, isFinished, videoId: generatedVideoId, error: jobError } =
    useVideoProgress(jobId);

  useEffect(() => {
    const load = async () => {
      try {
        const [pData, charData] = await Promise.all([
          adminService.listPublicPrompts({ limit: 100 }),
          adminService.listModels(),
        ]);
        setPrompts(pData.data || []);
        setCharacterModels(charData.data || []);
        if (pData.data?.length > 0) setSelectedPromptId(pData.data[0].id);
        if (charData.data?.length > 0) setSelectedCharacterId(charData.data[0].id);
      } catch (err) {
        console.error("[Onboarding] Failed to load data:", err);
      } finally {
        setModelsLoading(false);
      }
    };
    load();
  }, []);

  // Redirect after generation completes
  useEffect(() => {
    if (isFinished && generatedVideoId) {
      markOnboardingComplete();
      setTimeout(() => router.push(`/generate/${generatedVideoId}/script`), 1000);
    } else if (isFinished && jobError) {
      setError(jobError);
      setGenerating(false);
    }
  }, [isFinished, generatedVideoId, jobError, router]);

  const markOnboardingComplete = () => {
    if (session?.user?.id) {
      localStorage.setItem(`sketch_pilot_onboarded_${session.user.id}`, "true");
    }
  };

  const handleSkipOnboarding = () => {
    markOnboardingComplete();
    router.push("/dashboard");
  };

  const handleGenerateScript = async () => {
    if (!script.trim()) return;
    try {
      setGeneratingScript(true);
      setError(null);
      const res = await videosService.generateScriptFromTitle(script, {
        language,
        duration: parseInt(duration, 10),
        aspectRatio,
      });
      setScript(res.script);
    } catch (err: any) {
      setError(err.message || "Impossible de générer le script.");
    } finally {
      setGeneratingScript(false);
    }
  };

  const handleGenerate = async () => {
    if (!script.trim()) return;
    setStep(3);
    try {
      setGenerating(true);
      setError(null);
      const selectedPrompt = prompts.find((p) => p.id === selectedPromptId);
      const options: any = {
        promptId: selectedPromptId,
        duration: parseInt(duration, 10),
        aspectRatio,
        language,
        scriptOnly: true,
        videoType: selectedPrompt?.category || selectedPrompt?.name || "explainer",
        characterModelId: selectedCharacterId || undefined,
      };
      const response = await videosService.generate(script, options);
      if (response.jobId) {
        setJobId(response.jobId);
      } else {
        markOnboardingComplete();
        router.push(`/generate/${response.videoId}/script`);
      }
    } catch (err: any) {
      setError(err.message || "Échec du démarrage.");
      setGenerating(false);
      setStep(2);
    }
  };

  const currentProgress = generating ? progress : 0;
  const currentMessage = generating ? message : "";

  return (
    <div className="min-h-screen flex flex-col items-center justify-start py-10 px-4 relative">
{/* Logo + Skip */}
      <div className="w-full max-w-3xl flex items-center justify-between mb-10 relative z-10">
        <div className="flex items-center gap-2.5 font-black text-xl text-zinc-900">
          <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-zinc-900 text-white shadow-md text-base">
            ✏️
          </div>
          <span className="tracking-tight">Sketch Pilot</span>
        </div>
        <button
          onClick={handleSkipOnboarding}
          className="text-xs font-bold text-zinc-400 hover:text-zinc-700 transition-colors"
        >
          Passer l&apos;intro →
        </button>
      </div>

      {/* Stepper */}
      <div className="w-full max-w-3xl relative z-10 mb-10">
        <div className="flex items-center justify-between">
          {STEPS.map((s, i) => {
            const Icon = s.icon;
            const isActive = step === s.id;
            const isDone = step > s.id;
            return (
              <div key={s.id} className="flex items-center flex-1">
                <div className="flex flex-col items-center gap-2 flex-1">
                  <div
                    className={cn(
                      "h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all font-black text-sm",
                      isDone
                        ? "bg-emerald-500 border-emerald-500 text-white"
                        : isActive
                        ? "bg-white border-emerald-500 text-emerald-600 shadow-lg shadow-emerald-500/20"
                        : "bg-white border-zinc-200 text-zinc-400"
                    )}
                  >
                    {isDone ? <CheckCircle2 className="h-5 w-5" /> : <Icon className="h-4 w-4" />}
                  </div>
                  <span
                    className={cn(
                      "text-[10px] font-black uppercase tracking-widest",
                      isActive ? "text-emerald-600" : isDone ? "text-emerald-500" : "text-zinc-400"
                    )}
                  >
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div
                    className={cn(
                      "h-0.5 flex-1 mx-2 rounded-full transition-all",
                      step > s.id ? "bg-emerald-400" : "bg-zinc-200"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1 — Choose Character */}
      {step === 1 && (
        <div className="w-full max-w-3xl relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="text-center mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-black uppercase tracking-widest border border-emerald-500/20">
              <Sparkles className="h-3 w-3" /> Étape 1 / 3
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900">
              Choisissez votre <span className="text-emerald-500">personnage</span>
            </h1>
            <p className="text-zinc-500 font-medium max-w-md mx-auto">
              Sélectionnez le personnage qui apparaîtra dans vos vidéos. Vous pourrez en ajouter d&apos;autres plus tard.
            </p>
          </div>

          {modelsLoading ? (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-8">
              {[1, 2, 3, 4, 5].map((i) => (
                <div
                  key={i}
                  className="aspect-square rounded-2xl bg-zinc-100 animate-pulse"
                  style={{ animationDelay: `${i * 100}ms` }}
                />
              ))}
            </div>
          ) : characterModels.length === 0 ? (
            <Card className="mb-8 border-dashed border-2 border-zinc-200 rounded-3xl">
              <CardContent className="py-16 flex flex-col items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-zinc-100 flex items-center justify-center text-zinc-400">
                  <User className="h-8 w-8" />
                </div>
                <p className="text-zinc-500 font-medium text-center max-w-xs">
                  Aucun personnage disponible pour l&apos;instant. Un administrateur devra en créer.
                </p>
                <Button
                  variant="outline"
                  className="rounded-xl font-bold"
                  onClick={() => router.push("/admin/models/new")}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Créer un personnage
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4 mb-8">
              {characterModels.map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSelectedCharacterId(m.id)}
                  className={cn(
                    "group flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border-2 text-left",
                    selectedCharacterId === m.id
                      ? "bg-emerald-500/10 border-emerald-500 shadow-lg shadow-emerald-500/10"
                      : "bg-white border-zinc-100 hover:border-emerald-300 hover:shadow-md"
                  )}
                >
                  <Avatar
                    className={cn(
                      "h-16 w-16 border-2 transition-transform duration-300 group-hover:scale-105",
                      selectedCharacterId === m.id ? "border-emerald-500" : "border-transparent"
                    )}
                  >
                    <AvatarImage src={m.images?.[0]} alt={m.name} />
                    <AvatarFallback className="bg-emerald-100 text-emerald-700 font-black text-lg">
                      {m.name[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="text-[10px] font-black truncate w-full text-center uppercase tracking-tight">
                    {m.name}
                  </span>
                  {selectedCharacterId === m.id && (
                    <div className="flex items-center gap-1 text-emerald-600">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          <div className="flex justify-end">
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedCharacterId && characterModels.length > 0}
              className="h-12 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 group"
            >
              Continuer
              <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
          </div>
        </div>
      )}

      {/* Step 2 — Setup first video */}
      {step === 2 && (
        <div className="w-full max-w-3xl relative z-10 animate-in fade-in slide-in-from-bottom-6 duration-500">
          <div className="text-center mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-black uppercase tracking-widest border border-emerald-500/20">
              <Sparkles className="h-3 w-3" /> Étape 2 / 3
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900">
              Créez votre <span className="text-emerald-500">première vidéo</span>
            </h1>
            <p className="text-zinc-500 font-medium max-w-md mx-auto">
              Décrivez votre sujet ou collez votre script. Notre IA se charge du reste.
            </p>
          </div>

          {error && (
            <div className="mb-4 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}

          <div className="space-y-6">
            {/* Script Input */}
            <Card className="border border-emerald-500/10 shadow-xl rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-emerald-600 font-bold text-sm uppercase tracking-wider">
                    <Wand2 className="h-4 w-4" />
                    Script / Sujet
                  </div>
                  {script.trim().length > 5 && script.length < 200 && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleGenerateScript}
                      disabled={generatingScript}
                      className="h-8 text-[10px] font-bold uppercase tracking-widest border-emerald-500/20 bg-emerald-500/5 text-emerald-600 hover:bg-emerald-500/10 rounded-full"
                    >
                      {generatingScript ? (
                        <RefreshCw className="h-3 w-3 animate-spin mr-1.5" />
                      ) : (
                        <Sparkles className="h-3 w-3 mr-1.5" />
                      )}
                      Développer en script (10 🪙)
                    </Button>
                  )}
                </div>

                <div className="relative rounded-2xl bg-zinc-50 p-2 border border-zinc-100">
                  <Textarea
                    placeholder="Ex : « Les 5 erreurs à éviter quand on lance une startup en 2025 »"
                    className="min-h-[180px] resize-none border-none focus-visible:ring-0 bg-transparent text-base font-medium leading-relaxed"
                    value={script}
                    onChange={(e) => setScript(e.target.value)}
                  />
                  {generatingScript && (
                    <div className="absolute inset-0 bg-white/70 backdrop-blur-[2px] rounded-2xl flex items-center justify-center gap-2 z-20">
                      <RefreshCw className="h-5 w-5 text-emerald-500 animate-spin" />
                      <span className="font-bold text-emerald-600 text-sm">Rédaction du script...</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Quick Settings */}
            <Card className="border border-zinc-100 shadow-sm rounded-3xl overflow-hidden">
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-zinc-500 font-bold text-sm uppercase tracking-wider mb-5">
                  <Layout className="h-4 w-4" />
                  Paramètres rapides
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Duration */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                      <Clock className="h-3 w-3" /> Durée
                    </Label>
                    <Select value={duration} onValueChange={setDuration}>
                      <SelectTrigger className="bg-zinc-50 border-zinc-200 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="30">30 secondes</SelectItem>
                        <SelectItem value="60">1 minute</SelectItem>
                        <SelectItem value="120">2 minutes</SelectItem>
                        <SelectItem value="300">5 minutes</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Format */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                      <Layout className="h-3 w-3" /> Format
                    </Label>
                    <Select value={aspectRatio} onValueChange={setAspectRatio}>
                      <SelectTrigger className="bg-zinc-50 border-zinc-200 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="16:9">YouTube (16:9)</SelectItem>
                        <SelectItem value="9:16">TikTok (9:16)</SelectItem>
                        <SelectItem value="1:1">Instagram (1:1)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Language */}
                  <div className="space-y-2">
                    <Label className="text-[10px] font-bold uppercase tracking-widest text-zinc-400 flex items-center gap-1.5">
                      <Globe className="h-3 w-3" /> Langue
                    </Label>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="bg-zinc-50 border-zinc-200 rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="fr-FR">Français</SelectItem>
                        <SelectItem value="en-US">English</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Selected character reminder */}
                {selectedCharacterId && characterModels.length > 0 && (() => {
                  const m = characterModels.find((c) => c.id === selectedCharacterId);
                  if (!m) return null;
                  return (
                    <div className="mt-5 flex items-center gap-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100">
                      <Avatar className="h-8 w-8 border-2 border-emerald-300">
                        <AvatarImage src={m.images?.[0]} alt={m.name} />
                        <AvatarFallback className="bg-emerald-100 text-emerald-700 font-bold text-xs">
                          {m.name[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">
                          Personnage sélectionné
                        </p>
                        <p className="text-sm font-black text-zinc-800">{m.name}</p>
                      </div>
                      <button
                        onClick={() => setStep(1)}
                        className="ml-auto text-[10px] font-bold text-emerald-600 hover:text-emerald-800 underline underline-offset-2"
                      >
                        Changer
                      </button>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>

            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                onClick={() => setStep(1)}
                className="text-zinc-500 font-bold rounded-xl"
              >
                ← Retour
              </Button>
              <Button
                onClick={handleGenerate}
                disabled={!script.trim()}
                className="h-12 px-10 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-2xl shadow-lg shadow-emerald-500/20 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/20 to-transparent group-hover:translate-x-full transition-transform duration-500 pointer-events-none" />
                <Play className="h-4 w-4 mr-2" />
                Générer ma vidéo (~85 🪙)
                <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Step 3 — Generating */}
      {step === 3 && (
        <div className="w-full max-w-2xl relative z-10 animate-in fade-in zoom-in-95 duration-700">
          <div className="text-center mb-8 space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-xs font-black uppercase tracking-widest border border-emerald-500/20">
              <Sparkles className="h-3 w-3" /> Étape 3 / 3
            </div>
            <h1 className="text-4xl font-black tracking-tight text-zinc-900">
              Votre vidéo est en cours de <span className="text-emerald-500">création</span>
            </h1>
            <p className="text-zinc-500 font-medium max-w-md mx-auto">
              L&apos;IA travaille sur votre chef-d&apos;œuvre. Cela prend généralement moins d&apos;une minute.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl text-sm font-medium text-center">
              {error}
            </div>
          )}

          <Card className="border-none shadow-2xl shadow-emerald-500/10 overflow-hidden relative">
            <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-cyan-500/5 pointer-events-none" />
            <CardContent className="p-12 flex flex-col items-center gap-10 relative z-10">
              {/* Circular Progress */}
              <div className="relative h-48 w-48">
                <div className="absolute inset-0 rounded-full border-8 border-zinc-100" />
                <svg className="h-full w-full -rotate-90 drop-shadow-[0_0_16px_rgba(16,185,129,0.3)]" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="42" fill="none" className="stroke-zinc-100" strokeWidth="8" />
                  <circle
                    cx="50"
                    cy="50"
                    r="42"
                    fill="none"
                    className="stroke-emerald-500"
                    strokeWidth="8"
                    strokeLinecap="round"
                    strokeDasharray={`${2 * Math.PI * 42}`}
                    strokeDashoffset={`${2 * Math.PI * 42 * (1 - currentProgress / 100)}`}
                    style={{ transition: "stroke-dashoffset 1s ease-out" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-1">
                  <span className="text-4xl font-black text-emerald-600 tracking-tighter">
                    {currentProgress}%
                  </span>
                  {currentMessage && (
                    <span className="text-[10px] font-bold text-zinc-400 text-center leading-tight max-w-[100px] px-2">
                      {currentMessage}
                    </span>
                  )}
                </div>
              </div>

              {/* Status messages */}
              <div className="text-center space-y-3">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20 animate-pulse">
                  IA en action…
                </div>
                {isFinished && !error && (
                  <p className="font-black text-emerald-600 text-lg animate-in fade-in zoom-in-95">
                    ✅ Génération terminée ! Redirection...
                  </p>
                )}
              </div>

              {/* Tips while waiting */}
              <div className="w-full bg-zinc-50 rounded-2xl p-5 space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-3">
                  En attendant, sachez que…
                </p>
                {[
                  "Vous pouvez personnaliser chaque scène après génération",
                  "La voix est générée automatiquement avec votre texte",
                  "Vous pouvez ajouter de la musique de fond à tout moment",
                ].map((tip, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <div className="h-5 w-5 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <CheckCircle2 className="h-3 w-3 text-emerald-600" />
                    </div>
                    <p className="text-sm font-medium text-zinc-600">{tip}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
