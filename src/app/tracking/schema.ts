import { z } from "zod";

export const utmSchema = z.object({
    utmSource: z.string().optional(),
    utmMedium: z.string().optional(),
    utmCampaign: z.string().optional(),
    utmTerm: z.string().optional(),
    utmContent: z.string().optional(),
});

export type UtmParams = z.infer<typeof utmSchema>;
