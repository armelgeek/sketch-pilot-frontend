import { useQuery } from "@tanstack/react-query";
import { AdminService } from "../api/admin-service";
import { useAdminStore } from "../store";
import { adminKeys } from "./use-admin-actions";
import { useEffect } from "react";

const adminService = new AdminService();

export function useAdminStats() {
    const setStats = useAdminStore((state) => state.setStats);

    const query = useQuery({
        queryKey: adminKeys.stats(),
        queryFn: () => adminService.getStats(),
    });

    useEffect(() => {
        if (query.data) setStats(query.data);
    }, [query.data, setStats]);

    return query;
}

export function useAdminUser(id: string) {
    return useQuery({
        queryKey: adminKeys.users({ id }),
        queryFn: () => adminService.getUser(id),
        enabled: !!id,
    });
}

export function useAdminVideo(id: string) {
    return useQuery({
        queryKey: adminKeys.videos({ id }),
        queryFn: () => adminService.getVideo(id),
        enabled: !!id,
    });
}

export function useAdminUsers(filters: { page?: number; limit?: number; search?: string; role?: string }) {
    const setUsers = useAdminStore((state) => state.setUsers);

    const query = useQuery({
        queryKey: adminKeys.users(filters),
        queryFn: () => adminService.listUsers(filters),
    });

    useEffect(() => {
        if (query.data) setUsers(query.data.data, query.data.total);
    }, [query.data, setUsers]);

    return query;
}

export function useAdminVideos(filters: { page?: number; limit?: number; status?: string; search?: string; userId?: string }) {
    const setVideos = useAdminStore((state) => state.setVideos);

    const query = useQuery({
        queryKey: adminKeys.videos(filters),
        queryFn: () => adminService.listVideos(filters),
    });

    useEffect(() => {
        if (query.data) setVideos(query.data.data, query.data.total);
    }, [query.data, setVideos]);

    return query;
}

export function useAdminPrompts(filters: { page?: number; limit?: number; isActive?: boolean; search?: string }) {
    return useQuery({
        queryKey: adminKeys.prompts(filters),
        queryFn: () => adminService.listPrompts(filters),
    });
}

export function useAdminModels(filters?: { page?: number; limit?: number; search?: string }) {
    return useQuery({
        queryKey: adminKeys.models(filters),
        queryFn: () => adminService.listModels(filters),
    });
}

export function useAdminVoices() {
    return useQuery({
        queryKey: adminKeys.voices(),
        queryFn: () => adminService.listVoices(),
    });
}

export function useAdminMusic() {
    return useQuery({
        queryKey: adminKeys.music(),
        queryFn: () => adminService.listMusic(),
    });
}

export function useAdminThumbnailTemplates(filters?: { page?: number; limit?: number; niche?: string; search?: string }) {
    return useQuery({
        queryKey: adminKeys.thumbnails(filters),
        queryFn: () => adminService.listThumbnailTemplates(filters),
    });
}
