import request from "supertest";
import app from "../../../src/index.js";
import { describe, expect, it } from "vitest";
import { usuarioAdm } from "../vitest.setup.js";
import { prisma } from "../../../src/utils/prisma.js";

describe("Login", () => {
    it("deve retornar 422 - dados inválidos", async () => {
        const res = await request(app)
            .post("/user/login")
            .send({
                email: "",
                senha: ""
            });

        expect(res.status).toBe(422);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBeDefined();
    });

    it("deve retornar 401 - login inválido", async () => {
        const res = await request(app)
            .post("/user/login")
            .send({
                email: "emailqualquer@gmail.com",
                senha: "senhaqualquer"
            });

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Email ou senha incorretos.");
    });

    it("deve retornar 200 e um token - login válido", async () => {
        const res = await request(app)
            .post("/user/login")
            .send({
                email: usuarioAdm.email,
                senha: usuarioAdm.senha
            });

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.headers["set-cookie"][0]).toBeDefined();
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.data).toHaveProperty("nome");
        expect(res.body.data).toHaveProperty("tipo");
        expect(res.body.data.nome).toBe(usuarioAdm.nome);
        expect(res.body.data.tipo).toBe(usuarioAdm.tipo);
    });

    it("deve retornar 200 e criar novo usuário", async () => {
        await prisma.laboratorio.deleteMany();
        await prisma.user.deleteMany();

        const res = await request(app)
            .post("/user/login")
            .send({
                email: usuarioAdm.email,
                senha: usuarioAdm.senha
            });

        expect(res.status).toBe(201);
        expect(res.body.success).toBe(true);
        expect(res.headers["set-cookie"][0]).toBeDefined();
        expect(res.body.data).toHaveProperty("id");
        expect(res.body.data).toHaveProperty("nome");
        expect(res.body.data).toHaveProperty("tipo");
        expect(res.body.data).toHaveProperty("first");
        expect(res.body.data.nome).toBe("Master");
        expect(res.body.data.tipo).toBe(usuarioAdm.tipo);
        expect(res.body.data.first).toBe(true);

        const newUser = await prisma.user.findFirst();

        expect(newUser!.email).toBe(usuarioAdm.email);
        expect(newUser!.cpf).toBe("Master");
    });
});

describe("Logout", () => {
    it("deve retornar 200 - logout correto", async () => {
        const agent = request.agent(app);

        const resLogin = await agent
            .post("/user/login")
            .send({
                email: usuarioAdm.email,
                senha: usuarioAdm.senha
            });

        expect(resLogin.status).toBe(200);

        const resLogout = await agent
            .get("/user/logout");
        
        expect(resLogout.status).toBe(200);
        expect(resLogout.body.success).toBe(true);
    });
});