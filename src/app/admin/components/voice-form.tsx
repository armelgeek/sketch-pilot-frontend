"use client";

import { useState } from "react";
import {
    Mic2,
    Save,
    X,
    Upload,
    Play,
    Pause,
    Loader2,
    Globe,
    User,
    CheckCircle2,
    Settings
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Switch } from "@/src/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/src/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { VoicePreset } from "@/src/app/admin/schema";
import { cn } from "@/src/lib/utils";

interface VoiceFormProps {
    initialData?: Partial<VoicePreset>;
    onSubmit: (data: any, file?: File) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    title: string;
}

export function VoiceForm({ initialData, onSubmit, onCancel, isLoading, title }: VoiceFormProps) {
    const [formData, setFormData] = useState<any>(initialData || {
        isActive: true,
        provider: "kokoro",
        language: "fr-FR",
        gender: "female",
        name: "",
        presetId: ""
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewAudio, setPreviewAudio] = useState<HTMLAudioElement | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    const handlePlayPreview = (url: string) => {
        if (previewAudio) {
            previewAudio.pause();
            setPreviewAudio(null);
            setIsPlaying(false);
            return;
        }
        const audio = new Audio(url);
        audio.play();
        setPreviewAudio(audio);
        setIsPlaying(true);
        audio.onended = () => {
            setPreviewAudio(null);
            setIsPlaying(false);
        };
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData, selectedFile || undefined);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-emerald-50 dark:bg-emerald-950/20 rounded-2xl flex items-center justify-center text-emerald-600 shadow-sm border border-emerald-100 dark:border-emerald-900/30">
                        <Mic2 className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">{title}</h1>
                        <p className="text-sm font-medium text-zinc-500 mt-1">Configurez une nouvelle voix pour la synthèse vocale.</p>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button variant="ghost" type="button" className="rounded-2xl font-bold h-11 px-6 flex-1 md:flex-none" onClick={onCancel}>
                        <X className="mr-2 h-4 w-4" /> Annuler
                    </Button>
                    <Button
                        type="submit"
                        className="bg-black hover:bg-zinc-800 text-white rounded-2xl font-black h-11 px-8 shadow-xl flex-1 md:flex-none"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                        Enregistrer
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[32px] border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-3">
                                <Settings className="h-5 w-5 text-zinc-400" />
                                <CardTitle className="font-black tracking-tight text-xl">Paramètres Fondamentaux</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1">Nom d'affichage</Label>
                                    <Input
                                        className="h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 font-bold focus-visible:ring-emerald-500"
                                        value={formData.name || ""}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Emma - Douce et Narrative"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1">Provider ID / Preset ID</Label>
                                    <Input
                                        className="h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 font-mono font-bold focus-visible:ring-emerald-500"
                                        value={formData.presetId || ""}
                                        onChange={(e) => setFormData({ ...formData, presetId: e.target.value })}
                                        placeholder="Ex: af_sky"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <div className="space-y-2">
                                    <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1">Provider</Label>
                                    <Select value={formData.provider} onValueChange={(v) => setFormData({ ...formData, provider: v })}>
                                        <SelectTrigger className="h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value="kokoro" className="font-bold">Kokoro</SelectItem>
                                            <SelectItem value="elevenlabs" className="font-bold">ElevenLabs</SelectItem>
                                            <SelectItem value="openai" className="font-bold">OpenAI</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1">Langue</Label>
                                    <Select value={formData.language} onValueChange={(v) => setFormData({ ...formData, language: v })}>
                                        <SelectTrigger className="h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value="fr-FR" className="font-bold">Français (FR)</SelectItem>
                                            <SelectItem value="en-US" className="font-bold">English (US)</SelectItem>
                                            <SelectItem value="en-GB" className="font-bold">English (UK)</SelectItem>
                                            <SelectItem value="es-ES" className="font-bold">Español</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1">Genre</Label>
                                    <Select value={formData.gender} onValueChange={(v) => setFormData({ ...formData, gender: v })}>
                                        <SelectTrigger className="h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 font-bold">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl">
                                            <SelectItem value="male" className="font-bold">Masculin</SelectItem>
                                            <SelectItem value="female" className="font-bold">Féminin</SelectItem>
                                            <SelectItem value="neutral" className="font-bold">Neutre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1">Description</Label>
                                <Textarea
                                    className="rounded-2xl min-h-[100px] border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 font-bold"
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Décrivez les caractéristiques de la voix..."
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Status Card */}
                    <Card className="rounded-[32px] border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="font-black tracking-tight text-xl">Statut & Visibilité</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-3 w-3 rounded-full shadow-sm",
                                        formData.isActive ? "bg-emerald-500 shadow-emerald-500/20" : "bg-zinc-300"
                                    )} />
                                    <span className="font-black text-sm uppercase tracking-tight">Active</span>
                                </div>
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Preview Audio Card */}
                    <Card className="rounded-[32px] border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="font-black tracking-tight text-xl">Aperçu Audio</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            {(formData.previewUrl || selectedFile) ? (
                                <div className="relative group">
                                    <div className="h-32 w-full bg-emerald-50 dark:bg-emerald-950/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-emerald-100 dark:border-emerald-900/20 overflow-hidden">
                                        <Button
                                            type="button"
                                            size="icon"
                                            className="h-16 w-16 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-xl shadow-emerald-500/20 z-10 transition-transform active:scale-95"
                                            onClick={() => handlePlayPreview(selectedFile ? URL.createObjectURL(selectedFile) : formData.previewUrl)}
                                        >
                                            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current ml-1" />}
                                        </Button>
                                        <div className="absolute inset-0 opacity-10 flex items-center justify-around px-4">
                                            {Array(12).fill(0).map((_, i) => (
                                                <div key={i} className={cn(
                                                    "w-1 bg-emerald-600 rounded-full",
                                                    isPlaying ? "animate-pulse" : ""
                                                )} style={{ height: `${Math.random() * 80 + 20}%` }} />
                                            ))}
                                        </div>
                                    </div>
                                    <label className="absolute -bottom-3 -right-3 h-10 w-10 bg-white dark:bg-zinc-800 rounded-full shadow-lg border border-zinc-100 dark:border-zinc-800 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform">
                                        <Upload className="h-4 w-4 text-zinc-500" />
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="audio/*"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-3xl cursor-pointer bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <Upload className="w-8 h-8 mb-3 text-zinc-400" />
                                            <p className="text-sm text-zinc-500 font-bold">Uploader un aperçu</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="audio/*"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </div>
                            )}

                            {selectedFile && (
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Nouveau fichier : {selectedFile.name}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
