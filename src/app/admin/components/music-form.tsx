"use client";

import { useState } from "react";
import {
    Music,
    Save,
    X,
    Upload,
    Play,
    Pause,
    Loader2,
    Tag,
    CheckCircle2,
    Settings,
    Music2
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { MusicTrack } from "@/src/app/admin/schema";
import { cn } from "@/src/lib/utils";

const AVAILABLE_TAGS = ["chill", "dynamique", "joyeux", "triste", "épique", "calme", "entreprise"];

interface MusicFormProps {
    initialData?: Partial<MusicTrack>;
    onSubmit: (data: any, file?: File) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    title: string;
}

export function MusicForm({ initialData, onSubmit, onCancel, isLoading, title }: MusicFormProps) {
    const [formData, setFormData] = useState<any>(initialData || {
        isActive: true,
        tags: [],
        name: "",
        trackId: ""
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

    const toggleTag = (tag: string) => {
        const tags = [...(formData.tags || [])];
        if (tags.includes(tag)) {
            setFormData({ ...formData, tags: tags.filter(t => t !== tag) });
        } else {
            setFormData({ ...formData, tags: [...tags, tag] });
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData, selectedFile || undefined);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-indigo-50 dark:bg-indigo-950/20 rounded-2xl flex items-center justify-center text-indigo-600 shadow-sm border border-indigo-100 dark:border-indigo-900/30">
                        <Music2 className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">{title}</h1>
                        <p className="text-sm font-medium text-zinc-500 mt-1">Gérez les pistes musicales d'ambiance.</p>
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
                                <CardTitle className="font-black tracking-tight text-xl">Détails de la Piste</CardTitle>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1">Nom de la musique</Label>
                                    <Input
                                        className="h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 font-bold focus-visible:ring-indigo-500"
                                        value={formData.name || ""}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="Ex: Morning Coffee"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1">ID de la piste (Slug / Unique)</Label>
                                    <Input
                                        className="h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 font-mono font-bold focus-visible:ring-indigo-500"
                                        value={formData.trackId || ""}
                                        onChange={(e) => setFormData({ ...formData, trackId: e.target.value })}
                                        placeholder="Ex: morning_coffee_01"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1 flex items-center gap-2">
                                    <Tag className="h-3 w-3" /> Étiquettes (Ambiance)
                                </Label>
                                <div className="flex flex-wrap gap-2">
                                    {AVAILABLE_TAGS.map(tag => (
                                        <button
                                            key={tag}
                                            type="button"
                                            onClick={() => toggleTag(tag)}
                                            className={cn(
                                                "px-4 py-2 rounded-xl text-xs font-black uppercase transition-all",
                                                formData.tags?.includes(tag)
                                                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/20"
                                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:bg-zinc-200 dark:hover:bg-zinc-700"
                                            )}
                                        >
                                            {tag}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Status Card */}
                    <Card className="rounded-[32px] border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="font-black tracking-tight text-xl">Disponibilité</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4">
                            <div className="flex items-center justify-between p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "h-3 w-3 rounded-full shadow-sm",
                                        formData.isActive ? "bg-indigo-500 shadow-indigo-500/20" : "bg-zinc-300"
                                    )} />
                                    <span className="font-black text-sm uppercase tracking-tight">Activer la piste</span>
                                </div>
                                <Switch
                                    checked={formData.isActive}
                                    onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* File Upload Card */}
                    <Card className="rounded-[32px] border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="font-black tracking-tight text-xl">Fichier Audio</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            {(formData.path || selectedFile) ? (
                                <div className="relative group">
                                    <div className="h-32 w-full bg-indigo-50 dark:bg-indigo-950/10 rounded-2xl flex items-center justify-center border-2 border-dashed border-indigo-100 dark:border-indigo-900/20 overflow-hidden">
                                        <Button
                                            type="button"
                                            size="icon"
                                            className="h-16 w-16 rounded-full bg-indigo-500 hover:bg-indigo-600 text-white shadow-xl shadow-indigo-500/20 z-10 transition-transform active:scale-95"
                                            onClick={() => handlePlayPreview(selectedFile ? URL.createObjectURL(selectedFile) : formData.path)}
                                        >
                                            {isPlaying ? <Pause className="h-8 w-8" /> : <Play className="h-8 w-8 fill-current ml-1" />}
                                        </Button>
                                        <div className="absolute inset-0 opacity-10 flex items-center justify-around px-4">
                                            {Array(12).fill(0).map((_, i) => (
                                                <div key={i} className={cn(
                                                    "w-1 bg-indigo-600 rounded-full",
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
                                            <p className="text-sm text-zinc-500 font-bold">Uploader le fichier MP3</p>
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
                                <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-950/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
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
