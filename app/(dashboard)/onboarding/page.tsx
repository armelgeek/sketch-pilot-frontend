"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Sparkles } from "lucide-react";
import { useSession } from "@/src/lib/auth-client";

export default function OnboardingPage() {
  const router = useRouter();
  const { data: session } = useSession();

  useEffect(() => {
    if (session?.user?.id) {
      // Mark as onboarded in local storage just in case legacy checks exist
      localStorage.setItem(`sketch_pilot_onboarded_${session.user.id}`, "true");

      // Short delay for a "premium" feel of initialization
      const timer = setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [session, router]);

  return (
    <div className="min-h-screen bg-stone-50 flex flex-col items-center justify-center p-6 text-center space-y-8">
      <div className="relative">
        <div className="h-24 w-24 bg-white rounded-[2rem] shadow-xl shadow-stone-200 flex items-center justify-center animate-bounce">
          <span className="text-4xl">✏️</span>
        </div>
        <div className="absolute -top-2 -right-2 h-8 w-8 bg-stone-800 rounded-full flex items-center justify-center shadow-lg animate-in zoom-in-0 duration-500 delay-300">
          <Sparkles className="h-4 w-4 text-white fill-current" />
        </div>
      </div>

      <div className="space-y-3 animate-in fade-in slide-in-from-bottom-4 duration-1000">
        <h1 className="text-3xl font-black tracking-tight text-stone-800">
          Initialisation du Studio...
        </h1>
        <p className="text-stone-400 font-medium max-w-xs mx-auto leading-relaxed">
          Préparation de vos outils de création personnalisés.
        </p>
      </div>

      <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full border border-stone-200 shadow-sm animate-in fade-in zoom-in-90 duration-1000 delay-500">
        <Loader2 className="h-4 w-4 animate-spin text-stone-400" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
          Chargement de votre environnement
        </span>
      </div>
    </div>
  );
}
