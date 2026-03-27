"use client";

import { useState } from "react";
import {
    Plus,
    Trash2,
    Edit3,
    UserSquare2,
    AlertCircle,
    Image as ImageIcon,
    CheckCircle2,
    Star,
    Loader2,
    ArrowRight
} from "lucide-react";
import { ConfirmDialog } from "@/src/components/organisms/confirm-dialog";
import {
    Card,
    CardContent,
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useAdminModels } from "@/src/app/admin/hooks/use-admin-data";
import { useAdminActions } from "@/src/app/admin/hooks/use-admin-actions";
import { useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";

export default function AdminModelsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const { data: models, isLoading } = useAdminModels({ search });
    const { deleteModel, isPending } = useAdminActions();

    const [modelToDelete, setModelToDelete] = useState<any>(null);

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">Modèles de Personnages</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-2 font-medium">Gérez la bibliothèque de modèles prédéfinis pour la génération de vidéos.</p>
                </div>

                <div className="flex flex-col sm:flex-row gap-4 items-center">
                    <div className="relative w-full sm:w-80">
                        <ImageIcon className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <input
                            type="text"
                            placeholder="Rechercher un modèle..."
                            className="w-full pl-11 pr-4 py-3 bg-zinc-100 dark:bg-zinc-800 rounded-2xl border-none focus:ring-2 ring-black font-medium text-sm transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <Button
                        className="bg-black hover:bg-zinc-800 text-white rounded-[20px] font-black gap-2 h-12 px-8 shadow-xl w-full sm:w-auto"
                        onClick={() => router.push("/admin/models/new")}
                    >
                        <Plus className="h-5 w-5" />
                        Créer un Modèle
                    </Button>
                </div>
            </div>

            {/* Model List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {isLoading ? (
                    Array(8).fill(0).map((_, i) => <Skeleton key={i} className="aspect-square rounded-[32px]" />)
                ) : (
                    models?.data?.map((model: any) => (
                        <Card
                            key={model.id}
                            className="group border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden transition-all duration-300 hover:ring-2 ring-black cursor-pointer"
                            onClick={() => router.push(`/admin/models/${model.id}`)}
                        >
                            <CardContent className="p-0 relative aspect-square">
                                <img
                                    src={model.images?.[0]}
                                    alt={model.name}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-60 group-hover:opacity-80 transition-opacity" />

                                <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                                    <Button
                                        variant="secondary"
                                        size="icon"
                                        className="h-9 w-9 rounded-full bg-white/90 backdrop-blur-md border-none shadow-lg text-zinc-400 hover:text-red-500 transition-all opacity-0 group-hover:opacity-100"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            setModelToDelete(model);
                                        }}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>

                                <div className="absolute inset-x-0 bottom-0 p-6 flex items-end justify-between gap-4">
                                    <div className="min-w-0">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <h3 className="font-black text-white text-lg tracking-tight truncate">{model.name}</h3>
                                            {model.isStandard && (
                                                <Star className="h-4 w-4 text-amber-400 fill-current" />
                                            )}
                                        </div>
                                        <Badge variant="secondary" className="bg-white/10 backdrop-blur-md text-white border-none text-[10px] font-black uppercase tracking-widest px-2 py-0">
                                            {model.gender} • {model.age}
                                        </Badge>
                                    </div>
                                    <div className="h-10 w-10 bg-white dark:bg-zinc-800 rounded-full flex items-center justify-center text-zinc-900 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-lg scale-90 group-hover:scale-100">
                                        <ArrowRight className="h-5 w-5" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>

            {!isLoading && (models?.data?.length === 0 || !models?.data) && (
                <div className="flex flex-col items-center justify-center py-24 bg-white dark:bg-zinc-900 rounded-[40px] border-2 border-dashed border-zinc-100 dark:border-zinc-800 shadow-sm">
                    <UserSquare2 className="h-16 w-16 text-zinc-200 mb-6" />
                    <h3 className="text-xl font-black tracking-tight mb-2">Aucun modèle trouvé</h3>
                    <p className="text-zinc-500 font-medium max-w-xs text-center text-sm">
                        Commencez par créer votre premier modèle de personnage pour la bibliothèque.
                    </p>
                </div>
            )}

            <ConfirmDialog
                open={!!modelToDelete}
                onOpenChange={(open) => !open && setModelToDelete(null)}
                onConfirm={async () => {
                    await deleteModel(modelToDelete.id);
                    setModelToDelete(null);
                }}
                isLoading={isPending}
                title="Supprimer le Modèle"
                description={`Êtes-vous sûr de vouloir supprimer le modèle "${modelToDelete?.name}" ? Cette action supprimera également l'image associée.`}
                confirmText="Supprimer"
                variant="destructive"
            />
        </div>
    );
}
