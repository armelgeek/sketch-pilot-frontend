"use client";

import { useEffect, useState } from "react";
import { Library, Loader2, AlertCircle, Filter } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Badge } from "@/src/components/ui/badge";
import { Card } from "@/src/components/ui/card";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/src/components/ui/dialog";
import { usePersonalModels, useAvailableVoices } from "@/src/app/character-models/hooks";
import {
    PersonalModelForm,
    PersonalModelCard,
} from "@/src/app/character-models/components";
import { CharacterModel } from "@/src/app/character-models/api/character-models-service";

export default function MyModelsPage() {
    const { models, loading, error, fetchPersonalModels, createModel, updateModel, deleteModel } = usePersonalModels();
    const { voices, fetchVoices } = useAvailableVoices();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [editingModel, setEditingModel] = useState<CharacterModel | null>(null);
    const [modelToDelete, setModelToDelete] = useState<CharacterModel | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        fetchPersonalModels();
        fetchVoices();
    }, [fetchPersonalModels, fetchVoices]);

    const allTags = Array.from(new Set(models.flatMap(m => m.tags || [])));

    const filteredModels = models.filter(model => {
        const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            model.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesTags = selectedTags.length === 0 || selectedTags.some(tag => model.tags?.includes(tag));
        return matchesSearch && matchesTags;
    });

    const handleCreateOrUpdate = async (data: {
        name: string;
        imageUrl: string;
        description: string;
        voiceId?: string;
        tags?: string[];
        lockedPromptSegment?: string;
        advancedSeed?: number;
    }) => {
        setIsSubmitting(true);
        try {
            if (editingModel) {
                await updateModel(editingModel.id, data);
            } else {
                await createModel(data);
            }
            setEditingModel(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteModel = async () => {
        if (!modelToDelete) return;
        setIsSubmitting(true);
        try {
            await deleteModel(modelToDelete.id);
            setModelToDelete(null);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen pb-20 space-y-8">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-full bg-linear-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                            <Library className="h-6 w-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-3xl md:text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">
                                Ma Bibliothèque
                            </h1>
                            <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                Gérez vos modèles de personnages personnalisés
                            </p>
                        </div>
                    </div>

                    <PersonalModelForm
                        voices={voices}
                        model={editingModel || undefined}
                        onSubmit={handleCreateOrUpdate}
                        isLoading={isSubmitting}
                        trigger={
                            <Button className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg">
                                <Library className="h-4 w-4 mr-2" />
                                Nouveau Modèle
                            </Button>
                        }
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <Card className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                        <div>
                            <h3 className="font-bold text-red-800 dark:text-red-200">Erreur</h3>
                            <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Search & Filter */}
            <div className="space-y-3">
                <Input
                    placeholder="Rechercher par nom ou description..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-xl h-11 border-zinc-200 dark:border-zinc-800"
                />

                {/* Tag Filter */}
                {allTags.length > 0 && (
                    <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-zinc-500 uppercase">
                            <Filter className="h-3 w-3" />
                            Filtrer par tags
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {allTags.map(tag => (
                                <Badge
                                    key={tag}
                                    variant={selectedTags.includes(tag) ? "default" : "outline"}
                                    className={`cursor-pointer transition-colors rounded-full ${
                                        selectedTags.includes(tag)
                                            ? "bg-emerald-600 text-white"
                                            : "bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700 hover:border-emerald-500"
                                    }`}
                                    onClick={() => {
                                        setSelectedTags(prev =>
                                            prev.includes(tag)
                                                ? prev.filter(t => t !== tag)
                                                : [...prev, tag]
                                        );
                                    }}
                                >
                                    {tag}
                                </Badge>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4">
                    <Loader2 className="h-8 w-8 text-emerald-600 animate-spin" />
                    <p className="text-zinc-500">Chargement de votre bibliothèque...</p>
                </div>
            ) : filteredModels.length === 0 ? (
                <Card className="p-12 text-center rounded-2xl border-2 border-dashed border-zinc-200 dark:border-zinc-800">
                    <Library className="h-12 w-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-4" />
                    <h3 className="text-lg font-black text-zinc-600 dark:text-zinc-300 mb-2">
                        {models.length === 0 ? "Aucun modèle créé" : "Aucun résultat"}
                    </h3>
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-6 max-w-xs mx-auto">
                        {models.length === 0
                            ? "Créez votre premier modèle personnalisé pour organiser et réutiliser vos personnages."
                            : "Essayez de modifier votre recherche ou vos filtres."}
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredModels.map(model => (
                        <PersonalModelCard
                            key={model.id}
                            model={model}
                            onEdit={(m) => {
                                setEditingModel(m);
                            }}
                            onDelete={(id) => {
                                setModelToDelete(filteredModels.find(m => m.id === id) || null);
                            }}
                        />
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!modelToDelete} onOpenChange={(open: boolean) => !open && setModelToDelete(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Supprimer le modèle ?</DialogTitle>
                        <DialogDescription>
                            Êtes-vous sûr de vouloir supprimer <strong>{modelToDelete?.name}</strong> ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 justify-end">
                        <Button
                            onClick={() => setModelToDelete(null)}
                            variant="outline"
                            className="rounded-lg"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleDeleteModel}
                            disabled={isSubmitting}
                            className="bg-red-600 hover:bg-red-700 text-white rounded-lg"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Supprimer"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Additional Info */}
            <Card className="p-6 bg-linear-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/10 dark:to-teal-900/10 border border-emerald-200 dark:border-emerald-800 rounded-2xl">
                <h3 className="font-bold text-emerald-900 dark:text-emerald-100 mb-3">💡 Conseils d&apos;utilisation</h3>
                <ul className="space-y-2 text-sm text-emerald-800 dark:text-emerald-200">
                    <li>✅ <strong>Prompt verrouillé</strong>: Assurez la cohérence en ajoutant des traits invariants</li>
                    <li>✅ <strong>Voix assignée</strong>: La voix sera automatiquement appliquée aux vidéos utilisant ce modèle</li>
                    <li>✅ <strong>Tags</strong>: Organisez vos modèles par style, genre ou projet</li>
                    <li>✅ <strong>Seed avancé</strong>: Reproduisez exactement la même génération avec le même seed</li>
                </ul>
            </Card>
        </div>
    );
}
