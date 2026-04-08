"use client";

import { useState, useEffect } from "react";
import { Plus, Search, Clapperboard, AlertCircle, X, Layers, Loader2 } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { seriesService, type Series } from "@/src/services/series-service";
import { SeriesCard } from "@/src/components/organisms/series-card";
import { Button } from "@/src/components/ui/button";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { Globe, Wand2, Sparkles, RefreshCw } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/src/components/ui/dialog";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Textarea } from "@/src/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/src/components/ui/select";

const adminService = new AdminService();

export default function SeriesPage() {
    const [series, setSeries] = useState<Series[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isCreating, setIsCreating] = useState(false);

    // Context for form
    const [prompts, setPrompts] = useState<any[]>([]);
    const [characterModels, setCharacterModels] = useState<any[]>([]);
    const [personalModels, setPersonalModels] = useState<any[]>([]);

    // Form state
    const [newSeries, setNewSeries] = useState({
        title: "",
        description: "",
        promptId: "",
        characterModelId: "",
        fullStory: "",
        totalEpisodes: 10,
        secondaryCharacterIds: [] as string[]
    });

    useEffect(() => {
        loadSeries();
        loadFormData();
    }, []);

    const loadFormData = async () => {
        try {
            const [pData, charData, myData] = await Promise.all([
                adminService.listPublicPrompts({ limit: 100 }),
                adminService.listStandardModels(),
                adminService.listModels()
            ]);
            setPrompts(pData.data || []);
            setCharacterModels(charData.data || []);
            setPersonalModels(myData.data || []);

            // Set defaults for form if empty
            setNewSeries(prev => ({
                ...prev,
                promptId: pData.data?.[0]?.id || "",
                characterModelId: myData.data?.[0]?.id || charData.data?.[0]?.id || ""
            }));
        } catch (err) {
            console.error("Failed to load niches/characters", err);
        }
    };

    const loadSeries = () => {
        setLoading(true);
        setError(null);
        seriesService.getAll()
            .then(setSeries)
            .catch(() => setError("Impossible de charger vos séries."))
            .finally(() => setLoading(false));
    };

    const handleCreate = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSeries.title.trim()) return;

        setIsCreating(true);
        try {
            await seriesService.create(newSeries);
            loadSeries();
            setIsCreateOpen(false);
            setNewSeries({ title: "", description: "", promptId: prompts[0]?.id || "", characterModelId: (personalModels[0] || characterModels[0])?.id || "", fullStory: "", totalEpisodes: 10, secondaryCharacterIds: [] });
        } catch {
            alert("Erreur lors de la création de la série.");
        } finally {
            setIsCreating(false);
        }
    };

    const filtered = series.filter((s) =>
        s.title.toLowerCase().includes(search.toLowerCase()) ||
        s.description?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-white">
            <div className="max-w-[1600px] mx-auto p-6 lg:p-8 space-y-10 pb-32">

                {/* Header Section */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 text-zinc-500 text-[10px] font-bold uppercase tracking-widest mb-4">
                            <Layers className="h-3 w-3" /> Continuité Narrative
                        </div>
                        <h1 className="text-4xl font-black tracking-tight text-zinc-900 lg:text-5xl">Mes Séries</h1>
                        <p className="text-base text-zinc-500 mt-3 max-w-2xl leading-relaxed">
                            Organisez vos vidéos en sagas cohérentes. L'IA utilisera le contexte de l'épisode précédent pour assurer une suite logique à vos histoires.
                        </p>
                    </div>

                    <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                        <DialogTrigger asChild>
                            <button className="flex items-center gap-2.5 h-14 px-8 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white text-sm font-bold transition-all shadow-2xl shadow-zinc-900/20 active:scale-95 shrink-0">
                                <Plus className="h-5 w-5" /> Créer une série
                            </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[500px] rounded-[2rem] border-zinc-100 shadow-2xl max-h-[90vh] overflow-y-auto custom-scrollbar">
                            <form onSubmit={handleCreate}>
                                <DialogHeader className="pb-4">
                                    <DialogTitle className="text-2xl font-black">Nouvelle Série</DialogTitle>
                                    <DialogDescription className="text-zinc-500 font-medium">
                                        Donnez un nom à votre saga. Toutes les vidéos ajoutées à cette série partageront le même univers.
                                    </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-6 py-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="title" className="text-xs font-black uppercase tracking-widest text-zinc-400">Titre de la série</Label>
                                        <Input
                                            id="title"
                                            placeholder="Ex: Les Aventures de Max"
                                            value={newSeries.title}
                                            onChange={(e) => setNewSeries({ ...newSeries, title: e.target.value })}
                                            className="h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all font-semibold"
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="description" className="text-xs font-black uppercase tracking-widest text-zinc-400">Description (Optionnel)</Label>
                                        <Textarea
                                            id="description"
                                            placeholder="Résumé court de la série..."
                                            value={newSeries.description}
                                            onChange={(e) => setNewSeries({ ...newSeries, description: e.target.value })}
                                            className="min-h-[60px] rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="fullStory" className="text-xs font-black uppercase tracking-widest text-zinc-400">Histoire Globale (Bible)</Label>
                                        <Textarea
                                            id="fullStory"
                                            placeholder="Décrivez ici l'intrigue complète du début à la fin. L'IA s'en servira pour découper les épisodes..."
                                            value={newSeries.fullStory}
                                            onChange={(e) => setNewSeries({ ...newSeries, fullStory: e.target.value })}
                                            className="min-h-[120px] rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all font-medium"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 gap-4">
                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Niche / Style Visuel</Label>
                                            <Select value={newSeries.promptId} onValueChange={(val) => setNewSeries({ ...newSeries, promptId: val })}>
                                                <SelectTrigger className="h-12 text-sm font-semibold bg-zinc-50 border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900 shadow-none">
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="h-4 w-4 text-zinc-400" />
                                                        <span>{prompts.find(p => p.id === newSeries.promptId)?.name || "Choisir un style"}</span>
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-zinc-100 shadow-xl max-h-[250px]">
                                                    {prompts.map((p) => (
                                                        <SelectItem key={p.id} value={p.id} className="text-sm font-medium">{p.name}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>

                                        <div className="space-y-2">
                                            <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Personnage Signature</Label>
                                            <Select value={newSeries.characterModelId} onValueChange={(val) => setNewSeries({ ...newSeries, characterModelId: val })}>
                                                <SelectTrigger className="h-12 text-sm font-semibold bg-zinc-50 border-zinc-100 rounded-xl focus:ring-2 focus:ring-zinc-900 shadow-none">
                                                    <div className="flex items-center gap-2">
                                                        <Wand2 className="h-4 w-4 text-zinc-400" />
                                                        <span>{[...characterModels, ...personalModels].find(c => c.id === newSeries.characterModelId)?.name || "Choisir un personnage"}</span>
                                                    </div>
                                                </SelectTrigger>
                                                <SelectContent className="rounded-xl border-zinc-100 shadow-xl max-h-[250px]">
                                                    {[...personalModels, ...characterModels].map((c) => (
                                                        <SelectItem key={c.id} value={c.id} className="text-sm font-medium">
                                                            <div className="flex items-center gap-2">
                                                                <Avatar className="h-5 w-5">
                                                                    <AvatarImage src={c.images?.[0] || c.thumbnailUrl} />
                                                                    <AvatarFallback className="text-[8px]">{c.name?.[0]}</AvatarFallback>
                                                                </Avatar>
                                                                {c.name}
                                                            </div>
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-xs font-black uppercase tracking-widest text-zinc-400">Distribution / Cast (Secondaires)</Label>
                                        <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-zinc-50 border border-zinc-100 min-h-[50px]">
                                            {[...personalModels, ...characterModels].filter(c => c.id !== newSeries.characterModelId).map((c) => {
                                                const isSelected = newSeries.secondaryCharacterIds.includes(c.id);
                                                return (
                                                    <button
                                                        key={c.id}
                                                        type="button"
                                                        onClick={() => {
                                                            if (isSelected) {
                                                                setNewSeries({ ...newSeries, secondaryCharacterIds: newSeries.secondaryCharacterIds.filter(id => id !== c.id) });
                                                            } else {
                                                                setNewSeries({ ...newSeries, secondaryCharacterIds: [...newSeries.secondaryCharacterIds, c.id] });
                                                            }
                                                        }}
                                                        className={cn(
                                                            "flex items-center gap-2 px-2 py-1.5 rounded-lg border transition-all text-[10px] font-bold",
                                                            isSelected
                                                                ? "bg-zinc-900 border-zinc-900 text-white shadow-md"
                                                                : "bg-white border-zinc-100 text-zinc-500 hover:border-zinc-200"
                                                        )}
                                                    >
                                                        <Avatar className="h-4 w-4">
                                                            <AvatarImage src={c.images?.[0] || c.thumbnailUrl} />
                                                            <AvatarFallback className="text-[6px]">{c.name?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        {c.name}
                                                    </button>
                                                );
                                            })}
                                            {[...personalModels, ...characterModels].filter(c => c.id !== newSeries.characterModelId).length === 0 && (
                                                <span className="text-[10px] text-zinc-400 italic">Aucun autre personnage disponible</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label htmlFor="totalEpisodes" className="text-xs font-black uppercase tracking-widest text-zinc-400">Nombre d'épisodes estimé</Label>
                                        <Input
                                            id="totalEpisodes"
                                            type="number"
                                            min={1}
                                            max={100}
                                            value={newSeries.totalEpisodes}
                                            onChange={(e) => setNewSeries({ ...newSeries, totalEpisodes: parseInt(e.target.value) || 1 })}
                                            className="h-12 rounded-xl bg-zinc-50 border-zinc-100 focus:bg-white focus:ring-2 focus:ring-zinc-900 transition-all font-semibold"
                                        />
                                    </div>
                                </div>
                                <DialogFooter className="pt-4">
                                    <Button
                                        type="submit"
                                        disabled={isCreating || !newSeries.title.trim()}
                                        className="w-full h-12 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-sm font-bold shadow-lg shadow-zinc-900/10"
                                    >
                                        {isCreating ? <Loader2 className="h-4 w-4 animate-spin" /> : "Créer le projet"}
                                    </Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>

                {/* Search / Filters area */}
                <div className="relative max-w-md">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                    <input
                        placeholder="Rechercher une série..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="w-full h-14 pl-12 pr-4 rounded-2xl border border-zinc-100 bg-zinc-50 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-zinc-100 transition-all"
                    />
                </div>

                {/* Error handling */}
                {error && (
                    <div className="flex items-center gap-3 border border-red-100 bg-red-50 text-red-600 rounded-2xl px-5 py-4 text-sm font-bold">
                        <AlertCircle className="h-5 w-5 shrink-0" />
                        <span className="flex-1">{error}</span>
                        <button onClick={() => setError(null)}><X className="h-4 w-4" /></button>
                    </div>
                )}

                {/* Skeleton Loading */}
                {loading && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-64 rounded-[2rem] bg-zinc-50 animate-pulse border border-zinc-100" />
                        ))}
                    </div>
                )}

                {/* Grid Content */}
                {!loading && (
                    <>
                        {filtered.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                                {filtered.map((s) => (
                                    <SeriesCard
                                        key={s.id}
                                        series={s}
                                        onDelete={() => setSeries(series.filter(item => item.id !== s.id))}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="border-4 border-dashed border-zinc-50 rounded-[3rem] bg-zinc-50/30 flex flex-col items-center justify-center py-32 text-center px-6">
                                <div className="h-24 w-24 rounded-[2rem] bg-white shadow-2xl border border-zinc-50 flex items-center justify-center mb-8 rotate-3 group-hover:rotate-0 transition-transform duration-500">
                                    <Clapperboard className="h-10 w-10 text-zinc-300" />
                                </div>
                                <h3 className="text-2xl font-black text-zinc-900 tracking-tight">
                                    {search ? "Aucun résultat" : "Prêt pour votre première saga ?"}
                                </h3>
                                <p className="text-zinc-500 font-bold mt-3 mb-10 max-w-md leading-relaxed">
                                    {search
                                        ? "Nous n'avons trouvé aucune série correspondant à votre recherche."
                                        : "Créez une série pour lier vos épisodes entre eux et laisser l'IA gérer la continuité de l'histoire."
                                    }
                                </p>
                                {!search && (
                                    <Button
                                        onClick={() => setIsCreateOpen(true)}
                                        className="h-14 px-10 rounded-2xl bg-zinc-900 text-white font-black hover:scale-105 transition-all shadow-2xl shadow-zinc-900/20"
                                    >
                                        Démarrer une série
                                    </Button>
                                )}
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}
