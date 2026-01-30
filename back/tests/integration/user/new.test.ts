import request from "supertest";
import app from "../../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";
import { usuarioAdm, usuarioComum } from "../vitest.setup.js";
import { prisma } from "../../../src/utils/prisma.js";

const userAgent = request.agent(app);
const admAgent = request.agent(app);

describe("Create new user", () => {
    beforeAll(async () => {
        await userAgent
            .post("/user/login")
            .send({
                email: usuarioComum.email,
                senha: usuarioComum.senha
            });

        await admAgent
            .post("/user/login")
            .send({
                email: usuarioAdm.email,
                senha: usuarioAdm.senha
            });
    });

    it("deve retornar 403 - token não é de adm", async () => {
        const res = await userAgent
            .post("/user/create");

        expect(res.status).toBe(403);
        expect(res.text).toBe("Função não permitida");
    });

    it("deve retornar 401 - token não fornecido", async () => {
        const res = await request(app)
            .post("/user/create");

        expect(res.status).toBe(401);
        expect(res.text).toBe("Token não fornecido");
    });

    it("deve retornar 422 - dados inválidos", async () => {
        const res = await admAgent
            .post("/user/create")
            .send({
                nome: "New User",
                cpf: "123.123",
                data_nasc: "2000-14-01",
                telefone: "99af99",
                email: "email1@gmail.com",
                senha: "12345678",
                tipo: "Novo tipo"
            });

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 409 - dados conflitantes (email)", async () => {
        const res = await admAgent
            .post("/user/create")
            .send({
                nome: "New User",
                cpf: "123.123.123-12",
                data_nasc: "2000-01-01",
                telefone: "99999999999",
                email: "user@gmail.com",
                senha: "12345678",
                tipo: "Responsável"
            });

        expect(res.status).toBe(409);
        expect(res.text).toBe("Email já cadastrado");
    });

    it("deve retornar 409 - dados conflitantes (cpf)", async () => {
        const res = await admAgent
            .post("/user/create")
            .send({
                nome: "New User",
                cpf: "222.523.820-07",
                data_nasc: "2000-01-01",
                telefone: "99999999999",
                email: "email1@gmail.com",
                senha: "12345678",
                tipo: "Responsável"
            });

        expect(res.status).toBe(409);
        expect(res.text).toBe("CPF já cadastrado");
    });

    it("deve retornar 201 - dados corretos", async () => {
        const newUserData = {
            nome: "New User",
            cpf: "123.123.123-12",
            data_nasc: "2000-01-01",
            telefone: "99999999999",
            email: "email1@gmail.com",
            senha: "12345678",
            tipo: "Responsável"
        }

        const res = await admAgent
            .post("/user/create")
            .send(newUserData);

            
        expect(res.status).toBe(201);
        expect(res.text).toBe("Usuário cadastrado");

        const user = await prisma.user.findFirst({ where: { cpf: newUserData.cpf } });

        expect(user!.email).toBe(newUserData.email);
        expect(user!.nome).toBe(newUserData.nome);
        expect(user!.telefone).toBe(newUserData.telefone);
        expect(user!.tipo).toBe(newUserData.tipo);
    });
});