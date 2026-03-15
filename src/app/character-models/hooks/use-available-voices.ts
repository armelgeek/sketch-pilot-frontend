import { useState, useCallback } from "react";
import { VoicePreset } from "@/src/app/admin/schema";
import { AdminService } from "@/src/app/admin/api/admin-service";

const adminService = new AdminService();

export function useAvailableVoices() {
    const [voices, setVoices] = useState<VoicePreset[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchVoices = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await adminService.listVoices();
            setVoices(data || []);
        } catch (err) {
            const message = err instanceof Error ? err.message : "Erreur lors du chargement des voix";
            setError(message);
        } finally {
            setLoading(false);
        }
    }, []);

    return {
        voices,
        loading,
        error,
        fetchVoices,
    };
}
