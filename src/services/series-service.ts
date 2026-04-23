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
    const response = await this.apiFetch<{ success: boolean; data: Series[] }>(
      this.endpoint,
    );
    return response.data;
  }

  async findActive(): Promise<Series | null> {
    const response = await this.apiFetch<{
      success: boolean;
      data: Series | null;
    }>(`${this.endpoint}/active`);
    return response.data;
  }

  async create(data: CreateSeriesDTO): Promise<Series> {
    const response = await this.apiFetch<{ success: boolean; data: Series }>(
      this.endpoint,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    return response.data;
  }

  async update(id: string, data: UpdateSeriesDTO): Promise<Series> {
    const response = await this.apiFetch<{ success: boolean; data: Series }>(
      `${this.endpoint}/${id}`,
      {
        method: "PATCH",
        body: JSON.stringify(data),
      },
    );
    return response.data;
  }

  async getEpisodes(id: string): Promise<any[]> {
    const response = await this.apiFetch<{ success: boolean; data: any[] }>(
      `${this.endpoint}/${id}/episodes`,
    );
    return response.data;
  }

  async prepareDraft(data: {
    title: string;
    seriesId?: string;
    description?: string;
    language?: string;
    totalEpisodes?: number;
    referenceStyleImage?: string;
  }): Promise<{
    success: boolean;
    seriesId: string;
    intent: any;
    script: string;
    episodes: any[];
    error?: string;
    insufficientCredits?: boolean;
  }> {
    const response = await this.apiFetch<any>(
      `${this.endpoint}/prepare/draft`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    return response;
  }

  async prepareEnrich(
    id: string,
    script: string,
  ): Promise<{
    success: boolean;
    seriesId: string;
    characterRegistry: any;
    locationRegistry: any;
    atmosphere: any;
    error?: string;
    insufficientCredits?: boolean;
  }> {
    const response = await this.apiFetch<any>(
      `${this.endpoint}/${id}/prepare/enrich`,
      {
        method: "POST",
        body: JSON.stringify({ script }),
      },
    );
    return response;
  }

  async preparePortraits(
    id: string,
    characterModelId?: string,
  ): Promise<{
    success: boolean;
    seriesId: string;
    characterRegistry: any;
    error?: string;
    insufficientCredits?: boolean;
  }> {
    const response = await this.apiFetch<any>(
      `${this.endpoint}/${id}/prepare/portraits`,
      {
        method: "POST",
        body: JSON.stringify({ characterModelId }),
      },
    );
    return response;
  }

  async suggestConcept(): Promise<{
    success: boolean;
    title: string;
    videoGenre: string;
    description: string;
  }> {
    const response = await this.apiFetch<any>(`${this.endpoint}/suggest-idea`);
    return response;
  }

  async regenerateCharacterImage(
    id: string,
    characterName: string,
  ): Promise<{
    success: boolean;
    imageUrl?: string;
    thumbnailUrl?: string;
    error?: string;
    insufficientCredits?: boolean;
  }> {
    return this.apiFetch<any>(
      `${this.endpoint}/${id}/characters/${encodeURIComponent(characterName)}/regenerate-image`,
      {
        method: "POST",
      },
    );
  }

  async regenerateLocationImage(
    id: string,
    locationName: string,
  ): Promise<{
    success: boolean;
    imageUrl?: string;
    thumbnailUrl?: string;
    error?: string;
    insufficientCredits?: boolean;
  }> {
    return this.apiFetch<any>(
      `${this.endpoint}/${id}/locations/${encodeURIComponent(locationName)}/regenerate-image`,
      {
        method: "POST",
      },
    );
  }

  async regenerateAssetImage(
    id: string,
    assetName: string,
  ): Promise<{
    success: boolean;
    imageUrl?: string;
    thumbnailUrl?: string;
    error?: string;
    insufficientCredits?: boolean;
  }> {
    return this.apiFetch<any>(
      `${this.endpoint}/${id}/assets/${encodeURIComponent(assetName)}/regenerate-image`,
      {
        method: "POST",
      },
    );
  }

  async regenerateAllVisuals(seriesId: string): Promise<{
    success: boolean;
    characterRegistry: any;
    locationRegistry: any;
    assetRegistry: any;
  }> {
    const response = await this.apiFetch<any>(
      `${this.endpoint}/${seriesId}/regenerate-visuals`,
      { method: "POST" },
    );
    return response;
  }

  async generateNextEpisode(
    id: string,
  ): Promise<{ success: boolean; jobId: string; videoId: string }> {
    const response = await this.apiFetch<any>(
      `${this.endpoint}/${id}/generate-next`,
      {
        method: "POST",
      },
    );
    return response;
  }

  async promote(
    id: string,
    data: {
      type: "character" | "location" | "asset";
      name: string;
      thumbnailUrl: string;
    },
  ): Promise<{ success: boolean }> {
    const response = await this.apiFetch<any>(
      `${this.endpoint}/${id}/promote`,
      {
        method: "POST",
        body: JSON.stringify(data),
      },
    );
    return response;
  }

  async delete(id: string): Promise<void> {
    await this.apiFetch<{ success: boolean }>(`${this.endpoint}/${id}`, {
      method: "DELETE",
    });
  }
}

export const seriesService = new SeriesService();
