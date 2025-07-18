import dotenv from "dotenv";
dotenv.config({ path: ".env.test", quiet: true });
import { prisma } from "../../utils/prisma";
import { hashPassword } from "../../utils/auth";

//faz configurações iniciais para testes
beforeAll(async () => {
    await prisma.laboratorio.deleteMany();
    await prisma.user.deleteMany();

    await prisma.user.createMany({
        data: [
            {
                nome: "Adm",
                cpf: "1",
                data_nasc: new Date("2000-01-01"),
                email: "adm@gmail.com",
                senha: await hashPassword("Senha1@123"),
                telefone: "1",
                tipo: "Administrador",
            },
            {
                nome: "User",
                cpf: "000.000.000-00",
                data_nasc: new Date("2000-01-01"),
                email: "user@gmail.com",
                senha: await hashPassword("Senha1@123"),
                telefone: "1",
                tipo: "Usuário",
            }
        ],
    });
});

//apaga arquivo do banco
afterAll(async () => {
    await prisma.laboratorio.deleteMany();
    await prisma.user.deleteMany();

    await prisma.$disconnect();
});