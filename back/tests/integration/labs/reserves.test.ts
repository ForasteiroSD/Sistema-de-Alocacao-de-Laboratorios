import request from "supertest";
import app from "../../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";
import { usuarioComum } from "../vitest.setup.js";

const userAgent = request.agent(app);

describe("Get Reserves", () => {
    beforeAll(async () => {
        await userAgent
            .post("/user/login")
            .send({
                email: usuarioComum.email,
                senha: usuarioComum.senha
            }).expect(200);
    });

    it("deve retornar 422", async () => {
        const res = await userAgent
            .get("/lab/reservasdia")
            .query({
                nome: "Lab 1",
                dia: "2000-14-05"
            });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
    });

    it("deve retornar 404 - laboratório inexistente", async () => {
        const res = await userAgent
            .get("/lab/reservasdia")
            .query({
                nome: "Lab Aleatório",
                dia: "2000-11-05"
            });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Laboratório informado não encontrado.");
    });

    it("deve retornar 404 - nenhuma reserva no dia", async () => {
        const res = await userAgent
            .get("/lab/reservasdia")
            .query({
                nome: "Lab",
                dia: "2000-11-05"
            });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Não há reservas no dia.");
    });

    it("deve retornar 200 - dados corretos e reservas encontradas", async () => {
        const res = await userAgent
            .get("/lab/reservasdia")
            .query({
                nome: "Lab",
                dia: "2000-01-01"
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0]).toHaveProperty("hora_inicio");
        expect(res.body.data[0]).toHaveProperty("duracao");
        expect(res.body.data[0]).toHaveProperty("hora");

        const dataReserva = new Date("2000-01-01");
        dataReserva.setUTCHours(14, 0, 0, 0);
        
        expect(res.body.data[0].hora_inicio).toBe("14:00");
        expect(res.body.data[0].duracao).toBe("2:00");
        expect(res.body.data[0].hora).toBe(dataReserva.toISOString());
    });

    it("deve retonar 401 - usuário não autenticado", async () => {
        const res = await request(app)
            .get("/lab/reservasdia");

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Token não fornecido.");
    });
});