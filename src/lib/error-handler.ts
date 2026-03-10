export interface AppError {
  code: string;
  message: string;
  details?: string;
}

export function handleError(error: unknown): AppError {
  if (error instanceof TypeError && error.message.includes("Failed to fetch")) {
    return {
      code: "NETWORK_ERROR",
      message: "Erreur de connexion au serveur",
      details: "Impossible de se connecter. Vérifiez votre connexion internet ou réessayez plus tard.",
    };
  }

  if (error instanceof Error) {
    if (error.message.includes("CORS")) {
      return {
        code: "CORS_ERROR",
        message: "Erreur de configuration serveur",
        details: "La requête a été bloquée par des restrictions de sécurité.",
      };
    }

    if (error.message.includes("API error:")) {
      const statusMatch = error.message.match(/API error: (\d+)/);
      const status = statusMatch?.[1];

      if (status === "401") {
        return {
          code: "UNAUTHORIZED",
          message: "Identifiants invalides",
          details: "L'email ou le mot de passe est incorrect.",
        };
      }

      if (status === "429") {
        return {
          code: "RATE_LIMITED",
          message: "Trop de tentatives",
          details: "Vous avez essayé trop de fois. Patientez quelques minutes.",
        };
      }

      if (status === "500") {
        return {
          code: "SERVER_ERROR",
          message: "Erreur serveur",
          details: "Une erreur s'est produite sur le serveur. Réessayez plus tard.",
        };
      }

      return {
        code: "API_ERROR",
        message: "Erreur serveur",
        details: error.message,
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: "Une erreur s'est produite",
      details: error.message,
    };
  }

  return {
    code: "UNKNOWN_ERROR",
    message: "Une erreur inattendue s'est produite",
    details: "Réessayez ou contactez le support.",
  };
}
