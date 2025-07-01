import { z } from 'zod';

const envSchema = z.object({
    PORT: z.string().optional(),
    EMAIL_USER: z.string().email(),
    EMAIL_PASS: z.string(),
    PAGE_LINK: z.string(),
});

export const env = envSchema.parse(process.env);