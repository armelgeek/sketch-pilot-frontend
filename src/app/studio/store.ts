import { create } from "zustand";
import { type Video } from "@/src/services/videos-service";

export type StudioTab = "script" | "storyboard" | "production";

export interface CaptionOptions {
    enabled: boolean;
    style: string;
    fontSize: number;
    highlightColor: string;
    position: string;
}

export interface AudioOptions {
    voicePreset: string;
    voiceVolume: number;   // 0–100
    musicId: string;
    musicVolume: number;   // 0–100
}

interface StudioState {
    // ─── Core data ────────────────────────────────────────────────────────────
    activeVideo: Video | null;
    activeTab: StudioTab;
    selectedSceneId: string;
    generationMode: 'standalone' | 'series' | 'quotes';
    selectedSeriesId: string | null;


    // ─── UI Status ────────────────────────────────────────────────────────────
    generating: boolean;
    assembling: boolean;
    visualsGenerated: boolean;
    regeneratingSceneId: string | null;
    error: string | null;

    // ─── Edits ────────────────────────────────────────────────────────────────
    sceneEdits: Record<string, any>;

    // ─── Production options ───────────────────────────────────────────────────
    audioOptions: AudioOptions;
    captionOptions: CaptionOptions;
    isPlayingAudio: boolean;

    // ─── Modals ───────────────────────────────────────────────────────────────
    showProductionModal: boolean;
    showSuccessModal: boolean;
    productionStep: 0 | 1 | 2;
    isInserting: boolean;
    insertIndex: number | null;
    newNarration: string;

    // ─── Lists ────────────────────────────────────────────────────────────────
    availableVoices: any[];
    availableModels: any[];
    musicTracks: any[];
    availableSeries: any[];


    // ─── Actions ──────────────────────────────────────────────────────────────
    setVideo: (video: Video | null) => void;
    setTab: (tab: StudioTab) => void;
    setSelectedSceneId: (id: string) => void;
    setGenerating: (val: boolean) => void;
    setAssembling: (val: boolean) => void;
    setVisualsGenerated: (val: boolean) => void;
    setRegeneratingSceneId: (id: string | null) => void;
    setError: (error: string | null) => void;
    setAudioOptions: (options: Partial<AudioOptions>) => void;
    setCaptionOptions: (options: Partial<CaptionOptions>) => void;
    setGenerationMode: (mode: 'standalone' | 'series' | 'quotes') => void;
    setSelectedSeriesId: (id: string | null) => void;
    setAvailableSeries: (series: any[]) => void;
    setIsPlayingAudio: (val: boolean) => void;

    setShowProductionModal: (val: boolean) => void;
    setShowSuccessModal: (val: boolean) => void;
    setProductionStep: (step: 0 | 1 | 2) => void;
    setIsInserting: (val: boolean) => void;
    setInsertIndex: (index: number | null) => void;
    setNewNarration: (val: string) => void;
    setLists: (voices: any[], models: any[], music: any[]) => void;
    setSceneEdits: (edits: Record<string, any>) => void;
    updateSceneEdit: (id: string, field: string, value: any) => void;

    // ─── Derived ──────────────────────────────────────────────────────────────
    updateSceneInStore: (scene: any, index: number) => void;
}

export const useStudioStore = create<StudioState>((set) => ({
    activeVideo: null,
    activeTab: "script",
    selectedSceneId: "s1",
    generationMode: 'standalone',
    selectedSeriesId: null,

    generating: false,
    assembling: false,
    visualsGenerated: false,
    regeneratingSceneId: null,
    error: null,

    sceneEdits: {},

    audioOptions: {
        voicePreset: "af_heart",
        voiceVolume: 80,
        musicId: "none",
        musicVolume: 60,
    },
    captionOptions: {
        enabled: true,
        style: "colored",
        fontSize: 48,
        highlightColor: "#FFE135",
        position: "bottom",
    },
    isPlayingAudio: false,

    showProductionModal: false,
    showSuccessModal: false,
    productionStep: 0,
    isInserting: false,
    insertIndex: null,
    newNarration: "",

    availableVoices: [],
    availableModels: [],
    musicTracks: [],
    availableSeries: [],


    setVideo: (video) => set({ activeVideo: video }),
    setTab: (activeTab) => set({ activeTab }),
    setSelectedSceneId: (selectedSceneId) => set({ selectedSceneId }),
    setGenerating: (generating) => set({ generating }),
    setAssembling: (assembling) => set({ assembling }),
    setVisualsGenerated: (visualsGenerated) => set({ visualsGenerated }),
    setRegeneratingSceneId: (regeneratingSceneId) => set({ regeneratingSceneId }),
    setError: (error) => set({ error }),
    setAudioOptions: (options) => set((state) => ({ audioOptions: { ...state.audioOptions, ...options } })),
    setCaptionOptions: (options) => set((state) => ({ captionOptions: { ...state.captionOptions, ...options } })),
    setGenerationMode: (generationMode) => set({ generationMode }),
    setSelectedSeriesId: (selectedSeriesId) => set({ selectedSeriesId }),
    setAvailableSeries: (availableSeries) => set({ availableSeries }),
    setIsPlayingAudio: (isPlayingAudio) => set({ isPlayingAudio }),

    setShowProductionModal: (showProductionModal) => set({ showProductionModal }),
    setShowSuccessModal: (showSuccessModal) => set({ showSuccessModal }),
    setProductionStep: (productionStep) => set({ productionStep }),
    setIsInserting: (isInserting) => set({ isInserting }),
    setInsertIndex: (insertIndex) => set({ insertIndex }),
    setNewNarration: (newNarration) => set({ newNarration }),
    setLists: (voices, models, music) => set((state) => {
        const updates: any = { availableVoices: voices, availableModels: models, musicTracks: music };
        if (voices.length > 0 && (state.audioOptions.voicePreset === "af_heart" || !state.audioOptions.voicePreset)) {
            updates.audioOptions = {
                ...state.audioOptions,
                voicePreset: voices[0].presetId || voices[0].id
            };
        }
        return updates;
    }),
    setSceneEdits: (sceneEdits) => set({ sceneEdits }),
    updateSceneEdit: (id, field, value) => set((state) => ({
        sceneEdits: {
            ...state.sceneEdits,
            [id]: { ...state.sceneEdits[id], [field]: value }
        }
    })),

    updateSceneInStore: (scene, index) => set((state) => {
        if (!state.activeVideo) return state;
        const scenes = [...(state.activeVideo.scenes || state.activeVideo.script?.scenes || [])];
        scenes[index] = { ...scenes[index], ...scene };
        return {
            activeVideo: {
                ...state.activeVideo,
                scenes,
                script: state.activeVideo.script ? { ...state.activeVideo.script, scenes } : undefined
            }
        };
    }),
}));
