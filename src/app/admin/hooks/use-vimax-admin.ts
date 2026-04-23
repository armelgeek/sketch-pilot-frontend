import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  VimaxAdminService,
  LearningEpisode,
  VimaxStats,
  Lesson,
} from "../api/vimax-admin-service";

const vimaxService = new VimaxAdminService();

export const vimaxKeys = {
  all: ["vimax-admin"] as const,
  stats: () => [...vimaxKeys.all, "stats"] as const,
  sagas: () => [...vimaxKeys.all, "sagas"] as const,
  sagaDetail: (id: string) => [...vimaxKeys.sagas(), id] as const,
  episodes: () => [...vimaxKeys.all, "episodes"] as const,
  lessons: () => [...vimaxKeys.all, "lessons"] as const,
};

export function useVimaxStats() {
  return useQuery<VimaxStats>({
    queryKey: vimaxKeys.stats(),
    queryFn: () => vimaxService.getStats(),
  });
}

export function useVimaxSagas() {
  return useQuery<any[]>({
    queryKey: vimaxKeys.sagas(),
    queryFn: () => vimaxService.listSagas(),
  });
}

export function useVimaxSagaDetail(id: string) {
  return useQuery<any>({
    queryKey: vimaxKeys.sagaDetail(id),
    queryFn: () => vimaxService.getSagaDetail(id),
    enabled: !!id,
  });
}

export function useVimaxEpisodes() {
  return useQuery<LearningEpisode[]>({
    queryKey: vimaxKeys.episodes(),
    queryFn: () => vimaxService.listEpisodes(),
  });
}

export function useVimaxLessons() {
  return useQuery<Lesson[]>({
    queryKey: vimaxKeys.lessons(),
    queryFn: () => vimaxService.listLessons(),
  });
}

export function useVimaxActions() {
  const queryClient = useQueryClient();

  const syncMutation = useMutation({
    mutationFn: (seriesId: string) => vimaxService.syncLogs(seriesId),
  });

  const learnMutation = useMutation({
    mutationFn: ({ seriesId }: { seriesId?: string } = {}) =>
      vimaxService.triggerLearning(seriesId),
    onSuccess: (res) => {
      console.log(`${res.newLessons} nouvelles leçons ont été extraites.`);
      queryClient.invalidateQueries({ queryKey: vimaxKeys.all });
    },
  });

  const validateLessonMutation = useMutation({
    mutationFn: (lessonId: string) => vimaxService.validateLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vimaxKeys.lessons() });
    },
  });

  const deleteLessonMutation = useMutation({
    mutationFn: (lessonId: string) => vimaxService.deleteLesson(lessonId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vimaxKeys.lessons() });
    },
  });

  const rollbackMutation = useMutation({
    mutationFn: () => vimaxService.rollback(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vimaxKeys.all });
    },
  });

  const consolidateMutation = useMutation({
    mutationFn: () => vimaxService.consolidateLessons(),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vimaxKeys.all });
    },
  });

  const learnFromEpisodeMutation = useMutation({
    mutationFn: ({ id, critique }: { id: string; critique: string }) =>
      vimaxService.learnFromEpisode(id, critique),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vimaxKeys.all });
    },
  });

  const refineLessonMutation = useMutation({
    mutationFn: ({ id, feedback }: { id: string; feedback: string }) =>
      vimaxService.refineLesson(id, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vimaxKeys.all });
    },
  });

  const triggerSagaAuditMutation = useMutation({
    mutationFn: ({ id, section }: { id: string; section?: "plan" | "all" }) =>
      vimaxService.triggerSagaAudit(id, section),
  });

  const triggerVisualAuditMutation = useMutation({
    mutationFn: ({
      seriesId,
      episodeNumber,
    }: {
      seriesId: string;
      episodeNumber: number;
    }) => vimaxService.triggerVisualAudit(seriesId, episodeNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vimaxKeys.all });
    },
  });

  const learnFromSceneMutation = useMutation({
    mutationFn: ({
      seriesId,
      episodeNumber,
      sceneNumber,
      critique,
    }: {
      seriesId: string;
      episodeNumber: number;
      sceneNumber: number;
      critique: string;
    }) =>
      vimaxService.learnFromScene(
        seriesId,
        episodeNumber,
        sceneNumber,
        critique,
      ),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vimaxKeys.all });
    },
  });

  const markAuditSceneAsProcessedMutation = useMutation({
    mutationFn: ({
      seriesId,
      fileName,
      sceneNumber,
    }: {
      seriesId: string;
      fileName: string;
      sceneNumber: number;
    }) =>
      vimaxService.markAuditSceneAsProcessed(seriesId, fileName, sceneNumber),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vimaxKeys.all });
    },
  });

  const learnFromNarrativeMutation = useMutation({
    mutationFn: ({ seriesId, feedback }: { seriesId: string; feedback: any }) =>
      vimaxService.learnFromNarrative(seriesId, feedback),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vimaxKeys.all });
    },
  });

  const markNarrativeAuditProcessedMutation = useMutation({
    mutationFn: ({
      seriesId,
      fileName,
      issue,
    }: {
      seriesId: string;
      fileName: string;
      issue: string;
    }) => vimaxService.markNarrativeAuditProcessed(seriesId, fileName, issue),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vimaxKeys.all });
    },
  });

  return {
    syncLogs: syncMutation.mutateAsync,
    isSyncing: syncMutation.isPending,
    triggerLearning: learnMutation.mutateAsync,
    isLearning: learnMutation.isPending,
    validateLesson: validateLessonMutation.mutateAsync,
    isValidating: validateLessonMutation.isPending,
    deleteLesson: deleteLessonMutation.mutateAsync,
    isDeleting: deleteLessonMutation.isPending,
    rollback: rollbackMutation.mutateAsync,
    isRollingBack: rollbackMutation.isPending,
    consolidate: consolidateMutation.mutateAsync,
    isConsolidating: consolidateMutation.isPending,
    learnFromEpisode: learnFromEpisodeMutation.mutateAsync,
    isLearningEpisode: learnFromEpisodeMutation.isPending,
    refineLesson: refineLessonMutation.mutateAsync,
    isRefiningLesson: refineLessonMutation.isPending,
    triggerSagaAudit: triggerSagaAuditMutation.mutateAsync,
    isAuditingSaga: triggerSagaAuditMutation.isPending,
    triggerVisualAudit: triggerVisualAuditMutation.mutateAsync,
    isAuditingVisual: triggerVisualAuditMutation.isPending,
    learnFromScene: learnFromSceneMutation.mutateAsync,
    isLearningScene: learnFromSceneMutation.isPending,
    markAuditSceneAsProcessed: markAuditSceneAsProcessedMutation.mutateAsync,
    isMarkingProcessed: markAuditSceneAsProcessedMutation.isPending,
    learnFromNarrative: learnFromNarrativeMutation.mutateAsync,
    isLearningNarrative: learnFromNarrativeMutation.isPending,
    markNarrativeAuditProcessed:
      markNarrativeAuditProcessedMutation.mutateAsync,
    isMarkingNarrativeProcessed: markNarrativeAuditProcessedMutation.isPending,
  };
}
