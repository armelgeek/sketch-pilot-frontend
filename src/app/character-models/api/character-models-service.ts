import { BaseService } from "@/src/services/base-service";
import { usersService } from "@/src/services/users-service";

export interface CharacterModel {
    id: string;
    name: string;
    description?: string;
    gender?: string;
    age?: string;
    voiceId?: string;
    isStandard?: string;
    stylePrefix?: string;
    artistPersona?: string;
    images?: string[];
    userId?: string;
    createdAt?: string;
    updatedAt?: string;
}

class CharacterModelsService extends BaseService<CharacterModel> {
    constructor() {
        super("/v1/characters");
    }

    // Fetch base models (public templates)
    async getBaseModels(): Promise<CharacterModel[]> {
        const res = await this.apiFetch<any>("/v1/characters?isPublic=true");
        return res.data;
    }

    // Create a new character model
    async createCharacter(data: Partial<CharacterModel>): Promise<CharacterModel> {
        return this.create(data);
    }

    // Update an existing character model
    async updateCharacter(id: string, data: Partial<CharacterModel>): Promise<CharacterModel> {
        return this.update(id, data);
    }

    // Delete a character model
    async deleteCharacter(id: string): Promise<void> {
        return this.delete(id);
    }

    // Set as default character (calls the user endpoint)
    async setDefaultCharacter(id: string): Promise<void> {
        await usersService.updateMe({ defaultCharacterId: id });
    }
}

export const characterModelsService = new CharacterModelsService();
