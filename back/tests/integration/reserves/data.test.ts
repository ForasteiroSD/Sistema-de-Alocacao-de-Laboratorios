import request from "supertest";
import app from "../../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";
import { usuarioComum, usuarioResp } from "../vitest.setup.js";
import { prisma } from "../../../src/utils/prisma.js";
import { stringData } from "../../../src/utils/formatDate.js";

const userAgent = request.agent(app);
const respAgent = request.agent(app);
let userId: string;
let reserva: ({
    laboratorio: {
        nome: string;
    };
} & {
    id: string;
    data_inicio: Date;
    data_fim: Date;
    tipo: string;
    laboratorio_id: string;
    user_id: string;
}) | null;

describe("Get reserva", () => {
    beforeAll(async () => {
        const userRes = await userAgent
        .post("/user/login")
        .send({
            email: usuarioComum.email,
            senha: usuarioComum.senha,
        }).expect(200);
        
        userId = userRes.body.data.id;
        
        await respAgent
        .post("/user/login")
        .send({
            email: usuarioResp.email,
            senha: usuarioResp.senha,
        }).expect(200);

        reserva = await prisma.reserva.findFirst({include: { laboratorio: { select: { nome: true } } }});
    });

    it("deve retornar 422 - dados incorretos", async () => {
        const res = await userAgent
            .get("/reserva")
            .query({
                id: "id-invalido"
            });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
    });

    it("deve retornar 404 - reserva inexistente", async () => {
        const res = await userAgent
            .get("/reserva")
            .query({
                id: crypto.randomUUID()
            });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Reserva não encontrada.");
    });

    it("deve retornar 403 - sem permissão para visualizar reserva de outro usuário", async () => {
        const newTestUser = await prisma.user.create({
            data: {
                cpf: "356.208.970-87",
                data_nasc: new Date(),
                email: "reserveUser@example.com",
                nome: "Test Reserve User",
                senha: "123",
                telefone: "(65) 3462-8583",
                tipo: "Usuário"
            }
        });

        await prisma.reserva.update({ where: { id: reserva!.id }, data: { user_id: newTestUser.id } });
        
        const res = await userAgent
            .get("/reserva")
            .query({
                id: reserva!.id
            });

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Você não pode visualizar essa reserva.");

        await prisma.reserva.update({ where: { id: reserva!.id }, data: { user_id: userId } });
    });

    it("deve retornar 403 - sem permissão para visualizar reserva de outro laboratório", async () => {
        await prisma.reserva.update({
            where: { id: reserva!.id },
            data: {
                laboratorio: {
                    create: {
                        nome: "New Lab",
                        capacidade: 1,
                        responsavel_id: userId
                    },
                }
        }});

        const res = await respAgent
            .get("/reserva")
            .query({
                id: reserva!.id
            });

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Você não pode visualizar essa reserva.");

        await prisma.reserva.update({ where: { id: reserva!.id }, data: { laboratorio_id: reserva!.laboratorio_id } });
    });

    it("deve retornar 200 - dados corretos (reserva única)", async () => {
        const res = await respAgent
            .get("/reserva")
            .query({
                id: reserva!.id
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("usuario");
        expect(res.body.data).toHaveProperty("laboratorio");
        expect(res.body.data).toHaveProperty("tipo");
        expect(res.body.data).toHaveProperty("data_inicio");
        expect(res.body.data).toHaveProperty("data_fim");
        expect(res.body.data).toHaveProperty("hora_inicio");
        expect(res.body.data).toHaveProperty("duracao");

        expect(res.body.data.usuario).toBe(usuarioComum.nome);
        expect(res.body.data.laboratorio).toBe(reserva!.laboratorio.nome);
        expect(res.body.data.tipo).toBe(reserva!.tipo);
        expect(res.body.data.data_inicio).toBe(stringData(reserva!.data_inicio, false));
        expect(res.body.data.data_fim).toBe(stringData(reserva!.data_fim, false));
        expect(res.body.data.hora_inicio).toBe("14:00");
        expect(res.body.data.duracao).toBe("2:00");
    });

    it("deve retornar 200 - dados corretos (reserva semanal)", async () => {
        
        const dataInicioReserva = new Date();
        const dataFimReserva = new Date();

        dataInicioReserva.setUTCHours(0, 0, 0, 0);
        dataFimReserva.setUTCHours(0, 0, 0, 0);
        dataFimReserva.setUTCDate(dataFimReserva.getUTCDate()+8);

        const reservaSemanal = await prisma.reserva.create({
            data: {
                data_inicio: dataInicioReserva,
                data_fim: dataFimReserva,
                tipo: "Semanal",
                laboratorio_id: reserva!.laboratorio_id,
                user_id: userId
            }
        });

        const dias: { data_fim: Date; data_inicio: Date; duracao: string; reserva_id: string; }[] = [];
        while (dataInicioReserva.getTime() <= dataFimReserva.getTime()) {
            const dia_semana = dataInicioReserva.getUTCDay();

            if (dia_semana === 0 || dia_semana === 2) {
                const dataComeco = new Date(dataInicioReserva);
                const dataFim = new Date(dataInicioReserva);
                
                dataComeco.setUTCHours(10, 0, 0, 0);
                dataFim.setUTCHours(14, 0, 0, 0);

                dias.push({
                    data_inicio: dataComeco,
                    data_fim: dataFim,
                    duracao: "4:00",
                    reserva_id: reservaSemanal.id
                });

                if (dias.length === 2) break;
            }

            dataInicioReserva.setUTCDate(dataInicioReserva.getUTCDate() + 1);
        }
        
        await prisma.dia.createMany({
            data: dias
        });
            
        const res = await respAgent
            .get("/reserva")
            .query({
                id: reservaSemanal!.id
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("usuario");
        expect(res.body.data).toHaveProperty("laboratorio");
        expect(res.body.data).toHaveProperty("tipo");
        expect(res.body.data).toHaveProperty("data_inicio");
        expect(res.body.data).toHaveProperty("data_fim");
        expect(res.body.data).toHaveProperty("dias_semana");

        expect(res.body.data.usuario).toBe(usuarioComum.nome);
        expect(res.body.data.laboratorio).toBe(reserva!.laboratorio.nome);
        expect(res.body.data.tipo).toBe(reservaSemanal!.tipo);
        expect(res.body.data.data_inicio).toBe(stringData(reservaSemanal!.data_inicio, false));
        expect(res.body.data.data_fim).toBe(stringData(reservaSemanal!.data_fim, false));
        expect(res.body.data.dias_semana).toBeInstanceOf(Array);
        expect(res.body.data.dias_semana.length).toBe(2);

        const nomesDias = res.body.data.dias_semana.map((dia: any) => dia.dia);
        expect(nomesDias).toContain("Domingo");
        expect(nomesDias).toContain("Terça");

        expect(res.body.data.dias_semana[0].hora_inicio).toBe("10:00");
        expect(res.body.data.dias_semana[0].duracao).toBe("4:00");
        expect(res.body.data.dias_semana[1].hora_inicio).toBe("10:00");
        expect(res.body.data.dias_semana[1].duracao).toBe("4:00");
    });

    it("deve retornar 200 - dados corretos (reserva personalizada)", async () => {

        const diaReserva1 = new Date();
        const diaReserva2 = new Date();

        diaReserva1.setUTCHours(0, 0, 0, 0);
        diaReserva2.setUTCHours(0, 0, 0, 0);
    
        diaReserva2.setUTCDate(diaReserva2.getUTCDate()+4);

        const reservaPersonalizada = await prisma.reserva.create({
            data: {
                data_inicio: diaReserva1,
                data_fim: diaReserva2,
                tipo: "Personalizada",
                laboratorio_id: reserva!.laboratorio_id,
                user_id: userId
            }
        });
        
        const diaFimReserva1 = new Date(diaReserva1);
        const diaFimReserva2 = new Date(diaReserva2);
        
        diaReserva1.setUTCHours(15, 0, 0, 0);
        diaFimReserva1.setUTCHours(17, 0, 0, 0);

        diaReserva2.setUTCHours(9, 0, 0, 0);
        diaFimReserva2.setUTCHours(12, 0, 0, 0);
        
        await prisma.dia.createMany({
            data: [
                {
                    data_inicio: diaReserva1,
                    data_fim: diaFimReserva1,
                    duracao: "2:00",
                    reserva_id: reservaPersonalizada.id
                },
                {
                    data_inicio: diaReserva2,
                    data_fim: diaFimReserva2,
                    duracao: "3:00",
                    reserva_id: reservaPersonalizada.id
                }
            ]
        });
            
        const res = await respAgent
            .get("/reserva")
            .query({
                id: reservaPersonalizada!.id
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toHaveProperty("usuario");
        expect(res.body.data).toHaveProperty("laboratorio");
        expect(res.body.data).toHaveProperty("tipo");
        expect(res.body.data).toHaveProperty("data_inicio");
        expect(res.body.data).toHaveProperty("data_fim");
        expect(res.body.data).toHaveProperty("horarios");

        expect(res.body.data.usuario).toBe(usuarioComum.nome);
        expect(res.body.data.laboratorio).toBe(reserva!.laboratorio.nome);
        expect(res.body.data.tipo).toBe(reservaPersonalizada!.tipo);
        expect(res.body.data.data_inicio).toBe(stringData(reservaPersonalizada!.data_inicio, false));
        expect(res.body.data.data_fim).toBe(stringData(reservaPersonalizada!.data_fim, false));
        expect(res.body.data.horarios).toBeInstanceOf(Array);
        expect(res.body.data.horarios.length).toBe(2);

        const horarios = res.body.data.horarios;

        expect(horarios[0].data).toBe(stringData(diaFimReserva1, false));
        expect(horarios[0].hora_inicio).toBe("15:00");
        expect(horarios[0].duracao).toBe("2:00");
        expect(horarios[1].data).toBe(stringData(diaFimReserva2, false));
        expect(horarios[1].hora_inicio).toBe("09:00");
        expect(horarios[1].duracao).toBe("3:00");
    });

    it("deve retornar 401 - token não fornecido", async () => {
        const res = await request(app)
            .get("/reserva");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Token não fornecido.");
    });
});