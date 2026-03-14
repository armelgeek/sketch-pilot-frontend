"use client";

import { useState } from "react";
import {
    User,
    Shield,
    Mail,
    Save,
    X,
    Ban,
    Zap,
    Clock,
    Calendar,
    ChevronLeft
} from "lucide-react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Badge } from "@/src/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import { AdminUser } from "@/src/app/admin/schema";
import { cn } from "@/src/lib/utils";

interface UserFormProps {
    user: AdminUser;
    onSave: (data: Partial<AdminUser>) => Promise<void>;
    onCancel: () => void;
    onAdjustCredits?: (amount: number, reason: string) => Promise<void>;
    onStatusChange?: (banned: boolean, reason?: string) => Promise<void>;
    isLoading?: boolean;
}

export function UserForm({
    user,
    onSave,
    onCancel,
    onAdjustCredits,
    onStatusChange,
    isLoading
}: UserFormProps) {
    const [formData, setFormData] = useState({
        firstname: user.firstname || "",
        lastname: user.lastname || "",
        role: user.role || "user",
    });

    const [extraCredits, setExtraCredits] = useState(0);
    const [creditReason, setCreditReason] = useState("");
    const [banReason, setBanReason] = useState("");

    const handleBasicSave = async (e: React.FormEvent) => {
        e.preventDefault();
        await onSave(formData);
    };

    return (
        <div className="space-y-8">
            {/* Header / Profile Summary */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                <div className="flex items-center gap-6">
                    <button
                        onClick={onCancel}
                        className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                    >
                        <ChevronLeft className="h-6 w-6" />
                    </button>
                    <Avatar className="h-20 w-20 rounded-[24px] border-4 border-white dark:border-zinc-900 shadow-xl">
                        <AvatarImage src={user.image || ""} />
                        <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 font-black text-2xl">
                            {user.name.slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className="text-3xl font-black tracking-tighter text-zinc-900 dark:text-white">
                            {user.name}
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <Badge variant="secondary" className="rounded-lg font-black text-[10px] uppercase">
                                {user.role}
                            </Badge>
                            <span className="text-zinc-400 text-sm font-medium flex items-center gap-1">
                                <Mail className="h-3.5 w-3.5" />
                                {user.email}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Button
                        variant="ghost"
                        className="rounded-2xl font-bold h-11 px-6 flex-1 md:flex-none"
                        onClick={onCancel}
                    >
                        <X className="mr-2 h-4 w-4" /> Annuler
                    </Button>
                    <Button
                        className="bg-black hover:bg-zinc-800 text-white rounded-2xl font-black h-11 px-8 shadow-xl flex-1 md:flex-none"
                        onClick={handleBasicSave}
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <span className="flex items-center gap-2">
                                <Clock className="h-4 w-4 animate-spin" /> Sauvegarde...
                            </span>
                        ) : (
                            <span className="flex items-center gap-2">
                                <Save className="h-4 w-4" /> Enregistrer
                            </span>
                        )}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Settings */}
                <div className="lg:col-span-2 space-y-8">
                    <Card className="rounded-[32px] border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                                    <User className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="font-black tracking-tight text-xl">Informations Personnelles</CardTitle>
                                    <CardDescription className="font-medium text-zinc-500 mt-1">Gérez l'identité et les accès de l'utilisateur.</CardDescription>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="font-extrabold text-sm uppercase tracking-widest text-zinc-400 pl-1">Prénom</Label>
                                    <Input
                                        className="h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 font-bold focus-visible:ring-black"
                                        value={formData.firstname}
                                        onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                                        placeholder="Prénom"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-extrabold text-sm uppercase tracking-widest text-zinc-400 pl-1">Nom de famille</Label>
                                    <Input
                                        className="h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 font-bold focus-visible:ring-black"
                                        value={formData.lastname}
                                        onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                                        placeholder="Nom"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="font-extrabold text-sm uppercase tracking-widest text-zinc-400 pl-1">Rôle Système</Label>
                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: "user" })}
                                        className={cn(
                                            "h-14 rounded-2xl border-2 font-black transition-all flex items-center justify-center gap-3",
                                            formData.role === "user"
                                                ? "border-black bg-black text-white shadow-lg"
                                                : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                        )}
                                    >
                                        <User className="h-5 w-5" /> Utilisateur
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setFormData({ ...formData, role: "admin" })}
                                        className={cn(
                                            "h-14 rounded-2xl border-2 font-black transition-all flex items-center justify-center gap-3",
                                            formData.role === "admin"
                                                ? "border-emerald-600 bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                                                : "border-zinc-100 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700"
                                        )}
                                    >
                                        <Shield className="h-5 w-5" /> Administrateur
                                    </button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Security & Status */}
                    {onStatusChange && (
                        <Card className="rounded-[32px] border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
                            <CardHeader className="p-8 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                                        <Ban className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <CardTitle className="font-black tracking-tight text-xl">Sécurité & Blocage</CardTitle>
                                        <CardDescription className="font-medium text-zinc-500 mt-1">Contrôlez l'accès au compte.</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 space-y-6">
                                <div className={cn(
                                    "p-6 rounded-[24px] border flex items-center justify-between gap-6",
                                    user.banned
                                        ? "bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30"
                                        : "bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30"
                                )}>
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "h-12 w-12 rounded-2xl flex items-center justify-center shadow-sm",
                                            user.banned ? "bg-red-500 text-white" : "bg-emerald-500 text-white"
                                        )}>
                                            {user.banned ? <Ban className="h-6 w-6" /> : <Shield className="h-6 w-6" />}
                                        </div>
                                        <div>
                                            <h4 className="font-black text-lg">
                                                Compte {user.banned ? "Bloqué" : "Actif"}
                                            </h4>
                                            <p className="text-sm font-medium opacity-70">
                                                {user.banned
                                                    ? `Raison : ${user.banReason || "Non spécifiée"}`
                                                    : "L'utilisateur peut accéder à toutes les fonctionnalités."}
                                            </p>
                                        </div>
                                    </div>
                                    <Button
                                        variant={user.banned ? "outline" : "destructive"}
                                        className="rounded-2xl font-black px-6"
                                        onClick={() => user.banned ? onStatusChange(false) : onStatusChange(true, banReason)}
                                    >
                                        {user.banned ? "Débloquer" : "Bloquer l'accès"}
                                    </Button>
                                </div>

                                {!user.banned && (
                                    <div className="space-y-2">
                                        <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1">Raison du blocage (optionnel)</Label>
                                        <Input
                                            className="h-12 rounded-2xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 font-bold focus-visible:ring-black"
                                            value={banReason}
                                            onChange={(e) => setBanReason(e.target.value)}
                                            placeholder="Ex: Violation des CGU"
                                        />
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Credits / Side info */}
                <div className="space-y-8">
                    {onAdjustCredits && (
                        <Card className="rounded-[32px] border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
                            <CardHeader className="p-8 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 bg-amber-50 dark:bg-amber-950/20 rounded-xl flex items-center justify-center text-amber-500">
                                        <Zap className="h-5 w-5 fill-current" />
                                    </div>
                                    <div>
                                        <CardTitle className="font-black tracking-tight text-xl">Balance Crédits</CardTitle>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-8 pt-4 space-y-6">
                                <div className="bg-zinc-50 dark:bg-zinc-800/50 p-6 rounded-[24px] text-center border border-zinc-100 dark:border-zinc-800">
                                    <span className="text-[10px] font-black text-zinc-400 uppercase tracking-widest block mb-1">Crédits Actuels</span>
                                    <span className="text-4xl font-black tracking-tighter text-zinc-900 dark:text-white">--</span>
                                    <p className="text-[10px] font-bold text-zinc-400 mt-2 italic uppercase">Calculé via le backend</p>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1">Ajouter / Retirer</Label>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                className="h-12 w-12 rounded-xl text-xl font-black"
                                                onClick={() => setExtraCredits(p => p - 100)}
                                            >
                                                -
                                            </Button>
                                            <Input
                                                type="number"
                                                className="h-12 rounded-xl text-center font-black border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50"
                                                value={extraCredits}
                                                onChange={(e) => setExtraCredits(parseInt(e.target.value) || 0)}
                                            />
                                            <Button
                                                variant="outline"
                                                className="h-12 w-12 rounded-xl text-xl font-black"
                                                onClick={() => setExtraCredits(p => p + 100)}
                                            >
                                                +
                                            </Button>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="font-extrabold text-xs uppercase tracking-widest text-zinc-400 pl-1">Motif</Label>
                                        <Input
                                            className="h-10 rounded-xl border-zinc-100 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 text-sm font-bold"
                                            value={creditReason}
                                            onChange={(e) => setCreditReason(e.target.value)}
                                            placeholder="Ex: Geste commercial"
                                        />
                                    </div>
                                    <Button
                                        className="w-full bg-amber-500 hover:bg-amber-600 text-white rounded-[20px] font-black h-12 shadow-lg shadow-amber-500/20"
                                        onClick={() => onAdjustCredits(extraCredits, creditReason)}
                                        disabled={extraCredits === 0 || !creditReason}
                                    >
                                        Appliquer l'ajustement
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    <Card className="rounded-[32px] border-none shadow-xl shadow-zinc-200/40 dark:shadow-none bg-white dark:bg-zinc-900 overflow-hidden">
                        <CardHeader className="p-8 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 bg-zinc-100 dark:bg-zinc-800 rounded-xl flex items-center justify-center text-zinc-500">
                                    <Clock className="h-5 w-5" />
                                </div>
                                <div>
                                    <CardTitle className="font-black tracking-tight text-xl">Métadonnées</CardTitle>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-8 pt-4 space-y-4">
                            <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="text-xs font-black text-zinc-400 uppercase">Créé le</span>
                                <span className="text-xs font-bold">{new Date(user.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center justify-between py-2 border-b border-zinc-100 dark:border-zinc-800">
                                <span className="text-xs font-black text-zinc-400 uppercase">Dernier accès</span>
                                <span className="text-xs font-bold">
                                    {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : "Jamais"}
                                </span>
                            </div>
                            <div className="flex items-center justify-between py-2">
                                <span className="text-xs font-black text-zinc-400 uppercase">ID Unique</span>
                                <span className="text-[10px] font-mono font-bold text-zinc-500">{user.id}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}
