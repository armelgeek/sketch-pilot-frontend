"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, Loader2, Wand2, Sparkles } from "lucide-react";
import { cn } from "@/src/lib/utils";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { updateUser } from "@/src/lib/auth-client";
import { useHeaderStore } from "@/src/components/layout/header-store";
import { HeaderButton } from "@/src/components/layout/header-button";

const adminService = new AdminService();

interface CharacterModel {
    id: string;
    name: string;
    images?: string[];
    thumbnailUrl?: string;
}

const HEADER_H = 120; // px — matched to h-12 global header

function CharacterProContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get("edit");
    const initialName = searchParams.get("name") || "";
    const initialPrompt = searchParams.get("prompt") || "";
    const initialBaseId = searchParams.get("baseId") || "";
    const initialImage = searchParams.get("image") || null;

    const { setHeaderDetails } = useHeaderStore();

    const [loading, setLoading] = useState(true);
    const [generating, setGenerating] = useState(false);
    const [saving, setSaving] = useState(false);

    const [standardModels, setStandardModels] = useState<CharacterModel[]>([]);
    const [name, setName] = useState(initialName);
    const [prompt, setPrompt] = useState(initialPrompt);
    const [baseHostId, setBaseHostId] = useState<string | null>(initialBaseId || null);
    const [selectedImage, setSelectedImage] = useState<string | null>(initialImage);

    // Sync from URL params on mount (extra safety for hydration)
    useEffect(() => {
        if (editId) {
            if (initialName) setName(initialName);
            if (initialPrompt) setPrompt(initialPrompt);
            if (initialBaseId) setBaseHostId(initialBaseId);
            if (initialImage) setSelectedImage(initialImage);
        }
    }, [editId, initialName, initialPrompt, initialBaseId, initialImage]);

    useEffect(() => {
        setHeaderDetails({
            actions: (
                <HeaderButton
                    variant="secondary"
                    icon={Wand2}
                    onClick={() => router.push("/characters")}
                >
                    Retour
                </HeaderButton>
            ),
            customBreadcrumb: [{ label: "Mes Personnages", href: "/characters" }]
        });
    }, [setHeaderDetails, router]);

    useEffect(() => {
        adminService.listStandardModels()
            .then(res => {
                const models = res.data ?? [];
                setStandardModels(models);
                if (!baseHostId && models.length > 0) setBaseHostId(models[0].id);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    const handleGenerate = async () => {
        if (!baseHostId || !prompt.trim()) return;
        setGenerating(true);
        try {
            const result = await adminService.generateCharacterImage(baseHostId, prompt);
            if (result.success && result.imageUrl) setSelectedImage(result.imageUrl);
        } catch (err) {
            console.error(err);
        } finally {
            setGenerating(false);
        }
    };

    const handleSave = async () => {
        if (!name.trim() || !selectedImage) return;
        setSaving(true);
        try {
            const data: any = {
                name: name.trim(),
                description: prompt,
                isStandard: false,
                thumbnailUrl: selectedImage
            };
            if (baseHostId) data.baseModelId = baseHostId;

            if (editId) {
                await adminService.updateModel(editId, data);
            } else {
                const result = await adminService.createModel(data);
                await updateUser({ defaultCharacterId: result.id });
            }
            router.push("/characters");
        } catch (err) {
            console.error(err);
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        </div>
    );

    const canGenerate = !generating && !saving && !!baseHostId && !!prompt.trim();
    const canSave = !generating && !saving && !!selectedImage && !!name.trim();

    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <div
                className="flex gap-4 p-4 overflow-hidden"
                style={{ height: `calc(100vh - ${HEADER_H}px)` }}
            >
                {/* Sidebar */}
                <aside className="w-44 flex flex-col gap-2 overflow-y-auto shrink-0">
                    <p className="text-[11px] text-muted-foreground px-1 pb-1 shrink-0">Base</p>
                    {standardModels.map(model => {
                        const thumb = model.images?.[0] ?? model.thumbnailUrl;
                        const active = baseHostId === model.id;
                        return (
                            <button
                                key={model.id}
                                onClick={() => {
                                    setBaseHostId(active ? null : model.id);
                                    setSelectedImage(null);
                                }}
                                className={cn(
                                    "relative aspect-[3/2] rounded-lg overflow-hidden transition-all shrink-0",
                                    active
                                        ? "ring-2 ring-foreground ring-offset-1"
                                        : "opacity-50 hover:opacity-80 grayscale hover:grayscale-0"
                                )}
                            >
                                <img src={thumb} alt={model.name} className="absolute inset-0 h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                                <span className="absolute bottom-1.5 left-1.5 text-[9px] font-medium text-white truncate pr-2">
                                    {model.name}
                                </span>
                                {active && (
                                    <div className="absolute top-1.5 right-1.5 h-3.5 w-3.5 rounded-full bg-white flex items-center justify-center">
                                        <Check className="h-2 w-2 text-foreground" />
                                    </div>
                                )}
                            </button>
                        );
                    })}
                </aside>

                {/* Canvas */}
                <div className="flex-1 flex flex-col border border-border rounded-xl overflow-hidden min-h-0">
                    <div className="flex-1 flex items-center justify-center bg-stone-50/50 min-h-0 relative">
                        <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: "radial-gradient(#000 1px, transparent 1px)", backgroundSize: "20px 20px" }} />

                        {/* Persistent Tips Layer */}
                        <div className="absolute inset-0 flex flex-col justify-between p-6 pointer-events-none select-none">
                            <div className="flex justify-between items-start">
                                <div className="max-w-[140px] space-y-1.5 bg-white/40 backdrop-blur-[2px] p-2.5 rounded-xl border border-stone-100/50 opacity-60 hover:opacity-100 transition-opacity pointer-events-auto">
                                    <p className="text-[8px] font-black uppercase text-stone-500 tracking-wider">💡 Astuce Style</p>
                                    <p className="text-[10px] text-stone-600 font-medium leading-tight italic">"Précisez la texture : fusain, peinture à l'huile, ou croquis rapide."</p>
                                </div>
                                <div className="max-w-[140px] space-y-1.5 bg-white/40 backdrop-blur-[2px] p-2.5 rounded-xl border border-stone-100/50 opacity-60 hover:opacity-100 transition-opacity text-right pointer-events-auto">
                                    <p className="text-[8px] font-black uppercase text-stone-500 tracking-wider">🎭 Expression</p>
                                    <p className="text-[10px] text-stone-600 font-medium leading-tight italic">"L'expression (ex: regard défiant, sourire discret) donne vie au portrait."</p>
                                </div>
                            </div>
                            <div className="flex justify-between items-end">
                                <div className="max-w-[140px] space-y-1.5 bg-white/40 backdrop-blur-[2px] p-2.5 rounded-xl border border-stone-100/50 opacity-60 hover:opacity-100 transition-opacity pointer-events-auto">
                                    <p className="text-[8px] font-black uppercase text-stone-500 tracking-wider">👗 Détails</p>
                                    <p className="text-[10px] text-stone-600 font-medium leading-tight italic">"N'oubliez pas les vêtements : costume d'époque, hoodie moderne, uniforme..."</p>
                                </div>
                                <div className="max-w-[140px] space-y-1.5 bg-white/40 backdrop-blur-[2px] p-2.5 rounded-xl border border-stone-100/50 opacity-60 hover:opacity-100 transition-opacity text-right pointer-events-auto">
                                    <p className="text-[8px] font-black uppercase text-stone-500 tracking-wider">✨ Automatique</p>
                                    <p className="text-[10px] text-stone-600 font-medium leading-tight italic">"Le personnage sera détouré proprement pour vos futures vidéos."</p>
                                </div>
                            </div>
                        </div>

                        {generating ? (
                            <div className="flex flex-col items-center gap-3">
                                <Loader2 className="h-8 w-8 text-amber-500 animate-spin" />
                                <p className="text-[10px] font-black uppercase tracking-widest text-stone-400">L'IA dessine votre portrait...</p>
                            </div>
                        ) : selectedImage ? (
                            <div className="h-full w-full p-6 flex items-center justify-center">
                                <div className="relative aspect-[3/4] h-[78%] shadow-[0_25px_50px_-12px_rgba(0,0,0,0.25)] rounded-[2.5rem] overflow-hidden border-[6px] border-white bg-white group transition-transform hover:scale-[1.02] duration-500">
                                    <img
                                        src={selectedImage}
                                        alt="Personnage généré"
                                        className="h-full w-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-stone-900/30 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                    <div className="absolute bottom-4 right-4 h-10 w-10 rounded-full bg-stone-900/80 backdrop-blur-md text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all transform translate-y-4 group-hover:translate-y-0 duration-500">
                                        <Sparkles className="h-4 w-4 fill-amber-400 text-amber-400" />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-full w-full p-6 flex items-center justify-center">
                                <div className="relative aspect-[3/4] h-[78%] rounded-[2.5rem] border-2 border-dashed border-stone-200 bg-stone-50/50 flex flex-col items-center justify-center gap-4 group/ghost transition-all duration-700 hover:border-stone-300">
                                    <div className="h-14 w-14 rounded-full bg-white shadow-sm border border-stone-100 flex items-center justify-center opacity-60 group-hover/ghost:opacity-100 transition-opacity">
                                        <Wand2 className="h-6 w-6 text-stone-400 group-hover/ghost:text-amber-500 transition-colors" />
                                    </div>
                                    <div className="space-y-1 text-center opacity-40 group-hover/ghost:opacity-70 transition-opacity px-8">
                                        <p className="text-[9px] font-black uppercase tracking-[0.15em] text-stone-800">
                                            {!baseHostId ? "Sélectionnez une base" : "Prêt pour le shooting"}
                                        </p>
                                        <p className="text-[8px] font-medium text-stone-500 leading-relaxed mx-auto max-w-[120px]">
                                            Le portrait apparaîtra ici après la génération
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Input Bar */}
                    <div className="shrink-0 border-t border-border bg-background p-3">
                        <div className="flex items-end gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[11px] text-muted-foreground">Nom</label>
                                <input
                                    type="text"
                                    placeholder="Nom..."
                                    value={name}
                                    onChange={e => setName(e.target.value)}
                                    className="w-28 h-9 rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <div className="h-9 w-px bg-border shrink-0" />

                            <div className="flex-1 flex flex-col gap-1 min-w-0">
                                <label className="text-[11px] text-muted-foreground">Description</label>
                                <input
                                    type="text"
                                    placeholder="Style, costume, ambiance…"
                                    value={prompt}
                                    onChange={e => setPrompt(e.target.value)}
                                    onKeyDown={e => e.key === "Enter" && handleGenerate()}
                                    className="h-9 w-full rounded-lg border border-border bg-muted/30 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                                />
                            </div>

                            <button
                                onClick={handleGenerate}
                                disabled={!canGenerate}
                                className={cn(
                                    "shrink-0 h-9 px-4 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all text-[11px] uppercase tracking-wider",
                                    canGenerate
                                        ? "bg-foreground text-background hover:opacity-90 active:scale-95 shadow-[0_4px_12px_-4px_rgba(0,0,0,0.3)]"
                                        : "bg-muted text-muted-foreground cursor-not-allowed"
                                )}
                            >
                                {generating ? (
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                ) : (
                                    <>
                                        <Sparkles className="h-3.5 w-3.5" />
                                        Générer
                                        <span className="ml-1 opacity-50 font-black tracking-tighter text-[9px] bg-white/20 px-1.5 rounded-full py-0.5">
                                            -10⚡
                                        </span>
                                    </>
                                )}
                            </button>

                            {selectedImage && (
                                <button
                                    onClick={handleSave}
                                    disabled={!canSave}
                                    className={cn(
                                        "shrink-0 h-9 px-4 rounded-lg text-sm font-medium flex items-center gap-1.5 transition-all",
                                        canSave
                                            ? "bg-foreground text-background hover:opacity-90 active:scale-95"
                                            : "bg-muted text-muted-foreground cursor-not-allowed"
                                    )}
                                >
                                    {saving
                                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                        : <><Check className="h-3.5 w-3.5" /> Sauvegarder</>
                                    }
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CharacterProPage() {
    return (
        <Suspense fallback={
            <div className="flex items-center justify-center min-h-screen">
                <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
            </div>
        }>
            <CharacterProContent />
        </Suspense>
    );
}