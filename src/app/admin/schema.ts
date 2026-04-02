import { z } from "zod";

export const adminUserSchema = z.object({
    id: z.string(),
    name: z.string(),
    firstname: z.string().optional(),
    lastname: z.string().optional(),
    email: z.string().email(),
    image: z.string().optional().nullable(),
    role: z.string(),
    isAdmin: z.boolean(),
    banned: z.boolean(),
    banReason: z.string().optional().nullable(),
    banExpires: z.string().optional().nullable(),
    lastLoginAt: z.string().optional().nullable(),
    createdAt: z.string(),
});

export type AdminUser = z.infer<typeof adminUserSchema>;

export const adminVideoSchema = z.object({
    id: z.string(),
    userId: z.string(),
    userName: z.string().optional(),
    userEmail: z.string().optional(),
    topic: z.string(),
    description: z.string().optional().nullable(),
    status: z.string(),
    progress: z.number(),
    duration: z.number().optional().nullable(),
    currentStep: z.string().optional().nullable(),
    errorMessage: z.string().optional().nullable(),
    videoUrl: z.string().optional().nullable(),
    thumbnailUrl: z.string().optional().nullable(),
    createdAt: z.string(),
});

export type AdminVideo = z.infer<typeof adminVideoSchema>;

export const adminStatsSchema = z.object({
    totalUsers: z.number(),
    totalVideos: z.number(),
    videosByStatus: z.array(z.object({ status: z.string(), count: z.number() })),
    totalCreditsUsed: z.number(),
    totalExtraCredits: z.number(),
});

export type AdminStats = z.infer<typeof adminStatsSchema>;

export const voicePresetSchema = z.object({
    id: z.string(),
    presetId: z.string(),
    provider: z.string(),
    name: z.string(),
    language: z.string(),
    gender: z.string(),
    description: z.string().optional().nullable(),
    previewUrl: z.string().optional().nullable(),
    isActive: z.boolean(),
});

export type VoicePreset = z.infer<typeof voicePresetSchema>;

export const musicTrackSchema = z.object({
    id: z.string(),
    trackId: z.string(),
    name: z.string(),
    path: z.string(),
    tags: z.array(z.string()),
    previewUrl: z.string().optional().nullable(),
    isActive: z.boolean(),
});

export type MusicTrack = z.infer<typeof musicTrackSchema>;

export const videoTypeSpecificationSchema = z.object({
    name: z.string(),
    role: z.string(),
    context: z.string(),
    audienceDefault: z.string(),
    task: z.string(),
    goals: z.array(z.string()),
    structure: z.string(),

    // Optional high-level metadata
    category: z.string().optional(),

    // Technical fields now optional
    rules: z.array(z.string()).optional(),
    formatting: z.string().optional(),
    outputFormat: z.string().optional(),
    instructions: z.array(z.string()).optional(),
});

export const adminPromptSchema = videoTypeSpecificationSchema.extend({
    id: z.string().uuid(),
    description: z.string().optional().nullable(),
    isActive: z.boolean(),
    createdAt: z.string(),
    updatedAt: z.string(),
});

export type AdminPrompt = z.infer<typeof adminPromptSchema>;
