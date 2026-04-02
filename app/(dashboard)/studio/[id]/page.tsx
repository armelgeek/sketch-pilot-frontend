"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import {
    ChevronLeft, Film, Wand2, Clock, Camera, RefreshCw, Save,
    Play, Loader2, CheckCircle2, AlertCircle, Layers, Sparkles, Clapperboard
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { cn } from "@/src/lib/utils";
import { videosService, Video, VideoScript } from "@/src/services/videos-service";

// ─── Types ───────────────────────────────────────────────────────────────────

interface SceneEdit {
    id: string;
    title: string;
    narration: string;
    duration: number;
    cameraAction: string;
    transition: string;
    imageUrl?: string;
    imagePrompt?: string;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const CAMERA_ACTIONS = [
    { value: "static", label: "Fixe" },
    { value: "pan-right", label: "Panoramique →" },
    { value: "pan-left", label: "Panoramique ←" },
    { value: "pan-up", label: "Remontée ↑" },
    { value: "pan-down", label: "Descente ↓" },
    { value: "slow-zoom-in", label: "Zoom avant lent" },
    { value: "slow-zoom-out", label: "Zoom arrière lent" },
    { value: "ken-burns", label: "Ken Burns" },
    { value: "dutch-tilt", label: "Dutch Tilt" },
    { value: "snap-zoom", label: "Snap Zoom" },
    { value: "breathing", label: "Respiration" },
    { value: "orbit", label: "Orbite" },
    { value: "whip-pan", label: "Whip Pan" },
];

const TRANSITIONS = [
    { value: "fade", label: "Fondu" },
    { value: "crossfade", label: "Fondu croisé" },
    { value: "blur", label: "Flou" },
    { value: "zoom", label: "Zoom" },
    { value: "wipeleft", label: "Balayage ←" },
    { value: "wiperight", label: "Balayage →" },
    { value: "slideleft", label: "Glissement ←" },
    { value: "slideright", label: "Glissement →" },
    { value: "dissolve", label: "Dissolution" },
    { value: "pixelize", label: "Pixéliser" },
    { value: "cut", label: "Coupe sèche" },
];

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudioPage() {
    const router = useRouter();
    const params = useParams();
    const videoId = params.id as string;

    const [video, setVideo] = useState<Video | null>(null);
    const [scenes, setScenes] = useState<SceneEdit[]>([]);
    const [selectedScene, setSelectedScene] = useState<number>(0);
    const [isSaving, setIsSaving] = useState(false);
    const [isAssembling, setIsAssembling] = useState(false);
    const [isDirty, setIsDirty] = useState(false);
    const [status, setStatus] = useState<{ type: "success" | "error"; msg: string } | null>(null);
    const [loading, setLoading] = useState(true);
    const [previewMode, setPreviewMode] = useState(false);

    // Load the video and populate scene editor
    useEffect(() => {
        if (!videoId) return;
        videosService.getById(videoId)
            .then((v) => {
                setVideo(v);
                const rawScenes = v.script?.scenes || v.scenes || [];
                const mapped: SceneEdit[] = rawScenes.map((s: any) => ({
                    id: s.id || crypto.randomUUID(),
                    title: s.title || `Scène`,
                    narration: s.narration || "",
                    duration: s.duration || (s.timeRange ? s.timeRange.end - s.timeRange.start : 5),
                    cameraAction: s.cameraAction || "pan-right",
                    transition: s.transition || "fade",
                    imageUrl: s.imageUrl || undefined,
                    imagePrompt: s.imagePrompt || undefined,
                }));
                setScenes(mapped);
            })
            .catch(() => setStatus({ type: "error", msg: "Impossible de charger la vidéo." }))
            .finally(() => setLoading(false));
    }, [videoId]);

    const updateScene = useCallback((idx: number, field: keyof SceneEdit, value: string | number) => {
        setScenes((prev) => {
            const next = [...prev];
            next[idx] = { ...next[idx], [field]: value };
            return next;
        });
        setIsDirty(true);
    }, []);

    const handleSave = async () => {
        if (!video || !isDirty) return;
        setIsSaving(true);
        setStatus(null);
        try {
            const updatedScript: VideoScript = {
                ...(video.script || {}),
                scenes: scenes.map((s) => ({
                    ...((video.script?.scenes || video.scenes || []).find((orig: any) => orig.id === s.id) || {}),
                    id: s.id,
                    title: s.title,
                    narration: s.narration,
                    duration: s.duration,
                    cameraAction: s.cameraAction,
                    transition: s.transition,
                })),
            };
            await videosService.updateScript(videoId, updatedScript);
            setIsDirty(false);
            setStatus({ type: "success", msg: "Modifications sauvegardées ✓" });
        } catch (e: any) {
            setStatus({ type: "error", msg: e.message || "Erreur lors de la sauvegarde." });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAssemble = async () => {
        // Auto-save first if dirty
        if (isDirty) await handleSave();
        setIsAssembling(true);
        setStatus(null);
        try {
            const result = await videosService.assemble(videoId);
            if (result.jobId) {
                // Redirect to the result tracking page
                router.push(`/generate/${videoId}/result?jobId=${result.jobId}`);
            }
        } catch (e: any) {
            setStatus({ type: "error", msg: e.message || "Erreur lors du lancement du rendu." });
            setIsAssembling(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
            </div>
        );
    }

    if (!video) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center gap-4">
                <AlertCircle className="h-12 w-12 text-red-400" />
                <p className="text-zinc-500 font-medium">Vidéo introuvable</p>
                <Button variant="outline" onClick={() => router.back()}>Retour</Button>
            </div>
        );
    }

    const scene = scenes[selectedScene];
    const totalDuration = scenes.reduce((acc, s) => acc + (s.duration || 0), 0);

    return (
        <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">

            {/* ── Top Bar ── */}
            <header className="h-14 border-b border-zinc-800 flex items-center justify-between px-4 shrink-0 bg-zinc-950/80 backdrop-blur-md sticky top-0 z-50">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => router.push("/videos")}
                        className="h-8 w-8 rounded-xl bg-zinc-800 hover:bg-zinc-700 flex items-center justify-center transition-colors"
                    >
                        <ChevronLeft className="h-4 w-4" />
                    </button>
                    <div className="flex items-center gap-2">
                        <Clapperboard className="h-4 w-4 text-emerald-500" />
                        <span className="font-black text-sm truncate max-w-[200px]">{video.topic}</span>
                    </div>
                    <div className="hidden sm:inline-flex items-center px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                        Étape 4 sur 4
                    </div>
                    <span className="text-zinc-600 text-xs font-medium hidden sm:block">·</span>
                    <span className="text-zinc-500 text-xs font-medium hidden sm:block">
                        {scenes.length} scènes · {Math.round(totalDuration)}s
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    {status && (
                        <div className={cn(
                            "hidden sm:flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full",
                            status.type === "success" ? "text-emerald-400 bg-emerald-500/10" : "text-red-400 bg-red-500/10"
                        )}>
                            {status.type === "success" ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
                            {status.msg}
                        </div>
                    )}

                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={handleSave}
                        disabled={!isDirty || isSaving}
                        className="text-zinc-400 hover:text-white rounded-xl font-bold text-xs h-8"
                    >
                        {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" /> : <Save className="h-3.5 w-3.5 mr-1.5" />}
                        {isDirty ? "Sauvegarder" : "Sauvegardé"}
                    </Button>

                    <Button
                        size="sm"
                        onClick={handleAssemble}
                        disabled={isAssembling}
                        className="bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl h-8 px-4 shadow-lg shadow-emerald-500/20 disabled:opacity-60"
                    >
                        {isAssembling
                            ? <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Rendu en cours...</>
                            : <><Sparkles className="h-3.5 w-3.5 mr-1.5" />Lancer le rendu</>
                        }
                    </Button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden">

                {/* ── Left: Scene Timeline ── */}
                <aside className="w-48 sm:w-56 shrink-0 border-r border-zinc-800 overflow-y-auto flex flex-col bg-zinc-950">
                    <div className="p-3 border-b border-zinc-800">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                            <Layers className="h-3 w-3" /> Scènes
                        </p>
                    </div>
                    <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
                        {scenes.map((s, i) => (
                            <button
                                key={s.id}
                                onClick={() => setSelectedScene(i)}
                                className={cn(
                                    "w-full text-left rounded-xl overflow-hidden border transition-all",
                                    selectedScene === i
                                        ? "border-emerald-500/50 ring-1 ring-emerald-500/30"
                                        : "border-zinc-800 hover:border-zinc-700"
                                )}
                            >
                                <div className="aspect-video bg-zinc-900 relative overflow-hidden">
                                    {s.imageUrl ? (
                                        <img src={s.imageUrl} alt={s.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <Film className="h-4 w-4 text-zinc-700" />
                                        </div>
                                    )}
                                    <span className="absolute top-1 left-1 bg-black/60 text-white text-[8px] font-black px-1.5 py-0.5 rounded-md backdrop-blur-sm">
                                        {i + 1}
                                    </span>
                                </div>
                                <div className="p-2 bg-zinc-900">
                                    <p className="text-[10px] font-bold text-zinc-300 truncate">{s.title || `Scène ${i + 1}`}</p>
                                    <p className="text-[9px] text-zinc-500">{s.duration}s</p>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* ── Center: Editor ── */}
                <main className="flex-1 flex flex-col items-center justify-center p-4 sm:p-8 overflow-y-auto bg-zinc-900/30">
                    {scene ? (
                        <div className="w-full max-w-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* Scene Image Preview */}
                            <div className="aspect-video rounded-2xl overflow-hidden bg-zinc-950 border border-zinc-800 shadow-2xl relative group">
                                {scene.imageUrl ? (
                                    <img src={scene.imageUrl} alt={scene.title} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-700">
                                        <Film className="h-16 w-16" />
                                        <p className="text-sm font-bold">Aucune image générée</p>
                                    </div>
                                )}
                                <div className="absolute bottom-3 left-3 right-3">
                                    <div className="bg-black/60 backdrop-blur-md rounded-xl p-3 border border-white/5">
                                        <p className="text-xs text-zinc-200 font-medium leading-relaxed line-clamp-2">
                                            {scene.narration}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Scene Title */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Titre de la scène</label>
                                <input
                                    value={scene.title}
                                    onChange={(e) => updateScene(selectedScene, "title", e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-2.5 text-sm font-bold text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
                                />
                            </div>

                            {/* Narration */}
                            <div className="space-y-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Narration</label>
                                <textarea
                                    value={scene.narration}
                                    onChange={(e) => updateScene(selectedScene, "narration", e.target.value)}
                                    rows={4}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-sm text-zinc-200 font-medium leading-relaxed focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition resize-none"
                                />
                            </div>

                            {/* Image Prompt */}
                            {scene.imagePrompt && (
                                <div className="space-y-1">
                                    <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 flex items-center gap-1.5">
                                        <Wand2 className="h-3 w-3 text-purple-400" /> Prompt visuel
                                    </label>
                                    <textarea
                                        value={scene.imagePrompt}
                                        onChange={(e) => updateScene(selectedScene, "imagePrompt", e.target.value)}
                                        rows={3}
                                        className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-xs text-zinc-400 font-mono focus:outline-none focus:ring-1 focus:ring-purple-500/30 focus:border-purple-500/30 transition resize-none"
                                    />
                                </div>
                            )}
                        </div>
                    ) : null}
                </main>

                {/* ── Right: Inspector ── */}
                <aside className="w-56 sm:w-64 shrink-0 border-l border-zinc-800 overflow-y-auto bg-zinc-950">
                    {scene && (
                        <div className="p-4 space-y-6">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Inspecteur</p>

                            {/* Duration */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                                    <Clock className="h-3.5 w-3.5 text-zinc-500" /> Durée (secondes)
                                </label>
                                <input
                                    type="number"
                                    min={1}
                                    max={60}
                                    value={scene.duration}
                                    onChange={(e) => updateScene(selectedScene, "duration", Number(e.target.value))}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-bold text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition"
                                />
                                <p className="text-[10px] text-zinc-600">Total vidéo : {Math.round(totalDuration)}s</p>
                            </div>

                            {/* Camera Action */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                                    <Camera className="h-3.5 w-3.5 text-zinc-500" /> Caméra
                                </label>
                                <select
                                    value={scene.cameraAction}
                                    onChange={(e) => updateScene(selectedScene, "cameraAction", e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-bold text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition appearance-none cursor-pointer"
                                >
                                    {CAMERA_ACTIONS.map((a) => (
                                        <option key={a.value} value={a.value}>{a.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Transition */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-zinc-400 flex items-center gap-1.5">
                                    <RefreshCw className="h-3.5 w-3.5 text-zinc-500" /> Transition suivante
                                </label>
                                <select
                                    value={scene.transition}
                                    onChange={(e) => updateScene(selectedScene, "transition", e.target.value)}
                                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm font-bold text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition appearance-none cursor-pointer"
                                >
                                    {TRANSITIONS.map((t) => (
                                        <option key={t.value} value={t.value}>{t.label}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Scene Navigation Hint */}
                            <div className="pt-4 border-t border-zinc-800 space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Navigation</p>
                                <p className="text-xs text-zinc-600 leading-relaxed">
                                    Sélectionne une scène dans la timeline à gauche pour l'éditer.
                                </p>
                                <p className="text-xs text-zinc-600 leading-relaxed">
                                    Clique sur <span className="text-emerald-400 font-bold">Lancer le rendu</span> pour assembler la vidéo finale.
                                </p>
                            </div>

                            {/* Quick scene info */}
                            <div className="bg-zinc-900 rounded-xl p-3 border border-zinc-800 space-y-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Scène {selectedScene + 1}/{scenes.length}</p>
                                <div className="flex items-center gap-2">
                                    {scene.imageUrl ? (
                                        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
                                            <CheckCircle2 className="h-3 w-3" /> Image prête
                                        </span>
                                    ) : (
                                        <span className="text-[10px] font-bold text-zinc-500 flex items-center gap-1">
                                            <AlertCircle className="h-3 w-3" /> Pas d'image
                                        </span>
                                    )}
                                </div>
                                {scene.cameraAction && (
                                    <p className="text-[10px] text-zinc-600">{scene.cameraAction} → {scene.transition}</p>
                                )}
                            </div>

                            {/* Regenerate hint */}
                            <div className="pt-2">
                                <button
                                    onClick={() => {/* TODO: implement reprompt via /scenes/:index/reprompt */ }}
                                    className="w-full text-[10px] font-bold text-purple-400 hover:text-purple-300 border border-purple-500/20 hover:border-purple-500/40 rounded-xl py-2 transition-colors flex items-center justify-center gap-1.5"
                                >
                                    <Wand2 className="h-3 w-3" /> Régénérer l'image
                                </button>
                            </div>
                        </div>
                    )}
                </aside>
            </div>

            {/* ── Bottom: playback hint ── */}
            <footer className="h-10 border-t border-zinc-800 flex items-center justify-between px-4 shrink-0 bg-zinc-950/80">
                <div className="flex items-center gap-3 text-[10px] text-zinc-600 font-medium uppercase tracking-widest">
                    <Play className="h-3 w-3" />
                    <span>Studio Vidéo</span>
                </div>
                <span className="text-[10px] text-zinc-700">
                    {isDirty ? "● Modifications non sauvegardées" : "✓ Tout est sauvegardé"}
                </span>
            </footer>
        </div>
    );
}
