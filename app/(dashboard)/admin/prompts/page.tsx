"use client";

import { useState } from "react";
import {
    Plus,
    Trash2,
    Edit3,
    FileText,
    Copy,
    Settings,
    Grid3X3,
    Terminal,
    ArrowRight
} from "lucide-react";
import Link from "next/link";
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
import { useAdminPrompts } from "@/src/app/admin/hooks/use-admin-data";
import { useAdminActions } from "@/src/app/admin/hooks/use-admin-actions";

export default function AdminPromptsPage() {
    const router = useRouter();
    const [search, setSearch] = useState("");
    const { data: promptsRes, isLoading } = useAdminPrompts({ search });
    const prompts = promptsRes?.data || [];
    const { deletePrompt, isPending } = useAdminActions();

    // Deletion state
    const [promptToDelete, setPromptToDelete] = useState<any>(null);

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-black tracking-tighter">Prompts Système</h1>
                    <p className="text-zinc-500 dark:text-zinc-400 mt-1 font-medium">Gérez les instructions IA pour chaque type de génération.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Input
                            placeholder="Rechercher un prompt..."
                            className="h-11 w-64 rounded-2xl bg-white dark:bg-zinc-900 border-none shadow-lg shadow-zinc-200/50 dark:shadow-none font-bold pl-10 transition-all focus-visible:ring-black"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <FileText className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400 group-focus-within:text-black transition-colors" />
                    </div>

                    <Button
                        className="bg-black hover:bg-zinc-800 text-white rounded-2xl font-black gap-2 h-11 px-6 shadow-xl"
                        onClick={() => router.push("/admin/prompts/new")}
                    >
                        <Plus className="h-5 w-5" />
                        Nouveau
                    </Button>
                </div>
            </div>

            <div className={cn(
                "grid grid-cols-1 gap-6",
                !isLoading && prompts?.length > 0 ? "lg:grid-cols-2" : "lg:grid-cols-1"
            )}>
                {isLoading ? (
                    Array(4).fill(0).map((_, i) => <Skeleton key={i} className="h-48 rounded-[32px]" />)
                ) : prompts?.length === 0 ? (
                    <div className="col-span-full py-20 flex flex-col items-center justify-center bg-white dark:bg-zinc-900 rounded-[40px] shadow-xl shadow-zinc-200/50 dark:shadow-none border-2 border-dashed border-zinc-100 dark:border-zinc-800">
                        <div className="h-20 w-20 bg-zinc-50 dark:bg-zinc-800/50 rounded-[32px] flex items-center justify-center mb-6">
                            <FileText className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight mb-2">Aucun prompt trouvé</h3>
                        <p className="text-zinc-500 font-medium max-w-xs text-center text-sm">
                            {search
                                ? `Aucun résultat pour "${search}". Essayez une autre recherche.`
                                : "Commencez par créer votre premier prompt système pour l'IA."}
                        </p>
                        {!search && (
                            <Button
                                className="mt-8 bg-black hover:bg-zinc-800 text-white rounded-2xl font-black gap-2 h-11 px-8 shadow-xl"
                                onClick={() => router.push("/admin/prompts/new")}
                            >
                                <Plus className="h-5 w-5" />
                                Créer un Prompt
                            </Button>
                        )}
                    </div>
                ) : prompts?.map((prompt: any) => (
                    <Card key={prompt.id} className="border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 rounded-[32px] overflow-hidden group hover:ring-2 ring-black transition-all">
                        <CardHeader className="p-6 pb-2">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 group-hover:scale-110 transition-transform">
                                        <FileText className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-black tracking-tight">{prompt.name}</CardTitle>
                                        <CardDescription className="font-bold text-[10px] uppercase tracking-widest text-zinc-400">{prompt.role}</CardDescription>
                                    </div>
                                </div>
                                <div className="flex flex-col items-end gap-2">
                                    <Badge variant={prompt.isActive ? "default" : "secondary"} className="rounded-lg text-[9px] uppercase font-black px-1.5 py-0.5">
                                        {prompt.isActive ? "Actif" : "Brouillon"}
                                    </Badge>
                                    {prompt.category && (
                                        <Badge variant="outline" className="border-zinc-200 dark:border-zinc-800 text-[9px] uppercase font-black px-1.5 py-0.5 w-fit">
                                            {prompt.category}
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-6 pt-0">
                            <div className="space-y-4">
                                <p className="text-sm text-zinc-500 line-clamp-2 min-h-[40px] font-medium leading-relaxed">
                                    {prompt.description || "Aucune description fournie."}
                                </p>

                                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-4 rounded-2xl border border-zinc-100 dark:border-zinc-800 relative group/code overflow-hidden cursor-pointer" onClick={() => router.push(`/admin/prompts/${prompt.id}`)}>
                                    <pre className="text-[11px] font-medium text-zinc-500 line-clamp-4 font-mono leading-relaxed">
                                        {prompt.context}
                                    </pre>
                                    <div className="absolute inset-0 bg-gradient-to-t from-zinc-50/80 dark:from-zinc-800/80 to-transparent pointer-events-none" />
                                    <div className="absolute right-4 bottom-4 opacity-0 group-hover/code:opacity-100 transition-opacity">
                                        <ArrowRight className="h-4 w-4 text-black" />
                                    </div>
                                </div>

                                {prompt.tags && prompt.tags.length > 0 && (
                                    <div className="flex flex-wrap gap-1.5">
                                        {prompt.tags.map((tag: string) => (
                                            <span key={tag} className="text-[9px] font-bold bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded-full text-zinc-500 uppercase tracking-tighter">
                                                #{tag}
                                            </span>
                                        ))}
                                    </div>
                                )}

                                <div className="flex items-center justify-between pt-2">
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="rounded-xl font-bold text-xs gap-2 px-3"
                                        onClick={() => router.push(`/admin/prompts/${prompt.id}`)}
                                    >
                                        <Edit3 className="h-3.5 w-3.5" /> Éditer
                                    </Button>
                                    <div className="flex items-center gap-1">
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800" onClick={() => copyToClipboard(JSON.stringify(prompt, null, 2))}>
                                            <Copy className="h-3.5 w-3.5" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full text-zinc-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20" onClick={() => setPromptToDelete(prompt)}>
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
                open={!!promptToDelete}
                onOpenChange={(open) => !open && setPromptToDelete(null)}
                title="Supprimer le prompt"
                description={`Êtes-vous sûr de vouloir supprimer le prompt "${promptToDelete?.name}" ? Cette action est irréversible.`}
                onConfirm={async () => {
                    if (promptToDelete) {
                        await deletePrompt(promptToDelete.id);
                        setPromptToDelete(null);
                    }
                }}
                isLoading={isPending}
            />
        </div >
    );
}
