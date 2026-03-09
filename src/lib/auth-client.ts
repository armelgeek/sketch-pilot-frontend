import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "https://api.sketch-pilot.com",
});

export const { signIn, signUp, signOut, useSession } = authClient;
