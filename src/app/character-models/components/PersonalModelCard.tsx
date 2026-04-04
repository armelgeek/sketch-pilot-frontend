import { useState } from "react";
import { User, Edit2, Trash2, Mic, Info, Star } from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Card } from "@/src/components/ui/card";
import { CharacterModel } from "../api/character-models-service";
import { useSetDefaultCharacter } from "../hooks";
import { useSession } from "@/src/lib/auth-client";
import { cn } from "@/src/lib/utils";

interface PersonalModelCardProps {
    model: CharacterModel;
    onEdit: (model: CharacterModel) => void;
    onDelete: (id: string) => void;
}

export function PersonalModelCard({ model, onEdit, onDelete }: PersonalModelCardProps) {
    const { data: session } = useSession();
    const user = session?.user as any;
    const isDefault = user?.defaultCharacterId === model.id;

    const { mutate: setDefaultCharacter, isPending: isSettingDefault } = useSetDefaultCharacter();

    const handleSetDefault = () => {
        if (isDefault) return;
        setDefaultCharacter(model.id);
    };

    const imageUrl = model.images?.[0];

    return (
        <Card className={cn(
            "overflow-hidden group transition-all duration-300 relative border-2",
            isDefault
                ? "border-amber-500 shadow-xl shadow-amber-500/10"
                : "border-zinc-100 hover:border-zinc-300 hover:shadow-lg bg-white"
        )}>
            {isDefault && (
                <div className="absolute top-4 left-4 z-10 bg-amber-500 text-white text-[9px] font-black uppercase tracking-widest px-3 py-1.5 rounded-full shadow-md flex items-center gap-1.5 border border-amber-400">
                    <Star className="h-3 w-3 fill-white" />
                    Par Défaut
                </div>
            )}

            {/* Avatar Section */}
            <div className="relative pt-8 pb-6 px-6 flex flex-col items-center border-b border-zinc-50 bg-gradient-to-b from-zinc-50/50 to-white">
                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl shadow-zinc-200/50 mb-4 bg-zinc-100 flex items-center justify-center">
                    {imageUrl ? (
                        <img src={imageUrl} alt={model.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    ) : (
                        <User className="w-10 h-10 text-zinc-300" />
                    )}
                </div>
                <h3 className="text-lg font-black text-zinc-900 text-center tracking-tight truncate w-full px-4">
                    {model.name}
                </h3>

                {model.voiceId && model.voiceId !== "none" && (
                    <div className="flex items-center gap-1.5 mt-2 bg-zinc-100 px-3 py-1 rounded-full border border-zinc-200/50 text-zinc-600">
                        <Mic className="h-3 w-3" />
                        <span className="text-[10px] font-bold uppercase tracking-widest">Voix assignée</span>
                    </div>
                )}
            </div>

            {/* Details Section */}
            <div className="p-6 bg-white space-y-4">
                {model.description && (
                    <div className="flex items-start gap-2 text-zinc-500 bg-zinc-50 p-4 rounded-2xl border border-zinc-100 leading-relaxed text-sm">
                        <Info className="h-4 w-4 mt-0.5 shrink-0 text-zinc-400" />
                        <p className="line-clamp-3">{model.description}</p>
                    </div>
                )}

                <div className="flex items-center justify-center gap-3 pt-2">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSetDefault}
                        disabled={isDefault || isSettingDefault}
                        className={cn(
                            "flex-1 h-9 rounded-xl text-[10px] uppercase font-black tracking-widest transition-all border",
                            isDefault
                                ? "bg-amber-50 text-amber-600 border-amber-200 opacity-100 hover:bg-amber-50"
                                : "bg-white border-zinc-200 text-zinc-500 hover:border-amber-500 hover:text-amber-600 hover:bg-amber-50"
                        )}
                    >
                        {isDefault ? "Généré par défaut" : "Définir par défaut"}
                    </Button>
                </div>

                <div className="flex items-center justify-between border-t border-zinc-50 pt-4 mt-4">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onEdit(model)}
                        className="text-zinc-500 hover:text-zinc-900 bg-zinc-50 hover:bg-zinc-100 px-4 h-8 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all"
                    >
                        <Edit2 className="h-3 w-3 mr-2" /> Modifier
                    </Button>
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onDelete(model.id)}
                        className="text-red-400 hover:text-red-700 hover:bg-red-50 px-4 h-8 rounded-lg text-[10px] uppercase font-bold tracking-widest transition-all"
                    >
                        <Trash2 className="h-3 w-3 mr-2" /> Supprimer
                    </Button>
                </div>
            </div>
        </Card>
    );
}
