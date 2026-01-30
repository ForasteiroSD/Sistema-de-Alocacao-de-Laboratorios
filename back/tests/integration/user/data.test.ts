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

        userId = resUser.body.id;

        const resAdm = await admAgent
            .post("/user/login")
            .send({
                email: usuarioAdm.email,
                senha: usuarioAdm.senha
            });

        admId = resAdm.body.id;
    });

    it("deve retornar 422 - dados inválidos", async () => {
        const res = await userAgent
            .get("/user/data")
            .query({
                id: userId,
                saveContext: 2
            });

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 403 - token não é de adm", async () => {
        const res = await userAgent
            .get("/user/data")
            .query({
                id: admId
            });

        expect(res.status).toBe(403);
        expect(res.text).toBe("Função não permitida");
    });

    it("deve retornar 404 - usuário não encontrado", async () => {
        const res = await admAgent
            .get("/user/data")
            .query({
                id: crypto.randomUUID(),
            });

        expect(res.status).toBe(404);
        expect(res.text).toBe("Usuário não encontrado.");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await userAgent
            .get("/user/data")
            .query({
                id: userId
            });

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body).toHaveProperty("nome");
        expect(res.body).toHaveProperty("tipo");
        expect(res.body).toHaveProperty("email");
        expect(res.body).toHaveProperty("cpf");
        expect(res.body).toHaveProperty("data_nasc");
        expect(res.body).toHaveProperty("telefone");
        expect(res.body.nome).toBe(usuarioComum.nome);
        expect(res.body.tipo).toBe(usuarioComum.tipo);
        expect(res.body.email).toBe(usuarioComum.email);
        expect(res.body.cpf).toBe(usuarioComum.cpf);
        expect(res.body.data_nasc).toBe(usuarioComum.data_nasc.toISOString());
        expect(res.body.telefone).toBe(usuarioComum.telefone);
    });

    it("deve retornar 200 - dados corretos com somente nome e tipo", async () => {
        const res = await userAgent
            .get("/user/data")
            .query({
                id: userId,
                saveContext: 1
            });

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body).toHaveProperty("nome");
        expect(res.body).toHaveProperty("tipo");
        expect(res.body).not.toHaveProperty("email");
        expect(res.body).not.toHaveProperty("cpf");
        expect(res.body).not.toHaveProperty("data_nasc");
        expect(res.body).not.toHaveProperty("telefone");
        expect(res.body.nome).toBe(usuarioComum.nome);
        expect(res.body.tipo).toBe(usuarioComum.tipo);
    });

    it("deve retornar 200 - dados corretos de outro usuário", async () => {
        const res = await admAgent
            .get("/user/data")
            .query({
                id: userId
            });

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body).toHaveProperty("nome");
        expect(res.body).toHaveProperty("tipo");
        expect(res.body).toHaveProperty("email");
        expect(res.body).toHaveProperty("cpf");
        expect(res.body).toHaveProperty("data_nasc");
        expect(res.body).toHaveProperty("telefone");
        expect(res.body.nome).toBe(usuarioComum.nome);
        expect(res.body.tipo).toBe(usuarioComum.tipo);
        expect(res.body.email).toBe(usuarioComum.email);
        expect(res.body.cpf).toBe(usuarioComum.cpf);
        expect(res.body.data_nasc).toBe(usuarioComum.data_nasc.toISOString());
        expect(res.body.telefone).toBe(usuarioComum.telefone);
    });

    it("deve retornar 401 - token não fornecido", async () => {
        const res = await request(app)
            .get("/user/data");

        expect(res.status).toBe(401);
        expect(res.text).toBe("Token não fornecido");
    });
});