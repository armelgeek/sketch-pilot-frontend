import { BaseService } from "@/src/services/base-service";

export interface VimaxStats {
  performance: {
    totalAvg: number;
    totalCount: number;
    evaluatedCount: number;
    aspects: Record<string, { count: number; totalScore: number; avg: number }>;
    sagas: Record<string, any>;
  };
  storage: {
    sizeBytes: number;
    lastUpdated: string;
  };
}

export interface LearningEpisode {
  id: string;
  seriesId: string;
  title: string;
  score: number;
  timestamp: string;
  defectsCount: number;
}

export interface Lesson {
  id: string;
  agentName: string;
  directive: string;
  category: string;
  confidence: number;
  successCount: number;
  failCount: number;
  verified?: boolean;
  tags?: string[];
  example?: string;
}

export class VimaxAdminService extends BaseService<any> {
  constructor() {
    super("/v1/admin/vimax");
  }

  async syncLogs(seriesId: string): Promise<{ success: boolean }> {
    return this.apiFetch(`${this.endpoint}/sync-logs/${seriesId}`, {
      method: "POST",
    });
  }

  async triggerLearning(
    seriesId?: string,
  ): Promise<{ success: boolean; newLessons: number }> {
    return this.apiFetch(`${this.endpoint}/learn`, {
      method: "POST",
      body: JSON.stringify({ seriesId }),
    });
  }

  async getStats(): Promise<VimaxStats> {
    const res = await this.apiFetch<any>(`${this.endpoint}/stats`);
    return res.stats;
  }

  async listSagas(): Promise<any[]> {
    const res = await this.apiFetch<any>(`${this.endpoint}/sagas`);
    return res.sagas;
  }

  async getSagaDetail(id: string): Promise<any> {
    const res = await this.apiFetch<any>(`${this.endpoint}/sagas/${id}`);
    return res.saga;
  }

  async triggerSagaAudit(
    id: string,
    section: "plan" | "all" = "all",
  ): Promise<{ success: boolean; message: string }> {
    return this.apiFetch(`${this.endpoint}/sagas/${id}/audit`, {
      method: "POST",
      body: JSON.stringify({ section }),
    });
  }

  async listEpisodes(): Promise<LearningEpisode[]> {
    const res = await this.apiFetch<any>(`${this.endpoint}/learning-episodes`);
    return res.episodes;
  }

  async listLessons(): Promise<Lesson[]> {
    const res = await this.apiFetch<any>(`${this.endpoint}/lessons`);
    return res.lessons;
  }

  async validateLesson(id: string): Promise<{ success: boolean }> {
    return this.apiFetch(`${this.endpoint}/lessons/${id}/validate`, {
      method: "POST",
    });
  }

  async deleteLesson(id: string): Promise<{ success: boolean }> {
    return this.apiFetch(`${this.endpoint}/lessons/${id}`, {
      method: "DELETE",
    });
  }

  async rollback(): Promise<{ success: boolean }> {
    return this.apiFetch(`${this.endpoint}/rollback`, {
      method: "POST",
    });
  }

  async consolidateLessons(): Promise<{ success: boolean }> {
    return this.apiFetch(`${this.endpoint}/consolidate`, { method: "POST" });
  }

  async learnFromEpisode(
    id: string,
    critique: string,
  ): Promise<{ success: boolean }> {
    return this.apiFetch(`${this.endpoint}/episodes/${id}/learn`, {
      method: "POST",
      body: JSON.stringify({ critique }),
    });
  }

  async refineLesson(
    id: string,
    feedback: string,
  ): Promise<{ success: boolean }> {
    return this.apiFetch(`${this.endpoint}/lessons/${id}/refine`, {
      method: "POST",
      body: JSON.stringify({ feedback }),
    });
  }

  async triggerVisualAudit(
    seriesId: string,
    episodeNumber: number,
  ): Promise<{ success: boolean; audits: any[] }> {
    return this.apiFetch(
      `${this.endpoint}/sagas/${seriesId}/episodes/${episodeNumber}/audit-visual`,
      {
        method: "POST",
      },
    );
  }

  async learnFromScene(
    seriesId: string,
    episodeNumber: number,
    sceneNumber: number,
    critique: string,
  ): Promise<{ success: boolean }> {
    return this.apiFetch(
      `${this.endpoint}/sagas/${seriesId}/episodes/${episodeNumber}/scenes/${sceneNumber}/learn`,
      {
        method: "POST",
        body: JSON.stringify({ critique }),
      },
    );
  }

  async markAuditSceneAsProcessed(
    seriesId: string,
    fileName: string,
    sceneNumber: number,
  ): Promise<{ success: boolean }> {
    return this.apiFetch(
      `${this.endpoint}/audits/${seriesId}/${fileName}/scenes/${sceneNumber}/processed`,
      {
        method: "POST",
      },
    );
  }

  async learnFromNarrative(
    seriesId: string,
    feedback: any,
  ): Promise<{ success: boolean }> {
    return this.apiFetch(`${this.endpoint}/sagas/${seriesId}/learn-narrative`, {
      method: "POST",
      body: JSON.stringify({ feedback }),
    });
  }

  async markNarrativeAuditProcessed(
    seriesId: string,
    fileName: string,
    issue: string,
  ): Promise<{ success: boolean }> {
    return this.apiFetch(
      `${this.endpoint}/audits/${seriesId}/${fileName}/narrative/processed`,
      {
        method: "POST",
        body: JSON.stringify({ issue }),
      },
    );
  }
}
