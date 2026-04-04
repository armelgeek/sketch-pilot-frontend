import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { signUp, authClient } from "@/src/lib/auth-client";
import { handleError, type AppError } from "@/src/lib/error-handler";
import { useUtmStore } from "@/src/app/tracking";

interface UseSignUpOptions {
  onSuccess?: () => void;
  onError?: (error: AppError) => void;
  redirectTo?: string;
}

interface SignUpData {
  email: string;
  password: string;
  name: string;
  firstName?: string;
  lastName?: string;
  planId?: string;
  billingInterval?: "month" | "year";
}

export function useSignUp(options: UseSignUpOptions = {}) {
  const router = useRouter();
  const [error, setError] = useState<AppError | null>(null);
  const [loading, setLoading] = useState(false);
  const { onSuccess, onError, redirectTo = "/dashboard" } = options;

  const validatePassword = useCallback((password: string): AppError | null => {
    if (password.length < 8) {
      return {
        code: "INVALID_PASSWORD",
        message: "Mot de passe faible",
        details: "Le mot de passe doit contenir au moins 8 caractères.",
      };
    }
    return null;
  }, []);

  const handleEmailSignUp = useCallback(
    async (data: SignUpData) => {
      const validationError = validatePassword(data.password);
      if (validationError) {
        setError(validationError);
        onError?.(validationError);
        return;
      }

      setLoading(true);
      setError(null);

      const utmParams = useUtmStore.getState().utmParams;

      try {
        await signUp.email(
          {
            email: data.email,
            password: data.password,
            name: data.name,
            firstname: data.firstName || "",
            lastname: data.lastName || "",
            utmSource: utmParams.utmSource || "",
            utmMedium: utmParams.utmMedium || "",
            utmCampaign: utmParams.utmCampaign || "",
            utmTerm: utmParams.utmTerm || "",
            utmContent: utmParams.utmContent || "",
          },
          {
            onSuccess: async () => {
              setError(null);
              onSuccess?.();

              // Si un plan est sélectionné (et ce n'est pas le plan gratuit), rediriger vers Stripe
              if (data.planId && data.planId !== "plan_free") {
                try {
                  const priceId = data.billingInterval === "year"
                    ? "price_pro_year" // À adapter selon le plan
                    : "price_pro_month";

                  const { error: upgradeError } = await authClient.subscription.upgrade({
                    plan: data.planId,
                    annual: data.billingInterval === "year",
                    successUrl: `${window.location.origin}/dashboard`,
                    cancelUrl: `${window.location.origin}/register`,
                    disableRedirect: false,
                  });

                  if (upgradeError) {
                    console.error("Subscription upgrade error:", upgradeError);
                    router.push(redirectTo);
                  }
                } catch (err) {
                  console.error("Error initiating subscription:", err);
                  router.push(redirectTo);
                }
              } else {
                // Plan gratuit ou pas de plan sélectionné
                router.push(redirectTo);
              }
            },
            onError: (ctx) => {
              const appError: AppError = {
                code: "SIGNUP_ERROR",
                message: ctx.error.message || "Erreur d'inscription",
                details: "Vérifiez vos données et réessayez.",
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
        console.error("[SignUp Error]", { code: appError.code, message: appError.message, rawError: err });
      } finally {
        setLoading(false);
      }
    },
    [router, redirectTo, onSuccess, onError, validatePassword]
  );

  const handleGoogleSignUp = useCallback(async () => {
    setLoading(true);
    setError(null);
  }, []);

  const clearError = useCallback(() => setError(null), []);

  return {
    loading,
    error,
    clearError,
    signUpWithEmail: handleEmailSignUp,
    signUpWithGoogle: handleGoogleSignUp,
  };
}
