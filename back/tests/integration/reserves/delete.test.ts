import request from "supertest";
import app from "../../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";
import { usuarioComum } from "../vitest.setup.js";
import { prisma } from "../../../src/utils/prisma.js";

const userAgent = request.agent(app);
let userId: string;

describe("Delete minha reserva", () => {
    beforeAll(async () => {
        const userRes = await userAgent
        .post("/user/login")
        .send({
            email: usuarioComum.email,
            senha: usuarioComum.senha,
        }).expect(200);
        
        userId = userRes.body.id;
    });

    it("deve retornar 422 - dados incorretos", async () => {
        const res = await userAgent
            .delete("/minhareserva")
            .query({
                id: "id-invalido"
            });

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 404 - reserva inexistente", async () => {
        const res = await userAgent
            .delete("/minhareserva")
            .query({
                id: crypto.randomUUID()
            });

        expect(res.status).toBe(404);
        expect(res.text).toBe("Reserva informada não encontrada.");
    });

    it("deve retornar 200 - reserva removida", async () => {
        const reserva = await prisma.reserva.findFirst();

        const res = await userAgent
            .delete("/minhareserva")
            .query({
                id: reserva!.id
            });

        expect(res.status).toBe(200);
        expect(res.text).toBe("Reserva removida");
    });

    it("deve retornar 401 - token não fornecido", async () => {
        const res = await request(app)
            .delete("/minhareserva");

        expect(res.status).toBe(401);
        expect(res.text).toBe("Token não fornecido");
    });
});