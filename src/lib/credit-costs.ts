/**
 * Frontend-mirrored credit costs (must match video.config.ts in the API).
 * Update whenever the backend CREDIT_COSTS change.
 */
export const CREDIT_COSTS = {
    SCRIPT_GENERATION: 5,
    IMAGE_FREE: 0,
    IMAGE_CREATOR: 3,
    IMAGE_REPROMPT: 2,
    TTS_VOICE: 2,
    SUBTITLES: 0,
    SUGGEST_TOPIC: 2,
    EXPORT_720P: 2,
    EXPORT_1080P: 5,
    STUDIO_PASS_SURCHARGE: 3,
    THUMBNAIL_GENERATION: 1,
    CHARACTER_GENERATION: 5,
} as const;

/**
 * Estimate the cost to generate all scene visuals for a given number of scenes.
 * @param numScenes number of scenes in the video
 * @param useGemini whether to use AI image generation (default: true)
 */
export function estimateStoryboardCost(numScenes: number, useGemini = true) {
    return (useGemini ? CREDIT_COSTS.IMAGE_CREATOR : CREDIT_COSTS.IMAGE_FREE) * numScenes;
}

/**
 * Estimate the full video generation cost (script + images + TTS + export).
 */
export function estimateFullVideoCost(numScenes: number, useGemini = true, resolution: '720p' | '1080p' = '1080p') {
    const images = (useGemini ? CREDIT_COSTS.IMAGE_CREATOR : CREDIT_COSTS.IMAGE_FREE) * numScenes;
    const exportCost = resolution === '1080p' ? CREDIT_COSTS.EXPORT_1080P : CREDIT_COSTS.EXPORT_720P;
    return CREDIT_COSTS.SCRIPT_GENERATION + images + CREDIT_COSTS.TTS_VOICE + exportCost;
}
