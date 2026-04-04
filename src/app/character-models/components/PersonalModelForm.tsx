import { useState, useEffect, useRef } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Textarea } from "@/src/components/ui/textarea";
import { Label } from "@/src/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogFooter
} from "@/src/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/src/components/ui/select";
import { CharacterModel } from "../api/character-models-service";
import { Camera, RefreshCw, Upload, Sparkles } from "lucide-react";
import { cn } from "@/src/lib/utils";

interface PersonalModelFormProps {
    voices: any[];
    model?: CharacterModel | null;
    onSubmit: (data: any) => Promise<void>;
    isLoading: boolean;
    trigger?: React.ReactNode;
    isOpen?: boolean;
    onClose?: () => void;
}

export function PersonalModelForm({
    voices,
    model,
    onSubmit,
    isLoading,
    trigger,
    isOpen,
    onClose
}: PersonalModelFormProps) {
    const [internalOpen, setInternalOpen] = useState(false);

    const open = isOpen !== undefined ? isOpen : internalOpen;
    const setOpen = (val: boolean) => {
        if (!val && onClose) onClose();
        setInternalOpen(val);
    };

    useEffect(() => {
        if (model && open) {
            setName(model.name || "");
            setDescription(model.description || "");
            setVoiceId(model.voiceId || "none");
            setImageUrl(model.images?.[0] || "");
        } else if (open) {
            setName("");
            setDescription("");
            setVoiceId("none");
            setImageUrl("");
        }
    }, [model, open]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSubmit({
            name,
            description,
            voiceId: voiceId === "none" ? undefined : voiceId,
            images: imageUrl ? [imageUrl] : [],
            // Ensure we map standard fields the API expects
            gender: "unknown",
            age: "unknown",
            isStandard: "false",
        });
        setOpen(false);
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            // In a real app we would upload the file to S3 and get the URL
            // For now, we simulate with a generic avatar or base64
            const reader = new FileReader();
            reader.onload = (event) => {
                if (event.target?.result) {
                    setImageUrl(event.target.result as string);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
            <DialogContent className="sm:max-w-[500px] border-zinc-100 bg-white rounded-3xl shadow-2xl p-0 overflow-hidden">
                <form onSubmit={handleSubmit} className="flex flex-col h-full">
                    <div className="bg-gradient-to-b from-zinc-50 to-white px-8 pt-8 pb-4 border-b border-zinc-100">
                        <DialogTitle className="text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                            <Sparkles className="h-5 w-5 text-amber-500" />
                            {model ? "Modifier le Personnage" : "Nouveau Personnage"}
                        </DialogTitle>
                        <p className="text-xs font-medium text-zinc-500 mt-1">
                            Configurez l'apparence et la voix de votre modèle.
                        </p>
                    </div>

                    <div className="p-8 space-y-6">
                        {/* Avatar Upload */}
                        <div className="flex flex-col items-center justify-center">
                            <div
                                className="relative group cursor-pointer"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl shadow-zinc-200/50 bg-zinc-100 flex items-center justify-center">
                                    {imageUrl ? (
                                        <img src={imageUrl} alt="Avatar" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon />
                                    )}
                                </div>
                                <div className="absolute -bottom-2 -right-2 h-8 w-8 bg-zinc-900 rounded-full flex items-center justify-center border-2 border-white shadow-sm transition-transform group-hover:scale-110 group-hover:bg-amber-500 text-white">
                                    <Camera className="h-4 w-4" />
                                </div>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleImageUpload}
                                />
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Nom du personnage</Label>
                                <Input
                                    required
                                    placeholder="Ex: Clara, Experte Tech"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    className="rounded-xl h-11 border-zinc-200 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all font-bold"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Prompt / Description Vêtement</Label>
                                <Textarea
                                    placeholder="Décrivez l'apparence, les vêtements et le style du personnage pour maintenir sa cohérence visuelle..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    className="rounded-xl resize-none min-h-[100px] border-zinc-200 focus-visible:ring-amber-500/20 focus-visible:border-amber-500 transition-all text-sm leading-relaxed"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Voix par Défaut</Label>
                                <Select value={voiceId} onValueChange={setVoiceId}>
                                    <SelectTrigger className="rounded-xl h-11 border-zinc-200 font-bold focus:ring-amber-500/20 focus:border-amber-500">
                                        <SelectValue placeholder="Aucune voix" />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-2xl border-zinc-100 shadow-xl max-h-[200px]">
                                        <SelectItem value="none" className="font-bold">Aucune voix</SelectItem>
                                        {voices?.map((v) => (
                                            <SelectItem key={v.id} value={v.id} className="font-medium focus:bg-zinc-100 rounded-lg">
                                                {v.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </div>

                    <DialogFooter className="px-8 flex items-center justify-between">
                        <Button
                            type="button"
                            variant="ghost"
                            onClick={() => setOpen(false)}
                            className="text-zinc-500 hover:text-zinc-900 font-bold uppercase text-[11px] tracking-widest"
                        >
                            Annuler
                        </Button>
                        <Button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="bg-zinc-950 hover:bg-zinc-800 text-white rounded-xl h-11 px-6 font-black uppercase text-[11px] tracking-widest shadow-lg shadow-zinc-200 transition-all active:scale-95"
                        >
                            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin mr-2" /> : null}
                            {model ? "Enregistrer" : "Créer le personnage"}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

function UserIcon() {
    return (
        <svg className="w-10 h-10 text-zinc-300" fill="currentColor" viewBox="0 0 24 24">
            <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
    );
}
