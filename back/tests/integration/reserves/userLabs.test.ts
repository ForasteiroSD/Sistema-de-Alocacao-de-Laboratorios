import request from "supertest";
import app from "../../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";
import { usuarioResp } from "../vitest.setup.js";
import { prisma } from "../../../src/utils/prisma.js";
import { stringData } from "../../../src/utils/formatDate.js";

const respAgent = request.agent(app);
let respId: string;

describe("Get reservas lab", () => {
    beforeAll(async () => {
        const respRes = await respAgent
        .post("/user/login")
        .send({
            email: usuarioResp.email,
            senha: usuarioResp.senha,
        }).expect(200);
        
        respId = respRes.body.data.id;
    });

    it("deve retornar 422 - dados incorretos", async () => {
        const res = await respAgent
            .get("/reservas/lab")
            .query({
                resp_id: respId,
                data_inicio: "2025-02-30",
                tipo: "Diaria"
            });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
    });

    it("deve retornar 200 - dados corretos", async () => {
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
                user_id: respId
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
            .get("/reservas/lab")
            .query({
                resp_id: respId,
                data_inicio: new Date().toISOString()
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(1);

        expect(res.body.data[0]).toHaveProperty("id");
        expect(res.body.data[0]).toHaveProperty("responsavel");
        expect(res.body.data[0]).toHaveProperty("lab");
        expect(res.body.data[0]).toHaveProperty("data_inicio");
        expect(res.body.data[0]).toHaveProperty("data_fim");
        expect(res.body.data[0]).toHaveProperty("tipo");

        expect(res.body.data[0].id).toBe(reserva.id);
        expect(res.body.data[0].responsavel).toBe(usuarioResp.nome);
        expect(res.body.data[0].lab).toBe(laboratorio!.nome);
        expect(res.body.data[0].data_inicio).toBe(stringData(dataReserva, false));
        expect(res.body.data[0].data_fim).toBe(stringData(dataReservaAux, false));
        expect(res.body.data[0].tipo).toBe("Única");
    });

    it("deve retonar 401 - token não fornecido", async () => {
        const res = await request(app)
            .get("/reservas/lab");
        
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Token não fornecido.");
    });
});