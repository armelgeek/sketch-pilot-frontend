"use client";

import { useState } from "react";
import { ChevronRight, FileText, Image, Music, Play, Volume2, SkipBack, SkipForward } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Slider } from "@/src/components/ui/slider";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion";
import { cn } from "@/src/lib/utils";

const STEPS = [
  { n: 1, title: "Contenu" },
  { n: 2, title: "Storyboard" },
  { n: 3, title: "Vidéo & Audio" },
];

const mockScenes = [
  { id: "s1", title: "Introduction", text: "Bienvenue dans ce cours sur l'intelligence artificielle..." },
  { id: "s2", title: "Définition de l'IA", text: "L'intelligence artificielle est la simulation de l'intelligence humaine..." },
  { id: "s3", title: "Histoire de l'IA", text: "L'IA a été conceptualisée pour la première fois dans les années 1950..." },
  { id: "s4", title: "Applications modernes", text: "Aujourd'hui, l'IA est utilisée dans de nombreux domaines..." },
];

const mockTracks = [
  { id: "t1", name: "Calm Piano", duration: "3:24", genre: "Ambient" },
  { id: "t2", name: "Corporate Background", duration: "2:58", genre: "Business" },
  { id: "t3", name: "Soft Strings", duration: "4:10", genre: "Cinematic" },
  { id: "t4", name: "Inspiring Journey", duration: "3:45", genre: "Motivational" },
];

export default function GeneratePage() {
  const [step, setStep] = useState(1);
  const [script, setScript] = useState("");
  const [storyboardView, setStoryboardView] = useState<"script" | "visuals">("script");
  const [selectedScene, setSelectedScene] = useState("s1");
  const [selectedTrack, setSelectedTrack] = useState("t1");
  const [musicVolume, setMusicVolume] = useState(60);
  const [voiceVolume, setVoiceVolume] = useState(80);
  const [generating, setGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  const handleGenerate = () => {
    setGenerating(true);
    setProgress(0);
    const messages = [
      "Analyse du script...",
      "Génération du storyboard...",
      "Création des visuels...",
      "Synthèse vocale...",
      "Assemblage final...",
    ];
    let p = 0;
    const interval = setInterval(() => {
      p += 5;
      setProgress(p);
      setProgressMessage(messages[Math.floor(p / 20)] ?? "Finalisation...");
      if (p >= 100) {
        clearInterval(interval);
        setGenerating(false);
      }
    }, 300);
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Step indicator */}
      <div className="flex items-center gap-2 mb-8">
        {STEPS.map((s, i) => (
          <div key={s.n} className="flex items-center gap-2">
            <button
              onClick={() => setStep(s.n)}
              className={cn(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                step === s.n
                  ? "bg-zinc-900 text-zinc-50 dark:bg-zinc-50 dark:text-zinc-900"
                  : step > s.n
                  ? "bg-zinc-200 text-zinc-700 dark:bg-zinc-700 dark:text-zinc-300"
                  : "bg-zinc-100 text-zinc-400 dark:bg-zinc-800 dark:text-zinc-500"
              )}
            >
              <span className="font-bold">{s.n}</span>
              <span className="hidden sm:inline">{s.title}</span>
            </button>
            {i < STEPS.length - 1 && (
              <ChevronRight className="h-4 w-4 text-zinc-400 shrink-0" />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Content */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Créez votre contenu</h1>
            <p className="text-zinc-500 mt-1">Entrez votre script ou décrivez votre sujet</p>
          </div>
          <Card>
            <CardContent className="p-6 space-y-4">
              <Textarea
                placeholder="Entrez votre script ici... Décrivez votre sujet, vos personnages, votre histoire. L'IA générera automatiquement un storyboard complet."
                className="min-h-[200px] resize-none"
                value={script}
                onChange={(e) => setScript(e.target.value)}
              />
              {/* Toolbar */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                <Select>
                  <SelectTrigger><SelectValue placeholder="Type de script" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="explainer">Explainer</SelectItem>
                    <SelectItem value="story">Storytelling</SelectItem>
                    <SelectItem value="tutorial">Tutoriel</SelectItem>
                    <SelectItem value="promo">Promotionnel</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Durée" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5 minutes</SelectItem>
                    <SelectItem value="10">10 minutes</SelectItem>
                    <SelectItem value="20">20 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Format" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="16:9">16:9 Paysage</SelectItem>
                    <SelectItem value="9:16">9:16 Portrait</SelectItem>
                    <SelectItem value="1:1">1:1 Carré</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Langue" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger><SelectValue placeholder="Style" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="sketch">Sketch</SelectItem>
                    <SelectItem value="cartoon">Cartoon</SelectItem>
                    <SelectItem value="realistic">Réaliste</SelectItem>
                    <SelectItem value="minimal">Minimaliste</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end">
                <Button onClick={() => setStep(2)} disabled={!script.trim()}>
                  Créer le Storyboard <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Storyboard */}
      {step === 2 && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">Storyboard</h1>
              <p className="text-zinc-500 mt-1">Affinez votre storyboard scène par scène</p>
            </div>
            <Button onClick={() => setStep(3)}>
              Animer <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Sub-view tabs */}
          <div className="flex gap-2">
            <button
              onClick={() => setStoryboardView("script")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                storyboardView === "script"
                  ? "bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-50"
                  : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <FileText className="h-4 w-4" /> Script &amp; Casting
            </button>
            <button
              onClick={() => setStoryboardView("visuals")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-colors",
                storyboardView === "visuals"
                  ? "bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-50"
                  : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              )}
            >
              <Image className="h-4 w-4" aria-hidden="true" /> Aperçu Visuel
            </button>
          </div>

          {/* Script view */}
          {storyboardView === "script" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Scene list sidebar */}
              <div className="lg:col-span-1">
                <Card>
                  <CardHeader><CardTitle className="text-sm">Scènes</CardTitle></CardHeader>
                  <CardContent className="p-0">
                    {mockScenes.map((scene, i) => (
                      <button
                        key={scene.id}
                        onClick={() => setSelectedScene(scene.id)}
                        className={cn(
                          "w-full text-left px-4 py-3 text-sm border-b border-zinc-100 dark:border-zinc-800 last:border-b-0 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors",
                          selectedScene === scene.id && "bg-zinc-100 dark:bg-zinc-800"
                        )}
                      >
                        <span className="font-medium">Scène {i + 1}</span>
                        <span className="block text-zinc-500 text-xs truncate">{scene.title}</span>
                      </button>
                    ))}
                  </CardContent>
                </Card>
              </div>
              {/* Accordion */}
              <div className="lg:col-span-2">
                <Accordion type="single" collapsible defaultValue={selectedScene}>
                  {mockScenes.map((scene, i) => (
                    <AccordionItem key={scene.id} value={scene.id}>
                      <AccordionTrigger>Scène {i + 1} — {scene.title}</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3">
                          <Textarea
                            defaultValue={scene.text}
                            className="min-h-[100px] resize-none"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <Select>
                              <SelectTrigger><SelectValue placeholder="Personnage" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="narrator">Narrateur</SelectItem>
                                <SelectItem value="char1">Personnage A</SelectItem>
                                <SelectItem value="char2">Personnage B</SelectItem>
                              </SelectContent>
                            </Select>
                            <Select>
                              <SelectTrigger><SelectValue placeholder="Décor" /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="office">Bureau</SelectItem>
                                <SelectItem value="classroom">Classe</SelectItem>
                                <SelectItem value="outdoors">Extérieur</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </div>
            </div>
          )}

          {/* Visuals view */}
          {storyboardView === "visuals" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Thumbnails */}
              <div className="lg:col-span-1 space-y-3">
                {mockScenes.map((scene, i) => (
                  <button
                    key={scene.id}
                    onClick={() => setSelectedScene(scene.id)}
                    className={cn(
                      "w-full rounded-lg border overflow-hidden text-left transition-colors",
                      selectedScene === scene.id
                        ? "border-zinc-900 dark:border-zinc-50"
                        : "border-zinc-200 dark:border-zinc-700"
                    )}
                  >
                    <div className="aspect-video bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center">
                      <Play className="h-6 w-6 text-zinc-400" />
                    </div>
                    <div className="p-2">
                      <p className="text-xs font-medium">Scène {i + 1} — {scene.title}</p>
                    </div>
                  </button>
                ))}
              </div>
              {/* Preview + settings */}
              <div className="lg:col-span-2 space-y-4">
                <div className="aspect-video rounded-xl bg-zinc-200 dark:bg-zinc-800 flex items-center justify-center border border-zinc-300 dark:border-zinc-700">
                  <Play className="h-12 w-12 text-zinc-400" />
                </div>
                <Card>
                  <CardContent className="p-4 grid grid-cols-2 gap-4">
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Style visuel" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="sketch">Sketch</SelectItem>
                        <SelectItem value="cartoon">Cartoon</SelectItem>
                        <SelectItem value="minimal">Minimaliste</SelectItem>
                      </SelectContent>
                    </Select>
                    <Select>
                      <SelectTrigger><SelectValue placeholder="Palette" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bw">Noir &amp; Blanc</SelectItem>
                        <SelectItem value="warm">Chaleureuse</SelectItem>
                        <SelectItem value="cool">Froide</SelectItem>
                      </SelectContent>
                    </Select>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Step 3: Video & Audio */}
      {step === 3 && (
        <div className="space-y-6">
          <div>
            <h1 className="text-2xl font-bold">Vidéo &amp; Audio</h1>
            <p className="text-zinc-500 mt-1">Configurez la musique de fond et les volumes</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Music panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Music className="h-4 w-4" /> Musique de fond
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Track list */}
                <div className="space-y-2">
                  {mockTracks.map((track) => (
                    <button
                      key={track.id}
                      onClick={() => setSelectedTrack(track.id)}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2.5 rounded-lg border text-sm transition-colors",
                        selectedTrack === track.id
                          ? "bg-zinc-900 text-zinc-50 border-zinc-900 dark:bg-zinc-50 dark:text-zinc-900 dark:border-zinc-50"
                          : "border-zinc-200 dark:border-zinc-700 hover:bg-zinc-50 dark:hover:bg-zinc-800"
                      )}
                    >
                      <div className="flex items-center gap-2">
                        <Play className="h-3.5 w-3.5" />
                        <span className="font-medium">{track.name}</span>
                        <span className={cn("text-xs", selectedTrack === track.id ? "opacity-70" : "text-zinc-400")}>
                          {track.genre}
                        </span>
                      </div>
                      <span className={cn("text-xs", selectedTrack === track.id ? "opacity-70" : "text-zinc-400")}>
                        {track.duration}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Player controls */}
                <div className="flex items-center justify-center gap-4 pt-2">
                  <button className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                    <SkipBack className="h-5 w-5" />
                  </button>
                  <button className="rounded-full bg-zinc-900 dark:bg-zinc-50 p-3 text-zinc-50 dark:text-zinc-900 hover:bg-zinc-700 dark:hover:bg-zinc-200">
                    <Play className="h-5 w-5" />
                  </button>
                  <button className="text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200">
                    <SkipForward className="h-5 w-5" />
                  </button>
                </div>
              </CardContent>
            </Card>

            {/* Volume panel */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Volume2 className="h-4 w-4" /> Volumes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>🎙️ Voix off</span>
                    <span className="text-zinc-500">{voiceVolume}%</span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    value={voiceVolume}
                    onChange={(e) => setVoiceVolume(Number(e.target.value))}
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span>🎵 Musique</span>
                    <span className="text-zinc-500">{musicVolume}%</span>
                  </div>
                  <Slider
                    min={0}
                    max={100}
                    value={musicVolume}
                    onChange={(e) => setMusicVolume(Number(e.target.value))}
                  />
                </div>

                <div className="pt-4">
                  <Select>
                    <SelectTrigger><SelectValue placeholder="Voix narrative" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="marie">Marie (Française)</SelectItem>
                      <SelectItem value="pierre">Pierre (Français)</SelectItem>
                      <SelectItem value="sarah">Sarah (English)</SelectItem>
                      <SelectItem value="james">James (English)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Generate button */}
          {!generating ? (
            <div className="flex justify-center">
              <Button size="lg" onClick={handleGenerate} className="px-12">
                Générer la vidéo
              </Button>
            </div>
          ) : (
            <Card>
              <CardContent className="p-10 flex flex-col items-center gap-6">
                {/* Circular progress */}
                <div className="relative h-32 w-32">
                  <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      className="stroke-zinc-200 dark:stroke-zinc-800"
                      strokeWidth="8"
                    />
                    <circle
                      cx="50" cy="50" r="42"
                      fill="none"
                      className="stroke-zinc-900 dark:stroke-zinc-50"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 42}`}
                      strokeDashoffset={`${2 * Math.PI * 42 * (1 - progress / 100)}`}
                      style={{ transition: "stroke-dashoffset 0.3s ease" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-2xl font-bold">{progress}%</span>
                  </div>
                </div>
                <div className="text-center">
                  <p className="font-semibold">{progressMessage}</p>
                  <p className="text-sm text-zinc-500 mt-1">Veuillez patienter...</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
