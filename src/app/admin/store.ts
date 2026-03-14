import { create } from "zustand";
import { AdminUser, AdminVideo, AdminStats } from "./schema";

interface AdminState {
    stats: AdminStats | null;
    users: AdminUser[];
    totalUsers: number;
    videos: AdminVideo[];
    totalVideos: number;
    isLoading: boolean;

    setStats: (stats: AdminStats) => void;
    setUsers: (users: AdminUser[], total: number) => void;
    setVideos: (videos: AdminVideo[], total: number) => void;
    setLoading: (loading: boolean) => void;

    updateUserInStore: (id: string, data: Partial<AdminUser>) => void;
    updateVideoInStore: (id: string, data: Partial<AdminVideo>) => void;
    removeVideoFromStore: (id: string) => void;
}

export const useAdminStore = create<AdminState>((set) => ({
    stats: null,
    users: [],
    totalUsers: 0,
    videos: [],
    totalVideos: 0,
    isLoading: false,

    setStats: (stats) => set({ stats }),
    setUsers: (users, total) => set({ users, totalUsers: total }),
    setVideos: (videos, total) => set({ videos, totalVideos: total }),
    setLoading: (isLoading) => set({ isLoading }),

    updateUserInStore: (id, data) =>
        set((state) => ({
            users: state.users.map((u) => (u.id === id ? { ...u, ...data } : u)),
        })),

    updateVideoInStore: (id, data) =>
        set((state) => ({
            videos: state.videos.map((v) => (v.id === id ? { ...v, ...data } : v)),
        })),

    removeVideoFromStore: (id) =>
        set((state) => ({
            videos: state.videos.filter((v) => v.id !== id),
            totalVideos: state.totalVideos - 1,
        })),
}));
