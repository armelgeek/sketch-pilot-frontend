import { BaseService } from "@/src/services/base-service";
import { PricingPlan, CreditPack } from "@/src/hooks/use-subscription";

class PricingAdminService extends BaseService<any> {
    constructor() {
        super("/v1/pricing");
    }

    async createPlan(data: Partial<PricingPlan>) {
        return this.apiFetch<any>("/v1/admin/pricing/plans", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async updatePlan(id: string, data: Partial<PricingPlan>) {
        return this.apiFetch<any>(`/v1/admin/pricing/plans/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    async deletePlan(id: string) {
        return this.apiFetch<void>(`/v1/admin/pricing/plans/${id}`, {
            method: "DELETE",
        });
    }

    async createPack(data: Partial<CreditPack>) {
        return this.apiFetch<any>("/v1/admin/pricing/packs", {
            method: "POST",
            body: JSON.stringify(data),
        });
    }

    async updatePack(id: string, data: Partial<CreditPack>) {
        return this.apiFetch<any>(`/v1/admin/pricing/packs/${id}`, {
            method: "PATCH",
            body: JSON.stringify(data),
        });
    }

    async deletePack(id: string) {
        return this.apiFetch<void>(`/v1/admin/pricing/packs/${id}`, {
            method: "DELETE",
        });
    }

    async getStripePrices() {
        return this.apiFetch<{ prices: any[] }>("/v1/admin/pricing/stripe/prices");
    }
}

export const pricingAdminService = new PricingAdminService();
