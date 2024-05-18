import { Request, Response, Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router();
const prisma = new PrismaClient();

export default router;