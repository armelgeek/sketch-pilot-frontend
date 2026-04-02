import { z } from "zod";

export const personaMethodSchema = z.enum(["ai_generate", "upload", "skip"]);
export type PersonaMethod = z.infer<typeof personaMethodSchema>;

export const onboardingDataSchema = z.object({
    /** Step 0 – user goals */
    goals: z.array(z.string()).default([]),

    /** Step 1 – persona / character */
    personaMethod: personaMethodSchema.optional(),
    personaPrompt: z.string().optional(),          // used when method = "ai_generate"
    personaImageUrl: z.string().url().optional(),  // resulting/uploaded image URL

    /** Step 2 – first video topic */
    firstVideoTopic: z.string().optional(),
    firstVideoType: z.string().optional(),
});

export type OnboardingData = z.infer<typeof onboardingDataSchema>;
