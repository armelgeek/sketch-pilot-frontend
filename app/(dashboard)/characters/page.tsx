"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Check, Loader2, Plus, Search, Trash2, Sparkles, Ghost } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { useSession, updateUser } from "@/src/lib/auth-client";
import { useHeaderStore } from "@/src/components/layout/header-store";

const adminService = new AdminService();

// ─── Types ────────────────────────────────────────────────────────────────────

interface CharacterModel {
    id: string;
    name: string;
    images?: string[];
    thumbnailUrl?: string;
    isStandard?: string | boolean;
    description?: string;
    baseModelId?: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CharactersPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [personalModels, setPersonalModels] = useState<CharacterModel[]>([]);
    const [standardModels, setStandardModels] = useState<CharacterModel[]>([]);
    const [tab, setTab] = useState<"mine" | "standard">("mine");

    const selectedCharacterId = session?.user?.defaultCharacterId;

    useEffect(() => {
        Promise.all([adminService.listModels(), adminService.listStandardModels()])
            .then(([myRes, standardRes]) => {
                setPersonalModels(myRes.data || []);
                setStandardModels(standardRes.data || []);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleSelect = (id: string) =>
        updateUser({ defaultCharacterId: id }).catch(console.error);

    const handleRemove = async (id: string, name: string) => {
        if (!window.confirm(`Supprimer "${name}" ?`)) return;
        await adminService.deleteModel(id).catch(console.error);
        setPersonalModels(prev => prev.filter(p => p.id !== id));
    };

    const handleEdit = (c: CharacterModel) => {
        const params = new URLSearchParams({
            edit: c.id,
            name: c.name,
            prompt: c.description || "",
            baseId: c.baseModelId || "",
            image: c.images?.[0] || c.thumbnailUrl || "",
        });
        router.push(`/studio/character-pro?${params}`);
    };

    const toStudio = () => router.push("/studio/character-pro");

    const filtered = (list: CharacterModel[]) =>
        list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

    const isMine = tab === "mine";
    const models = filtered(isMine ? personalModels : standardModels);

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1600px] mx-auto p-6 space-y-6">

                {/* Header */}
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-stone-900">Mes Personnages</h1>
                    <p className="text-sm text-stone-500 mt-1">Créez, gérez et entraînez des personnages IA pour vos vidéos.</p>
                </div>

                {/* Controls */}
                <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                    {/* Tabs */}
                    <div className="flex p-1 bg-stone-50 border border-stone-100 rounded-2xl w-full sm:w-auto">
                        {(["mine", "standard"] as const).map(t => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={cn(
                                    "flex-1 sm:flex-none h-10 px-6 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                                    tab === t
                                        ? "bg-white text-stone-900 shadow-sm"
                                        : "text-stone-400 hover:text-stone-600"
                                )}
                            >
                                {t === "mine" ? "Mes Créations" : "Standards"}
                            </button>
                        ))}
                    </div>

                    {/* Search */}
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
                        <input
                            placeholder="Rechercher..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            className="w-full h-10 pl-10 pr-4 rounded-xl border border-stone-100 bg-stone-50/50 text-xs font-medium focus:outline-none focus:border-stone-300 focus:bg-white transition-all"
                        />
                    </div>
                </div>

                {/* Grid */}
                <div className="min-h-[60vh]">
                    {loading ? (
                        <div className="flex items-center justify-center h-[40vh]">
                            <Loader2 className="h-5 w-5 animate-spin text-stone-200" />
                        </div>
                    ) : models.length === 0 && !isMine ? (
                        <Empty label="Aucun modèle standard" />
                    ) : (
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-5">
                            {models.map(c => (
                                <CharacterCard
                                    key={c.id}
                                    character={c}
                                    isSelected={selectedCharacterId === c.id}
                                    onSelect={() => handleSelect(c.id)}
                                    onRemove={isMine ? () => handleRemove(c.id, c.name) : undefined}
                                    onEdit={isMine ? () => handleEdit(c) : undefined}
                                />
                            ))}
                            {isMine && (
                                <button
                                    onClick={toStudio}
                                    className="group aspect-[3/4.5] rounded-2xl border-2 border-dashed border-stone-100 flex flex-col items-center justify-center gap-2 transition-all hover:border-stone-200 hover:bg-stone-50"
                                >
                                    <div className="h-10 w-10 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 group-hover:scale-110 transition-transform">
                                        <Plus className="h-5 w-5" />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-widest text-stone-300 group-hover:text-stone-400">
                                        Nouveau
                                    </span>
                                </button>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

// ─── CharacterCard ─────────────────────────────────────────────────────────────

function CharacterCard({ character, isSelected, onSelect, onRemove, onEdit }: {
    character: CharacterModel;
    isSelected: boolean;
    onSelect: () => void;
    onRemove?: () => void;
    onEdit?: () => void;
}) {
    const thumb = character.images?.[0] ?? character.thumbnailUrl;

    return (
        <div className={cn(
            "group relative aspect-[3/4.5] rounded-2xl overflow-hidden cursor-pointer transition-all duration-300",
            isSelected
                ? "ring-2 ring-stone-800 shadow-xl scale-[1.02]"
                : "hover:shadow-md hover:ring-1 hover:ring-stone-200"
        )}>
            {/* Image */}
            <img
                onClick={onSelect}
                src={thumb}
                alt={character.name}
                className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500"
            />

            {/* Gradient */}
            <div
                onClick={onSelect}
                className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-transparent to-transparent opacity-60 group-hover:opacity-80 transition-opacity"
            />

            {/* Top actions */}
            {(onEdit || onRemove) && (
                <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {onEdit && (
                        <ActionBtn onClick={onEdit} title="Modifier">
                            <Sparkles className="h-3.5 w-3.5" />
                        </ActionBtn>
                    )}
                    {onRemove && (
                        <ActionBtn onClick={onRemove} title="Supprimer" danger>
                            <Trash2 className="h-3.5 w-3.5" />
                        </ActionBtn>
                    )}
                </div>
            )}

            {/* Bottom info */}
            <div onClick={onSelect} className="absolute inset-x-0 bottom-0 p-3.5 flex items-end justify-between">
                <p className="text-[11px] font-bold text-white tracking-wide truncate flex-1 pr-2">
                    {character.name}
                </p>
                {isSelected && (
                    <div className="h-4 w-4 rounded-full bg-white flex items-center justify-center shrink-0">
                        <Check className="h-2.5 w-2.5 text-stone-800" />
                    </div>
                )}
            </div>
        </div>
    );
}

// ─── ActionBtn ─────────────────────────────────────────────────────────────────

function ActionBtn({ onClick, title, danger, children }: {
    onClick: () => void;
    title: string;
    danger?: boolean;
    children: React.ReactNode;
}) {
    return (
        <button
            onClick={e => { e.stopPropagation(); onClick(); }}
            title={title}
            className={cn(
                "h-7 w-7 rounded-lg bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md transition-colors",
                danger
                    ? "text-red-500 hover:bg-red-500 hover:text-white"
                    : "text-stone-700 hover:bg-stone-900 hover:text-white"
            )}
        >
            {children}
        </button>
    );
}

// ─── Empty ─────────────────────────────────────────────────────────────────────

function Empty({ label }: { label: string }) {
    return (
        <div className="flex flex-col items-center justify-center py-20 border-2 border-dashed border-stone-100 rounded-3xl">
            <Ghost className="h-8 w-8 text-stone-200 mb-4" />
            <p className="text-xs font-bold text-stone-300 uppercase tracking-widest">{label}</p>
        </div>
    );
}