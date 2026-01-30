import { prisma } from "../../src/utils/prisma.js";
import { hashPassword } from "../../src/utils/auth.js";
import { beforeAll, afterAll } from "vitest";

export const usuarioComum = {
    nome: "User",
    cpf: "222.523.820-07",
    data_nasc: new Date("2000-01-01"),
    email: "user@gmail.com",
    senha: "Senha1@123",
    telefone: "(71) 97459-4045",
    tipo: "Usuário",
};

export const usuarioAdm = {
    nome: "Adm",
    cpf: "Master",
    data_nasc: new Date("2000-01-01"),
    email: "adm@gmail.com",
    senha: "Senha1@123",
    telefone: "(94) 99103-5132",
    tipo: "Administrador",
};

export const usuarioResp = {
    nome: "Resp",
    cpf: "259.296.780-06",
    data_nasc: new Date("2000-01-01"),
    email: "resp@gmail.com",
    senha: "Senha1@123",
    telefone: "(61) 98513-9943",
    tipo: "Responsável",
};

beforeAll(async () => {
    await prisma.dia.deleteMany();
    await prisma.reserva.deleteMany();
    await prisma.laboratorio.deleteMany();
    await prisma.user.deleteMany();

    const users = await prisma.user.createManyAndReturn({
        data: [
            {
                nome: usuarioAdm.nome,
                cpf: usuarioAdm.cpf,
                data_nasc: usuarioAdm.data_nasc,
                email: usuarioAdm.email,
                senha: await hashPassword(usuarioAdm.senha),
                telefone: usuarioAdm.telefone,
                tipo: usuarioAdm.tipo as any,
            },
            {
                nome: usuarioComum.nome,
                cpf: usuarioComum.cpf,
                data_nasc: usuarioComum.data_nasc,
                email: usuarioComum.email,
                senha: await hashPassword(usuarioComum.senha),
                telefone: usuarioComum.telefone,
                tipo: usuarioComum.tipo as any,
            },
            {
                nome: usuarioResp.nome,
                cpf: usuarioResp.cpf,
                data_nasc: usuarioResp.data_nasc,
                email: usuarioResp.email,
                senha: await hashPassword(usuarioResp.senha),
                telefone: usuarioResp.telefone,
                tipo: usuarioResp.tipo as any,
            }
        ],
    });

    const labs = await prisma.laboratorio.createManyAndReturn({
        data: [
            {
                nome: "Lab",
                capacidade: 30,
                ar_condicionado: 1,
                computador: 10,
                projetor: 1,
                quadro: 2,
                televisao: 0,
                responsavel_id: users[2].id
            },
            {
                nome: "Lab 2",
                capacidade: 40,
                ar_condicionado: 2,
                computador: 40,
                projetor: 1,
                quadro: 1,
                televisao: 1,
                responsavel_id: users[2].id
            },
        ]
    });

    const dataReserva = new Date("2000-01-01");

    dataReserva.setUTCHours(0, 0, 0, 0);
    const reserva = await prisma.reserva.create({
        data: {
            tipo: "Única",
            data_fim: dataReserva,
            data_inicio: dataReserva,
            laboratorio_id: labs[0].id,
            user_id: users[2].id
        }
    });

    const dataReservaAux = new Date(dataReserva);
    dataReserva.setUTCHours(14, 0, 0, 0);
    dataReservaAux.setUTCHours(16, 0, 0, 0);
    await prisma.dia.create({
        data: {
            data_inicio: dataReserva,
            data_fim: dataReservaAux,
            duracao: "2:00",
            reserva_id: reserva.id
        }
    })
});

//apaga arquivo do banco
afterAll(async () => {
    await prisma.$disconnect();
});