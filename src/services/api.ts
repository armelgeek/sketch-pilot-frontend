export interface Video {
  id: string;
  title: string;
  status: "completed" | "processing" | "failed" | "queued";
  genre: string;
  type: string;
  duration: string;
  createdAt: string;
  thumbnailUrl?: string;
}

export interface Credits {
  used: number;
  total: number;
  plan: string;
}

export interface BillingPlan {
  id: string;
  name: string;
  price: number;
  credits: number;
  features: string[];
}

const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "https://api.sketch-pilot.com";

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export const videosApi = {
  list: () => apiFetch<Video[]>("/videos"),
  get: (id: string) => apiFetch<Video>(`/videos/${id}`),
  create: (data: Partial<Video>) =>
    apiFetch<Video>("/videos", { method: "POST", body: JSON.stringify(data) }),
  delete: (id: string) => apiFetch<void>(`/videos/${id}`, { method: "DELETE" }),
};

export const billingApi = {
  getCredits: () => apiFetch<Credits>("/billing/credits"),
  getPlans: () => apiFetch<BillingPlan[]>("/billing/plans"),
};

export const configApi = {
  getGenres: () => apiFetch<string[]>("/config/genres"),
  getStyles: () => apiFetch<string[]>("/config/styles"),
};
