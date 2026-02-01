import request from "supertest";
import app from "../../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";
import { usuarioAdm, usuarioComum, usuarioResp } from "../vitest.setup.js";

const userAgent = request.agent(app);
const respAgent = request.agent(app);
const admAgent = request.agent(app);
let userId: string, respId: string;

describe("Create Lab", () => {
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

        const respRes = await respAgent
            .post("/user/login")
            .send({
                email: usuarioResp.email,
                senha: usuarioResp.senha
            }).expect(200);

        respId = respRes.body.data.id;
    });

    it("deve retornar 422 - dados inválidos", async () => {
        const res = await userAgent
            .post("/lab")
            .send({
                responsavel_id: userId,
                nome: "Lab 1",
                capacidade: 10,
                projetor: 1,
                quadro: "Nenhum",
                televisao: "bnh",
                ar_condicionado: "al",
                computador: "0",
                outro: ""
            });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
    });

    it("deve retornar 403 - token de usuário comum", async () => {
        const res = await userAgent
            .post("/lab")
            .send({
                responsavel_id: respId,
                nome: "Lab 1",
                capacidade: 40,
                projetor: 1,
                quadro: 3,
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            });

        expect(res.status).toBe(403);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Função não permitida.");
    });

    it("deve retornar 400 - dados do responsável não informados", async () => {
        const res = await admAgent
            .post("/lab")
            .send({
                nome: "Lab 1",
                capacidade: 40,
                projetor: 1,
                quadro: 3,
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            });
        
        expect(res.status).toBe(400);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Id ou cpf do responsável pelo laboratório deve ser informado.");
    });

    it("deve retornar 404 - cpf invalido", async () => {
        const res = await admAgent
            .post("/lab")
            .send({
                responsavel_cpf: "123.456.789-00",
                nome: "Lab 1",
                capacidade: 40,
                projetor: 1,
                quadro: 3,
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            });

        expect(res.status).toBe(404);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Usuário informado não encontrado.");
    });

    it("deve retornar 201 - dados corretos", async () => {
        const res = await admAgent
            .post("/lab")
            .send({
                responsavel_cpf: usuarioResp.cpf,
                nome: "Lab 1",
                capacidade: 40,
                projetor: 1,
                quadro: 3,
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.body.message).toBe("Laboratório criado.");
    });

    it("deve retornar 409 - nome duplicado", async () => {
        const res = await admAgent
            .post("/lab")
            .send({
                responsavel_id: respId,
                nome: "Lab 1",
                capacidade: 30,
                quadro: 2,
                ar_condicionado: 1,
                computador: 10,
            });
        
        expect(res.status).toBe(409);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Nome de laboratório já cadastrado.");
    });

    it("deve retornar 401 - token não fornecido", async () => {
        const res = await request(app)
            .post("/lab");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Token não fornecido.");
    });

    it("deve retornar 401 - token inválido", async () => {
        const res = await request(app)
            .post("/lab")
            .set("Cookie", [`jwtToken=jgasgjjg1tadga`]);

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Usuário não autenticado.");
    });
});