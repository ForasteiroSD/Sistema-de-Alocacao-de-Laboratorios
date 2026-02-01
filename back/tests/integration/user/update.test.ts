import request from "supertest";
import app from "../../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";
import { usuarioAdm, usuarioComum } from "../vitest.setup.js";
import { prisma } from "../../../src/utils/prisma.js";

let userId: string, admId: string;
const userAgent = request.agent(app);
const admAgent = request.agent(app);

describe("Update", () => {
    beforeAll(async () => {
        const userRes = await userAgent
            .post("/user/login")
            .send({
                email: usuarioComum.email,
                senha: usuarioComum.senha
            });

        userId = userRes.body.data.id;

        const admRes = await admAgent
            .post("/user/login")
            .send({
                email: usuarioAdm.email,
                senha: usuarioAdm.senha
            });

        admId = admRes.body.data.id;
    });

    it("deve retornar 401 - token não fornecido", async () => {
        const res = await request(app)
            .patch("/user")
            .send({
                id: "",
                nome: "",
                telefone: "",
                email: "",
                novasenha: "",
                tipo: "",
                senha: "",
                adm: "",
                mudarSenha: "",
                changeType: ""
            });
        
        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Token não fornecido.");
    });

    it("deve retornar 422 - dados inválidos (parse falha)", async () => {
        const res = await admAgent
            .patch("/user")
            .send({
                id: "",
                nome: "",
                telefone: "",
                email: "",
                novasenha: "",
                tipo: "",
                senha: "",
                adm: "",
                mudarSenha: "",
                changeType: ""
            });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
    });

    it("deve retornar 403 - token não é de administrador", async () => {
        const res = await userAgent
            .patch("/user")
            .send({
                id: admId,
                nome: "Adm",
                telefone: "99999999999",
                email: "adm1@gmail.com",
                senha: "Senha1@123",
            });

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Função não permitida.");
    });

    it("deve retornar 422 - dados inválidos (tipo não informado)", async () => {
        const res = await userAgent
            .patch("/user")
            .send({
                id: userId,
                nome: "User",
                telefone: "99999999999",
                email: "user1@gmail.com",
                changeType: 1
            });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Tipo de usuário deve ser informado.");
    });

    it("deve retornar 422 - dados inválidos (senha não informada)", async () => {
        const res = await userAgent
            .patch("/user")
            .send({
                id: userId,
                nome: "User",
                telefone: "99999999999",
                email: "user1@gmail.com",
            });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Senha deve ser informada.");
    });

    it("deve retornar 401 - senha incorreta", async () => {
        const res = await userAgent
            .patch("/user")
            .send({
                id: userId,
                nome: "User1",
                telefone: "99999999999",
                email: "user1@gmail.com",
                senha: "Senha2@123",
            });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Senha inválida.");
    });

    it("deve retornar 409 - email em uso", async () => {
        const res = await userAgent
            .patch("/user")
            .send({
                id: userId,
                nome: "User1",
                telefone: "99999999999",
                email: "adm@gmail.com",
                senha: "Senha1@123",
            });

        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Este email já está cadastrado.");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const novoNome = "User1";
        const novoEmail = "userUpdateEmail@gmail.com";
        const res = await userAgent
            .patch("/user")
            .send({
                id: userId,
                nome: novoNome,
                telefone: "99999999999",
                email: novoEmail,
                senha: "Senha1@123",
                novasenha: "Senha2@123",
                mudarSenha: 1
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.nome).toBe(novoNome);

        const user = await prisma.user.findFirst({ where: { id: userId } });

        expect(user!.email).toBe(novoEmail);
    });

    it("deve retornar 200 (adm atualizando) - dados corretos", async () => {
        const novoNome = "User";
        const novoEmail = "admUpdateEmail@gmail.com";
        const res = await admAgent
            .patch("/user")
            .send({
                id: userId,
                nome: novoNome,
                telefone: "12345678",
                email: novoEmail,
                novasenha: "Senha1@123",
                mudarSenha: 1,
                tipo: "Responsável",
                changeType: 1,
                adm: 1
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.nome).toBe(novoNome);

        const user = await prisma.user.findFirst({ where: { id: userId } });

        expect(user!.email).toBe(novoEmail);
    });
});