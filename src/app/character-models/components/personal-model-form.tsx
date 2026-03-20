"use client";

import { useState } from "react";
import { Plus, X, Loader2, Save, Mic2, Tag, Lock, Zap, Palette } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Badge } from "@/src/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { Label } from "@/src/components/ui/label";
import { CharacterModel } from "@/src/app/character-models/api/character-models-service";
import type { VoicePreset } from "@/src/app/admin/schema";

interface PersonalModelFormProps {
    model?: CharacterModel;
    voices: VoicePreset[];
    onSubmit: (data: {
        name: string;
        imageUrl: string;
        description: string;
        voiceId?: string;
        tags?: string[];
        lockedPromptSegment?: string;
        advancedSeed?: number;
        stylePrefix?: string;
        artistPersona?: string;
    }) => Promise<void>;
    isLoading?: boolean;
    trigger?: React.ReactNode;
}

export function PersonalModelForm({
    model,
    voices,
    onSubmit,
    isLoading = false,
    trigger,
}: PersonalModelFormProps) {
    const [open, setOpen] = useState(false);
    const [initialSeed] = useState(() => Math.floor(Math.random() * 1000000));
    const [formData, setFormData] = useState({
        name: model?.name || "",
        imageUrl: model?.imageUrl || "",
        description: model?.description || "",
        voiceId: model?.voiceId || "",
        tags: model?.tags || [] as string[],
        lockedPromptSegment: model?.lockedPromptSegment || "",
        advancedSeed: model?.advancedSeed || initialSeed,
        stylePrefix: model?.stylePrefix || "",
        artistPersona: model?.artistPersona || "",
    });

    const [newTag, setNewTag] = useState("");
    const selectedVoicePreview = voices.find(v => v.presetId === formData.voiceId) || null;

    const handleAddTag = () => {
        if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
            setFormData(prev => ({
                ...prev,
                tags: [...prev.tags, newTag.trim()]
            }));
            setNewTag("");
        }
    };

    const handleRemoveTag = (tag: string) => {
        setFormData(prev => ({
            ...prev,
            tags: prev.tags.filter(t => t !== tag)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            await onSubmit(formData);
            setOpen(false);
        } catch (err) {
            console.error("Failed to save model:", err);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {trigger || (
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl">
                        <Plus className="h-4 w-4 mr-2" />
                        Nouveau Modèle
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-90vh overflow-y-auto rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-black">
                        {model ? "Éditer le Modèle" : "Créer un Nouveau Modèle Personnel"}
                    </DialogTitle>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="space-y-4">
                        <div>
                            <Label className="text-sm font-bold">Nom du Modèle</Label>
                            <Input
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                placeholder="ex: Mon Personnage Anime"
                                className="mt-2 rounded-lg border-zinc-200"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-bold">Image URL</Label>
                            <Input
                                value={formData.imageUrl}
                                onChange={(e) => setFormData(prev => ({ ...prev, imageUrl: e.target.value }))}
                                placeholder="https://..."
                                className="mt-2 rounded-lg border-zinc-200"
                            />
                        </div>

                        <div>
                            <Label className="text-sm font-bold">Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                                placeholder="Décrivez le caractère et le style..."
                                className="mt-2 rounded-lg border-zinc-200 min-h-25"
                            />
                        </div>
                    </div>

                    {/* Voice Selection */}
                    <div className="space-y-3 p-4 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-800">
                        <div className="flex items-center gap-2">
                            <Mic2 className="h-4 w-4 text-blue-600" />
                            <Label className="font-bold">Voix Associée</Label>
                        </div>
                        <Select value={formData.voiceId} onValueChange={(val) => setFormData(prev => ({ ...prev, voiceId: val }))}>
                            <SelectTrigger className="rounded-lg bg-white dark:bg-zinc-800">
                                <SelectValue placeholder="Aucune voix" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="">Aucune voix</SelectItem>
                                {voices.map((voice) => (
                                    <SelectItem key={voice.id} value={voice.presetId}>
                                        <div className="flex items-center gap-2">
                                            <span>{voice.gender === 'female' ? '👩' : '👨'}</span>
                                            <span>{voice.name} ({voice.language})</span>
                                        </div>
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {selectedVoicePreview?.previewUrl && (
                            <div className="flex items-center gap-2">
                                <audio controls className="w-full h-8" src={selectedVoicePreview.previewUrl} />
                                <span className="text-xs text-blue-600 font-medium">Aperçu</span>
                            </div>
                        )}
                    </div>

                    {/* Advanced Settings */}
                    <div className="space-y-4 p-4 bg-purple-50 dark:bg-purple-900/10 rounded-xl border border-purple-200 dark:border-purple-800">
                        <div className="flex items-center gap-2 mb-3">
                            <Zap className="h-4 w-4 text-purple-600" />
                            <Label className="font-bold">Paramètres Avancés</Label>
                        </div>

                        {/* Locked Prompt Segment */}
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Lock className="h-3 w-3 text-purple-600" />
                                <Label className="text-sm font-semibold">Prompt Verrouillé (Cohérence)</Label>
                            </div>
                            <Textarea
                                value={formData.lockedPromptSegment}
                                onChange={(e) => setFormData(prev => ({ ...prev, lockedPromptSegment: e.target.value }))}
                                placeholder="ex: cheveux blonds, lunettes rondes, style cartoon..."
                                className="mt-1 rounded-lg border-purple-200 dark:border-purple-800 min-h-20 text-sm"
                            />
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                                Cette partie du prompt ne changerait jamais, garantissant la cohérence du personnage.
                            </p>
                        </div>

                        {/* Advanced Seed */}
                        <div>
                            <Label className="text-sm font-semibold">Seed Avancé (Expert)</Label>
                            <div className="flex items-center gap-2 mt-2">
                                <Input
                                    type="number"
                                    value={formData.advancedSeed}
                                    onChange={(e) => setFormData(prev => ({ ...prev, advancedSeed: parseInt(e.target.value) || 0 }))}
                                    className="rounded-lg border-purple-200"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setFormData(prev => ({ ...prev, advancedSeed: Math.floor(Math.random() * 1000000) }))}
                                    className="rounded-lg"
                                >
                                    Aléatoire
                                </Button>
                            </div>
                            <p className="text-xs text-purple-600 dark:text-purple-400 mt-2">
                                Utilisez le même seed pour reproduire exactement la même génération.
                            </p>
                        </div>
                    </div>

                    {/* Style Theme */}
                    <div className="space-y-4 p-4 bg-orange-50 dark:bg-orange-900/10 rounded-xl border border-orange-200 dark:border-orange-800">
                        <div className="flex items-center gap-2 mb-3">
                            <Palette className="h-4 w-4 text-orange-600" />
                            <Label className="font-bold">Thème Visuel</Label>
                        </div>

                        <div>
                            <Label className="text-sm font-semibold">Style Prefix (Prompt)</Label>
                            <Textarea
                                value={formData.stylePrefix}
                                onChange={(e) => setFormData(prev => ({ ...prev, stylePrefix: e.target.value }))}
                                placeholder="ex: Clean Whiteboard illustration, monochrome black ink on white background..."
                                className="mt-2 rounded-lg border-orange-200 dark:border-orange-800 min-h-20 text-sm"
                            />
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                                Définit le style artistique global des images générées pour ce personnage. Exemples : "Watercolor illustration", "Flat vector minimalist", "Cyberpunk 2D neon", "Whiteboard stick figure".
                            </p>
                        </div>

                        <div>
                            <Label className="text-sm font-semibold">Persona Artiste (Rôle IA)</Label>
                            <Input
                                value={formData.artistPersona}
                                onChange={(e) => setFormData(prev => ({ ...prev, artistPersona: e.target.value }))}
                                placeholder="ex: Whiteboard artist, Concept illustrator, Manga artist..."
                                className="mt-2 rounded-lg border-orange-200 dark:border-orange-800"
                            />
                            <p className="text-xs text-orange-600 dark:text-orange-400 mt-2">
                                Définit le persona de l'IA lors de la génération (ex : "As a [persona], draw the following scene").
                            </p>
                        </div>
                    </div>

                    {/* Tags */}
                    <div className="space-y-3 p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-2 mb-2">
                            <Tag className="h-4 w-4 text-emerald-600" />
                            <Label className="font-bold">Tags & Catégories</Label>
                        </div>

                        <div className="flex gap-2">
                            <Input
                                value={newTag}
                                onChange={(e) => setNewTag(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                placeholder="Ajouter un tag..."
                                className="rounded-lg border-emerald-200"
                            />
                            <Button
                                type="button"
                                onClick={handleAddTag}
                                variant="outline"
                                className="rounded-lg border-emerald-200 text-emerald-600"
                            >
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>

                        {formData.tags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {formData.tags.map(tag => (
                                    <Badge
                                        key={tag}
                                        variant="secondary"
                                        className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-100 cursor-pointer hover:bg-emerald-200 transition-colors"
                                        onClick={() => handleRemoveTag(tag)}
                                    >
                                        {tag}
                                        <X className="h-3 w-3 ml-1" />
                                    </Badge>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => setOpen(false)}
                            className="rounded-lg"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !formData.name}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold"
                        >
                            {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                            {model ? "Mettre à jour" : "Créer"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
