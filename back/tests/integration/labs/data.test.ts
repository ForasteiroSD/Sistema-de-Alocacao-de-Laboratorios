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
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
    });

    it("deve retonar 404 - laboratório inexistente", async () => {
        const res = await userAgent
            .get("/lab")
            .query({
                nome: "Laboratório qualquer"
            });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Laboratório inexistente.");
    });

    it("deve retonar 200 - dados corretos", async () => {
        const res = await userAgent
            .get("/lab")
            .query({
                nome: "Lab"
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data).toHaveProperty("nome");
        expect(res.body.data).toHaveProperty("responsavelNome");
        expect(res.body.data).toHaveProperty("responsavelCpf");
        expect(res.body.data).toHaveProperty("capacidade");
        expect(res.body.data).toHaveProperty("projetores");
        expect(res.body.data).toHaveProperty("quadros");
        expect(res.body.data).toHaveProperty("televisoes");
        expect(res.body.data).toHaveProperty("ar_condicionados");
        expect(res.body.data).toHaveProperty("computadores");
        expect(res.body.data).toHaveProperty("outro");

        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data.nome).toBe("Lab");
        expect(res.body.data.responsavelNome).toBe(usuarioResp.nome);
        expect(res.body.data.responsavelCpf).toBe(usuarioResp.cpf);
        expect(res.body.data.capacidade).toBe(30);
        expect(res.body.data.projetores).toBe(1);
        expect(res.body.data.quadros).toBe(2);
        expect(res.body.data.televisoes).toBe("Não possui");
        expect(res.body.data.ar_condicionados).toBe(1);
        expect(res.body.data.computadores).toBe(10);
        expect(res.body.data.outro).toBe("");
    });

    it("deve retonar 401 - usuário não autenticado", async () => {
        const res = await request(app)
            .get("/lab")
            .query({
                nome: "Lab"
            });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Token não fornecido.");
    });
});