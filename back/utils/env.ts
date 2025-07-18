import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config({ path: `${process.env.NODE_ENV?.toLowerCase().includes("production") && process.env.NODE_ENV || ""}.env`, quiet: true });

const envSchema = z.object({
    JWT_SECRET: z.string(),
    PORT: z.number().optional(),
    EMAIL_USER: z.string().email(),
    EMAIL_PASS: z.string(),
    PAGE_LINK: z.string(),
    ALLOWED_LINKS: z.string(),
    NODE_ENV: z.string().optional()
});

console.log('EMAIL_USER:', process.env.EMAIL_USER);
export const env = envSchema.parse(process.env);