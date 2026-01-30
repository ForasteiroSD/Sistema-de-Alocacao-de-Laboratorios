import request from "supertest";
import app from "../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";

let admToken: string, admId: string, userToken: string, userId: string;

//salva tokens e ids para uso
beforeAll(async () => {
    const res = await request(app)
        .post("/user/login")
        .send({
            email: "adm@gmail.com",
            senha: "Senha1@123"
        });

    admId = res.body.id;
    admToken = res.headers["set-cookie"][0].split(";")[0].replace("jwtToken=", "");

    const res1 = await request(app)
        .post("/user/login")
        .send({
            email: "user@gmail.com",
            senha: "Senha1@123"
        });

    userId = res1.body.id;
    userToken = res1.headers["set-cookie"][0].split(";")[0].replace("jwtToken=", "");
});

describe("Login", () => {
    it("deve retornar 422 - dados inválidos", async () => {
        const res = await request(app)
            .post("/user/login")
            .send({
                email: "",
                senha: ""
            });

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 401 - login inválido", async () => {
        const res = await request(app)
            .post("/user/login")
            .send({
                email: "emailqualquer@gmail.com",
                senha: "senhaqualquer"
            });

        expect(res.status).toBe(401);
    });

    it("deve retornar 200 e um token - login válido", async () => {
        const res = await request(app)
            .post("/user/login")
            .send({
                email: "adm@gmail.com",
                senha: "Senha1@123"
            });

        expect(res.status).toBe(200);
        expect(res.text).toBeDefined();
        expect(res.headers["set-cookie"][0]).toBeDefined();
    });
});


describe("Update", () => {
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
    });

    it("deve retornar 401 - token inválido", async () => {
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
            })
            .set("Cookie", [`jwtToken=tokenQualquer`]);
        
        expect(res.status).toBe(401);
    });

    it("deve retornar 422 - dados inválidos (parse falha)", async () => {
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
            })
            .set("Cookie", [`jwtToken=${admToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos")
    });

    it("deve retornar 403 - token não é de administrador", async () => {
        const res = await request(app)
            .patch("/user")
            .send({
                id: admId,
                nome: "Adm",
                telefone: "99999999999",
                email: "adm1@gmail.com",
                senha: "Senha1@123",
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(403);
        expect(res.text).toBe("Função não permitida")
    });

    it("deve retornar 422 - dados inválidos (tipo não informado)", async () => {
        const res = await request(app)
            .patch("/user")
            .send({
                id: userId,
                nome: "User",
                telefone: "99999999999",
                email: "user1@gmail.com",
                changeType: 1
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.text).toBe("Tipo de usuário deve ser informado.")
    });

    it("deve retornar 422 - dados inválidos (senha não informada)", async () => {
        const res = await request(app)
            .patch("/user")
            .send({
                id: userId,
                nome: "User",
                telefone: "99999999999",
                email: "user1@gmail.com",
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.text).toBe("Senha deve ser informada.")
    });

    it("deve retornar 401 - senha incorreta", async () => {
        const res = await request(app)
            .patch("/user")
            .send({
                id: userId,
                nome: "User1",
                telefone: "99999999999",
                email: "user1@gmail.com",
                senha: "Senha2@123",
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(401);
        expect(res.text).toBe("Senha inválida.")
    });

    it("deve retornar 409 - email em uso", async () => {
        const res = await request(app)
            .patch("/user")
            .send({
                id: userId,
                nome: "User1",
                telefone: "99999999999",
                email: "adm@gmail.com",
                senha: "Senha1@123",
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(409);
        expect(res.text).toBe("Este email já está cadastrado.")
    });

    it("deve retornar 200 - dados corretos", async () => {
        const novoNome = "User1";
        const res = await request(app)
            .patch("/user")
            .send({
                id: userId,
                nome: novoNome,
                telefone: "99999999999",
                email: "user1@gmail.com",
                senha: "Senha1@123",
                novasenha: "Senha2@123",
                mudarSenha: 1
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(200);
        expect(res.body.nome).toBe(novoNome);
    });

    it("deve retornar 200 (adm atualizando) - dados corretos", async () => {
        const novoNome = "User";
        const res = await request(app)
            .patch("/user")
            .send({
                id: userId,
                nome: novoNome,
                telefone: "12345678",
                email: "user@gmail.com",
                novasenha: "Senha1@123",
                mudarSenha: 1,
                tipo: "Responsável",
                changeType: 1,
                adm: 1
            })
            .set("Cookie", [`jwtToken=${admToken}`]);

        expect(res.status).toBe(200);
        expect(res.body.nome).toBe(novoNome);
    });
});

describe("Get responsaveis", () => {
    it("deve retornar 422 - dados inválidos", async () => {
        const res = await request(app)
            .get("/user/responsaveis")
            .query({
                cpf: 3
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await request(app)
            .get("/user/responsaveis")
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
    });
});

describe("Get user data", () => {
    it("deve retornar 422 - dados inválidos", async () => {
        const res = await request(app)
            .post("/user/data")
            .send({
                id: userId,
                saveContext: 2
            })
            .set("Cookie", [`jwtToken=${userToken}`])

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 403 - token não é de adm", async () => {
        const res = await request(app)
            .post("/user/data")
            .send({
                id: admId
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(403);
        expect(res.text).toBe("Função não permitida");
    });

    it("deve retornar 404 - usuário não encontrado", async () => {
        const res = await request(app)
            .post("/user/data")
            .send({
                id: "5b3c5675-d7ef-435a-88ef-e3781548e3cc",
            })
            .set("Cookie", [`jwtToken=${admToken}`])

        expect(res.status).toBe(404);
        expect(res.text).toBe("Usuário não encontrado.");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await request(app)
            .post("/user/data")
            .send({
                id: userId
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.nome).toBeDefined();
        expect(res.body.tipo).toBeDefined();
    });
});

describe("Main page info", () => {
    it("deve retornar 422 - dados inválidos", async () => {
        const res = await request(app)
            .get("/user/mainpageinfo")
            .query({
                id: "id-invalido"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await request(app)
            .get("/user/mainpageinfo")
            .query({
                id: userId
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.mainInfo).toHaveLength(4);
        expect(res.body.nextReserves).toBeInstanceOf(Array);
    });
});

describe("Create", () => {
    it("deve retornar 403 - token não é de adm", async () => {
        const res = await request(app)
            .post("/user/create")
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(403);
        expect(res.text).toBe("Função não permitida");
    });

    it("deve retornar 422 - dados inválidos", async () => {
        const res = await request(app)
            .post("/user/create")
            .send({
                nome: "New User",
                cpf: "123.123",
                data_nasc: "2000-14-01",
                telefone: "99af99",
                email: "email1@gmail.com",
                senha: "12345678",
                tipo: "Novo tipo"
            })
            .set("Cookie", [`jwtToken=${admToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 409 - dados conflitantes (email)", async () => {
        const res = await request(app)
            .post("/user/create")
            .send({
                nome: "New User",
                cpf: "123.123.123-12",
                data_nasc: "2000-01-01",
                telefone: "99999999999",
                email: "user@gmail.com",
                senha: "12345678",
                tipo: "Responsável"
            })
            .set("Cookie", [`jwtToken=${admToken}`]);

        expect(res.status).toBe(409);
        expect(res.text).toBe("Email já cadastrado");
    });

    it("deve retornar 409 - dados conflitantes (cpf)", async () => {
        const res = await request(app)
            .post("/user/create")
            .send({
                nome: "New User",
                cpf: "222.523.820-07",
                data_nasc: "2000-01-01",
                telefone: "99999999999",
                email: "email1@gmail.com",
                senha: "12345678",
                tipo: "Responsável"
            })
            .set("Cookie", [`jwtToken=${admToken}`]);

        expect(res.status).toBe(409);
        expect(res.text).toBe("CPF já cadastrado");
    });

    it("deve retornar 201 - dados corretos", async () => {
        const res = await request(app)
            .post("/user/create")
            .send({
                nome: "New User",
                cpf: "123.123.123-12",
                data_nasc: "2000-01-01",
                telefone: "99999999999",
                email: "email1@gmail.com",
                senha: "12345678",
                tipo: "Responsável"
            })
            .set("Cookie", [`jwtToken=${admToken}`]);

        expect(res.status).toBe(201);
        expect(res.text).toBe("Usuário cadastrado");
    });
});

describe("Delete", () => {
    it("deve retornar 422 - dados inválidos", async () => {
        const res = await request(app)
            .delete("/user")
            .query({
                id: userId,
                senha: "123458",
            })
            .set("Cookie", [`jwtToken=${admToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 403 - token não é de adm", async () => {
        const res = await request(app)
            .delete("/user")
            .query({
                id: admId,
                senha: "12345678",
                minhaConta: 0,
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(403);
        expect(res.text).toBe("Função não permitida");
    });

    it("deve retornar 422 - dados inválidos (senha não informada)", async () => {
        const res = await request(app)
            .delete("/user")
            .query({
                id: userId,
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.text).toBe("A senha da conta deve ser informada");
    });

    it("deve retornar 401 - senha errada", async () => {
        const res = await request(app)
            .delete("/user")
            .query({
                id: userId,
                senha: "Senha2@123"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(401);
        expect(res.text).toBe("Senha inválida");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await request(app)
            .delete("/user")
            .query({
                id: userId,
                senha: "Senha1@123"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(200);
        expect(res.text).toBe("Usuário excluido");
    });
});

describe("Get all", () => {
    it("deve retornar 403 - token não é de adm", async () => {
        const res = await request(app)
            .get("/user/all")
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(403);
        expect(res.text).toBe("Função não permitida");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await request(app)
            .get("/user/all")
            .set("Cookie", [`jwtToken=${admToken}`]);

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body[0]).toHaveProperty("id");
        expect(res.body[0]).toHaveProperty("nome");
        expect(res.body[0]).toHaveProperty("cpf");
        expect(res.body[0]).toHaveProperty("email");
        expect(res.body[0]).toHaveProperty("tipo");
    });
});