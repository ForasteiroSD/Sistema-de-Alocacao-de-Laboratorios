import request from "supertest";
import app from "../../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";
import { usuarioComum, usuarioResp } from "../vitest.setup.js";

const userAgent = request.agent(app);

describe("Get Lab Data", () => {
    beforeAll(async () => {
        await userAgent
            .post("/user/login")
            .send({
                email: usuarioComum.email,
                senha: usuarioComum.senha,
            }).expect(200);
    });

    it("deve retornar 422 - dados inválidos", async () => {
        const res = await userAgent
            .get("/lab")
            .query({
                nome: ""
            });

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retonar 404 - laboratório inexistente", async () => {
        const res = await userAgent
            .get("/lab")
            .query({
                nome: "Laboratório qualquer"
            });

        expect(res.status).toBe(404);
        expect(res.text).toBe("Laboratório inexistente");
    });

    it("deve retonar 200 - dados corretos", async () => {
        const res = await userAgent
            .get("/lab")
            .query({
                nome: "Lab"
            });

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body).toHaveProperty("nome");
        expect(res.body).toHaveProperty("responsavelNome");
        expect(res.body).toHaveProperty("responsavelCpf");
        expect(res.body).toHaveProperty("capacidade");
        expect(res.body).toHaveProperty("projetores");
        expect(res.body).toHaveProperty("quadros");
        expect(res.body).toHaveProperty("televisoes");
        expect(res.body).toHaveProperty("ar_condicionados");
        expect(res.body).toHaveProperty("computadores");
        expect(res.body).toHaveProperty("outro");

        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.nome).toBe("Lab");
        expect(res.body.responsavelNome).toBe(usuarioResp.nome);
        expect(res.body.responsavelCpf).toBe(usuarioResp.cpf);
        expect(res.body.capacidade).toBe(30);
        expect(res.body.projetores).toBe(1);
        expect(res.body.quadros).toBe(2);
        expect(res.body.televisoes).toBe("Não possui");
        expect(res.body.ar_condicionados).toBe(1);
        expect(res.body.computadores).toBe(10);
        expect(res.body.outro).toBe("");
    });

    it("deve retonar 401 - usuário não autenticado", async () => {
        const res = await request(app)
            .get("/lab")
            .query({
                nome: "Lab"
            });

        expect(res.status).toBe(401);
        expect(res.text).toBe("Token não fornecido");
    });
});