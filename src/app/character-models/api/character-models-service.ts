import { BaseService } from "@/src/services/base-service";

export interface GenerationVariant {
    id: string;
    imageUrl: string;
    seedUsed?: number;
    generatedAt?: string;
    promptUsed?: string;
}

export interface CharacterModel {
    id: string;
    name: string;
    imageUrl: string;
    description: string;
    userId: string | null;
    isStandard: boolean;
    voiceId?: string | null;
    tags?: string[];
    lockedPromptSegment?: string;
    advancedSeed?: number;
    generationHistory?: GenerationVariant[];
    createdAt?: string;
    updatedAt?: string;
}

export class CharacterModelsService extends BaseService<CharacterModel> {
    constructor() {
        super("/character-models");
    }

    async savePersonal(data: {
        name: string;
        imageUrl: string;
        description: string;
        voiceId?: string;
        tags?: string[];
        lockedPromptSegment?: string;
    }) {
        const res = await this.apiFetch<{ success: boolean; data: CharacterModel }>(
            `${this.endpoint}/personal`,
            {
                method: "POST",
                body: JSON.stringify(data),
            }
        );
        return res.data;
    }

    async updatePersonal(id: string, data: Partial<CharacterModel>) {
        const res = await this.apiFetch<{ success: boolean; data: CharacterModel }>(
            `${this.endpoint}/personal/${id}`,
            {
                method: "PATCH",
                body: JSON.stringify(data),
            }
        );
        return res.data;
    }

    async deletePersonal(id: string) {
        await this.apiFetch(`${this.endpoint}/personal/${id}`, {
            method: "DELETE",
        });
    }

    async getPersonal() {
        const res = await this.apiFetch<{ success: boolean; data: CharacterModel[] }>(
            `${this.endpoint}/personal`
        );
        return res.data;
    }

    async addGenerationVariant(modelId: string, variant: Omit<GenerationVariant, 'id' | 'generatedAt'>) {
        const res = await this.apiFetch<{ success: boolean; data: CharacterModel }>(
            `${this.endpoint}/personal/${modelId}/variants`,
            {
                method: "POST",
                body: JSON.stringify(variant),
            }
        );
        return res.data;
    }

    async addTag(modelId: string, tag: string) {
        const res = await this.apiFetch<{ success: boolean; data: CharacterModel }>(
            `${this.endpoint}/personal/${modelId}/tags`,
            {
                method: "POST",
                body: JSON.stringify({ tag }),
            }
        );
        return res.data;
    }

    async removeTag(modelId: string, tag: string) {
        const res = await this.apiFetch<{ success: boolean; data: CharacterModel }>(
            `${this.endpoint}/personal/${modelId}/tags/${tag}`,
            {
                method: "DELETE",
            }
        );
        return res.data;
    }
}
