"use client";

import { useState } from "react";
import Link from "next/link";
import { authClient } from "@/src/lib/auth-client";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { CheckCircle2, Loader2 } from "lucide-react";

export default function ForgotPasswordPage() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Better Auth: requestPasswordReset
            await authClient.requestPasswordReset({
                email,
                redirectTo: `${window.location.origin}/reset-password`,
            });
            setSent(true);
        } catch (err: any) {
            setError(err?.message || "Une erreur est survenue. Veuillez réessayer.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Card className="w-full max-w-sm mx-4 bg-white rounded-2xl shadow-sm border border-zinc-100">
            <CardHeader className="text-center pb-4">
                <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-zinc-900 text-white shadow-md text-lg mx-auto mb-3">✏️</div>
                <CardTitle className="text-2xl font-black tracking-tight text-zinc-900">Mot de passe oublié</CardTitle>
                <CardDescription className="text-zinc-500 font-medium">
                    Saisissez votre email et nous vous enverrons un lien de réinitialisation.
                </CardDescription>
            </CardHeader>

            <CardContent className="space-y-4">
                {sent ? (
                    <div className="flex flex-col items-center gap-3 py-4 text-center">
                        <CheckCircle2 className="h-12 w-12 text-amber-500" />
                        <p className="font-bold text-zinc-900">Email envoyé !</p>
                        <p className="text-sm text-zinc-500">
                            Vérifiez votre boîte de réception à <strong>{email}</strong> et cliquez sur le lien.
                        </p>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {error && (
                            <div className="text-sm bg-red-50 border border-red-200 p-3 rounded-xl">
                                <p className="font-bold text-red-700">{error}</p>
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="vous@exemple.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={loading}
                                className="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || !email}
                            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-amber-600 active:scale-95 shadow-[0_4px_15px_-3px_rgba(245,158,11,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                            {loading ? "Envoi en cours..." : "Envoyer le lien"}
                        </button>
                    </form>
                )}
            </CardContent>

            <CardFooter className="justify-center pt-0">
                <p className="text-sm text-zinc-500">
                    <Link href="/login" className="font-bold text-zinc-900 hover:text-amber-600 transition-colors">
                        ← Retour à la connexion
                    </Link>
                </p>
            </CardFooter>
        </Card>
    );
}
