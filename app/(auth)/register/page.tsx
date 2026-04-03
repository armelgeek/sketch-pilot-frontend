"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/src/components/ui/button";
import { Input } from "@/src/components/ui/input";
import { Label } from "@/src/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card";
import { Separator } from "@/src/components/ui/separator";
import { useSignUp } from "@/src/hooks/use-sign-up";

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: "", lastName: "", email: "", password: "" });
  const { loading, error, signUpWithEmail, signUpWithGoogle } = useSignUp({
    redirectTo: "/pricing"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await signUpWithEmail({
      email: form.email,
      password: form.password,
      name: `${form.firstName} ${form.lastName}`,
      firstName: form.firstName,
      lastName: form.lastName,
    });
  };

  return (
    <Card className="w-full max-w-2xl mx-4 bg-white rounded-2xl shadow-sm border border-zinc-100">
      <CardHeader className="text-center pb-4">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-zinc-900 text-white shadow-md text-lg mx-auto mb-3">✏️</div>
        <CardTitle className="text-2xl font-black tracking-tight text-zinc-900">Créer un compte</CardTitle>
        <CardDescription className="text-zinc-500 font-medium">Rejoignez Sketch Pilot et commencez à créer</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <button
          type="button"
          className="w-full flex items-center justify-center gap-2.5 rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-2.5 text-sm font-bold text-zinc-700 hover:bg-zinc-100 transition-colors disabled:opacity-50"
          onClick={signUpWithGoogle}
          disabled={loading}
        >
          <svg className="h-4 w-4" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
          </svg>
          Continuer avec Google
        </button>

        <div className="flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs text-zinc-400 font-medium">ou</span>
          <Separator className="flex-1" />
        </div>

        {error && (
          <div className="space-y-1 text-sm bg-red-50 border border-red-200 p-3 rounded-xl">
            <p className="font-bold text-red-700">{error.message}</p>
            {error.details && <p className="text-red-600 text-xs">{error.details}</p>}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="firstName" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Prénom</Label>
              <Input
                id="firstName"
                name="firstName"
                placeholder="Jean"
                value={form.firstName}
                onChange={handleChange}
                required
                disabled={loading}
                className="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Nom</Label>
              <Input
                id="lastName"
                name="lastName"
                placeholder="Dupont"
                value={form.lastName}
                onChange={handleChange}
                required
                disabled={loading}
                className="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Email</Label>
            <Input
              id="email"
              name="email"
              type="email"
              placeholder="vous@exemple.com"
              value={form.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Mot de passe</Label>
            <Input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={handleChange}
              required
              disabled={loading}
              minLength={8}
              className="rounded-xl border-zinc-200 bg-zinc-50 focus:bg-white"
            />
            <p className="text-xs text-zinc-400 font-medium">Minimum 8 caractères</p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-amber-500 px-6 py-2.5 text-sm font-bold text-white transition-all hover:bg-amber-600 active:scale-95 shadow-[0_4px_15px_-3px_rgba(245,158,11,0.4)] disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Création en cours..." : "Créer mon compte"}
          </button>
        </form>
      </CardContent>
      <CardFooter className="justify-center pt-0">
        <p className="text-sm text-zinc-500">
          Déjà un compte ?{" "}
          <Link href="/login" className="font-bold text-zinc-900 hover:text-amber-600 transition-colors">
            Se connecter
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
