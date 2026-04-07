"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { authClient } from "@/src/lib/auth-client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { CheckCircle2, Loader2, Eye, EyeOff } from "lucide-react";

function ResetPasswordContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const token = searchParams.get("token");

    const [password, setPassword] = useState("");
    const [confirm, setConfirm] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [error, setError] = useState<string | null>(null);

    if (!token) {
        return (
            <Card className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-sm border border-zinc-100">
                <CardContent className="pt-8 pb-6 text-center space-y-3">
                    <p className="font-bold text-red-600">Lien invalide ou expiré.</p>
                    <Link href="/forgot-password" className="text-sm font-bold text-amber-600 hover:underline">
                        Demander un nouveau lien →
                    </Link>
                </CardContent>
            </Card>
        );
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            setError("Les mots de passe ne correspondent pas.");
            return;
        }
        if (password.length < 8) {
            setError("Le mot de passe doit contenir au moins 8 caractères.");
            return;
        }
        setLoading(true);
        setError(null);

        try {
            await authClient.resetPassword({ newPassword: password, token });
            setDone(true);
            setTimeout(() => router.push("/login"), 2500);
        } catch (err: any) {
            setError(err?.message || "Une erreur est survenue.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-sm border border-zinc-100">
            <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-zinc-900 text-white shadow-md text-lg mx-auto mb-3">✏️</div>
                <CardTitle className="text-2xl font-black tracking-tight text-zinc-900">Nouveau mot de passe</CardTitle>
                <CardDescription className="text-zinc-500 font-medium">Choisissez un nouveau mot de passe sécurisé.</CardDescription>
            </CardHeader>

            <CardContent>
                {done ? (
                    <div className="flex flex-col items-center gap-3 py-4 text-center">
                        <CheckCircle2 className="h-12 w-12 text-amber-500" />
                        <p className="font-bold text-zinc-900">Mot de passe mis à jour !</p>
                        <p className="text-sm text-zinc-500">Redirection vers la connexion...</p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="text-sm bg-red-50 border border-red-200 p-3 rounded-xl">
                                <p className="font-bold text-red-700">{error}</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Nouveau mot de passe</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    minLength={8}
                                    disabled={loading}
                                    className="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600"
                                    onClick={() => setShowPassword(!showPassword)}
                                    tabIndex={-1}
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="confirm" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Confirmer</Label>
                            <div className="relative">
                                <Input
                                    id="confirm"
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="••••••••"
                                    value={confirm}
                                    onChange={(e) => setConfirm(e.target.value)}
                                    required
                                    disabled={loading}
                                    className="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white pr-10"
                                />
                                <button
                                    type="button"
                                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-zinc-400 hover:text-zinc-600"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    tabIndex={-1}
                                >
                                    {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !password || !confirm}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-amber-600 active:scale-95 shadow-[0_4px_15px_-3px_rgba(245,158,11,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {loading ? "Mise à jour..." : "Réinitialiser le mot de passe"}
                        </button>
                    </form>
                )}
            </CardContent>

            <CardFooter className="justify-center pt-0">
                <Link href="/login" className="text-sm font-bold text-zinc-500 hover:text-amber-600 transition-colors">
                    ← Retour à la connexion
                </Link>
            </CardFooter>
        </Card>
    );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="animate-pulse h-96 rounded-2xl bg-zinc-100" />}>
            <ResetPasswordContent />
        </Suspense>
    );
}
