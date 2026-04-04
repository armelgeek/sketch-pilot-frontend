"use client";

import { useRef } from "react";
import { X, Mic, Music, Type, Check, ChevronLeft, ChevronRight, Zap, SkipBack, Play, SkipForward } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Slider } from "@/src/components/ui/slider";
import { cn } from "@/src/lib/utils";
import { useStudioStore } from "../store";

interface ProductionModalProps {
    onAssemble: () => void;
    onSkipMusic: (dir: "next" | "prev") => void;
}

export function ProductionModal({ onAssemble, onSkipMusic }: ProductionModalProps) {
    const {
        showProductionModal,
        setShowProductionModal,
        productionStep,
        setProductionStep,
        audioOptions,
        setAudioOptions,
        captionOptions,
        setCaptionOptions,
        availableVoices,
        musicTracks,
        isPlayingAudio,
        setIsPlayingAudio,
        assembling,
        activeVideo,
    } = useStudioStore();

    const modalRef = useRef<HTMLDivElement | null>(null);

    if (!showProductionModal) return null;

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowProductionModal(false); }}
            role="dialog"
            aria-modal="true">
            <div
                ref={modalRef}
                className="w-full max-w-2xl bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">

                {/* Header with Stepper */}
                <div className="shrink-0 border-b border-zinc-100">
                    <div className="flex items-center justify-between px-5 py-3.5">
                        <div className="flex-1">
                            <p className="text-xs font-bold text-zinc-900">Production</p>
                            <p className="text-[10px] text-zinc-400">Étape {productionStep + 1}/3</p>
                        </div>
                        <button
                            onClick={() => setShowProductionModal(false)}
                            className="h-7 w-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors">
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="flex gap-0 px-5 pb-3.5">
                        {[
                            { id: 0, label: "Voix", icon: Mic },
                            { id: 1, label: "Musique", icon: Music },
                            { id: 2, label: "Sous-titres", icon: Type }
                        ].map((step) => {
                            const isActive = productionStep === step.id;
                            return (
                                <button
                                    key={step.id}
                                    onClick={() => setProductionStep(step.id as 0 | 1 | 2)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all",
                                        isActive
                                            ? "bg-zinc-900 border-zinc-950 text-white shadow-sm"
                                            : "border-transparent text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50"
                                    )}>
                                    <step.icon className={cn("h-3.5 w-3.5", isActive ? "text-amber-400" : "text-zinc-400")} />
                                    {step.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Body */}
                <div className="overflow-y-auto p-4 flex-1">
                    <div className="max-w-xl mx-auto">
                        {productionStep === 0 && (
                            <VoiceStep
                                availableVoices={availableVoices}
                                audioOptions={audioOptions}
                                onUpdateOptions={setAudioOptions}
                            />
                        )}
                        {productionStep === 1 && (
                            <MusicStep
                                musicTracks={musicTracks}
                                audioOptions={audioOptions}
                                isPlayingAudio={isPlayingAudio}
                                onUpdateOptions={setAudioOptions}
                                onTogglePlay={() => setIsPlayingAudio(!isPlayingAudio)}
                                onSkip={onSkipMusic}
                            />
                        )}
                        {productionStep === 2 && (
                            <CaptionsStep
                                captionOptions={captionOptions}
                                onUpdateOptions={setCaptionOptions}
                            />
                        )}
                    </div>
                </div>

                {/* Footer */}
                <div className="shrink-0 px-5 py-3 border-t border-zinc-100 bg-zinc-50/50 flex items-center justify-between">
                    <button
                        onClick={() => productionStep > 0 && setProductionStep((productionStep - 1) as 0 | 1 | 2)}
                        disabled={productionStep === 0}
                        className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium">
                        <ChevronLeft className="h-3.5 w-3.5" /> Précédent
                    </button>
                    <div className="text-xs font-medium text-zinc-500">
                        Étape {productionStep + 1} sur 3
                    </div>
                    {productionStep < 2 ? (
                        <button
                            onClick={() => setProductionStep((productionStep + 1) as 0 | 1 | 2)}
                            className="flex items-center gap-1 text-xs text-zinc-900 hover:text-black transition-colors font-medium">
                            Suivant <ChevronRight className="h-3.5 w-3.5" />
                        </button>
                    ) : (
                        <Button
                            onClick={onAssemble}
                            disabled={assembling}
                            className="bg-zinc-950 hover:bg-zinc-800 text-white font-black rounded-xl h-9 px-6 text-xs gap-2 shadow-xl shadow-zinc-200">
                            <Zap className="h-3.5 w-3.5 fill-current text-amber-400" />
                            Générer la vidéo finale ({activeVideo?.options?.resolution === "1080p" ? "10" : "5"} 🪙)
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── Sub-steps ───────────────────────────────────────────────────────────────

function VoiceStep({ availableVoices, audioOptions, onUpdateOptions }: {
    availableVoices: any[];
    audioOptions: any;
    onUpdateOptions: (options: Partial<any>) => void;
}) {
    return (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-zinc-200 bg-white">
                <div className="h-6 w-6 rounded-lg bg-blue-50 flex items-center justify-center shrink-0">
                    <Mic className="h-3 w-3 text-blue-500" />
                </div>
                <div>
                    <p className="text-xs font-bold text-zinc-900">Voix Narrative</p>
                    <p className="text-[9px] text-zinc-400">Narration globale</p>
                </div>
            </div>
            <div className="p-3.5 space-y-3.5">
                <Select
                    value={audioOptions.voicePreset}
                    onValueChange={(v) => onUpdateOptions({ voicePreset: v })}>
                    <SelectTrigger className="bg-white border-zinc-200 text-zinc-900 rounded-lg h-9 text-xs">
                        <SelectValue placeholder="Choisir une voix" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl bg-white border-zinc-200">
                        {availableVoices.map((v: any) => (
                            <SelectItem key={v.id} value={v.presetId} className="text-zinc-900 text-xs">
                                <div className="flex items-center gap-1.5">
                                    <span>{v.gender === "female" ? "👩" : "👨"}</span>
                                    <span className="font-medium">{v.name}</span>
                                    <span className="text-[8px] uppercase px-1 py-0.5 rounded bg-zinc-100 text-zinc-400 font-bold">
                                        {v.language?.split("-")[0]}
                                    </span>
                                </div>
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <div className="space-y-3">
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                            <span className="text-zinc-500">🎙️ Voix</span>
                            <span className="font-black text-zinc-800 tabular-nums">{audioOptions.voiceVolume}%</span>
                        </div>
                        <Slider
                            min={0} max={100} step={5}
                            value={audioOptions.voiceVolume}
                            onChange={(e: any) => onUpdateOptions({ voiceVolume: parseInt(e.target.value) })} />
                    </div>
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px]">
                            <span className="text-zinc-500">🎵 Musique</span>
                            <span className="font-black text-zinc-800 tabular-nums">{audioOptions.musicVolume}%</span>
                        </div>
                        <Slider
                            min={0} max={100} step={5}
                            value={audioOptions.musicVolume}
                            onChange={(e: any) => onUpdateOptions({ musicVolume: parseInt(e.target.value) })} />
                    </div>
                </div>
                <p className="text-[9px] text-zinc-400 italic leading-relaxed border-t border-zinc-200 pt-2.5">
                    Ducking automatique pour garder la voix audible.
                </p>
            </div>
        </div>
    );
}

function MusicStep({
    musicTracks,
    audioOptions,
    isPlayingAudio,
    onUpdateOptions,
    onTogglePlay,
    onSkip
}: {
    musicTracks: any[];
    audioOptions: any;
    isPlayingAudio: boolean;
    onUpdateOptions: (options: Partial<any>) => void;
    onTogglePlay: () => void;
    onSkip: (dir: "next" | "prev") => void;
}) {
    return (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
            <div className="flex items-center gap-2 px-3.5 py-2.5 border-b border-zinc-200 bg-white">
                <div className="h-6 w-6 rounded-lg bg-amber-50 flex items-center justify-center shrink-0">
                    <Music className="h-3 w-3 text-amber-500" />
                </div>
                <div>
                    <p className="text-xs font-bold text-zinc-900">Musique de fond</p>
                    <p className="text-[9px] text-zinc-400">{musicTracks.length} pistes</p>
                </div>
            </div>
            <div className="p-3 space-y-2">
                <div className="max-h-44 overflow-y-auto space-y-1 pr-0.5">
                    <MusicOption
                        label="Aucune musique"
                        selected={audioOptions.musicId === "none"}
                        onClick={() => onUpdateOptions({ musicId: "none" })} />
                    {musicTracks.map((t: any) => (
                        <MusicOption
                            key={t.id}
                            label={t.name}
                            tags={t.tags}
                            selected={audioOptions.musicId === t.id}
                            playing={audioOptions.musicId === t.id && isPlayingAudio}
                            onClick={() => {
                                onUpdateOptions({ musicId: t.id });
                                if (!isPlayingAudio) onTogglePlay();
                            }} />
                    ))}
                </div>

                <div className="flex items-center justify-center gap-3 pt-2 border-t border-zinc-100">
                    <button onClick={() => onSkip("prev")} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                        <SkipBack className="h-3.5 w-3.5" />
                    </button>
                    <button
                        onClick={onTogglePlay}
                        disabled={audioOptions.musicId === "none"}
                        className={cn(
                            "h-8 w-8 rounded-full border flex items-center justify-center transition-all",
                            audioOptions.musicId !== "none" ? "bg-white border-zinc-200 text-zinc-700 hover:border-emerald-400 hover:text-emerald-600" : "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                        )}>
                        {isPlayingAudio ? (
                            <div className="flex gap-0.5"><div className="w-0.5 h-3 bg-current rounded-sm" /><div className="w-0.5 h-3 bg-current rounded-sm" /></div>
                        ) : (
                            <Play className="h-3.5 w-3.5 fill-current ml-0.5" />
                        )}
                    </button>
                    <button onClick={() => onSkip("next")} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                        <SkipForward className="h-3.5 w-3.5" />
                    </button>
                </div>
            </div>
        </div>
    );
}

function MusicOption({
    label,
    tags,
    selected,
    playing = false,
    onClick
}: {
    label: string,
    tags?: string[],
    selected: boolean,
    playing?: boolean,
    onClick: () => void
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[11px] border transition-colors text-left",
                selected ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            )}>
            <div className={cn("h-3.5 w-3.5 rounded-full border-2 shrink-0 flex items-center justify-center", selected ? "border-emerald-500 bg-emerald-500" : "border-zinc-300")}>
                {selected && <div className="h-1 w-1 rounded-full bg-white" />}
            </div>
            <div className="flex-1 min-w-0">
                <div className="font-semibold truncate flex items-center gap-1">
                    {selected && playing && (
                        <span className="flex gap-0.5 mr-1">
                            {[1, 2, 3].map(b => (
                                <span key={b} className="w-0.5 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: `${b * 0.1}s` }} />
                            ))}
                        </span>
                    )}
                    {label}
                </div>
                {tags && <div className="text-[8px] text-zinc-400 truncate">{tags.join(" · ")}</div>}
            </div>
        </button>
    );
}

function CaptionsStep({
    captionOptions,
    onUpdateOptions
}: {
    captionOptions: any;
    onUpdateOptions: (options: Partial<any>) => void;
}) {
    const CAPTION_STYLES = [
        { id: "colored", label: "Coloré" },
        { id: "scaling", label: "Zoom" },
        { id: "bounce", label: "Rebond" },
        { id: "neon", label: "Néon" },
        { id: "typewriter", label: "Machine" },
        { id: "karaoke", label: "Karaoké" },
        { id: "animated-background", label: "Bulle" },
        { id: "remotion", label: "Moderne" },
    ];
    const HIGHLIGHT_COLORS = ["#FFE135", "#10B981", "#3B82F6", "#EC4899", "#F97316", "#FFFFFF"];

    return (
        <div className="bg-zinc-50 border border-zinc-200 rounded-xl overflow-hidden">
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-zinc-200 bg-white">
                <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-lg bg-pink-50 flex items-center justify-center shrink-0">
                        <Type className="h-3 w-3 text-pink-500" />
                    </div>
                    <div>
                        <p className="text-xs font-bold text-zinc-900">Sous-titres</p>
                        <p className="text-[9px] text-zinc-400">Style & animation</p>
                    </div>
                </div>
                <button
                    onClick={() => onUpdateOptions({ enabled: !captionOptions.enabled })}
                    className={cn("relative w-8 h-4 rounded-full transition-colors", captionOptions.enabled ? "bg-emerald-500" : "bg-zinc-200")}>
                    <div className={cn("absolute top-0.5 w-3 h-3 rounded-full bg-white transition-transform shadow-sm", captionOptions.enabled ? "translate-x-4" : "translate-x-0.5")} />
                </button>
            </div>
            {captionOptions.enabled ? (
                <div className="p-3.5 space-y-3">
                    <div className="grid grid-cols-2 gap-1">
                        {CAPTION_STYLES.map(s => (
                            <button
                                key={s.id}
                                onClick={() => onUpdateOptions({ style: s.id })}
                                className={cn(
                                    "flex items-center justify-between px-2 py-1 rounded-lg text-[10px] font-medium border transition-all",
                                    captionOptions.style === s.id ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300"
                                )}>
                                {s.label}
                                {captionOptions.style === s.id && <Check className="h-2.5 w-2.5" />}
                            </button>
                        ))}
                    </div>
                    <CaptionPreview style={captionOptions.style} highlightColor={captionOptions.highlightColor} />
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8 gap-1.5 opacity-30">
                    <Type className="h-6 w-6 text-zinc-400" />
                    <p className="text-xs text-zinc-400 font-medium">Désactivés</p>
                </div>
            )}
        </div>
    );
}

function CaptionPreview({ style, highlightColor }: { style: string, highlightColor: string }) {
    return (
        <div className="relative aspect-video rounded-lg bg-zinc-900 overflow-hidden border border-zinc-200">
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=60')] bg-cover bg-center opacity-20" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center text-center px-4">
                {style === "colored" && <div className="text-xs font-black italic text-white line-clamp-2">VOTRE <span style={{ color: highlightColor }}>VIDÉO</span>.</div>}
                {style === "scaling" && <div className="text-xs font-bold text-white uppercase scale-110 animate-pulse">TEXTE</div>}
                {style === "bounce" && <div className="text-xs font-bold text-yellow-400 animate-bounce">REBOND</div>}
                {/* ... other styles simplified for preview ... */}
            </div>
        </div>
    );
}
