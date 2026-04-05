"use client";

import { useState } from "react";
import {
    Plus,
    Trash2,
    Edit3,
    Image as ImageIcon,
    Copy,
    Settings,
    Grid3X3,
    Sparkles,
    ArrowRight,
    Search
} from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/src/lib/utils";
import { ConfirmDialog } from "@/src/components/organisms/confirm-dialog";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription
} from "@/src/components/ui/card";
import { Button } from "@/src/components/ui/button";
import { Badge } from "@/src/components/ui/badge";
import { Input } from "@/src/components/ui/input";
import { Skeleton } from "@/src/components/ui/skeleton";
import { useAdminThumbnailTemplates } from "@/src/app/admin/hooks/use-admin-data";
import { useAdminActions } from "@/src/app/admin/hooks/use-admin-actions";

export default function AdminThumbnailsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const { data: templatesRes, isLoading } = useAdminThumbnailTemplates({ search });
    const templates = templatesRes?.data || [];
    const { deleteThumbnail, isPending } = useAdminActions();

    // Deletion state
    const [templateToDelete, setTemplateToDelete] = useState<any>(null);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Inspirations Thumbnail</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Gérez les styles et templates pour la génération de miniatures.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Input
                            placeholder="Rechercher un style..."
                            className="h-11 w-64 rounded-2xl bg-white dark:bg-zinc-900 border-none shadow-lg shadow-zinc-200/50 dark:shadow-none font-bold pl-10 transition-all focus-visible:ring-black"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 group-focus-within:text-black transition-colors" />
                    </div>

                    <Button
                        className="bg-black hover:bg-zinc-800 text-white rounded-2xl font-black gap-2 h-11 px-6 shadow-xl"
                        onClick={() => router.push("/admin/thumbnails/new")}
                    >
                        <Plus className="h-5 w-5" />
                        Nouveau Style
                    </Button>
                </div>
            </div>

            <div className={cn(
                "grid grid-cols-1 gap-6",
                !isLoading && templates?.length > 0 ? "md:grid-cols-2 lg:grid-cols-3" : "lg:grid-cols-1"
            )}>
                {isLoading ? (
                    Array(6).fill(0).map((_, i) => <Skeleton key={i} className="h-64 rounded-[32px]" />)
                ) : templates?.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-[40px] shadow-xl shadow-zinc-200/50 dark:shadow-none border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                        <div className="h-20 w-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-[32px] flex items-center justify-center mb-6">
                            <ImageIcon className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight mb-2">Aucun style trouvé</h3>
                        <p className="text-zinc-500 font-medium max-w-xs text-center text-sm">
                            {search
                                ? `Aucun résultat pour "${search}". Essayez une autre recherche.`
                                : "Commencez par créer votre premier style d'inspiration pour les miniatures."}
                        </p>
                        {!search && (
                            <Button
                                className="mt-8 bg-black hover:bg-zinc-800 text-white rounded-2xl font-black gap-2 h-11 px-8 shadow-xl"
                                onClick={() => router.push("/admin/thumbnails/new")}
                            >
                                <Plus className="h-5 w-5" />
                                Créer un Style
                            </Button>
                        )}
                    </div>
                ) : templates?.map((template: any) => (
                    <Card key={template.id} className="border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden group hover:ring-2 ring-black transition-all">
                        <div className="aspect-video relative overflow-hidden bg-zinc-100">
                            {template.previewUrl ? (
                                <img
                                    src={template.previewUrl}
                                    alt={template.styleName}
                                    className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-500"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-zinc-300">
                                    <ImageIcon className="h-12 w-12" />
                                </div>
                            )}
                            <div className="absolute top-4 right-4 flex gap-2">
                                <Badge className="bg-white/90 backdrop-blur-md text-black border-none font-black text-[9px] uppercase px-2 shadow-sm">
                                    {template.niche}
                                </Badge>
                                <Badge variant={template.isActive ? "default" : "secondary"} className="rounded-lg text-[9px] uppercase font-black px-1.5 py-0.5">
                                    {template.isActive ? "Actif" : "Inactif"}
                                </Badge>
                            </div>
                        </div>

                        <CardHeader className="p-5 pb-2">
                            <div className="flex items-start justify-between gap-2">
                                <div>
                                    <CardTitle className="text-lg font-black tracking-tight">{template.styleName}</CardTitle>
                                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest mt-0.5">Style Inspiration</p>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className="p-5 pt-0">
                            <div className="space-y-4">
                                <p className="text-[11px] text-zinc-500 line-clamp-2 min-h-[32px] font-medium leading-relaxed italic">
                                    "{template.prompt}"
                                </p>

                                <div className="flex items-center justify-between pt-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-xl font-bold text-xs gap-2 px-3 hover:bg-zinc-100"
                                        onClick={() => router.push(`/admin/thumbnails/${template.id}`)}
                                    >
                                        <Edit3 className="h-3.5 w-3.5" /> Éditer
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50" onClick={() => setTemplateToDelete(template)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <ConfirmDialog
                open={!!templateToDelete}
                onOpenChange={(open) => !open && setTemplateToDelete(null)}
                title="Supprimer le style"
                description={`Êtes-vous sûr de vouloir supprimer le style "${templateToDelete?.styleName}" ? Cette action est irréversible.`}
                onConfirm={async () => {
                    if (templateToDelete) {
                        await deleteThumbnail(templateToDelete.id);
                        setTemplateToDelete(null);
                    }
                }}
                isLoading={isPending}
            />
        </div >
    );
}
