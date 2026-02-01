import request from "supertest";
import app from "../../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";
import { usuarioComum } from "../vitest.setup.js";
import { prisma } from "../../../src/utils/prisma.js";

const userAgent = request.agent(app);
let userId: string;

describe("Get Lab Names", () => {
    beforeAll(async () => {
        const res = await userAgent
            .post("/user/login")
            .send({
                email: usuarioComum.email,
                senha: usuarioComum.senha
            }).expect(200);

        userId = res.body.data.id;
    });

    it("deve retornar 422 - dados inválidos", async () => {
        const res = await userAgent
            .get("/lab/user")
            .query({
                user_id: "njhnkakjg"
            });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await userAgent
            .get("/lab/user");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(2);
        expect(res.body.data[0]).toHaveProperty("nome");
    });

    it("deve retornar 200 e filtrar por id de usuario responsável - dados corretos", async () => {
        await prisma.laboratorio.update({ where: { nome: "Lab 2" }, data: { responsavel_id: userId } });

        const labs = await prisma.laboratorio.findMany({ where: { responsavel_id: userId } });

        const res = await userAgent
            .get("/lab/user")
            .query({
                user_id: userId
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.data.length).toBe(1);
        expect(res.body.data[0].nome).toBe("Lab 2");
    });

    it("deve retonar 401 - usuário não autenticado", async () => {
        const res = await request(app)
            .get("/lab/user");

        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Token não fornecido.");
    });
});
