const BASE_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000") + "/api";

export class BaseService<T> {
    protected endpoint: string;

    constructor(endpoint: string) {
        this.endpoint = endpoint;
    }

    protected async apiFetch<R = T>(path: string, options?: RequestInit): Promise<R> {
        const res = await fetch(`${BASE_URL}${path}`, {
            credentials: "include",
            headers: { "Content-Type": "application/json" },
            ...options,
        });
        if (!res.ok) {
            const error = await res.json().catch(() => ({ error: `API error: ${res.status}` }));
            throw new Error(error.error || `API error: ${res.status}`);
        }
        return res.json() as Promise<R>;
    }

    async getAll(): Promise<T[]> {
        return this.apiFetch<T[]>(this.endpoint);
    }

    async getById(id: string): Promise<T> {
        return this.apiFetch<T>(`${this.endpoint}/${id}`);
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
