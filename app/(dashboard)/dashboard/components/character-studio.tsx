"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Search, Check, Plus } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────

interface CharacterModel {
    id: string;
    name: string;
    images?: string[];
    thumbnailUrl?: string;
}

interface CharacterStudioProps {
    selectedId?: string;
    characterModels: CharacterModel[];
    personalModels: CharacterModel[];
    onSelect: (id: string) => void | Promise<void>;
    onCreated?: (newChar: any) => void;
    children: React.ReactNode;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function CharacterStudio({ selectedId, characterModels, personalModels, onSelect, children }: CharacterStudioProps) {
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const initialTab = (personalModels.length > 0) ? "collection" : "explorer";
    const [tab, setTab] = useState<"explorer" | "collection">(initialTab);
    const [search, setSearch] = useState("");

    const handleSelect = (id: string) => { onSelect(id); setOpen(false); };
    const filter = (list: CharacterModel[]) =>
        list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-xl p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl bg-white flex flex-col h-[65vh]">

                {/* Header */}
                <div className="px-7 pt-7 pb-4 shrink-0 space-y-5 border-b border-stone-50">
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-black tracking-tight text-stone-800">
                            Choisir un Personnage
                        </DialogTitle>
                        <div className="relative w-40">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-300" />
                            <Input
                                placeholder="Filtrer..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                className="h-8 pl-9 border-stone-100 bg-stone-50 rounded-full text-[10px] font-bold"
                            />
                        </div>
                    </div>

                    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
                        <TabsList className="bg-stone-50 border border-stone-100 rounded-lg h-9 p-1 gap-1">
                            <TabsTrigger value="explorer" className="rounded-md px-4 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Explorer</TabsTrigger>
                            <TabsTrigger value="collection" className="rounded-md px-4 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm">Ma Collection</TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-7 py-6">
                    <Tabs value={tab}>
                        <TabsContent value="explorer" className="m-0">
                            <CharacterGrid characters={filter(characterModels)} selectedId={selectedId} onSelect={handleSelect} />
                        </TabsContent>
                        <TabsContent value="collection" className="m-0">
                            <CharacterGrid
                                characters={filter(personalModels)}
                                selectedId={selectedId}
                                onSelect={handleSelect}
                                showCreate
                                onCreate={() => { setOpen(false); router.push("/studio/character-pro"); }}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Footer */}
                <div className="px-7 py-4 flex justify-between items-center shrink-0 bg-stone-50/50">
                    <p className="text-[10px] font-medium text-stone-400">
                        {tab === "explorer" ? "Catalogue public" : "Vos personnages personnalisés"}
                    </p>
                    <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-full text-[10px] font-black uppercase tracking-widest text-stone-400 hover:text-stone-600 h-8 px-4">
                        Fermer
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Character Grid ────────────────────────────────────────────────────────────

function CharacterGrid({ characters, selectedId, onSelect, emptyLabel, showCreate, onCreate }: {
    characters: CharacterModel[];
    selectedId?: string;
    onSelect: (id: string) => void;
    emptyLabel?: string;
    showCreate?: boolean;
    onCreate?: () => void;
}) {
    if (!characters.length && !showCreate)
        return <p className="text-center text-xs text-stone-300 font-medium py-16">{emptyLabel || "Aucun résultat"}</p>;

    return (
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-4">
            {characters.map(c => (
                <CharacterCard key={c.id} character={c} isSelected={selectedId === c.id} onSelect={() => onSelect(c.id)} />
            ))}
            {showCreate && (
                <button
                    onClick={onCreate}
                    className="group relative aspect-[4/5] rounded-2xl border-2 border-dashed border-stone-100 flex flex-col items-center justify-center gap-2 transition-all hover:bg-stone-50 hover:border-stone-200"
                >
                    <div className="h-8 w-8 rounded-full bg-stone-100 flex items-center justify-center text-stone-400 group-hover:scale-110 transition-transform">
                        <Plus className="h-4 w-4" />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-stone-300 group-hover:text-stone-500">Nouveau</span>
                </button>
            )}
        </div>
    );
}

// ─── Character Card ────────────────────────────────────────────────────────────

function CharacterCard({ character, isSelected, onSelect }: {
    character: CharacterModel;
    isSelected: boolean;
    onSelect: () => void;
}) {
    const thumb = character.images?.[0] ?? character.thumbnailUrl;
    return (
        <button
            onClick={onSelect}
            className={cn(
                "group relative aspect-[4/5] rounded-2xl overflow-hidden transition-all duration-300 border-2",
                isSelected ? "border-stone-800 shadow-xl" : "border-transparent hover:shadow-md hover:-translate-y-0.5"
            )}>
            <img src={thumb} alt={character.name} className="absolute inset-0 h-full w-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent opacity-60" />
            <p className="absolute bottom-2 inset-x-1 text-[9px] font-black text-white uppercase tracking-wider text-center leading-tight">
                {character.name}
            </p>
            {isSelected && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-stone-800 text-white flex items-center justify-center border border-white/20">
                    <Check className="h-2.5 w-2.5" />
                </div>
            )}
        </button>
    );
}