import request from "supertest";
import app from "../../../src/index.js";
import { generateJWTToken } from "../../../src/utils/auth.js";
import { beforeAll, describe, expect, it } from "vitest";
import { prisma } from "../../../src/utils/prisma.js";
import { usuarioAdm, usuarioComum, usuarioResp } from "../vitest.setup.js";

const userAgent = request.agent(app);
const respAgent = request.agent(app);
const admAgent = request.agent(app);
let userId: string;

describe("Update Lab", () => {
    beforeAll(async () => {
        const userRes = await userAgent
            .post("/user/login")
            .send({
                email: usuarioComum.email,
                senha: usuarioComum.senha
            }).expect(200);

        userId = userRes.body.data.id;

        await admAgent
            .post("/user/login")
            .send({
                email: usuarioAdm.email,
                senha: usuarioAdm.senha
            }).expect(200);

        await respAgent
            .post("/user/login")
            .send({
                email: usuarioResp.email,
                senha: usuarioResp.senha
            }).expect(200);
    });

    it("deve retornar 422 - dados inválidos", async () => {
        const res = await respAgent
            .patch("/lab")
            .send({
                capacidade: "aga",
                projetor: 1,
                quadro: "Nenhum",
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
    });

    it("deve retornar 403 - usuário comum", async () => {
        const res = await userAgent
            .patch("/lab")
            .send({
                nome: "Lab 1",
                capacidade: 40,
                projetor: 1,
                quadro: 1,
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            });

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Função não permitida.");
    });

    it("deve retornar 403 - usuário não é responsável pelo laboratório", async () => {
        const res = await request(app)
            .patch("/lab")
            .send({
                nome: "Lab",
                capacidade: 40,
                projetor: 1,
                quadro: 1,
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            })
            .set("Cookie", [`jwtToken=${generateJWTToken({id: userId, tipo: "Responsável"})}`]);

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Você não tem permissão para atualizar esse laboratório.");
    });

    it("deve retornar 404 - laboratório não encontrado", async () => {
        const res = await admAgent
            .patch("/lab")
            .send({
                novo_responsavel: "000.000.000-00",
                nome: "Lab Qualquer",
                capacidade: 40,
                projetor: 1,
                quadro: 1,
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Laboratório informado não encontrado.");
    });

    it("deve retornar 404 - novo responsável não encontrado", async () => {
        const res = await admAgent
            .patch("/lab")
            .send({
                novo_responsavel: "000.000.000-00",
                nome: "Lab",
                capacidade: 40,
                projetor: 1,
                quadro: 1,
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Novo responsável não encontrado.");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await admAgent
            .patch("/lab")
            .send({
                nome: "Lab",
                capacidade: 40,
                projetor: 1,
                quadro: 1,
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Laboratório atualizado.");

        const updatedLab = await prisma.laboratorio.findFirst({
            where: {
                nome: "Lab"
            }
        });

        expect(updatedLab!.capacidade).toBe(40);
        expect(updatedLab!.projetor).toBe(1);
        expect(updatedLab!.quadro).toBe(1);
        expect(updatedLab!.televisao).toBe(1);
        expect(updatedLab!.ar_condicionado).toBe(3);
        expect(updatedLab!.computador).toBe(20);
    });

    it("deve retornar 200 - dados corretos (atualizando responsável)", async () => {

        const newRespCpf = "195.330.830-93";

        const newResp = await prisma.user.create({
            data: {
                cpf: newRespCpf,
                data_nasc: new Date(),
                email: "newresp@test.com",
                nome: "New Resp",
                senha: "123",
                telefone: "123",
                tipo: "Responsável",
            }
        });

        const res = await admAgent
            .patch("/lab")
            .send({
                nome: "Lab",
                capacidade: 40,
                projetor: 1,
                quadro: 1,
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
                novo_responsavel: newRespCpf,
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Laboratório atualizado.");

        const updatedLab = await prisma.laboratorio.findFirst({
            where: {
                nome: "Lab"
            }
        });

        expect(updatedLab!.responsavel_id).toBe(newResp.id);
    });

    it("deve retonar 401 - usuário não autenticado", async () => {
        const res = await request(app)
            .patch("/lab");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Token não fornecido.");
    });
});