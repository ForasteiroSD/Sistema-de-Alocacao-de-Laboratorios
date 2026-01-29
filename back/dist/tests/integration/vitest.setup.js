import path from "path";
import { prisma } from "../../src/utils/prisma.js";
import { hashPassword } from "../../src/utils/auth.js";
const testDbPath = path.resolve(__dirname, "test.db");
//faz configurações iniciais para testes
beforeAll(async () => {
    await prisma.dia.deleteMany();
    await prisma.reserva.deleteMany();
    await prisma.laboratorio.deleteMany();
    await prisma.user.deleteMany();
    const users = await prisma.user.createManyAndReturn({
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
            },
            {
                nome: "Resp",
                cpf: "111.111.111-11",
                data_nasc: new Date("2000-01-01"),
                email: "resp@gmail.com",
                senha: await hashPassword("Senha1@123"),
                telefone: "2",
                tipo: "Responsável",
            }
        ],
    });
    const lab = await prisma.laboratorio.create({
        data: {
            nome: "Lab",
            capacidade: 30,
            ar_contidionado: 1,
            computador: 10,
            projetor: 1,
            quadro: 2,
            televisao: 0,
            responsavel_id: users[2].id
        },
    });
    const dataReserva = new Date("2000-01-01");
    dataReserva.setUTCHours(0, 0, 0, 0);
    const reserva = await prisma.reserva.create({
        data: {
            tipo: "Única",
            data_fim: dataReserva,
            data_inicio: dataReserva,
            laboratorio_id: lab.id,
            user_id: users[2].id
        }
    });
    const dataReservaAux = new Date(dataReserva);
    dataReserva.setUTCHours(14, 0, 0, 0);
    dataReservaAux.setUTCHours(16, 0, 0, 0);
    const dia = await prisma.dia.create({
        data: {
            data_inicio: dataReserva,
            data_fim: dataReservaAux,
            duracao: "2:00",
            reserva_id: reserva.id
        }
    });
});
//apaga arquivo do banco
afterAll(async () => {
    await prisma.$disconnect();
});
//# sourceMappingURL=vitest.setup.js.map