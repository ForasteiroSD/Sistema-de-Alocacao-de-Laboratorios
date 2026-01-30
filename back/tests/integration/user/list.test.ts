import request from "supertest";
import app from "../../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";
import { usuarioAdm, usuarioComum, usuarioResp } from "../vitest.setup.js";

let userId: string, admId: string;
const userAgent = request.agent(app);
const admAgent = request.agent(app);

describe("Get all users", () => {
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

    it("deve retornar 403 - token não é de adm", async () => {
        const res = await userAgent
            .get("/user/all");

        expect(res.status).toBe(403);
        expect(res.text).toBe("Função não permitida");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await admAgent
            .get("/user/all");

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(3);
        expect(res.body[0]).toHaveProperty("id");
        expect(res.body[0]).toHaveProperty("nome");
        expect(res.body[0]).toHaveProperty("cpf");
        expect(res.body[0]).toHaveProperty("email");
        expect(res.body[0]).toHaveProperty("tipo");
        
        const userNames = res.body.map((user: any) => user.nome);

        expect(userNames).toContain(usuarioComum.nome);
        expect(userNames).toContain(usuarioAdm.nome);
        expect(userNames).toContain(usuarioResp.nome);
    });

    it("deve retornar 401 - token não fornecido", async () => {
        const res = await request(app)
            .get("/user/all");

        expect(res.status).toBe(401);
        expect(res.text).toBe("Token não fornecido");
    });
});