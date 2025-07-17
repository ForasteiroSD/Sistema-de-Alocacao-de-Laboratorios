import fs from 'fs';
import path from 'path';
import { execSync } from "child_process";
import { prisma } from "../../utils/prisma";
import { hashPassword } from "../../utils/auth";

const testDbPath = path.resolve(__dirname, 'test.db');

//faz configurações iniciais para testes
beforeAll(async () => {
    //apaga arquivo do banco
    if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
    }

    //cria arquivo do banco
    execSync('npx prisma migrate deploy', { stdio: 'inherit' });

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

//apaga arquivo do banco
afterAll(async () => {
    await prisma.$disconnect();

    if (fs.existsSync(testDbPath)) {
        fs.unlinkSync(testDbPath);
    }
});