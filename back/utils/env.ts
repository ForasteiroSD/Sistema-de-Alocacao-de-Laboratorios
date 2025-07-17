import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: '.env', quiet: true });

const envSchema = z.object({
    JWT_SECRET: z.string(),
    PORT: z.number().optional(),
    EMAIL_USER: z.string().email(),
    EMAIL_PASS: z.string(),
    PAGE_LINK: z.string(),
    ALLOWED_LINKS: z.string(),
    NODE_ENV: z.string().optional()
});

export const env = envSchema.parse(process.env);