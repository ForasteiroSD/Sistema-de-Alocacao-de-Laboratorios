import { env } from './env';
import type { PrismaClient as ProdClient } from '@prisma/client';

let prisma: ProdClient;

if (env.NODE_ENV && env.NODE_ENV.toLowerCase().includes('production')) {
    const { PrismaClient } = require("@prisma/client");
    prisma = new PrismaClient();
} else {
    const { PrismaClient } = require("./../prisma/dev/dev-client");
    prisma = new PrismaClient();
}

export { prisma };