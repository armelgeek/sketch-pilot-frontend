"use client";

import { useState } from "react";
import { UserSquare2, Loader2, AlertCircle, Filter, Plus } from "lucide-react";
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
import { usePersonalModels, useAvailableVoices, useCreateCharacter, useUpdateCharacter, useDeleteCharacter } from "@/src/app/character-models/hooks";
import { PersonalModelForm } from "@/src/app/character-models/components/PersonalModelForm";
import { PersonalModelCard } from "@/src/app/character-models/components/PersonalModelCard";
import { CharacterModel } from "@/src/app/character-models/api/character-models-service";


export default function MyModelsPage() {
    const { data: models = [], isLoading: loading, error } = usePersonalModels();
    const { data: voices = [] } = useAvailableVoices();
    const { mutateAsync: createModel } = useCreateCharacter();
    const { mutateAsync: updateModel } = useUpdateCharacter();
    const { mutateAsync: deleteModel } = useDeleteCharacter();

    const [searchQuery, setSearchQuery] = useState("");
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [editingModel, setEditingModel] = useState<CharacterModel | null>(null);
    const [modelToDelete, setModelToDelete] = useState<CharacterModel | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Mocking tags since the backend might not natively support them as a top-level field yet
    const allTags = Array.from(new Set(models.flatMap(m => m.gender ? [m.gender] : [])));

    const filteredModels = models.filter(model => {
        const matchesSearch = model.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            (model.description && model.description.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesSearch;
    });

    const handleCreateOrUpdate = async (data: any) => {
        setIsSubmitting(true);
        try {
            if (editingModel) {
                await updateModel({ id: editingModel.id, data });
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
        <div className="space-y-6 pb-20 max-w-6xl mx-auto">
            {/* Header */}
            <div className="space-y-4">
                <div className="flex items-center justify-between bg-white p-6 rounded-[2.5rem] shadow-sm border border-zinc-100">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-50 flex items-center justify-center border border-amber-100">
                            <UserSquare2 className="h-6 w-6 text-amber-500" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-black tracking-tight text-zinc-900">
                                My Models
                            </h1>
                            <p className="text-xs font-bold text-zinc-400 uppercase tracking-widest mt-1">
                                Gérez vos personnages IA
                            </p>
                        </div>
                    </div>

                    <PersonalModelForm
                        voices={voices}
                        model={editingModel || undefined}
                        onSubmit={handleCreateOrUpdate}
                        isLoading={isSubmitting}
                        trigger={
                            <Button className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl h-11 px-6 font-black tracking-widest uppercase text-[10px] shadow-xl shadow-zinc-200 transition-all active:scale-95">
                                <Plus className="h-4 w-4 mr-2" />
                                Nouveau Personnage
                            </Button>
                        }
                    />
                </div>
            </div>

            {/* Error Message */}
            {error && (
                <Card className="p-4 bg-red-50 border border-red-200 rounded-2xl">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 shrink-0" />
                        <div>
                            <h3 className="font-bold text-red-800">Erreur</h3>
                            <p className="text-sm text-red-700">{(error as any).message || "Impossible de charger les modèles."}</p>
                        </div>
                    </div>
                </Card>
            )}

            {/* Search */}
            <div className="bg-white p-2 rounded-2xl border border-zinc-100 shadow-sm flex gap-2">
                <Input
                    placeholder="Rechercher par nom..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="rounded-xl h-12 border-none bg-zinc-50 font-bold focus-visible:ring-0 focus-visible:bg-zinc-100 transition-colors"
                />
            </div>

            {/* Content */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 gap-4 bg-white rounded-[2.5rem] border border-zinc-100">
                    <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Chargement de vos modèles...</p>
                </div>
            ) : filteredModels.length === 0 ? (
                <Card className="p-16 flex flex-col items-center text-center rounded-[2.5rem] border-2 border-dashed border-zinc-200 bg-zinc-50/50">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mb-4 shadow-sm border border-zinc-100 relative">
                        <UserSquare2 className="h-8 w-8 text-zinc-300" />
                        <div className="absolute -bottom-1 -right-1 h-6 w-6 bg-amber-500 rounded-full flex items-center justify-center border-2 border-zinc-50">
                            <Plus className="h-3 w-3 text-white" />
                        </div>
                    </div>
                    <h3 className="text-xl font-black text-zinc-900 mb-2 tracking-tight">
                        {models.length === 0 ? "Aucun modèle créé" : "Aucun résultat"}
                    </h3>
                    <p className="text-sm text-zinc-500 max-w-sm mx-auto font-medium">
                        {models.length === 0
                            ? "Créez votre premier personnage pour l'utiliser comme acteur par défaut dans vos prochaines vidéos."
                            : "Aucun personnage ne correspond à votre recherche."}
                    </p>
                </Card>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredModels.map(model => (
                        <PersonalModelCard
                            key={model.id}
                            model={model}
                            onEdit={(m: CharacterModel) => setEditingModel(m)}
                            onDelete={(id: string) => setModelToDelete(filteredModels.find(m => m.id === id) || null)}
                        />

                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            <Dialog open={!!modelToDelete} onOpenChange={(open) => !open && setModelToDelete(null)}>
                <DialogContent className="rounded-3xl border-zinc-100 bg-white">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black text-zinc-900 tracking-tight">Supprimer le modèle ?</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-zinc-500 mt-2">
                            Êtes-vous sûr de vouloir supprimer <strong>{modelToDelete?.name}</strong> ? Cette action est irréversible.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex gap-3 justify-end mt-4">
                        <Button
                            onClick={() => setModelToDelete(null)}
                            variant="ghost"
                            className="rounded-xl h-11 text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900"
                        >
                            Annuler
                        </Button>
                        <Button
                            onClick={handleDeleteModel}
                            disabled={isSubmitting}
                            className="bg-red-500 hover:bg-red-600 text-white rounded-xl h-11 px-6 font-black text-[11px] uppercase tracking-widest shadow-lg shadow-red-500/20"
                        >
                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Supprimer"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}
