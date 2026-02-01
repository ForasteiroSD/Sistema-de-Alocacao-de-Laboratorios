import request from "supertest";
import app from "../../../src/index.js";
import { beforeAll, describe, expect, it, vi } from "vitest";
import { usuarioComum, usuarioResp } from "../vitest.setup.js";
import { prisma } from "../../../src/utils/prisma.js";
import * as sendEmail from "../../../src/utils/sendEmail.js";

vi.spyOn(sendEmail, 'sendEmail').mockImplementation(() => undefined);

const userAgent = request.agent(app);
const respAgent = request.agent(app);
let userId: string;

describe("Delete reserva", () => {
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
    });

    it("deve retornar 422 - dados incorretos", async () => {
        const res = await respAgent
            .delete("/reserva")
            .query({
                id: "id-invalido"
            });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
    });

    it("deve retornar 403 - token não tem permissão", async () => {
        const res = await userAgent
            .delete("/reserva")
            .query({
                id: userId
            });

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Você não pode excluir essa reserva.");
    });

    it("deve retornar 404 - reserva inexistente", async () => {
        const res = await respAgent
            .delete("/reserva")
            .query({
                id: crypto.randomUUID()
            });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Reserva não encontrada.");
    });

    it("deve retornar 400 - reserva não pode ser removida", async () => {

        const laboratorio = await prisma.laboratorio.findFirst();
        const dataReserva = new Date();

        dataReserva.setUTCDate(dataReserva.getUTCDate()+1);
        dataReserva.setUTCHours(0, 0, 0, 0);

        const reserva = await prisma.reserva.create({
            data: {
                tipo: "Única",
                data_fim: dataReserva,
                data_inicio: dataReserva,
                laboratorio_id: laboratorio!.id,
                user_id: userId
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
        });

        const res = await respAgent
            .delete("/reserva")
            .query({
                id: reserva!.id
            });

        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Não é possível remover nenhum dia da reserva.");
    });

    it("deve retornar 200 - reserva removida e dias próximos mantidos", async () => {
        const laboratorio = await prisma.laboratorio.findFirst();
        const dataReserva = new Date();
        const dataFimReserva = new Date();

        dataReserva.setUTCDate(dataReserva.getUTCDate()+1);
        dataReserva.setUTCHours(0, 0, 0, 0);
        dataFimReserva.setUTCDate(dataFimReserva.getUTCDate()+10);
        dataFimReserva.setUTCHours(0, 0, 0, 0);

        const reserva = await prisma.reserva.create({
            data: {
                tipo: "Personalizada",
                data_fim: dataFimReserva,
                data_inicio: dataReserva,
                laboratorio_id: laboratorio!.id,
                user_id: userId
            }
        });

        const dataReservaInicioAux = new Date(dataReserva);
        const dataReservaFimAux = new Date(dataFimReserva);

        dataReserva.setUTCHours(14, 0, 0, 0);
        dataReservaInicioAux.setUTCHours(16, 0, 0, 0);
        dataFimReserva.setUTCHours(10, 0, 0, 0);
        dataReservaFimAux.setUTCHours(12, 0, 0, 0);

        await prisma.dia.createMany({
            data: [
                {
                    data_inicio: dataReserva,
                    data_fim: dataReservaInicioAux,
                    duracao: "2:00",
                    reserva_id: reserva.id
                },
                {
                    data_inicio: dataFimReserva,
                    data_fim: dataReservaFimAux,
                    duracao: "2:00",
                    reserva_id: reserva.id
                }
            ]
        });

        const res = await respAgent
            .delete("/reserva")
            .query({
                id: reserva!.id
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toContain("Dias da reserva removidos, as reservas que iriam ocorrer até");
    });

    it("deve retornar 200 - reserva removida", async () => {
        const reserva = await prisma.reserva.findFirst();

        const res = await respAgent
            .delete("/reserva")
            .query({
                id: reserva!.id
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Reserva removida.");
    });

    it("deve retornar 401 - token não fornecido", async () => {
        const res = await request(app)
            .delete("/reserva");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Token não fornecido.");
    });
});