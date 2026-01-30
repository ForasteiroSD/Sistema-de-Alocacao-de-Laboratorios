import request from "supertest";
import app from "../../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";
import { usuarioComum } from "../vitest.setup.js";

const userAgent = request.agent(app);

describe("Get Labs List", () => {
    beforeAll(async () => {
        await userAgent
            .post("/user/login")
            .send({
                email: usuarioComum.email,
                senha: usuarioComum.senha
            }).expect(200);
    });

    it("deve retornar 422 - dados inválidos", async () => {
        const res = await userAgent
            .get("/lab/all")
            .query({
                capacidade_minima: "-1"
            });

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await userAgent
            .get("/lab/all")
            .query({
                nome: "Lab"
            });

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(2);
        expect(res.body[0]).toHaveProperty("nome");
        expect(res.body[0]).toHaveProperty("responsavel");
        expect(res.body[0]).toHaveProperty("capacidade");

        const resLabsFiltered = await userAgent
            .get("/lab/all")
            .query({
                nome: "Lab 2"
            });

        expect(resLabsFiltered.status).toBe(200);
        expect(resLabsFiltered.body).toBeInstanceOf(Array);
        expect(resLabsFiltered.body.length).toBe(1);
        expect(resLabsFiltered.body[0].nome).toBe("Lab 2");
    });

    it("deve retonar 401 - usuário não autenticado", async () => {
        const res = await request(app)
            .get("/lab/all");

        expect(res.status).toBe(401);
        expect(res.text).toBe("Token não fornecido");
    });
});