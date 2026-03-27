import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AdminService } from "../api/admin-service";
import { useAdminStore } from "../store";

const adminService = new AdminService();

export const adminKeys = {
    all: ["admin"] as const,
    stats: () => [...adminKeys.all, "stats"] as const,
    users: (filters: any) => [...adminKeys.all, "users", filters] as const,
    videos: (filters: any) => [...adminKeys.all, "videos", filters] as const,
    voices: () => [...adminKeys.all, "voices"] as const,
    music: () => [...adminKeys.all, "music"] as const,
    prompts: (filters: any) => [...adminKeys.all, "prompts", filters] as const,
    models: (filters: any = {}) => [...adminKeys.all, "models", filters] as const,
};

export function useAdminActions() {
    const queryClient = useQueryClient();
    const { updateUserInStore, removeVideoFromStore } = useAdminStore();

    const banMutation = useMutation({
        mutationFn: ({ id, reason, expiresAt }: { id: string; reason?: string; expiresAt?: string }) =>
            adminService.banUser(id, reason, expiresAt),
        onSuccess: (_, { id }) => {
            updateUserInStore(id, { banned: true });
            queryClient.invalidateQueries({ queryKey: adminKeys.all });
        },
    });

    const unbanMutation = useMutation({
        mutationFn: (id: string) => adminService.unbanUser(id),
        onSuccess: (_, id) => {
            updateUserInStore(id, { banned: false });
            queryClient.invalidateQueries({ queryKey: adminKeys.all });
        },
    });

    const adjustCreditsMutation = useMutation({
        mutationFn: ({ id, extraCredits, reason }: { id: string; extraCredits: number; reason?: string }) =>
            adminService.adjustCredits(id, extraCredits, reason),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: adminKeys.all });
        },
    });

    const deleteVideoMutation = useMutation({
        mutationFn: (id: string) => adminService.deleteVideo(id),
        onSuccess: (_, id) => {
            removeVideoFromStore(id);
            queryClient.invalidateQueries({ queryKey: adminKeys.videos({}) });
            queryClient.invalidateQueries({ queryKey: adminKeys.stats() });
        },
    });

    // --- Voice Mutations ---
    const createVoiceMutation = useMutation({
        mutationFn: (data: any) => adminService.createVoice(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.voices() }),
    });

    const updateVoiceMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminService.updateVoice(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.voices() }),
    });

    const deleteVoiceMutation = useMutation({
        mutationFn: (id: string) => adminService.deleteVoice(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.voices() }),
    });

    // --- Music Mutations ---
    const createMusicMutation = useMutation({
        mutationFn: (data: any) => adminService.createMusic(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.music() }),
    });

    const updateMusicMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminService.updateMusic(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.music() }),
    });

    const deleteMusicMutation = useMutation({
        mutationFn: (id: string) => adminService.deleteMusic(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.music() }),
    });

    // --- Prompt Mutations ---
    const createPromptMutation = useMutation({
        mutationFn: (data: any) => adminService.createPrompt(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.prompts({}) }),
    });

    const updatePromptMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminService.updatePrompt(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.prompts({}) }),
    });

    const deletePromptMutation = useMutation({
        mutationFn: (id: string) => adminService.deletePrompt(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.prompts({}) }),
    });

    // --- Model Mutations ---
    const createModelMutation = useMutation({
        mutationFn: (data: any) => adminService.createModel(data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.models() }),
    });

    const updateModelMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminService.updateModel(id, data),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.models() }),
    });

    const deleteModelMutation = useMutation({
        mutationFn: (id: string) => adminService.deleteModel(id),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: adminKeys.models() }),
    });

    const uploadAssetMutation = useMutation({
        mutationFn: ({ file, type }: { file: File; type: 'voice' | 'music' }) =>
            adminService.uploadAsset(file, type),
    });

    const updateUserMutation = useMutation({
        mutationFn: ({ id, data }: { id: string; data: any }) => adminService.updateUser(id, data),
        onSuccess: (_, { id }) => {
            queryClient.invalidateQueries({ queryKey: adminKeys.all });
        },
    });

    return {
        banUser: banMutation.mutateAsync,
        unbanUser: unbanMutation.mutateAsync,
        adjustCredits: adjustCreditsMutation.mutateAsync,
        updateUser: updateUserMutation.mutateAsync,
        deleteVideo: deleteVideoMutation.mutateAsync,
        createVoice: createVoiceMutation.mutateAsync,
        updateVoice: updateVoiceMutation.mutateAsync,
        deleteVoice: deleteVoiceMutation.mutateAsync,
        createMusic: createMusicMutation.mutateAsync,
        updateMusic: updateMusicMutation.mutateAsync,
        deleteMusic: deleteMusicMutation.mutateAsync,
        createPrompt: createPromptMutation.mutateAsync,
        updatePrompt: updatePromptMutation.mutateAsync,
        deletePrompt: deletePromptMutation.mutateAsync,
        createModel: createModelMutation.mutateAsync,
        updateModel: updateModelMutation.mutateAsync,
        deleteModel: deleteModelMutation.mutateAsync,
        uploadAsset: uploadAssetMutation.mutateAsync,
        isPending:
            banMutation.isPending ||
            unbanMutation.isPending ||
            adjustCreditsMutation.isPending ||
            updateUserMutation.isPending ||
            deleteVideoMutation.isPending ||
            createVoiceMutation.isPending ||
            updateVoiceMutation.isPending ||
            deleteVoiceMutation.isPending ||
            createMusicMutation.isPending ||
            updateMusicMutation.isPending ||
            deleteMusicMutation.isPending ||
            createPromptMutation.isPending ||
            updatePromptMutation.isPending ||
            deletePromptMutation.isPending ||
            createModelMutation.isPending ||
            updateModelMutation.isPending ||
            deleteModelMutation.isPending ||
            uploadAssetMutation.isPending,
    };
}
