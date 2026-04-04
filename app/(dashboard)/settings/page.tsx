"use client";

import { useEffect, useState } from "react";
import { Sparkles, Palette, Save, CheckCircle2 } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/src/components/ui/card";
import { useSession } from "@/src/lib/auth-client";
import { AdminService } from "@/src/app/admin/api/admin-service";
import { usersService } from "@/src/services/users-service";
import { cn } from "@/src/lib/utils";

const adminService = new AdminService();

export default function SettingsPage() {
    const { data: session } = useSession();
    const [prompts, setPrompts] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    // Initialize with the user's current niche if available
    const [selectedPromptId, setSelectedPromptId] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await adminService.listPublicPrompts({ limit: 100 });
                // We filter out deleted ones if needed, but assuming all returned are active
                setPrompts(res.data || []);
            } catch (err) {
                console.error("Failed to load prompts", err);
            } finally {
                setLoading(false);
            }
        };
        load();
    }, []);

    useEffect(() => {
        if (session?.user && !selectedPromptId) {
            // @ts-ignore - Better auth typing might not include custom fields immediately
            setSelectedPromptId((session.user as any).niche || "");
        }
    }, [session, selectedPromptId]);

    const handleSave = async () => {
        if (!selectedPromptId || !session?.user) return;
        setIsSaving(true);
        setSaved(false);
        try {
            await usersService.updateMe({ niche: selectedPromptId });
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);

            // Update local session to reflect changes
            window.location.reload();
        } catch (err) {
            console.error(err);
        } finally {
            setIsSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="p-8 flex items-center justify-center min-h-[50vh]">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 rounded-full border-4 border-amber-500 border-t-transparent animate-spin" />
                    <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">Chargement...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto p-4 md:p-8 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-zinc-900">Paramètres</h1>
                    <p className="text-zinc-500 font-medium mt-1">
                        Gérez vos préférences de chaîne et votre profil.
                    </p>
                </div>
            </div>

            <div className="grid gap-8">
                {/* Niche Configuration */}
                <Card className="border border-zinc-100 shadow-xl rounded-3xl overflow-hidden relative">
                    <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-amber-400 to-amber-600" />
                    <CardHeader className="pb-4">
                        <div className="flex items-center gap-3 mb-1">
                            <div className="h-10 w-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                                <Palette className="h-5 w-5" />
                            </div>
                            <div>
                                <CardTitle className="text-xl font-black">Style de Vidéo (Niche)</CardTitle>
                                <CardDescription className="font-medium text-zinc-500">
                                    Définissez la niche principale de votre chaîne.
                                </CardDescription>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
                            {prompts.map((p) => (
                                <button
                                    key={p.id}
                                    type="button"
                                    onClick={() => setSelectedPromptId(p.id)}
                                    className={cn(
                                        "flex flex-col items-center gap-3 p-4 rounded-3xl transition-all border-2 text-center group",
                                        selectedPromptId === p.id
                                            ? "bg-amber-50 border-amber-500 shadow-xl shadow-amber-500/10"
                                            : "bg-white border-zinc-100 hover:border-amber-300 hover:shadow-md"
                                    )}
                                >
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center transition-all",
                                        selectedPromptId === p.id ? "bg-amber-500 text-white shadow-md shadow-amber-500/20" : "bg-zinc-100 text-zinc-400 group-hover:bg-amber-100 group-hover:text-amber-600"
                                    )}>
                                        <Palette className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <span className="text-sm font-black text-zinc-900 block mb-1">
                                            {p.name}
                                        </span>
                                        <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest w-full truncate block px-2">
                                            {p.category || "Standard"}
                                        </span>
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="flex justify-end pt-4 border-t border-zinc-100">
                            <Button
                                onClick={handleSave}
                                disabled={isSaving || !selectedPromptId}
                                className={cn(
                                    "h-12 px-8 font-black uppercase tracking-widest text-[11px] rounded-2xl transition-all",
                                    saved
                                        ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                        : "bg-zinc-950 hover:bg-zinc-800 text-white shadow-xl shadow-zinc-200"
                                )}
                            >
                                {isSaving ? (
                                    <span className="flex items-center">
                                        <div className="h-4 w-4 rounded-full border-2 border-white/20 border-t-white animate-spin mr-2" />
                                        Enregistrement...
                                    </span>
                                ) : saved ? (
                                    <span className="flex items-center">
                                        <CheckCircle2 className="h-4 w-4 mr-2" />
                                        Enregistré !
                                    </span>
                                ) : (
                                    <span className="flex items-center">
                                        <Save className="h-4 w-4 mr-2 opacity-50" />
                                        Sauvegarder
                                    </span>
                                )}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
