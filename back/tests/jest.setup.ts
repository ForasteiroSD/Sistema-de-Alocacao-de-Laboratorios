import { prisma } from "../utils/prisma";
import { hashPassword } from "../utils/auth";

beforeAll(async () => {
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
                cpf: "2",
                data_nasc: new Date("2000-01-01"),
                email: "user@gmail.com",
                senha: await hashPassword("Senha1@123"),
                telefone: "1",
                tipo: "Usuário",
            }
        ],
    });
});