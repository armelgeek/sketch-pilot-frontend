import { BaseService } from "./base-service";

export interface VideoScript {
    title?: string;
    description?: string;
    scenes: any[];
    totalDuration?: number;
    metadata?: any;
}

export interface VideoIdea {
    title: string;
    script: string;
}

export interface Video {
    id: string;
    topic: string;
    status: "draft" | "queued" | "processing" | "scenes_generated" | "narration_generated" | "completed" | "failed" | "cancelled";
    progress: number;
    currentStep?: string;
    jobId?: string;
    videoUrl?: string;
    thumbnailUrl?: string;
    script?: VideoScript;
    scenes?: any[];
    options?: any;
    characterModelId?: string;
    title?: string;
    createdAt?: string;
    created_at?: string;
}

export interface VideoGenerationOptions {
    videoType?: 'explainer' | 'story' | 'tutorial' | 'promo' | string;
    videoGenre?: 'educational' | 'fun' | 'business' | 'lifestyle' | string;
    language?: string;
    style?: 'sketch' | 'cartoon' | 'realistic' | 'minimal' | string;
    duration?: number;
    aspectRatio?: '16:9' | '9:16' | '1:1';
    kokoroVoicePreset?: string;
    musicVolume?: number;
    voiceVolume?: number;
    backgroundMusic?: string;
    promptId?: string;
    characterDescription?: string;
    [key: string]: any; // For any other options passed down
}

export interface ScriptGenerationResponse {
    topic: string;
    jobId?: string;
    videoId: string;
    script?: VideoScript;
    metadata: {
        sceneCount: number;
        estimatedDuration: number;
        language: string;
    };
}

export interface JobResponse {
    jobId: string;
    status: string;
    estimatedDuration?: number;
    creditsRequired?: number;
    message?: string;
    streamUrl?: string;
    videoId?: string;
}

export class VideosService extends BaseService<Video> {
    constructor() {
        super("/v1/videos");
    }

    async getById(id: string): Promise<Video> {
        const response = await this.apiFetch<any>(`${this.endpoint}/${id}`);
        return response.data || response.video || response;
    }

    async getAll(): Promise<Video[]> {
        const response = await this.apiFetch<{ data: Video[]; total: number; page: number; limit: number }>(
            this.endpoint
        );
        return response.data;
    }

    async suggestTopics(options: {
        language?: string;
        videoType?: string;
        videoGenre?: string;
        aspectRatio?: string;
        themeName?: string;
        themeDescription?: string;
        goals?: string[];
        duration?: number;
        characterDescription?: string;
        characterModelId?: string;
    }): Promise<{ topics: VideoIdea[] }> {
        return this.apiFetch<{ topics: VideoIdea[] }>(`${this.endpoint}/suggest-topics`, {
            method: "POST",
            body: JSON.stringify({ options }),
        });
    }

    async generateScriptFromTitle(title: string, options: {
        language?: string;
        duration?: number;
        aspectRatio?: string;
    } = {}): Promise<{ script: string }> {
        return this.apiFetch<{ script: string }>(`${this.endpoint}/generate-script-from-title`, {
            method: "POST",
            body: JSON.stringify({ title, options }),
        });
    }

    async generate(topic: string, options: any = {}): Promise<ScriptGenerationResponse> {
        return this.apiFetch<ScriptGenerationResponse>(`/v1/scripts/generate`, {
            method: "POST",
            body: JSON.stringify({ topic, options }),
        });
    }

    async generateScenes(id: string): Promise<JobResponse> {
        return this.apiFetch<JobResponse>(`${this.endpoint}/${id}/generate-scenes`, {
            method: "POST",
        });
    }

    async repromptScene(id: string, index: number, newPrompt?: string): Promise<JobResponse> {
        return this.apiFetch<JobResponse>(`${this.endpoint}/${id}/scenes/${index}/reprompt`, {
            method: "POST",
            body: JSON.stringify({ newPrompt }),
        });
    }

    async generateNarration(id: string): Promise<JobResponse> {
        return this.apiFetch<JobResponse>(`${this.endpoint}/${id}/narrate`, {
            method: "POST",
        });
    }

    async assemble(id: string, options: any = {}): Promise<JobResponse> {
        return this.apiFetch<JobResponse>(`${this.endpoint}/${id}/assemble`, {
            method: "POST",
            body: JSON.stringify({ options }),
        });
    }

    async getJobStatus(jobId: string): Promise<any> {
        return this.apiFetch<any>(`${this.endpoint}/jobs/${jobId}`);
    }

    async update(id: string, data: Partial<Video>): Promise<Video> {
        const response = await this.apiFetch<{ success: boolean; data: Video }>(`${this.endpoint}/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
        return response.data;
    }

    async generateThumbnail(videoId: string, options: {
        inspirationUrl?: string;
        characterId?: string;
        title: string;
    }): Promise<{ variations: string[]; creditsRequired: number }> {
        return this.apiFetch<any>(`${this.endpoint}/${videoId}/generate-thumbnail`, {
            method: "POST",
            body: JSON.stringify(options),
        });
    }

    async deleteVideo(id: string): Promise<{ success: boolean }> {
        return this.apiFetch<{ success: boolean }>(`${this.endpoint}/${id}`, {
            method: "DELETE",
        });
    }
}

export const videosService = new VideosService();
