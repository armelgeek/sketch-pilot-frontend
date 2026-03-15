"use client";

import { useState } from "react";
import {
    UserSquare2,
    Save,
    X,
    Upload,
    Star,
    Loader2,
    Image as ImageIcon,
    CheckCircle2,
    Users2,
    Baby,
    UserCircle2,
    UserCircle,
    Mic2
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Switch } from "@/src/components/ui/switch";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/src/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { cn } from "@/src/lib/utils";
import { useAdminVoices } from "../hooks/use-admin-data";

interface ModelFormProps {
    initialData?: any;
    onSubmit: (data: any, file?: File) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    title: string;
}

export function ModelForm({ initialData, onSubmit, onCancel, isLoading, title }: ModelFormProps) {
    const { data: voices } = useAdminVoices();

    const [formData, setFormData] = useState<any>(initialData || {
        name: "",
        gender: "unknown",
        age: "unknown",
        voiceId: "",
        isStandard: true
    });

    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit(formData, selectedFile || undefined);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <div className="h-14 w-14 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 shadow-sm border border-zinc-200 dark:border-zinc-800">
                        <UserSquare2 className="h-7 w-7" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">{title}</h1>
                        <p className="text-sm font-medium text-zinc-500 mt-1">Gérez les modèles de personnages et leurs styles visuels.</p>
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
                            <CardTitle className="font-black tracking-tight text-xl">Détails du Modèle</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="space-y-2">
                                <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1">Nom du modèle</Label>
                                <Input
                                    className="h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 font-bold focus-visible:ring-black"
                                    value={formData.name || ""}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="Ex: Stickman Business"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1">Genre</Label>
                                    <Select
                                        value={formData.gender || "unknown"}
                                        onValueChange={(val) => setFormData({ ...formData, gender: val })}
                                    >
                                        <SelectTrigger className="h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 font-bold">
                                            <div className="flex items-center gap-2">
                                                <Users2 className="h-4 w-4 text-zinc-400" />
                                                <SelectValue placeholder="Choisir le genre" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-xl">
                                            <SelectItem value="male">Homme (Male)</SelectItem>
                                            <SelectItem value="female">Femme (Female)</SelectItem>
                                            <SelectItem value="unknown">Inconnu / Neutre</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1">Âge</Label>
                                    <Select
                                        value={formData.age || "unknown"}
                                        onValueChange={(val) => setFormData({ ...formData, age: val })}
                                    >
                                        <SelectTrigger className="h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 font-bold">
                                            <div className="flex items-center gap-2">
                                                <UserCircle2 className="h-4 w-4 text-zinc-400" />
                                                <SelectValue placeholder="Choisir l'âge" />
                                            </div>
                                        </SelectTrigger>
                                        <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-xl">
                                            <SelectItem value="child">Enfant (Child)</SelectItem>
                                            <SelectItem value="youth">Jeune (Youth)</SelectItem>
                                            <SelectItem value="senior">Sénior (Senior)</SelectItem>
                                            <SelectItem value="unknown">Inconnu</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1">Voix par défaut</Label>
                                <Select
                                    value={formData.voiceId || ""}
                                    onValueChange={(val) => setFormData({ ...formData, voiceId: val })}
                                >
                                    <SelectTrigger className="h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 font-bold">
                                        <div className="flex items-center gap-2">
                                            <Mic2 className="h-4 w-4 text-zinc-400" />
                                            <SelectValue placeholder="Aucune voix associée" />
                                        </div>
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-zinc-100 dark:border-zinc-800 shadow-xl max-h-[300px]">
                                        <SelectItem value="none">Aucune voix associée</SelectItem>
                                        {voices?.map((voice) => (
                                            <SelectItem key={voice.id} value={voice.presetId}>
                                                {voice.name} ({voice.provider} - {voice.language})
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="flex items-center justify-between p-6 rounded-3xl bg-zinc-50 dark:bg-zinc-800/50 border border-zinc-100 dark:border-zinc-800">
                                <div className="flex items-center gap-4">
                                    <div className={cn(
                                        "h-12 w-12 rounded-2xl flex items-center justify-center shadow-lg",
                                        formData.isStandard ? "bg-emerald-500 text-white shadow-emerald-500/20" : "bg-zinc-200 text-zinc-500 shadow-zinc-200/20"
                                    )}>
                                        <Star className={cn("h-6 w-6", formData.isStandard ? "fill-current" : "")} />
                                    </div>
                                    <div>
                                        <h4 className="font-black text-lg">Modèle Standard</h4>
                                        <p className="text-sm font-medium text-zinc-500">Les modèles standards sont visibles par tous les utilisateurs.</p>
                                    </div>
                                </div>
                                <Switch
                                    checked={formData.isStandard}
                                    onCheckedChange={(checked: boolean) => setFormData({ ...formData, isStandard: checked })}
                                />
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Visual Reference Card */}
                    <Card className="rounded-[32px] border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="font-black tracking-tight text-xl">Image de Référence</CardTitle>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            {(formData.imageUrl || selectedFile) ? (
                                <div className="relative group rounded-3xl overflow-hidden border-4 border-white dark:border-zinc-800 shadow-xl aspect-square bg-zinc-100 dark:bg-zinc-800">
                                    <img
                                        src={selectedFile ? URL.createObjectURL(selectedFile) : formData.imageUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                    <label className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer">
                                        <div className="bg-white text-black font-black px-6 py-2.5 rounded-2xl flex items-center gap-2 transform translate-y-4 group-hover:translate-y-0 transition-transform">
                                            <Upload className="h-4 w-4" /> Changer l'image
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    <label className="flex flex-col items-center justify-center w-full aspect-square border-2 border-dashed rounded-[32px] cursor-pointer bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all">
                                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                            <ImageIcon className="w-12 h-12 mb-4 text-zinc-300" />
                                            <p className="text-sm text-zinc-500 font-black">Uploader une image</p>
                                        </div>
                                        <input
                                            type="file"
                                            className="hidden"
                                            accept="image/*"
                                            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
                                        />
                                    </label>
                                </div>
                            )}

                            {selectedFile && (
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                    <CheckCircle2 className="h-4 w-4" />
                                    Nouveau fichier prêt.
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form>
    );
}
