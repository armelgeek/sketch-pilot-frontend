export const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000") + "/api";

export class BaseService<T> {
    protected endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    protected async apiFetch<R = T>(path: string, options?: RequestInit): Promise<R> {
        const headers: Record<string, string> = {};

        // Don't set Content-Type for FormData, browser will set it with boundary
        if (!(options?.body instanceof FormData)) {
            headers["Content-Type"] = "application/json";
        }

        const res = await fetch(`${BASE_URL}${path}`, {
            credentials: "include",
            headers: {
                ...headers,
                ...(options?.headers as any),
            },
            ...options,
        });
        if (!res.ok) {
            const errorData = await res.json().catch(() => ({ error: `API error: ${res.status}` }));
            const error = new Error(errorData.error || `API error: ${res.status}`);
            (error as any).status = res.status;
            throw error;
        }
        return res.json() as Promise<R>;
    }

    async getAll(): Promise<T[]> {
        return this.apiFetch<T[]>(this.endpoint);
    }

    async getById(id: string, refresh: boolean = false): Promise<T> {
        const path = refresh ? `${this.endpoint}/${id}?t=${Date.now()}` : `${this.endpoint}/${id}`;
        return this.apiFetch<T>(path);
    }

    async create(data: Partial<T>): Promise<T> {
        return this.apiFetch<T>(this.endpoint, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async update(id: string, data: Partial<T>): Promise<T> {
        return this.apiFetch<T>(`${this.endpoint}/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    async delete(id: string): Promise<void> {
        return this.apiFetch<void>(`${this.endpoint}/${id}`, {
            method: "DELETE",
        });
    }
}
