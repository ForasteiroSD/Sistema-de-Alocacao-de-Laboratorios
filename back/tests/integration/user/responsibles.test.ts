import request from "supertest";
import app from "../../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";
import { usuarioComum, usuarioResp } from "../vitest.setup.js";

const userAgent = request.agent(app);

describe("Get responsaveis", () => {
    beforeAll(async () => {
        await userAgent
            .post("/user/login")
            .send({
                email: usuarioComum.email,
                senha: usuarioComum.senha
            });
    });

    it("deve retornar 422 - dados inválidos", async () => {
        const res = await userAgent
            .get("/user/responsaveis")
            .query({
                cpf: 3
            });

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await userAgent
            .get("/user/responsaveis")
            .query({
                cpf: 1
            });

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(1);
        expect(res.body[0]).toHaveProperty("nome");
        expect(res.body[0]).toHaveProperty("cpf");
        expect(res.body[0].nome).toBe(usuarioResp.nome);
        expect(res.body[0].cpf).toBe(usuarioResp.cpf);
    });

    it("deve retornar 401 - token não fornecido", async () => {
        const res = await request(app)
            .get("/user/responsaveis");

        expect(res.status).toBe(401);
        expect(res.text).toBe("Token não fornecido");
    });
});