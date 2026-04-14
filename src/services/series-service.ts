import { BaseService } from "./base-service";

export interface Series {
    id: string;
    userId: string;
    title: string;
    description?: string;
    globalContext?: string;
    characterRegistry?: Record<string, any>;
    locationRegistry?: Record<string, any>;
    assetRegistry?: Record<string, any>;
    visualEvolution?: Record<string, any>;
    assetEvolution?: Record<string, any>;
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
    visualStyleGuide?: string;
    weatherState?: string;
    timeOfDay?: string;
    colorPalette?: string;
    cameraStyle?: string;
    plannedEpisodes?: { number: number; title: string; hook: string }[];
}

export interface CreateSeriesDTO {
    title: string;
    description?: string;
    globalContext?: string;
    characterRegistry?: Record<string, any>;
    locationRegistry?: Record<string, any>;
    visualStyleGuide?: string;

    totalEpisodes?: string;
    language?: string;
    aspectRatio?: string;
    duration?: string;
    videoType?: string;
    videoGenre?: string;
    promptId?: string;
    visualStyleModelId?: string;
    weatherState?: string;
    timeOfDay?: string;
    colorPalette?: string;
    cameraStyle?: string;
    plannedEpisodes?: { number: number; title: string; hook: string }[];
}

export type UpdateSeriesDTO = Partial<CreateSeriesDTO> & { status?: string };


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

    async prepare(data: { title: string; seriesId?: string; description?: string; language?: string; promptId?: string; visualStyleModelId?: string; videoGenre?: string; totalEpisodes?: number; skipPortraits?: boolean; aspectRatio?: string }): Promise<any> {
        const response = await this.apiFetch<any>(`${this.endpoint}/prepare`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return response;
    }

    getPrepareStreamUrl(data: { title: string; seriesId?: string; description?: string; language?: string; promptId?: string; visualStyleModelId?: string; videoGenre?: string; totalEpisodes?: number; skipPortraits?: boolean; roadmapOnly?: boolean; aspectRatio?: string }): string {
        const params = new URLSearchParams();
        params.append("title", data.title);
        if (data.seriesId) params.append("seriesId", data.seriesId);
        if (data.description) params.append("description", data.description);
        if (data.language) params.append("language", data.language);
        if (data.promptId) params.append("promptId", data.promptId);
        if (data.visualStyleModelId) params.append("visualStyleModelId", data.visualStyleModelId);
        if (data.videoGenre) params.append("videoGenre", data.videoGenre);
        if (data.totalEpisodes) params.append("totalEpisodes", data.totalEpisodes.toString());
        // @ts-ignore - planned parameter
        if (data.skipPortraits) params.append("skipPortraits", "true");
        if (data.roadmapOnly) params.append("roadmapOnly", "true");
        if (data.aspectRatio) params.append("aspectRatio", data.aspectRatio);

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

    async regenerateLocationImage(seriesId: string, locationName: string): Promise<{ success: boolean; thumbnailUrl?: string; error?: string }> {
        const response = await this.apiFetch<any>(
            `${this.endpoint}/${seriesId}/locations/${encodeURIComponent(locationName)}/regenerate-image`,
            { method: 'POST' }
        );
        return response;
    }

    async regenerateAssetImage(seriesId: string, assetName: string): Promise<{ success: boolean; thumbnailUrl?: string; error?: string }> {
        const response = await this.apiFetch<any>(
            `${this.endpoint}/${seriesId}/assets/${encodeURIComponent(assetName)}/regenerate-image`,
            { method: 'POST' }
        );
        return response;
    }

    async regenerateAllVisuals(seriesId: string): Promise<{ success: boolean; characterRegistry: any; locationRegistry: any; assetRegistry: any }> {
        const response = await this.apiFetch<any>(
            `${this.endpoint}/${seriesId}/regenerate-visuals`,
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

    async promote(id: string, data: { type: 'character' | 'location' | 'asset', name: string, thumbnailUrl: string }): Promise<{ success: boolean }> {
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
