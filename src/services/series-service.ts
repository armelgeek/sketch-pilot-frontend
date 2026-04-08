import { BaseService } from "./base-service";
import { Video } from "./videos-service";

export interface Series {
    id: string;
    userId: string;
    title: string;
    description?: string;
    characterModelId?: string;
    promptId?: string;
    fullStory?: string;
    totalEpisodes?: number;
    secondaryCharacterIds?: string[];
    createdAt?: string;
    updatedAt?: string;
    videos?: Video[];
}

export class SeriesService extends BaseService<Series> {
    constructor() {
        super("/v1/series");
    }

    async getById(id: string): Promise<Series> {
        return this.apiFetch<Series>(`${this.endpoint}/${id}`);
    }

    async getAll(): Promise<Series[]> {
        const response = await this.apiFetch<{ data: Series[] }>(this.endpoint);
        return response.data || [];
    }

    async create(data: { title: string; description?: string; characterModelId?: string; promptId?: string; fullStory?: string; totalEpisodes?: number; secondaryCharacterIds?: string[] }): Promise<Series> {
        return this.apiFetch<Series>(this.endpoint, {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async updateSeries(id: string, data: Partial<Series>): Promise<Series> {
        return this.apiFetch<Series>(`${this.endpoint}/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    async deleteSeries(id: string): Promise<void> {
        return this.apiFetch<void>(`${this.endpoint}/${id}`, {
            method: "DELETE",
        });
    }
}

export const seriesService = new SeriesService();
