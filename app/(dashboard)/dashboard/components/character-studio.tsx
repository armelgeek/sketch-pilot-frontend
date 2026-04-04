"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from "@/src/components/ui/dialog";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { Search, Sparkles, Check, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { AdminService } from "@/src/app/admin/api/admin-service";

const adminService = new AdminService();

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
    onSelect: (id: string) => void;
    onCreated: (char: CharacterModel) => void;
    children: React.ReactNode;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export function CharacterStudio({ selectedId, characterModels, personalModels, onSelect, onCreated, children }: CharacterStudioProps) {
    const [open, setOpen] = useState(false);
    const [tab, setTab] = useState<"explorer" | "collection" | "studio">("explorer");
    const [search, setSearch] = useState("");

    const handleSelect = (id: string) => { onSelect(id); setOpen(false); };
    const filter = (list: CharacterModel[]) =>
        list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="max-w-2xl p-0 overflow-hidden rounded-[2rem] border-none shadow-2xl bg-white flex flex-col h-[75vh]">

                {/* Header */}
                <div className="px-7 pt-7 pb-0 shrink-0 space-y-5">
                    <DialogTitle className="text-xl font-black tracking-tight text-stone-800">
                        Character Studio
                    </DialogTitle>

                    <div className="flex items-center justify-between border-b border-stone-100 pb-3">
                        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
                            <TabsList className="bg-stone-50 border border-stone-100 rounded-full h-9 p-1 gap-0.5">
                                <TabsTrigger value="explorer" className="rounded-full px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Explorer</TabsTrigger>
                                <TabsTrigger value="collection" className="rounded-full px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">Collection</TabsTrigger>
                                <TabsTrigger value="studio" className="rounded-full px-4 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm flex gap-1.5 items-center">
                                    <Sparkles className="h-3 w-3 text-amber-500 fill-amber-500" /> Studio IA
                                </TabsTrigger>
                            </TabsList>
                        </Tabs>

                        {tab !== "studio" && (
                            <div className="relative w-44">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-stone-300" />
                                <Input
                                    placeholder="Rechercher..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="h-8 pl-9 border-stone-100 bg-stone-50 rounded-full text-xs"
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Body */}
                <div className="flex-1 overflow-y-auto px-7 py-4">
                    <Tabs value={tab}>
                        <TabsContent value="explorer" className="m-0">
                            <CharacterGrid characters={filter(characterModels)} selectedId={selectedId} onSelect={handleSelect} />
                        </TabsContent>
                        <TabsContent value="collection" className="m-0">
                            <CharacterGrid
                                characters={filter(personalModels)}
                                selectedId={selectedId}
                                onSelect={handleSelect}
                                emptyLabel="Aucun personnage — créez-en un dans Studio IA"
                            />
                        </TabsContent>
                        <TabsContent value="studio" className="m-0">
                            <StudioForm
                                characterModels={characterModels}
                                onCreated={char => { onCreated(char); setTab("collection"); }}
                            />
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Footer */}
                <div className="px-7 py-4 border-t border-stone-50 flex justify-end shrink-0">
                    <Button variant="ghost" onClick={() => setOpen(false)} className="rounded-full text-xs font-bold text-stone-400 h-8 px-4">
                        Fermer
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}

// ─── Character Grid ────────────────────────────────────────────────────────────

function CharacterGrid({ characters, selectedId, onSelect, emptyLabel }: {
    characters: CharacterModel[];
    selectedId?: string;
    onSelect: (id: string) => void;
    emptyLabel?: string;
}) {
    if (!characters.length && emptyLabel)
        return <p className="text-center text-xs text-stone-300 font-medium py-16">{emptyLabel}</p>;

    return (
        <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
            {characters.map(c => (
                <CharacterCard key={c.id} character={c} isSelected={selectedId === c.id} onSelect={() => onSelect(c.id)} />
            ))}
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
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/70 via-transparent to-transparent" />
            <p className="absolute bottom-2 inset-x-1 text-[10px] font-black text-white uppercase tracking-wide text-center leading-tight">
                {character.name}
            </p>
            {isSelected && (
                <div className="absolute top-2 right-2 h-5 w-5 rounded-full bg-stone-800 text-white flex items-center justify-center">
                    <Check className="h-2.5 w-2.5" />
                </div>
            )}
        </button>
    );
}

// ─── Studio Form ───────────────────────────────────────────────────────────────

function StudioForm({ characterModels, onCreated }: {
    characterModels: CharacterModel[];
    onCreated: (char: CharacterModel) => void;
}) {
    const [name, setName] = useState("");
    const [prompt, setPrompt] = useState("");
    const [baseHostId, setBaseHostId] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const canSubmit = name.trim() && prompt.trim() && !loading;

    const handleSubmit = async () => {
        if (!canSubmit) return;
        setLoading(true);
        try {
            const result = await adminService.createModel({
                name, description: prompt, gender: "unknown", isStandard: false,
                baseModelId: baseHostId ?? undefined,
            });
            onCreated(result);
            setName(""); setPrompt(""); setBaseHostId(null);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6 max-w-md mx-auto py-4">

            {/* Hôte de base */}
            <div className="space-y-2">

                <div className="flex flex-wrap gap-2">
                    {characterModels.map(host => {
                        const thumb = host.images?.[0] ?? host.thumbnailUrl;
                        const active = baseHostId === host.id;
                        return (
                            <button
                                key={host.id}
                                onClick={() => setBaseHostId(active ? null : host.id)}
                                className={cn(
                                    "flex items-center gap-2 px-3 py-1.5 rounded-full border-2 text-xs font-bold transition-all",
                                    active ? "border-stone-800 bg-stone-50 text-stone-700" : "border-stone-100 text-stone-400 hover:border-stone-200"
                                )}>
                                <img src={thumb} alt={host.name} className="h-5 w-5 rounded-full object-cover" />
                                {host.name}
                                {active && <Check className="h-3 w-3 shrink-0" />}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Nom */}
            <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Nom</p>
                <Input
                    placeholder="Ex: Adam l'Investisseur"
                    value={name}
                    onChange={e => setName(e.target.value)}
                    className="h-11 rounded-2xl border-stone-100 bg-stone-50 font-bold"
                />
            </div>

            {/* Style */}
            <div className="space-y-1.5">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Style & personnalité</p>
                <textarea
                    placeholder="Ex: Homme d'affaires en costume, style Whiteboard épuré..."
                    value={prompt}
                    onChange={e => setPrompt(e.target.value)}
                    rows={3}
                    className="w-full rounded-2xl border border-stone-100 bg-stone-50 p-4 text-sm font-medium focus:ring-2 focus:ring-stone-100 focus:outline-none resize-none"
                />
            </div>

            <Button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="w-full h-12 bg-stone-800 hover:bg-stone-900 text-white rounded-3xl font-black gap-2">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4 fill-current" />}
                Générer le personnage
            </Button>
        </div>
    );
}