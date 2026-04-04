import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { characterModelsService, CharacterModel } from "../api/character-models-service";
import { AdminService } from "@/src/app/admin/api/admin-service";

const adminService = new AdminService();

export function usePersonalModels() {
    return useQuery({
        queryKey: ["personal-models"],
        queryFn: async () => {
            const res = await characterModelsService.getAll() as any;
            return (res.data || []) as CharacterModel[];
        },
    });
}

export function useBaseModels() {
    return useQuery({
        queryKey: ["base-models"],
        queryFn: () => characterModelsService.getBaseModels(),
        staleTime: 5 * 60 * 1000,
    });
}

export function useAvailableVoices() {
    return useQuery({
        queryKey: ["available-voices"],
        queryFn: async () => {
            const res = await adminService.listVoices();
            return res || [];
        },
    });
}

export function useSetDefaultCharacter() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => characterModelsService.setDefaultCharacter(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["personal-models"] });
            queryClient.invalidateQueries({ queryKey: ["auth-session"] }); // To refresh useSession if mapped
        },
    });
}

export function useCreateCharacter() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (data: Partial<CharacterModel>) => characterModelsService.createCharacter(data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["personal-models"] });
        },
    });
}

export function useUpdateCharacter() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: ({ id, data }: { id: string; data: Partial<CharacterModel> }) => characterModelsService.updateCharacter(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["personal-models"] });
        },
    });
}

export function useDeleteCharacter() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: (id: string) => characterModelsService.deleteCharacter(id),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["personal-models"] });
        },
    });
}
