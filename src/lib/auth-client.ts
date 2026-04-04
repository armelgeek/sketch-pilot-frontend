import { createAuthClient } from "better-auth/react";
import { stripeClient } from "@better-auth/stripe/client"
import { inferAdditionalFields } from "better-auth/client/plugins";
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  basePath: "/api/auth",
  plugins: [
    stripeClient({
      subscription: true
    }),
    inferAdditionalFields({
      user: {
        firstname: { type: 'string' },
        lastname: { type: 'string' },
        utmSource: { type: 'string' },
        utmMedium: { type: 'string' },
        utmCampaign: { type: 'string' },
        utmTerm: { type: 'string' },
        utmContent: { type: 'string' },
        defaultCharacterId: { type: 'string' },
        defaultPromptId: { type: 'string' },
        language: { type: 'string' },
      }
    })
  ]
});

export const { signIn, signUp, signOut, useSession, updateUser } = authClient;
