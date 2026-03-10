import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "@/src/lib/auth-client";
import { handleError, type AppError } from "@/src/lib/error-handler";

interface UseSignInOptions {
  onSuccess?: () => void;
  onError?: (error: AppError) => void;
  redirectTo?: string;
}

export function useSignIn(options: UseSignInOptions = {}) {
  const router = useRouter();
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(false);
  const { onSuccess, onError, redirectTo = "/dashboard" } = options;

  const handleEmailSignIn = useCallback(
    async (email: string, password: string) => {
      setLoading(true);
      setError(null);

      try {
        await signIn.email(
          { email, password },
          {
            onSuccess: () => {
              setError(null);
              onSuccess?.();
              router.push(redirectTo);
            },
            onError: (ctx) => {
              const appError: AppError = {
                code: "AUTH_ERROR",
                message: ctx.error.message || "Erreur de connexion",
                details: "Vérifiez vos identifiants et réessayez.",
              };
              setError(appError);
              onError?.(appError);
            },
          }
        );
      } catch (err) {
        const appError = handleError(err);
        setError(appError);
        onError?.(appError);
        console.error("[SignIn Error]", { code: appError.code, message: appError.message, rawError: err });
      } finally {
        setLoading(false);
      }
    },
    [router, redirectTo, onSuccess, onError]
  );

  const handleGoogleSignIn = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      await signIn.social(
        { provider: "google" },
        {
          onError: (ctx) => {
            const appError: AppError = {
              code: "GOOGLE_AUTH_ERROR",
              message: ctx.error.message || "Erreur de connexion Google",
              details: "La connexion avec Google a échoué.",
            };
            setError(appError);
            onError?.(appError);
            setLoading(false);
          },
        }
      );
    } catch (err) {
      const appError = handleError(err);
      setError(appError);
      onError?.(appError);
      console.error("[Google SignIn Error]", { code: appError.code, message: appError.message, rawError: err });
      setLoading(false);
    }
  }, [onError]);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    clearError,
    signInWithEmail: handleEmailSignIn,
    signInWithGoogle: handleGoogleSignIn,
  };
}
