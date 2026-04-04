import { BaseService } from "@/src/services/base-service";

class UsersService extends BaseService<any> {
    constructor() {
        super("/v1/users");
    }

    async updateMe(data: { niche?: string; defaultCharacterId?: string }) {
        const response = await this.apiFetch<any>(`${this.endpoint}/me`, {
            method: "PATCH",
            body: JSON.stringify(data)
        });
        return response;
    }
}

export const usersService = new UsersService();
