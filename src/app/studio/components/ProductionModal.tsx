"use client";

import { useRef } from "react";
import {
    X, Mic, Music, Type, Check,
    ChevronLeft, ChevronRight, Zap,
    SkipBack, Play, SkipForward
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Slider } from "@/src/components/ui/slider";
import { cn } from "@/src/lib/utils";
import { useStudioStore } from "../store";
import { CREDIT_COSTS } from "@/src/lib/credit-costs";

// ─── Types ────────────────────────────────────────────────────────────────────

interface AudioOptions {
    voicePreset: string;
    voiceVolume: number;
    musicVolume: number;
    musicId: string;
}

interface CaptionOptions {
    enabled: boolean;
    style: string;
    highlightColor: string;
}

interface Voice {
    id: string;
    presetId: string;
    name: string;
    gender: "male" | "female";
    language: string;
}

interface MusicTrack {
    id: string;
    name: string;
    tags?: string[];
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STEPS = [
    { id: 0, label: "Voix", icon: Mic },
    { id: 1, label: "Musique", icon: Music },
    { id: 2, label: "Sous-titres", icon: Type },
] as const;

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

// ─── Main Modal ───────────────────────────────────────────────────────────────

interface ProductionModalProps {
    onAssemble: () => void;
    onSkipMusic: (dir: "next" | "prev") => void;
}

export function ProductionModal({ onAssemble, onSkipMusic }: ProductionModalProps) {
    const {
        showProductionModal, setShowProductionModal,
        productionStep, setProductionStep,
        audioOptions, setAudioOptions,
        captionOptions, setCaptionOptions,
        availableVoices, musicTracks,
        isPlayingAudio, setIsPlayingAudio,
        assembling, activeVideo,
    } = useStudioStore();

    const modalRef = useRef<HTMLDivElement>(null);

    if (!showProductionModal) return null;

    const resolution = activeVideo?.options?.resolution || '1080p';
    const coinCost = (resolution === '1080p' ? CREDIT_COSTS.EXPORT_1080P : CREDIT_COSTS.EXPORT_720P) + CREDIT_COSTS.TTS_VOICE;

    return (
        <div
            className="fixed inset-0 z-40 flex items-center justify-center p-4 bg-zinc-900/50 backdrop-blur-sm"
            onClick={(e) => { if (e.target === e.currentTarget) setShowProductionModal(false); }}
            role="dialog"
            aria-modal="true"
        >
            <div
                ref={modalRef}
                className="w-full max-w-xl bg-white border border-zinc-200 rounded-2xl shadow-xl flex flex-col max-h-[88vh]"
            >
                {/* Header */}
                <ModalHeader
                    step={productionStep}
                    onStepChange={setProductionStep}
                    onClose={() => setShowProductionModal(false)}
                />

                {/* Body */}
                <div className="overflow-y-auto flex-1 p-5">
                    {productionStep === 0 && (
                        <VoiceStep
                            voices={availableVoices}
                            options={audioOptions}
                            onChange={setAudioOptions}
                        />
                    )}
                    {productionStep === 1 && (
                        <MusicStep
                            tracks={musicTracks}
                            options={audioOptions}
                            isPlaying={isPlayingAudio}
                            onChange={setAudioOptions}
                            onTogglePlay={() => setIsPlayingAudio(!isPlayingAudio)}
                            onSkip={onSkipMusic}
                        />
                    )}
                    {productionStep === 2 && (
                        <CaptionsStep
                            options={captionOptions}
                            onChange={setCaptionOptions}
                        />
                    )}
                </div>

                {/* Footer */}
                <ModalFooter
                    step={productionStep}
                    onStepChange={setProductionStep}
                    onAssemble={onAssemble}
                    assembling={assembling}
                    coinCost={coinCost}
                />
            </div>
        </div>
    );
}

// ─── Modal Header ─────────────────────────────────────────────────────────────

function ModalHeader({
    step,
    onStepChange,
    onClose,
}: {
    step: number;
    onStepChange: (s: 0 | 1 | 2) => void;
    onClose: () => void;
}) {
    return (
        <div className="border-b border-zinc-100">
            <div className="flex items-center justify-between px-5 py-4">
                <div>
                    <p className="text-sm font-semibold text-zinc-900">Production</p>
                    <p className="text-xs text-zinc-400">Étape {step + 1} / 3</p>
                </div>
                <button
                    onClick={onClose}
                    className="h-7 w-7 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 transition-colors"
                    aria-label="Fermer"
                >
                    <X className="h-4 w-4" />
                </button>
            </div>

            <div className="flex gap-1 px-5 pb-4">
                {STEPS.map(({ id, label, icon: Icon }) => (
                    <button
                        key={id}
                        onClick={() => onStepChange(id)}
                        className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all",
                            step === id
                                ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                : "border-transparent text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50"
                        )}
                    >
                        <Icon className="h-3.5 w-3.5" />
                        {label}
                    </button>
                ))}
            </div>
        </div>
    );
}

// ─── Modal Footer ─────────────────────────────────────────────────────────────

function ModalFooter({
    step,
    onStepChange,
    onAssemble,
    assembling,
    coinCost,
}: {
    step: number;
    onStepChange: (s: 0 | 1 | 2) => void;
    onAssemble: () => void;
    assembling: boolean;
    coinCost: number;
}) {
    return (
        <div className="px-5 py-3.5 border-t border-zinc-100 bg-zinc-50/60 flex items-center justify-between">
            <button
                onClick={() => step > 0 && onStepChange((step - 1) as 0 | 1 | 2)}
                disabled={step === 0}
                className="flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-700 disabled:opacity-30 disabled:cursor-not-allowed transition-colors font-medium"
            >
                <ChevronLeft className="h-3.5 w-3.5" /> Précédent
            </button>

            <span className="text-xs text-zinc-400">{step + 1} / 3</span>

            {step < 2 ? (
                <button
                    onClick={() => onStepChange((step + 1) as 0 | 1 | 2)}
                    className="flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 transition-colors font-medium"
                >
                    Suivant <ChevronRight className="h-3.5 w-3.5" />
                </button>
            ) : (
                <Button
                    onClick={onAssemble}
                    disabled={assembling}
                    className="bg-emerald-500 hover:bg-emerald-400 text-white text-xs font-semibold h-8 px-4 rounded-lg gap-1.5 shadow-sm shadow-emerald-200/50"
                >
                    <Zap className="h-3.5 w-3.5 fill-current" />
                    Rendu
                    <span className="flex items-center gap-0.5 bg-white/20 border border-white/20 rounded-md px-1.5 py-0.5 text-[9px] font-black">
                        {coinCost} cr.
                    </span>
                </Button>
            )}
        </div>
    );
}

// ─── Step: Voice ──────────────────────────────────────────────────────────────

function VoiceStep({
    voices,
    options,
    onChange,
}: {
    voices: Voice[];
    options: AudioOptions;
    onChange: (patch: Partial<AudioOptions>) => void;
}) {
    return (
        <div className="space-y-5">
            <StepHeader icon={Mic} iconBg="bg-blue-50" iconColor="text-blue-500" title="Voix narrative" subtitle="Sélectionnez une voix de narration" />

            <Select value={options.voicePreset} onValueChange={(v) => onChange({ voicePreset: v })}>
                <SelectTrigger className="bg-white border-zinc-200 text-zinc-900 rounded-lg h-9 text-xs">
                    <SelectValue placeholder="Choisir une voix" />
                </SelectTrigger>
                <SelectContent className="rounded-xl bg-white border-zinc-200">
                    {voices.map((v) => (
                        <SelectItem key={v.id} value={v.presetId} className="text-xs text-zinc-900">
                            <span className="flex items-center gap-2">
                                <span>{v.gender === "female" ? "👩" : "👨"}</span>
                                <span className="font-medium">{v.name}</span>
                                <span className="text-[9px] uppercase px-1.5 py-0.5 rounded bg-zinc-100 text-zinc-400 font-semibold">
                                    {v.language?.split("-")[0]}
                                </span>
                            </span>
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            <div className="space-y-4">
                <VolumeSlider
                    label="Voix"
                    emoji="🎙️"
                    value={options.voiceVolume}
                    onChange={(val) => onChange({ voiceVolume: val })}
                />
                <VolumeSlider
                    label="Musique"
                    emoji="🎵"
                    value={options.musicVolume}
                    onChange={(val) => onChange({ musicVolume: val })}
                />
            </div>

            <p className="text-xs text-zinc-400 italic">
                Le ducking automatique maintient la voix audible sur la musique.
            </p>
        </div>
    );
}

function VolumeSlider({
    label,
    emoji,
    value,
    onChange,
}: {
    label: string;
    emoji: string;
    value: number;
    onChange: (v: number) => void;
}) {
    return (
        <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
                <span className="text-zinc-500">{emoji} {label}</span>
                <span className="font-semibold text-zinc-800 tabular-nums">{value}%</span>
            </div>
            <Slider
                min={0} max={100} step={5}
                value={value}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(parseInt(e.target.value))}
            />
        </div>
    );
}

// ─── Step: Music ──────────────────────────────────────────────────────────────

function MusicStep({
    tracks,
    options,
    isPlaying,
    onChange,
    onTogglePlay,
    onSkip,
}: {
    tracks: MusicTrack[];
    options: AudioOptions;
    isPlaying: boolean;
    onChange: (patch: Partial<AudioOptions>) => void;
    onTogglePlay: () => void;
    onSkip: (dir: "next" | "prev") => void;
}) {
    const handleTrackSelect = (id: string) => {
        onChange({ musicId: id });
        if (!isPlaying && id !== "none") onTogglePlay();
    };

    return (
        <div className="space-y-4">
            <StepHeader icon={Music} iconBg="bg-amber-50" iconColor="text-amber-500" title="Musique de fond" subtitle={`${tracks.length} pistes disponibles`} />

            <div className="max-h-48 overflow-y-auto space-y-1 pr-0.5">
                <TrackOption
                    label="Aucune musique"
                    selected={options.musicId === "none"}
                    playing={false}
                    onClick={() => handleTrackSelect("none")}
                />
                {tracks.map((t) => (
                    <TrackOption
                        key={t.id}
                        label={t.name}
                        tags={t.tags}
                        selected={options.musicId === t.id}
                        playing={options.musicId === t.id && isPlaying}
                        onClick={() => handleTrackSelect(t.id)}
                    />
                ))}
            </div>

            {/* Playback controls */}
            <div className="flex items-center justify-center gap-4 pt-2 border-t border-zinc-100">
                <button onClick={() => onSkip("prev")} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                    <SkipBack className="h-4 w-4" />
                </button>
                <button
                    onClick={onTogglePlay}
                    disabled={options.musicId === "none"}
                    className={cn(
                        "h-9 w-9 rounded-full border flex items-center justify-center transition-all",
                        options.musicId !== "none"
                            ? "bg-white border-zinc-200 text-zinc-700 hover:border-emerald-400 hover:text-emerald-600"
                            : "bg-zinc-50 border-zinc-100 text-zinc-300 cursor-not-allowed"
                    )}
                    aria-label={isPlaying ? "Pause" : "Lecture"}
                >
                    {isPlaying ? (
                        <span className="flex gap-0.5">
                            <span className="w-0.5 h-3 bg-current rounded-sm" />
                            <span className="w-0.5 h-3 bg-current rounded-sm" />
                        </span>
                    ) : (
                        <Play className="h-4 w-4 fill-current ml-0.5" />
                    )}
                </button>
                <button onClick={() => onSkip("next")} className="text-zinc-400 hover:text-zinc-700 transition-colors">
                    <SkipForward className="h-4 w-4" />
                </button>
            </div>
        </div>
    );
}

function TrackOption({
    label,
    tags,
    selected,
    playing,
    onClick,
}: {
    label: string;
    tags?: string[];
    selected: boolean;
    playing: boolean;
    onClick: () => void;
}) {
    return (
        <button
            onClick={onClick}
            className={cn(
                "w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs border transition-colors text-left",
                selected
                    ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                    : "border-zinc-200 bg-white text-zinc-600 hover:bg-zinc-50"
            )}
        >
            <span className={cn(
                "h-3.5 w-3.5 rounded-full border-2 shrink-0 flex items-center justify-center",
                selected ? "border-emerald-500 bg-emerald-500" : "border-zinc-300"
            )}>
                {selected && <span className="h-1 w-1 rounded-full bg-white" />}
            </span>

            <span className="flex-1 min-w-0">
                <span className="font-medium truncate flex items-center gap-1.5">
                    {playing && (
                        <span className="flex gap-0.5">
                            {[0, 100, 200].map((delay) => (
                                <span
                                    key={delay}
                                    className="w-0.5 h-2 bg-emerald-500 rounded-full animate-bounce"
                                    style={{ animationDelay: `${delay}ms` }}
                                />
                            ))}
                        </span>
                    )}
                    {label}
                </span>
                {tags && <span className="text-[9px] text-zinc-400 truncate block">{tags.join(" · ")}</span>}
            </span>
        </button>
    );
}

// ─── Step: Captions ───────────────────────────────────────────────────────────

function CaptionsStep({
    options,
    onChange,
}: {
    options: CaptionOptions;
    onChange: (patch: Partial<CaptionOptions>) => void;
}) {
    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <StepHeader icon={Type} iconBg="bg-pink-50" iconColor="text-pink-500" title="Sous-titres" subtitle="Style et animation" />
                <Toggle enabled={options.enabled} onToggle={() => onChange({ enabled: !options.enabled })} />
            </div>

            {options.enabled ? (
                <>
                    <div className="grid grid-cols-2 gap-1.5">
                        {CAPTION_STYLES.map(({ id, label }) => (
                            <button
                                key={id}
                                onClick={() => onChange({ style: id })}
                                className={cn(
                                    "flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium border transition-all",
                                    options.style === id
                                        ? "bg-emerald-50 border-emerald-200 text-emerald-700"
                                        : "border-zinc-200 bg-white text-zinc-600 hover:border-zinc-300 hover:bg-zinc-50"
                                )}
                            >
                                {label}
                                {options.style === id && <Check className="h-3 w-3" />}
                            </button>
                        ))}
                    </div>

                    <CaptionPreview style={options.style} />
                </>
            ) : (
                <div className="flex flex-col items-center justify-center py-10 gap-2 text-zinc-300">
                    <Type className="h-7 w-7" />
                    <p className="text-xs font-medium">Sous-titres désactivés</p>
                </div>
            )}
        </div>
    );
}

// ─── Shared Components ────────────────────────────────────────────────────────

function StepHeader({
    icon: Icon,
    iconBg,
    iconColor,
    title,
    subtitle,
}: {
    icon: React.ElementType;
    iconBg: string;
    iconColor: string;
    title: string;
    subtitle: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
                <Icon className={cn("h-4 w-4", iconColor)} />
            </div>
            <div>
                <p className="text-sm font-semibold text-zinc-900">{title}</p>
                <p className="text-xs text-zinc-400">{subtitle}</p>
            </div>
        </div>
    );
}

function Toggle({ enabled, onToggle }: { enabled: boolean; onToggle: () => void }) {
    return (
        <button
            onClick={onToggle}
            aria-pressed={enabled}
            className={cn(
                "relative w-9 h-5 rounded-full transition-colors shrink-0",
                enabled ? "bg-emerald-500" : "bg-zinc-200"
            )}
        >
            <span className={cn(
                "absolute top-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform",
                enabled ? "translate-x-4" : "translate-x-0.5"
            )} />
        </button>
    );
}

function CaptionPreview({ style }: { style: string }) {
    const { activeVideo } = useStudioStore();
    const isVertical = activeVideo?.options?.aspectRatio === '9:16';

    const previewMap: Record<string, React.ReactNode> = {
        colored: <span className="text-sm font-black italic text-white">VOTRE <span className="text-yellow-400">VIDÉO</span></span>,
        scaling: <span className="text-sm font-bold text-white uppercase scale-110 inline-block">TEXTE</span>,
        bounce: <span className="text-sm font-bold text-yellow-400 animate-bounce inline-block">REBOND</span>,
        neon: <span className="text-sm font-bold text-cyan-400" style={{ textShadow: "0 0 8px cyan" }}>NÉON</span>,
        typewriter: <span className="text-sm font-mono text-green-400 border-r-2 border-green-400">MACHINE_</span>,
        karaoke: <span className="text-sm font-bold"><span className="text-yellow-400">KA</span><span className="text-white">RAOKE</span></span>,
        "animated-background": <span className="text-sm font-bold text-white bg-emerald-500/80 px-2 py-0.5 rounded">BULLE</span>,
        remotion: <span className="text-sm font-semibold tracking-widest text-white uppercase">Moderne</span>,
    };

    return (
        <div className={cn(
            "relative rounded-xl bg-zinc-900 overflow-hidden border border-zinc-200 mx-auto",
            isVertical ? "aspect-[9/16] max-h-[300px]" : "aspect-video"
        )}>
            <div
                className="absolute inset-0 bg-cover bg-center opacity-20"
                style={{ backgroundImage: "url('https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&q=60')" }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute inset-0 flex items-center justify-center">
                {previewMap[style] ?? <span className="text-sm font-bold text-white">APERÇU</span>}
            </div>
        </div>
    );
}