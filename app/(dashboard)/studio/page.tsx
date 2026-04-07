"use client";

import { useState, useEffect, Fragment } from "react";
import { useRouter } from "next/navigation";
import { Search, Sparkles, Check, Loader2, Globe, Wand2, Plus, ImagePlus, X } from "lucide-react";
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
    const router = useRouter();
    const { data: session } = useSession();
    const [mainTab, setMainTab] = useState<"characters" | "niches">("characters");
    const [charTab, setCharTab] = useState<"explorer" | "collection" | "create">("explorer");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    const [prompts, setPrompts] = useState<Prompt[]>([]);
    const [standardModels, setStandardModels] = useState<CharacterModel[]>([]);
    const [personalModels, setPersonalModels] = useState<CharacterModel[]>([]);

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

    const filtered = (list: CharacterModel[]) =>
        list.filter(m => m.name.toLowerCase().includes(search.toLowerCase()));

    if (loading) return (
        <div className="flex items-center justify-center min-h-[60vh]">
            <Loader2 className="h-6 w-6 animate-spin text-stone-300" />
        </div>
    );

    return (
        <div className="min-h-screen">
            <div className="max-w-[1600px] mx-auto p-6 space-y-8">
                {/* Tabs Switcher (Simplified) */}
                <div className="flex items-center justify-between">
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

                {/* Content Card */}
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
                                            <Sparkles className="h-3 w-3 fill-current" /> Character Studio
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
                                            onEmpty={() => router.push("/studio/character-pro")}
                                        />
                                    </TabsContent>

                                    <TabsContent value="create" className="m-0 h-full">
                                        <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 text-center space-y-8 bg-stone-50/20 rounded-[2.5rem] border-2 border-dashed border-stone-100 animate-in fade-in zoom-in-95 duration-1000">
                                            <div className="relative">
                                                <div className="h-24 w-24 rounded-[2.5rem] bg-white shadow-2xl flex items-center justify-center border border-stone-100">
                                                    <Sparkles className="h-10 w-10 text-amber-500 fill-amber-500" />
                                                </div>
                                                <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-stone-800 text-white flex items-center justify-center border-2 border-white shadow-lg animate-bounce">
                                                    <Wand2 className="h-4 w-4" />
                                                </div>
                                            </div>

                                            <div className="max-w-md space-y-4">
                                                <h3 className="text-3xl font-black text-stone-800 uppercase tracking-tighter">AI Character Studio Pro</h3>
                                                <p className="text-sm text-stone-400 font-medium leading-relaxed">
                                                    Découvrez notre nouvelle expérience de génération immersive. Créez des hôtes uniques avec un rendu IA professionnel dans un studio plein écran dédié.
                                                </p>
                                            </div>

                                            <Button
                                                onClick={() => router.push("/studio/character-pro")}
                                                className="h-16 px-12 rounded-[1.5rem] bg-stone-800 hover:bg-stone-950 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-stone-300/50 active:scale-95 transition-all group"
                                            >
                                                Ouvrir le Studio <Sparkles className="h-4 w-4 ml-3 fill-amber-400 text-amber-400 group-hover:scale-125 transition-transform" />
                                            </Button>
                                        </div>
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