import request from "supertest";
import app from "../../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";
import { usuarioAdm, usuarioComum } from "../vitest.setup.js";

let userId: string, admId: string;
const userAgent = request.agent(app);
const admAgent = request.agent(app);

describe("Get user data", () => {
    beforeAll(async () => {
        const resUser = await userAgent
            .post("/user/login")
            .send({
                email: usuarioComum.email,
                senha: usuarioComum.senha
            });

        userId = resUser.body.data.id;

        const resAdm = await admAgent
            .post("/user/login")
            .send({
                email: usuarioAdm.email,
                senha: usuarioAdm.senha
            });

        admId = resAdm.body.data.id;
    });

    it("deve retornar 422 - dados inválidos", async () => {
        const res = await userAgent
            .get("/user/data")
            .query({
                id: userId,
                saveContext: 2
            });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
    });

    it("deve retornar 403 - token não é de adm", async () => {
        const res = await userAgent
            .get("/user/data")
            .query({
                id: admId
            });

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Função não permitida.");
    });

    it("deve retornar 404 - usuário não encontrado", async () => {
        const res = await admAgent
            .get("/user/data")
            .query({
                id: crypto.randomUUID(),
            });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Usuário não encontrado.");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await userAgent
            .get("/user/data")
            .query({
                id: userId
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data).toHaveProperty("nome");
        expect(res.body.data).toHaveProperty("tipo");
        expect(res.body.data).toHaveProperty("email");
        expect(res.body.data).toHaveProperty("cpf");
        expect(res.body.data).toHaveProperty("data_nasc");
        expect(res.body.data).toHaveProperty("telefone");
        expect(res.body.data.nome).toBe(usuarioComum.nome);
        expect(res.body.data.tipo).toBe(usuarioComum.tipo);
        expect(res.body.data.email).toBe(usuarioComum.email);
        expect(res.body.data.cpf).toBe(usuarioComum.cpf);
        expect(res.body.data.data_nasc).toBe(usuarioComum.data_nasc.toISOString());
        expect(res.body.data.telefone).toBe(usuarioComum.telefone);
    });

    it("deve retornar 200 - dados corretos com somente nome e tipo", async () => {
        const res = await userAgent
            .get("/user/data")
            .query({
                id: userId,
                saveContext: 1
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data).toHaveProperty("nome");
        expect(res.body.data).toHaveProperty("tipo");
        expect(res.body.data).not.toHaveProperty("email");
        expect(res.body.data).not.toHaveProperty("cpf");
        expect(res.body.data).not.toHaveProperty("data_nasc");
        expect(res.body.data).not.toHaveProperty("telefone");
        expect(res.body.data.nome).toBe(usuarioComum.nome);
        expect(res.body.data.tipo).toBe(usuarioComum.tipo);
    });

    it("deve retornar 200 - dados corretos de outro usuário", async () => {
        const res = await admAgent
            .get("/user/data")
            .query({
                id: userId
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeInstanceOf(Object);
        expect(res.body.data).toHaveProperty("nome");
        expect(res.body.data).toHaveProperty("tipo");
        expect(res.body.data).toHaveProperty("email");
        expect(res.body.data).toHaveProperty("cpf");
        expect(res.body.data).toHaveProperty("data_nasc");
        expect(res.body.data).toHaveProperty("telefone");
        expect(res.body.data.nome).toBe(usuarioComum.nome);
        expect(res.body.data.tipo).toBe(usuarioComum.tipo);
        expect(res.body.data.email).toBe(usuarioComum.email);
        expect(res.body.data.cpf).toBe(usuarioComum.cpf);
        expect(res.body.data.data_nasc).toBe(usuarioComum.data_nasc.toISOString());
        expect(res.body.data.telefone).toBe(usuarioComum.telefone);
    });

    it("deve retornar 401 - token não fornecido", async () => {
        const res = await request(app)
            .get("/user/data");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Token não fornecido.");
    });
});