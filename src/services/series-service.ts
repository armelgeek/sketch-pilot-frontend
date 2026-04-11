import { BaseService } from "./base-service";

export interface Series {
    id: string;
    userId: string;
    title: string;
    description?: string;
    globalContext?: string;
    characterRegistry?: Record<string, any>;
    previousEpisodesContext?: string;

    totalEpisodes?: string;
    lastEpisodeNumber?: number;
    status?: string;
    createdAt?: string;
    updatedAt?: string;
    language?: string;
    aspectRatio?: string;
    duration?: string;
    videoType?: string;
    videoGenre?: string;
    promptId?: string;
    visualStyleModelId?: string;
    plannedEpisodes?: { number: number; title: string; hook: string }[];
}

export interface CreateSeriesDTO {
    title: string;
    description?: string;
    globalContext?: string;
    characterRegistry?: Record<string, any>;

    totalEpisodes?: string;
    language?: string;
    aspectRatio?: string;
    duration?: string;
    videoType?: string;
    videoGenre?: string;
    promptId?: string;
    visualStyleModelId?: string;
    plannedEpisodes?: { number: number; title: string; hook: string }[];
}

export type UpdateSeriesDTO = Partial<CreateSeriesDTO>;


export class SeriesService extends BaseService<Series> {
    constructor() {
        super("/v1/series");
    }

    async getById(id: string): Promise<Series> {
        const response = await this.apiFetch<any>(`${this.endpoint}/${id}`);
        return response.data || response;
    }

    async getAll(): Promise<Series[]> {
        const response = await this.apiFetch<{ success: boolean; data: Series[] }>(this.endpoint);
        return response.data;
    }

    async findActive(): Promise<Series | null> {
        const response = await this.apiFetch<{ success: boolean; data: Series | null }>(`${this.endpoint}/active`);
        return response.data;
    }

    async create(data: CreateSeriesDTO): Promise<Series> {
        const response = await this.apiFetch<{ success: boolean; data: Series }>(this.endpoint, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response.data;
    }

    async update(id: string, data: UpdateSeriesDTO): Promise<Series> {
        const response = await this.apiFetch<{ success: boolean; data: Series }>(`${this.endpoint}/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
        return response.data;
    }

    async getEpisodes(id: string): Promise<any[]> {
        const response = await this.apiFetch<{ success: boolean; data: any[] }>(`${this.endpoint}/${id}/episodes`);
        return response.data;
    }

    async prepare(data: { title: string; description?: string; language?: string; promptId?: string }): Promise<{ globalContext: string; characterRegistry: Record<string, any>; videoGenre: string; totalEpisodes?: number; suggestedTitles?: string[]; suggestedEpisodes: any[] }> {
        const response = await this.apiFetch<any>(`${this.endpoint}/prepare`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response;
    }

    getPrepareStreamUrl(data: { title: string; description?: string; language?: string; promptId?: string; visualStyleModelId?: string }): string {
        const params = new URLSearchParams();
        params.append("title", data.title);
        if (data.description) params.append("description", data.description);
        if (data.language) params.append("language", data.language);
        if (data.promptId) params.append("promptId", data.promptId);
        if (data.visualStyleModelId) params.append("visualStyleModelId", data.visualStyleModelId);

        const baseUrl = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000") + "/api";
        return `${baseUrl}${this.endpoint}/prepare/stream?${params.toString()}`;
    }

    async suggestConcept(): Promise<{ success: boolean; title: string; videoGenre: string; description: string }> {
        const response = await this.apiFetch<any>(`${this.endpoint}/suggest-idea`);
        return response;
    }

    async regenerateCharacterImage(seriesId: string, characterName: string): Promise<{ success: boolean; thumbnailUrl?: string; error?: string }> {
        const response = await this.apiFetch<any>(
            `${this.endpoint}/${seriesId}/characters/${encodeURIComponent(characterName)}/regenerate-image`,
            { method: 'POST' }
        );
        return response;
    }

    async generateNextEpisode(id: string): Promise<{ success: boolean; jobId: string; videoId: string }> {
        const response = await this.apiFetch<any>(`${this.endpoint}/${id}/generate-next`, {
            method: "POST",
        });
        return response;
    }

    async promote(id: string, data: { type: 'character' | 'location', name: string, thumbnailUrl: string }): Promise<{ success: boolean }> {
        const response = await this.apiFetch<any>(`${this.endpoint}/${id}/promote`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response;
    }

    async delete(id: string): Promise<void> {
        await this.apiFetch<{ success: boolean }>(`${this.endpoint}/${id}`, {
            method: "DELETE",
        });
    }
}

export const seriesService = new SeriesService();
