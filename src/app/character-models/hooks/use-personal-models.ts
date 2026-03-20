import { useState, useCallback } from "react";
import { CharacterModel, CharacterModelsService, GenerationVariant } from "../api/character-models-service";

const characterModelsService = new CharacterModelsService();

export function usePersonalModels() {
    const [models, setModels] = useState<CharacterModel[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchPersonalModels = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await characterModelsService.getPersonal();
            setModels(data || []);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erreur lors du chargement des modèles";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    const createModel = useCallback(async (data: {
        name: string;
        imageUrl: string;
        description: string;
        voiceId?: string;
        tags?: string[];
        lockedPromptSegment?: string;
        stylePrefix?: string;
        artistPersona?: string;
    }) => {
        try {
            const newModel = await characterModelsService.savePersonal(data);
            setModels(prev => [...prev, newModel]);
            return newModel;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erreur lors de la création du modèle";
            setError(message);
            throw err;
        }
    }, []);

    const updateModel = useCallback(async (id: string, data: Partial<CharacterModel>) => {
        try {
            const updated = await characterModelsService.updatePersonal(id, data);
            setModels(prev => prev.map(m => m.id === id ? updated : m));
            return updated;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erreur lors de la mise à jour du modèle";
            setError(message);
            throw err;
        }
    }, []);

    const deleteModel = useCallback(async (id: string) => {
        try {
            await characterModelsService.deletePersonal(id);
            setModels(prev => prev.filter(m => m.id !== id));
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erreur lors de la suppression du modèle";
            setError(message);
            throw err;
        }
    }, []);

    const renameModel = useCallback(async (id: string, newName: string) => {
        return updateModel(id, { name: newName });
    }, [updateModel]);

    const addTag = useCallback(async (modelId: string, tag: string) => {
        try {
            const updated = await characterModelsService.addTag(modelId, tag);
            setModels(prev => prev.map(m => m.id === modelId ? updated : m));
            return updated;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erreur lors de l'ajout du tag";
            setError(message);
            throw err;
        }
    }, []);

    const removeTag = useCallback(async (modelId: string, tag: string) => {
        try {
            const updated = await characterModelsService.removeTag(modelId, tag);
            setModels(prev => prev.map(m => m.id === modelId ? updated : m));
            return updated;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erreur lors de la suppression du tag";
            setError(message);
            throw err;
        }
    }, []);

    const addVariant = useCallback(async (modelId: string, variant: Omit<GenerationVariant, 'id' | 'generatedAt'>) => {
        try {
            const updated = await characterModelsService.addGenerationVariant(modelId, variant);
            setModels(prev => prev.map(m => m.id === modelId ? updated : m));
            return updated;
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erreur lors de l'ajout de la variante";
            setError(message);
            throw err;
        }
    }, []);

    const updateLockedPrompt = useCallback(async (modelId: string, lockedPromptSegment: string) => {
        return updateModel(modelId, { lockedPromptSegment });
    }, [updateModel]);

    const updateAdvancedSeed = useCallback(async (modelId: string, advancedSeed: number) => {
        return updateModel(modelId, { advancedSeed });
    }, [updateModel]);

    return {
        models,
        loading,
        error,
        fetchPersonalModels,
        createModel,
        updateModel,
        deleteModel,
        renameModel,
        addTag,
        removeTag,
        addVariant,
        updateLockedPrompt,
        updateAdvancedSeed,
    };
}
