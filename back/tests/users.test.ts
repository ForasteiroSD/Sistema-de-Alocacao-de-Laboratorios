import request from "supertest";
import app from "../index";

let admToken: string, admId: string, userToken: string, userId: string;

//get tokens and ids to use
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

    it("deve retornar 422 - dados inválidos", async () => {
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
        expect(res.text).toBe("Senha inválida")
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
        expect(res.text).toBe("Email já cadastrado")
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