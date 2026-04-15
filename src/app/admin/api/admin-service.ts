
import { BaseService } from "@/src/services/base-service";
import { AdminUser, AdminVideo, AdminStats, VoicePreset, MusicTrack } from "../schema";

export class AdminService extends BaseService<any> {
    constructor() {
        super("/v1/admin");
    }

    // --- Users ---
    async getUser(id: string): Promise<AdminUser> {
        const res = await this.apiFetch<any>(`${this.endpoint}/users/${id}`);
        return res.data;
    }

    async listUsers(params: { page?: number; limit?: number; search?: string; role?: string }): Promise<{
        data: AdminUser[];
        total: number;
        page: number;
        limit: number;
    }> {
        const query = new URLSearchParams();
        if (params.page) query.append("page", params.page.toString());
        if (params.limit) query.append("limit", params.limit.toString());
        if (params.search) query.append("search", params.search);
        if (params.role) query.append("role", params.role);

        const res = await this.apiFetch<any>(`${this.endpoint}/users?${query.toString()}`);
        // Response is { success, data: { users, total, page, limit } }
        return {
            data: res.data.users,
            total: res.data.total,
            page: res.data.page,
            limit: res.data.limit
        };
    }

    async banUser(id: string, reason?: string, expiresAt?: string): Promise<void> {
        await this.apiFetch(`${this.endpoint}/users/${id}/ban`, {
            method: "PATCH",
            body: JSON.stringify({ reason, expiresAt }),
        });
    }

    async unbanUser(id: string): Promise<void> {
        await this.apiFetch(`${this.endpoint}/users/${id}/unban`, {
            method: "PATCH",
        });
    }

    async adjustCredits(id: string, extraCredits: number, reason?: string): Promise<void> {
        await this.apiFetch(`${this.endpoint}/users/${id}/credits`, {
            method: "PATCH",
            body: JSON.stringify({ extraCredits, reason }),
        });
    }

    async updateUser(id: string, data: Partial<AdminUser>): Promise<AdminUser> {
        const res = await this.apiFetch<any>(`${this.endpoint}/users/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
        return res.data;
    }

    // --- Videos ---
    async getVideo(id: string): Promise<AdminVideo> {
        const res = await this.apiFetch<any>(`${this.endpoint}/videos/${id}`);
        return res.data;
    }

    async listVideos(params: { page?: number; limit?: number; status?: string; search?: string; userId?: string }): Promise<{
        data: AdminVideo[];
        total: number;
        page: number;
        limit: number;
    }> {
        const query = new URLSearchParams();
        if (params.page) query.append("page", params.page.toString());
        if (params.limit) query.append("limit", params.limit.toString());
        if (params.status) query.append("status", params.status);
        if (params.search) query.append("search", params.search);
        if (params.userId) query.append("userId", params.userId);

        const res = await this.apiFetch<any>(`${this.endpoint}/videos?${query.toString()}`);
        return {
            data: res.data.videos || res.data,
            total: res.data.total,
            page: res.data.page,
            limit: res.data.limit
        };
    }

    async deleteVideo(id: string): Promise<void> {
        await this.apiFetch(`${this.endpoint}/videos/${id}`, {
            method: "DELETE",
        });
    }

    // --- Stats ---
    async getStats(): Promise<AdminStats> {
        const res = await this.apiFetch<any>(`${this.endpoint}/stats`);
        return res.data;
    }

    // --- Config / Assets ---
    async listVoices(): Promise<VoicePreset[]> {
        const res = await this.apiFetch<any>(`${this.endpoint}/config/voices`);
        return res.data;
    }

    /** Public endpoint — safe for non-admin users at /api/v1/config/voices */
    async listPublicVoices(): Promise<VoicePreset[]> {
        try {
            const res = await this.apiFetch<any>(`/v1/config/voices`);
            if (res.voices) {
                // Flatten the grouped object { providerName: VoicePreset[] } into a single array
                return Object.values(res.voices).flat() as VoicePreset[];
            }
            return res.data || [];
        } catch {
            // Fallback: try the admin route (works for admin users)
            try {
                return await this.listVoices();
            } catch {
                return [];
            }
        }
    }

    async createVoice(data: Partial<VoicePreset>): Promise<VoicePreset> {
        const res = await this.apiFetch<any>(`${this.endpoint}/config/voices`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return res.data;
    }

    async updateVoice(id: string, data: Partial<VoicePreset>): Promise<VoicePreset> {
        const res = await this.apiFetch<any>(`${this.endpoint}/config/voices/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
        return res.data;
    }

    async deleteVoice(id: string): Promise<void> {
        await this.apiFetch(`${this.endpoint}/config/voices/${id}`, {
            method: "DELETE",
        });
    }

    async listMusic(): Promise<MusicTrack[]> {
        const res = await this.apiFetch<any>(`${this.endpoint}/config/music`);
        return res.data;
    }

    /** Public endpoint — safe for non-admin users at /api/v1/config/music */
    async listPublicMusic(): Promise<MusicTrack[]> {
        try {
            const res = await this.apiFetch<any>(`/v1/config/music`);
            return res.music || res.data || [];
        } catch {
            // Fallback: try the admin route (works for admin users)
            try {
                return await this.listMusic();
            } catch {
                return [];
            }
        }
    }


    async createMusic(data: Partial<MusicTrack>): Promise<MusicTrack> {
        const res = await this.apiFetch<any>(`${this.endpoint}/config/music`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return res.data;
    }

    async updateMusic(id: string, data: Partial<MusicTrack>): Promise<MusicTrack> {
        const res = await this.apiFetch<any>(`${this.endpoint}/config/music/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
        return res.data;
    }

    async deleteMusic(id: string): Promise<void> {
        await this.apiFetch(`${this.endpoint}/config/music/${id}`, {
            method: "DELETE",
        });
    }

    // --- Prompts ---
    async listPrompts(params: { page?: number; limit?: number; isActive?: boolean; search?: string }): Promise<{
        data: any[];
        total: number;
    }> {
        const query = new URLSearchParams();
        if (params.page) query.append("page", params.page.toString());
        if (params.limit) query.append("limit", params.limit.toString());
        if (params.isActive !== undefined) query.append("isActive", params.isActive.toString());
        if (params.search) query.append("search", params.search);

        const res = await this.apiFetch<any>(`${this.endpoint}/prompts?${query.toString()}`);
        return {
            data: res.data,
            total: res.total
        };
    }

    async listPublicPrompts(params: { page?: number; limit?: number; search?: string }): Promise<{
        data: any[];
        total: number;
    }> {
        const query = new URLSearchParams();
        if (params.page) query.append("page", params.page.toString());
        if (params.limit) query.append("limit", params.limit.toString());
        if (params.search) query.append("search", params.search);

        // Public prompts are at /v1/prompts, not /v1/admin/prompts
        const res = await this.apiFetch<any>(`/v1/prompts?${query.toString()}`);
        return {
            data: res.data,
            total: res.total
        };
    }

    async createPrompt(data: any): Promise<any> {
        const res = await this.apiFetch<any>(`${this.endpoint}/prompts`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return res.data;
    }

    async updatePrompt(id: string, data: any): Promise<any> {
        const res = await this.apiFetch<any>(`${this.endpoint}/prompts/${id}`, {
            method: "PUT",
            body: JSON.stringify(data),
        });
        return res.data;
    }

    async deletePrompt(id: string): Promise<void> {
        await this.apiFetch(`${this.endpoint}/prompts/${id}`, {
            method: "DELETE",
        });
    }

    // --- General Assets ---
    async uploadAsset(file: File, type: 'voice' | 'music'): Promise<string> {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("type", type);

        const res = await this.apiFetch<any>(`${this.endpoint}/config/upload`, {
            method: "POST",
            body: formData,
        });
        return res.url;
    }

    // --- Character Models ---
    async listModels(params?: { page?: number; limit?: number; search?: string }): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }> {
        const query = new URLSearchParams();
        if (params?.page) query.append("page", params.page.toString());
        if (params?.limit) query.append("limit", params.limit.toString());
        if (params?.search) query.append("search", params.search);

        const res = await this.apiFetch<any>(`/v1/characters?${query.toString()}`);
        return {
            data: res.data || [],
            total: res.total || res.data?.length || 0,
            page: res.page || 1,
            limit: res.limit || 10
        };
    }

    async listStandardModels(params?: { page?: number; limit?: number; search?: string }): Promise<{
        data: any[];
        total: number;
        page: number;
        limit: number;
    }> {
        const query = new URLSearchParams();
        if (params?.page) query.append("page", params.page.toString());
        if (params?.limit) query.append("limit", params.limit.toString());
        if (params?.search) query.append("search", params.search);

        const res = await this.apiFetch<any>(`/v1/character-models?${query.toString()}`);
        return {
            data: res.data || [],
            total: res.total || res.data?.length || 0,
            page: res.page || 1,
            limit: res.limit || 10
        };
    }

    async createModel(data: any): Promise<any> {
        return this.apiFetch<any>("/v1/characters", {
            method: "POST",
            body: data instanceof FormData ? data : JSON.stringify(data),
        });
    }

    async generateCharacterImage(baseModelId: string, prompt: string, options: { visualStyleGuide?: string, visualStyleDNA?: string, seriesThumbnailUrl?: string } = {}): Promise<{ success: boolean; imageUrl?: string; thumbnailUrl?: string; creditsRequired?: number; error?: string; insufficientCredits?: boolean }> {
        return this.apiFetch<any>("/v1/characters/generate", {
            method: "POST",
            body: JSON.stringify({ baseModelId, prompt, ...options }),
        });
    }

    async updateModel(id: string, data: any): Promise<any> {
        return this.apiFetch<any>(`/v1/characters/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    async deleteModel(id: string): Promise<void> {
        await this.apiFetch(`/v1/characters/${id}`, {
            method: "DELETE",
        });
    }

    // --- Thumbnail Templates ---
    async listThumbnailTemplates(params?: { page?: number; limit?: number; niche?: string; search?: string }): Promise<{
        data: any[];
        total: number;
    }> {
        const query = new URLSearchParams();
        if (params?.page) query.append("page", params.page.toString());
        if (params?.limit) query.append("limit", params.limit.toString());
        if (params?.niche) query.append("niche", params.niche);
        if (params?.search) query.append("search", params.search);

        const res = await this.apiFetch<any>(`${this.endpoint}/config/thumbnail-templates?${query.toString()}`);
        return {
            data: res.data || [],
            total: res.total || 0,
        };
    }

    async createThumbnailTemplate(data: any): Promise<any> {
        const res = await this.apiFetch<any>(`${this.endpoint}/config/thumbnail-templates`, {
            method: "POST",
            body: JSON.stringify(data),
        });
        return res.data;
    }

    async updateThumbnailTemplate(id: string, data: any): Promise<any> {
        const res = await this.apiFetch<any>(`${this.endpoint}/config/thumbnail-templates/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
        return res.data;
    }

    async deleteThumbnailTemplate(id: string): Promise<void> {
        await this.apiFetch(`${this.endpoint}/config/thumbnail-templates/${id}`, {
            method: "DELETE",
        });
    }
}
