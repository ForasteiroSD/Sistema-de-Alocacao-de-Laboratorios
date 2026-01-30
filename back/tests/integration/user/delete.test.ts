import request from "supertest";
import app from "../../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";
import { usuarioAdm, usuarioComum } from "../vitest.setup.js";
import { prisma } from "../../../src/utils/prisma.js";

let userId: string, admId: string;
const userAgent = request.agent(app);
const admAgent = request.agent(app);

describe("Delete User", () => {
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
        const res = await admAgent
            .delete("/user")
            .query({
                id: userId,
                senha: "123458",
            });

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 403 - token não é de adm", async () => {
        const res = await userAgent
            .delete("/user")
            .query({
                id: admId,
                senha: "12345678",
                minhaConta: 0,
            });

        expect(res.status).toBe(403);
        expect(res.text).toBe("Função não permitida");
    });

    it("deve retornar 422 - dados inválidos (senha não informada)", async () => {
        const res = await userAgent
            .delete("/user")
            .query({
                id: userId,
            });

        expect(res.status).toBe(422);
        expect(res.text).toBe("A senha da conta deve ser informada");
    });

    it("deve retornar 401 - senha errada", async () => {
        const res = await userAgent
            .delete("/user")
            .query({
                id: userId,
                senha: "Senha2@123"
            });

        expect(res.status).toBe(401);
        expect(res.text).toBe("Senha inválida");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await userAgent
            .delete("/user")
            .query({
                id: userId,
                senha: "Senha1@123"
            });

        expect(res.status).toBe(200);
        expect(res.text).toBe("Usuário excluido");
        
        const user = await prisma.user.findFirst({ where: { id: userId } });

        expect(user).toBeFalsy();
    });

    it("deve retornar 404 - usuário não encontrado", async () => {
        const res = await admAgent
            .delete("/user")
            .query({
                minhaConta: 0,
                id: crypto.randomUUID(),
            });

        expect(res.status).toBe(404);
        expect(res.text).toBe("Usuário não encontrado");
    });

    it("deve retornar 400 - tentando excluir conta master", async () => {
        const res = await admAgent
            .delete("/user")
            .query({
                minhaConta: 0,
                id: admId,
            });

        expect(res.status).toBe(400);
        expect(res.text).toBe("Você não pode excluir essa conta");
    });

    it("deve retornar 400 - usuário ainda é responsável por laboratórios", async () => {
        const respUser = await prisma.user.findFirst({ where: { tipo: "Responsável" } });

        const res = await admAgent
            .delete("/user")
            .query({
                minhaConta: 0,
                id: respUser!.id,
            });

        expect(res.status).toBe(400);
        expect(res.text).toBe("Usuário ainda é responsável por laboratórios");
    });

    it("deve retornar 200 - dados corretos e adm excluindo conta", async () => {
        const respUser = await prisma.user.findFirst({ where: { tipo: "Responsável" } });
        await prisma.laboratorio.updateMany({ where: { responsavel_id: respUser!.id }, data: { responsavel_id: admId } });

        const res = await admAgent
            .delete("/user")
            .query({
                minhaConta: 0,
                id: respUser!.id,
            });

        expect(res.status).toBe(200);
        expect(res.text).toBe("Usuário excluido");
        
        const user = await prisma.user.findFirst({ where: { id: respUser!.id } });

        expect(user).toBeFalsy();
    });

    it("deve retornar 401 - token não fornecido", async () => {
        const res = await request(app)
            .delete("/user");

        expect(res.status).toBe(401);
        expect(res.text).toBe("Token não fornecido");
    });
});