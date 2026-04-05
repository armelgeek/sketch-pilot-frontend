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
    Mic2,
    Palette,
    TextQuote,
    Plus,
    Trash2,
    Sparkles
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
    onSubmit: (data: any, files: File[], inspirationFiles: Record<number, File>) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    title: string;
}

export function ModelForm({ initialData, onSubmit, onCancel, isLoading, title }: ModelFormProps) {
    const { data: voices } = useAdminVoices();

    const [formData, setFormData] = useState<any>(initialData || {
        name: "",
        description: "",
        gender: "unknown",
        age: "unknown",
        voiceId: "",
        stylePrefix: "",
        artistPersona: "",
        isStandard: true,
        images: [],
        thumbnailInspirations: []
    });

    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Merge multiple file states into one for easier handling if needed, 
        // or just pass them separately as before.
        await onSubmit(formData, selectedFiles, inspirationFiles);
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...files]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const removeExistingImage = (index: number) => {
        const newImages = [...(formData.images || [])];
        newImages.splice(index, 1);
        setFormData({ ...formData, images: newImages });
    };

    const [inspirationFiles, setInspirationFiles] = useState<Record<number, File>>({});

    const handleInspirationFile = (file: File) => {
        const index = (formData.thumbnailInspirations || []).length;
        setInspirationFiles(prev => ({ ...prev, [index]: file }));
        const newInspirations = [...(formData.thumbnailInspirations || []), URL.createObjectURL(file)];
        setFormData({ ...formData, thumbnailInspirations: newInspirations });
    };

    const removeInspiration = (index: number) => {
        const currentInspirations = formData.thumbnailInspirations || [];
        const newInspirations = currentInspirations.filter((_: any, i: number) => i !== index);

        // Cleanup files mapping
        const newFiles: Record<number, File> = {};
        let newIdx = 0;
        currentInspirations.forEach((_: any, i: number) => {
            if (i !== index) {
                if (inspirationFiles[i]) {
                    newFiles[newIdx] = inspirationFiles[i];
                }
                newIdx++;
            }
        });
        setInspirationFiles(newFiles);
        setFormData({ ...formData, thumbnailInspirations: newInspirations });
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

                            <div className="space-y-2">
                                <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1">Description / Bio</Label>
                                <textarea
                                    className="w-full min-h-[80px] rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 p-4 font-medium focus:ring-2 focus:ring-black focus:outline-none transition-all text-sm"
                                    value={formData.description || ""}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Décrivez brièvement le personnage..."
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
                                        {voices?.map((voice: any) => (
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

                    {/* Visual Style Theme */}
                    <Card className="rounded-[32px] border-none shadow-xl shadow-orange-200/20 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden border-t-4 border-orange-500">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-3">
                                <Palette className="h-6 w-6 text-orange-500" />
                                <CardTitle className="font-black tracking-tight text-xl">Style Visuel & Persona</CardTitle>
                            </div>
                            <CardDescription className="font-medium">Définit l'identité artistique générée par l'IA pour ce personnage.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="font-extrabold text-xs uppercase tracking-widest text-orange-400 pl-1">Style Prefix (Prompt)</Label>
                                    <div className="relative">
                                        <TextQuote className="absolute left-4 top-4 h-4 w-4 text-zinc-400" />
                                        <textarea
                                            className="w-full min-h-[100px] rounded-2xl border-zinc-100 dark:border-zinc-800 bg-orange-50/30 dark:bg-orange-950/10 p-4 pl-12 font-medium focus:ring-2 focus:ring-orange-500 focus:outline-none transition-all text-sm"
                                            value={formData.stylePrefix || ""}
                                            onChange={(e) => setFormData({ ...formData, stylePrefix: e.target.value })}
                                            placeholder="Ex: Clean Whiteboard illustration, monochrome black ink on pure white background..."
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-zinc-400 px-2 uppercase tracking-tighter">Instructions de style injectées dans chaque prompt d'image.</p>
                                </div>

                                <div className="space-y-2">
                                    <Label className="font-extrabold text-xs uppercase tracking-widest text-orange-400 pl-1">Artist Persona</Label>
                                    <div className="relative">
                                        <UserSquare2 className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                                        <Input
                                            className="h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-orange-50/30 dark:bg-orange-950/10 pl-12 font-bold focus-visible:ring-orange-500"
                                            value={formData.artistPersona || ""}
                                            onChange={(e) => setFormData({ ...formData, artistPersona: e.target.value })}
                                            placeholder="Ex: Whiteboard artist, Manga illustrator..."
                                        />
                                    </div>
                                    <p className="text-[10px] font-bold text-zinc-400 px-2 uppercase tracking-tighter">Le rôle que l'IA doit endosser (ex: "As a [Persona]...").</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Thumbnail Inspirations */}
                    <Card className="rounded-[32px] border-none shadow-xl shadow-amber-200/20 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden border-t-4 border-amber-500">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-3">
                                <Sparkles className="h-6 w-6 text-amber-500" />
                                <CardTitle className="font-black tracking-tight text-xl">Inspirations Thumbnail</CardTitle>
                            </div>
                            <CardDescription className="font-medium">Images de référence pour les miniatures.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                                {(formData.thumbnailInspirations || []).map((url: string, idx: number) => (
                                    <div key={idx} className="group relative aspect-video rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 transition-all hover:ring-4 hover:ring-amber-500/10">
                                        <img src={url} alt={`Inspiration ${idx}`} className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                            <button
                                                type="button"
                                                onClick={() => removeInspiration(idx)}
                                                className="bg-red-500 text-white p-2 rounded-full shadow-lg hover:bg-red-600 transition-colors"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </button>
                                        </div>
                                        {inspirationFiles[idx] && (
                                            <div className="absolute top-2 left-2 bg-amber-500 text-white text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-tighter shadow-sm">New</div>
                                        )}
                                    </div>
                                ))}

                                {/* Add Button */}
                                <label className="flex flex-col items-center justify-center aspect-video border-2 border-dashed border-zinc-200 rounded-xl cursor-pointer hover:bg-amber-50/30 hover:border-amber-200 transition-all group">
                                    <div className="h-8 w-8 rounded-full bg-zinc-50 flex items-center justify-center mb-2 group-hover:bg-amber-100 transition-colors">
                                        <Plus className="h-4 w-4 text-zinc-400 group-hover:text-amber-600" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase text-zinc-400 group-hover:text-amber-600 transition-colors">Ajouter</p>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        onChange={(e) => e.target.files?.[0] && handleInspirationFile(e.target.files[0])}
                                    />
                                </label>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-8">
                    {/* Visual Reference Card */}
                    <Card className="rounded-[32px] border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <CardTitle className="font-black tracking-tight text-xl text-center">Images de Référence</CardTitle>
                            <CardDescription className="text-center font-medium">Ajoutez plusieurs images pour une meilleure cohérence.</CardDescription>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="grid grid-cols-2 gap-4">
                                {/* Existing Images */}
                                {formData.images?.map((url: string, idx: number) => (
                                    <div key={`existing-${idx}`} className="relative group rounded-2xl overflow-hidden border-2 border-zinc-100 aspect-square bg-zinc-50">
                                        <img src={url} alt={`Reference ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeExistingImage(idx)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}

                                {/* New Selected Files */}
                                {selectedFiles.map((file, idx) => (
                                    <div key={`new-${idx}`} className="relative group rounded-2xl overflow-hidden border-2 border-emerald-100 aspect-square bg-emerald-50/30">
                                        <img src={URL.createObjectURL(file)} alt={`New ${idx}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeFile(idx)}
                                            className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                        <div className="absolute bottom-0 inset-x-0 bg-emerald-500 text-white text-[10px] py-0.5 text-center font-bold">READY</div>
                                    </div>
                                ))}

                                {/* Add Button */}
                                <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed rounded-2xl cursor-pointer bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all">
                                    <div className="flex flex-col items-center justify-center">
                                        <Upload className="w-6 h-6 mb-2 text-zinc-400" />
                                        <p className="text-[10px] text-zinc-500 font-black uppercase">Ajouter</p>
                                    </div>
                                    <input
                                        type="file"
                                        className="hidden"
                                        accept="image/*"
                                        multiple
                                        onChange={handleFileChange}
                                    />
                                </label>
                            </div>

                            {selectedFiles.length > 0 && (
                                <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                                    <CheckCircle2 className="h-4 w-4" />
                                    {selectedFiles.length} nouveau(x) fichier(s) prêt(s).
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </form >
    );
}
