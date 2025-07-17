import { prisma } from "../utils/prisma";

export default async function () {
    await prisma.laboratorio.deleteMany();
    await prisma.user.deleteMany();

    await prisma.$disconnect();
};