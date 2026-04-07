"use client";

import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useSession, updateUser } from "@/src/lib/auth-client";
import { authClient } from "@/src/lib/auth-client";
import {
    User, Settings, LifeBuoy, Mail, ExternalLink, Loader2,
    Save, FileText, Compass, CheckCircle2, Camera, Lock, Trash2, Eye, EyeOff
} from "lucide-react";
import { cn } from "@/src/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/src/components/ui/avatar";
import Link from "next/link";

type TabType = "account" | "settings" | "help";

// ─────────────────────────────────────────────────────────────────────────────
// Delete Confirmation Modal
// ─────────────────────────────────────────────────────────────────────────────

function DeleteAccountModal({ email, onClose, onConfirm, loading }: {
    email: string;
    onClose: () => void;
    onConfirm: () => void;
    loading: boolean;
}) {
    const [inputEmail, setInputEmail] = useState("");
    const [inputWord, setInputWord] = useState("");
    const canDelete = inputEmail === email && inputWord === "SUPPRIMER";

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-2xl border border-rose-200 p-6 max-w-md w-full shadow-xl space-y-5 animate-in zoom-in-90 duration-200">
                <div>
                    <h3 className="text-lg font-bold text-rose-600">Supprimer mon compte</h3>
                    <p className="text-sm text-zinc-500 mt-1">
                        Cette action est irréversible. Toutes vos vidéos et personnages seront supprimés définitivement.
                    </p>
                </div>
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            Confirmez votre email
                        </label>
                        <input
                            type="email"
                            value={inputEmail}
                            onChange={(e) => setInputEmail(e.target.value)}
                            placeholder={email}
                            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">
                            Tapez <span className="font-black text-rose-600">SUPPRIMER</span> pour confirmer
                        </label>
                        <input
                            type="text"
                            value={inputWord}
                            onChange={(e) => setInputWord(e.target.value)}
                            placeholder="SUPPRIMER"
                            className="w-full px-3 py-2 border border-zinc-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-400 font-mono"
                        />
                    </div>
                </div>
                <div className="flex gap-3 pt-1">
                    <button
                        onClick={onClose}
                        className="flex-1 px-4 py-2 border border-zinc-200 rounded-lg text-sm font-medium text-zinc-600 hover:bg-zinc-50 transition-colors"
                    >
                        Annuler
                    </button>
                    <button
                        onClick={onConfirm}
                        disabled={!canDelete || loading}
                        className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                        Supprimer
                    </button>
                </div>
            </div>
        </div>
    );
}

// ─────────────────────────────────────────────────────────────────────────────
// Main Profile Content
// ─────────────────────────────────────────────────────────────────────────────

function ProfileContent() {
    const { data: session, isPending: sessionPending } = useSession();
    const searchParams = useSearchParams();

    const defaultTab = (searchParams.get("tab") as TabType) || "account";
    const [activeTab, setActiveTab] = useState<TabType>(defaultTab);

    // Profile Name
    const [name, setName] = useState("");
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // Photo
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [photoUploading, setPhotoUploading] = useState(false);
    const [photoUrl, setPhotoUrl] = useState<string | null>(null);

    // Change Password
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrentPw, setShowCurrentPw] = useState(false);
    const [showNewPw, setShowNewPw] = useState(false);
    const [pwSaving, setPwSaving] = useState(false);
    const [pwSuccess, setPwSuccess] = useState(false);
    const [pwError, setPwError] = useState<string | null>(null);

    // Delete Account
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleteLoading, setDeleteLoading] = useState(false);

    useEffect(() => {
        if (session?.user) {
            setName(session.user.name || "");
            setPhotoUrl(session.user.image || null);
        }
    }, [session?.user]);

    const handleTabChange = (tab: TabType) => {
        setActiveTab(tab);
        const params = new URLSearchParams(searchParams.toString());
        params.set("tab", tab);
        window.history.pushState(null, "", `?${params.toString()}`);
    };

    if (sessionPending) {
        return (
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        );
    }

    if (!session?.user) return null;

    const { user } = session;
    const userInitials = (user.name || user.email || "U")
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    const tabs = [
        { id: "account", label: "Mon profil", icon: User },
        { id: "settings", label: "Paramètres", icon: Settings },
        { id: "help", label: "Aide & Support", icon: LifeBuoy },
    ] as const;

    // ─── Handlers ─────────────────────────────────────────────────────────────

    const handleSaveName = async () => {
        if (name === user.name) return;
        setIsSaving(true);
        try {
            await updateUser({ name });
            setSaveSuccess(true);
            setTimeout(() => setSaveSuccess(false), 3000);
        } catch (e) { console.error("Failed to update profile", e); }
        setIsSaving(false);
    };

    const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Preview immediately
        const objectUrl = URL.createObjectURL(file);
        setPhotoUrl(objectUrl);
        setPhotoUploading(true);

        try {
            // Convert to base64 data URL (Better Auth accepts base64 images)
            const reader = new FileReader();
            reader.onload = async (ev) => {
                const dataUrl = ev.target?.result as string;
                await updateUser({ image: dataUrl });
                setPhotoUploading(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error("Photo upload failed", err);
            setPhotoUploading(false);
        }
    };

    const handleChangePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setPwError(null);
        if (newPassword !== confirmPassword) {
            setPwError("Les nouveaux mots de passe ne correspondent pas.");
            return;
        }
        if (newPassword.length < 8) {
            setPwError("Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }
        setPwSaving(true);
        try {
            await authClient.changePassword({ currentPassword, newPassword, revokeOtherSessions: false });
            setPwSuccess(true);
            setCurrentPassword("");
            setNewPassword("");
            setConfirmPassword("");
            setTimeout(() => setPwSuccess(false), 3000);
        } catch (err: any) {
            setPwError(err?.message || "Mot de passe actuel incorrect.");
        }
        setPwSaving(false);
    };

    const handleDeleteAccount = async () => {
        setDeleteLoading(true);
        try {
            await authClient.deleteUser({ callbackURL: "/" });
        } catch (err) {
            console.error("Delete account failed", err);
            setDeleteLoading(false);
        }
    };

    // ─── Render ───────────────────────────────────────────────────────────────

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">

            {showDeleteModal && (
                <DeleteAccountModal
                    email={user.email}
                    onClose={() => setShowDeleteModal(false)}
                    onConfirm={handleDeleteAccount}
                    loading={deleteLoading}
                />
            )}

            <div>
                <h1 className="text-2xl font-bold tracking-tight text-zinc-900">Préférences</h1>
                <p className="text-sm text-zinc-500 mt-1">Gérez vos informations personnelles, vos paramètres et trouvez de l'aide.</p>
            </div>

            {/* Tabs */}
            <div className="flex space-x-1 border-b border-zinc-200">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const isActive = activeTab === tab.id;
                    return (
                        <button
                            key={tab.id}
                            onClick={() => handleTabChange(tab.id)}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                                isActive
                                    ? "border-amber-500 text-amber-700"
                                    : "border-transparent text-zinc-500 hover:text-zinc-700 hover:border-zinc-300"
                            )}
                        >
                            <Icon className={cn("h-4 w-4", isActive ? "text-amber-500" : "text-zinc-400")} />
                            {tab.label}
                        </button>
                    );
                })}
            </div>

            {/* ── ACCOUNT TAB ── */}
            {activeTab === "account" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">

                    {/* Profile Card */}
                    <div className="bg-white border border-zinc-200 rounded-xl p-6 space-y-6">
                        <h3 className="text-lg font-semibold text-zinc-900">Informations du compte</h3>

                        <div className="flex flex-col sm:flex-row gap-8 items-start">
                            {/* Avatar with upload */}
                            <div className="flex flex-col items-center gap-3">
                                <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                    <Avatar className="h-24 w-24 rounded-2xl shadow-sm border border-zinc-100">
                                        <AvatarImage src={photoUrl || ""} alt={user.name || "User"} className="object-cover" />
                                        <AvatarFallback className="bg-zinc-100 text-2xl font-bold text-zinc-500 rounded-2xl">
                                            {userInitials}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div className="absolute inset-0 rounded-2xl bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        {photoUploading
                                            ? <Loader2 className="h-6 w-6 text-white animate-spin" />
                                            : <Camera className="h-6 w-6 text-white" />
                                        }
                                    </div>
                                </div>
                                <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoChange} />
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="text-xs font-semibold text-amber-600 hover:text-amber-700 transition-colors"
                                >
                                    Changer la photo
                                </button>
                            </div>

                            {/* Name & Email */}
                            <div className="flex-1 space-y-4 w-full">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Nom complet</label>
                                        <input
                                            type="text"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            placeholder="Votre nom complet"
                                            className="w-full px-3 py-2 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg text-sm text-zinc-900 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Email (Lecture seule)</label>
                                        <div className="relative">
                                            <input
                                                type="email"
                                                defaultValue={user.email}
                                                disabled
                                                className="w-full pl-9 pr-3 py-2 bg-zinc-50 border border-zinc-200 rounded-lg text-sm text-zinc-500 cursor-not-allowed"
                                            />
                                            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end gap-3 pt-2">
                                    {saveSuccess && (
                                        <span className="text-sm font-medium text-amber-600 flex items-center gap-1.5 animate-in fade-in duration-300">
                                            <CheckCircle2 className="h-4 w-4" /> Profil mis à jour
                                        </span>
                                    )}
                                    <button
                                        onClick={handleSaveName}
                                        disabled={isSaving || name === user.name}
                                        className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-sm"
                                    >
                                        {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                                        Enregistrer
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Change Password */}
                    <div className="bg-white border border-zinc-200 rounded-xl p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <Lock className="h-4 w-4 text-zinc-400" />
                            <h3 className="text-base font-semibold text-zinc-900">Changer le mot de passe</h3>
                        </div>

                        <form onSubmit={handleChangePassword} className="space-y-4 max-w-sm">
                            {pwError && (
                                <div className="text-sm bg-red-50 border border-red-200 p-3 rounded-lg">
                                    <p className="font-medium text-red-700">{pwError}</p>
                                </div>
                            )}
                            {pwSuccess && (
                                <div className="text-sm bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-center gap-2 text-amber-700 font-medium">
                                    <CheckCircle2 className="h-4 w-4" /> Mot de passe mis à jour !
                                </div>
                            )}

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Mot de passe actuel</label>
                                <div className="relative">
                                    <input
                                        type={showCurrentPw ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => setCurrentPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        className="w-full pr-10 px-3 py-2 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                                    />
                                    <button type="button" onClick={() => setShowCurrentPw(!showCurrentPw)} className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600">
                                        {showCurrentPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Nouveau mot de passe</label>
                                <div className="relative">
                                    <input
                                        type={showNewPw ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                        placeholder="••••••••"
                                        minLength={8}
                                        className="w-full pr-10 px-3 py-2 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                                    />
                                    <button type="button" onClick={() => setShowNewPw(!showNewPw)} className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600">
                                        {showNewPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Confirmer le nouveau mot de passe</label>
                                <input
                                    type="password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    placeholder="••••••••"
                                    className="w-full px-3 py-2 bg-white border border-zinc-200 hover:border-zinc-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-colors"
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
                                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
                                Mettre à jour le mot de passe
                            </button>
                        </form>
                    </div>

                    {/* Danger Zone */}
                    <div className="bg-white border border-rose-200 rounded-xl p-6">
                        <h3 className="text-base font-semibold text-rose-600 mb-2">Zone de danger</h3>
                        <p className="text-sm text-zinc-500 mb-4">
                            La suppression de votre compte effacera toutes vos vidéos et vos personnages générés de façon permanente.
                        </p>
                        <button
                            onClick={() => setShowDeleteModal(true)}
                            className="px-4 py-2 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                        >
                            <Trash2 className="h-4 w-4" />
                            Supprimer mon compte
                        </button>
                    </div>
                </div>
            )}

            {/* ── SETTINGS TAB ── */}
            {activeTab === "settings" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="bg-white border border-zinc-200 rounded-xl p-6">
                        <h3 className="text-lg font-semibold text-zinc-900 mb-1">Préférences de l'application</h3>
                        <p className="text-sm text-zinc-500 mb-6">Personnalisez votre expérience sur Sketch Pilot.</p>

                        <div className="space-y-6 divide-y divide-zinc-100">
                            <div className="flex items-center justify-between py-2">
                                <div>
                                    <p className="font-medium text-sm text-zinc-900">Langue de l'interface</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">Sélectionnez la langue d'affichage du tableau de bord.</p>
                                </div>
                                <select className="px-3 py-1.5 bg-white border border-zinc-200 rounded-lg text-sm text-zinc-700 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500">
                                    <option value="fr">Français</option>
                                    <option value="en" disabled>English (Bientôt)</option>
                                </select>
                            </div>

                            <div className="flex items-center justify-between pt-6">
                                <div>
                                    <p className="font-medium text-sm text-zinc-900">Thème visuel</p>
                                    <p className="text-xs text-zinc-500 mt-0.5">Sketch Pilot utilise le Light Mode par défaut pour l'esthétique "Tableau Blanc".</p>
                                </div>
                                <div className="px-3 py-1.5 bg-zinc-100 text-zinc-500 rounded-lg text-sm font-medium border border-zinc-200 cursor-not-allowed">
                                    Clair (Light)
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 shadow-sm">
                            <Save className="h-4 w-4" /> Enregistrer les paramètres
                        </button>
                    </div>
                </div>
            )}

            {/* ── HELP TAB ── */}
            {activeTab === "help" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-amber-300 hover:shadow-md transition-all group">
                            <div className="h-10 w-10 bg-amber-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Compass className="h-5 w-5 text-amber-600" />
                            </div>
                            <h3 className="font-semibold text-zinc-900 mb-2">Guide de démarrage</h3>
                            <p className="text-sm text-zinc-500 mb-4">Découvrez comment générer votre première vidéo de A à Z avec notre IA.</p>
                            <a href="https://sketchpilot.fr" target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-sm font-medium text-amber-600 hover:text-amber-700">
                                Lire le guide <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        </div>

                        <div className="bg-white border border-zinc-200 rounded-xl p-5 hover:border-zinc-300 hover:shadow-md transition-all group">
                            <div className="h-10 w-10 bg-zinc-50 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                                <Mail className="h-5 w-5 text-zinc-600" />
                            </div>
                            <h3 className="font-semibold text-zinc-900 mb-2">Contacter le support</h3>
                            <p className="text-sm text-zinc-500 mb-4">Un problème technique ? Une question sur votre facturation ? Nous sommes là.</p>
                            <a href="mailto:support@sketchpilot.com" className="inline-flex items-center gap-1 text-sm font-medium text-zinc-700 hover:text-amber-600 transition-colors">
                                support@sketchpilot.com <ExternalLink className="h-3.5 w-3.5" />
                            </a>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default function ProfilePage() {
    return (
        <Suspense fallback={
            <div className="min-h-[400px] flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-300" />
            </div>
        }>
            <ProfileContent />
        </Suspense>
    );
}
