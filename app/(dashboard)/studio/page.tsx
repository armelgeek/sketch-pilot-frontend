"use client";

import { useState, useEffect } from "react";
import { Search, Sparkles, Check, Loader2, Globe, Wand2, Plus } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { useSession, updateUser } from "@/src/lib/auth-client";

const adminService = new AdminService();

// ─── Types ────────────────────────────────────────────────────────────────────

interface CharacterModel {
    id: string;
    name: string;
    images?: string[];
    thumbnailUrl?: string;
    isStandard?: boolean;
}

interface Prompt {
    id: string;
    name: string;
    description?: string;
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StudioPage() {
    const { data: session } = useSession();
    const [mainTab, setMainTab] = useState<"characters" | "niches">("characters");
    const [charTab, setCharTab] = useState<"explorer" | "collection" | "create">("explorer");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [standardModels, setStandardModels] = useState<CharacterModel[]>([]);
    const [personalModels, setPersonalModels] = useState<CharacterModel[]>([]);

    const [generating, setGenerating] = useState(false);
    const [newName, setNewName] = useState("");
    const [newPrompt, setNewPrompt] = useState("");
    const [baseHostId, setBaseHostId] = useState<string | null>(null);

    const selectedCharacterId = session?.user?.defaultCharacterId;
    const selectedPromptId = session?.user?.defaultPromptId;

    useEffect(() => {
        Promise.all([
            adminService.listPublicPrompts({ limit: 100 }),
            adminService.listStandardModels(),
            adminService.listModels(),
        ]).then(([pData, charData, myData]) => {
            setPrompts(pData.data || []);
            setStandardModels(charData.data || []);
            setPersonalModels(myData.data || []);
        }).catch(console.error).finally(() => setLoading(false));
    }, []);

    const updatePreference = async (updates: { defaultPromptId?: string; defaultCharacterId?: string }) => {
        try { await updateUser(updates); } catch (err) { console.error(err); }
    };

    const handleGenerate = async () => {
        if (!newName || !newPrompt) return;
        setGenerating(true);
        try {
            const result = await adminService.createModel({
                name: newName, description: newPrompt, gender: "unknown", isStandard: false,
                baseModelId: baseHostId ?? undefined,
            });
            setPersonalModels(prev => [result, ...prev]);
            await updatePreference({ defaultCharacterId: result.id });
            setCharTab("collection");
            setNewName(""); setNewPrompt(""); setBaseHostId(null);
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    const filtered = (list: CharacterModel[]) =>
        list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-6 w-6 animate-spin text-stone-300" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto space-y-10 py-6">

            {/* Header */}
            <div className="flex items-end justify-between">
                <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-stone-400">Configuration Active</p>
                    <h1 className="text-4xl font-black tracking-tight text-stone-800">Mon Studio</h1>
                </div>
                <Tabs value={mainTab} onValueChange={v => setMainTab(v as typeof mainTab)} className="bg-stone-100 p-1 rounded-2xl border border-stone-200/50">
                    <TabsList className="bg-transparent gap-1">
                        <TabsTrigger value="characters" className="rounded-xl px-6 py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Wand2 className="h-3.5 w-3.5 mr-2" /> Hôtes
                        </TabsTrigger>
                        <TabsTrigger value="niches" className="rounded-xl px-6 py-2 text-xs font-bold data-[state=active]:bg-white data-[state=active]:shadow-sm">
                            <Globe className="h-3.5 w-3.5 mr-2" /> Niches
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </div>

            {/* Card */}
            <div className="bg-white rounded-[2.5rem] border border-stone-200 shadow-sm min-h-[60vh] overflow-hidden flex flex-col">
                <Tabs value={mainTab} className="flex-1 flex flex-col">

                    {/* ── Hôtes ─────────────────────────────────────────────── */}
                    <TabsContent value="characters" className="m-0 flex-1 flex flex-col">

                        {/* Sub-nav */}
                        <div className="px-8 py-5 border-b border-stone-100 bg-stone-50/50 flex items-center justify-between">
                            <Tabs value={charTab} onValueChange={v => setCharTab(v as typeof charTab)}>
                                <TabsList className="bg-white border border-stone-200 rounded-full h-10 p-1 gap-0.5">
                                    <TabsTrigger value="explorer" className="rounded-full px-5 text-[11px] font-bold data-[state=active]:bg-stone-800 data-[state=active]:text-white">
                                        Explorer
                                    </TabsTrigger>
                                    <TabsTrigger value="collection" className="rounded-full px-5 text-[11px] font-bold data-[state=active]:bg-stone-800 data-[state=active]:text-white">
                                        Ma Collection
                                    </TabsTrigger>
                                    <TabsTrigger value="create" className="rounded-full px-5 text-[11px] font-bold data-[state=active]:bg-stone-800 data-[state=active]:text-white flex gap-1.5 items-center">
                                        <Sparkles className="h-3 w-3 fill-current" /> Studio IA
                                    </TabsTrigger>
                                </TabsList>
                            </Tabs>

                            {charTab !== "create" && (
                                <div className="relative w-64">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
                                    <Input
                                        placeholder="Rechercher..."
                                        value={search}
                                        onChange={e => setSearch(e.target.value)}
                                        className="h-10 pl-10 border-stone-200 bg-white rounded-full text-xs font-medium"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Body */}
                        <div className="p-8 flex-1">
                            <Tabs value={charTab}>

                                <TabsContent value="explorer" className="m-0">
                                    <CharacterGrid
                                        characters={filtered(standardModels)}
                                        selectedId={selectedCharacterId}
                                        onSelect={id => updatePreference({ defaultCharacterId: id })}
                                    />
                                </TabsContent>

                                <TabsContent value="collection" className="m-0">
                                    <CharacterGrid
                                        characters={filtered(personalModels)}
                                        selectedId={selectedCharacterId}
                                        onSelect={id => updatePreference({ defaultCharacterId: id })}
                                        onEmpty={() => setCharTab("create")}
                                    />
                                </TabsContent>

                                <TabsContent value="create" className="m-0">
                                    <CreateForm
                                        standardModels={standardModels}
                                        baseHostId={baseHostId}
                                        onBaseHostToggle={id => setBaseHostId(prev => prev === id ? null : id)}
                                        name={newName}
                                        onNameChange={setNewName}
                                        prompt={newPrompt}
                                        onPromptChange={setNewPrompt}
                                        onSubmit={handleGenerate}
                                        loading={generating}
                                    />
                                </TabsContent>

                            </Tabs>
                        </div>
                    </TabsContent>

                    {/* ── Niches ────────────────────────────────────────────── */}
                    <TabsContent value="niches" className="m-0 flex-1 p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {prompts.map(p => (
                                <NicheCard
                                    key={p.id}
                                    prompt={p}
                                    isSelected={selectedPromptId === p.id}
                                    onSelect={() => updatePreference({ defaultPromptId: p.id })}
                                />
                            ))}
                        </div>
                    </TabsContent>

                </Tabs>
            </div>
        </div>
    );
}

// ─── Character Grid ────────────────────────────────────────────────────────────

function CharacterGrid({ characters, selectedId, onSelect, onEmpty }: {
    characters: CharacterModel[];
    selectedId?: string;
    onSelect: (id: string) => void;
    onEmpty?: () => void;
}) {
    if (!characters.length && onEmpty) return (
        <button onClick={onEmpty} className="aspect-[3/4] w-40 rounded-3xl border-2 border-dashed border-stone-100 flex flex-col items-center justify-center gap-4 text-stone-300 hover:bg-stone-50 hover:border-stone-200 transition-all group">
            <div className="h-12 w-12 rounded-full bg-stone-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Plus className="h-6 w-6" />
            </div>
            <span className="text-xs font-bold uppercase tracking-[0.2em]">Créer</span>
        </button>
    );

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
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
        <div
            onClick={onSelect}
            className={cn(
                "group relative aspect-[3/4] rounded-3xl overflow-hidden cursor-pointer transition-all duration-500",
                isSelected ? "ring-4 ring-stone-800 shadow-2xl scale-[1.02]" : "hover:shadow-xl hover:-translate-y-1"
            )}>
            <img src={thumb} alt={character.name} className="absolute inset-0 h-full w-full object-cover group-hover:scale-110 transition-transform duration-700" />
            <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-stone-950/20 opacity-40 group-hover:opacity-70 transition-opacity" />
            <div className="absolute inset-x-0 bottom-0 p-5">
                <p className="text-xs font-black text-white uppercase tracking-wider">{character.name}</p>
                <p className="text-[9px] font-bold text-stone-400 uppercase tracking-tighter mt-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                    {character.isStandard ? "Modèle Standard" : "Modèle IA"}
                </p>
            </div>
            {isSelected && (
                <div className="absolute top-4 right-4 h-8 w-8 rounded-full bg-stone-800 text-white flex items-center justify-center shadow-xl border-2 border-white">
                    <Check className="h-4 w-4" />
                </div>
            )}
        </div>
    );
}

// ─── Create Form ───────────────────────────────────────────────────────────────

function CreateForm({ standardModels, baseHostId, onBaseHostToggle, name, onNameChange, prompt, onPromptChange, onSubmit, loading }: {
    standardModels: CharacterModel[];
    baseHostId: string | null;
    onBaseHostToggle: (id: string) => void;
    name: string;
    onNameChange: (v: string) => void;
    prompt: string;
    onPromptChange: (v: string) => void;
    onSubmit: () => void;
    loading: boolean;
}) {
    return (
        <div className="max-w-xl mx-auto py-8 space-y-8">

            {/* Hôte de base */}
            <div className="space-y-3">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                    Hôte de base <span className="normal-case font-medium tracking-normal text-stone-300">(optionnel)</span>
                </p>
                <div className="flex flex-wrap gap-2">
                    {standardModels.map(host => {
                        const thumb = host.images?.[0] ?? host.thumbnailUrl;
                        const active = baseHostId === host.id;
                        return (
                            <button
                                key={host.id}
                                onClick={() => onBaseHostToggle(host.id)}
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
            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Nom</p>
                <Input
                    placeholder="Ex: Adam l'Investisseur"
                    value={name}
                    onChange={e => onNameChange(e.target.value)}
                    className="h-14 rounded-2xl border-stone-200 bg-stone-50 font-bold text-lg"
                />
            </div>

            {/* Style */}
            <div className="space-y-2">
                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">Style visuel & instructions</p>
                <textarea
                    placeholder="Ex: Un homme d'affaires élégant, traits fins, style whiteboard minimaliste..."
                    value={prompt}
                    onChange={e => onPromptChange(e.target.value)}
                    rows={5}
                    className="w-full rounded-2xl border border-stone-200 bg-stone-50 p-6 text-base font-medium focus:ring-0 focus:outline-none resize-none"
                />
            </div>

            <Button
                onClick={onSubmit}
                disabled={loading || !name || !prompt}
                className="w-full h-16 bg-stone-800 hover:bg-stone-900 text-white rounded-[2rem] font-black text-lg shadow-2xl shadow-stone-200 gap-3 active:scale-[0.98] transition-all">
                {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Sparkles className="h-6 w-6 fill-current" />}
                Générer le modèle
            </Button>
        </div>
    );
}

// ─── Niche Card ────────────────────────────────────────────────────────────────

function NicheCard({ prompt, isSelected, onSelect }: {
    prompt: Prompt;
    isSelected: boolean;
    onSelect: () => void;
}) {
    return (
        <div
            onClick={onSelect}
            className={cn(
                "relative rounded-[2rem] border p-6 cursor-pointer transition-all group space-y-4",
                isSelected ? "border-stone-800 shadow-xl bg-stone-800 text-white" : "border-stone-100 bg-stone-50/30 hover:bg-white hover:shadow-lg hover:border-stone-200"
            )}>
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center", isSelected ? "bg-white/10" : "bg-stone-100 text-stone-400 group-hover:text-stone-800")}>
                <Globe className="h-5 w-5" />
            </div>
            <div>
                <h3 className="font-black text-lg tracking-tight uppercase">{prompt.name}</h3>
                <p className={cn("text-xs line-clamp-2 leading-relaxed font-medium mt-1", isSelected ? "text-stone-400" : "text-stone-400")}>
                    {prompt.description || "Optimisé pour des vidéos virales à fort engagement."}
                </p>
            </div>
            {isSelected && (
                <div className="absolute top-6 right-6 h-6 w-6 rounded-full bg-white text-stone-800 flex items-center justify-center shadow-lg">
                    <Check className="h-3 w-3" />
                </div>
            )}
        </div>
    );
}