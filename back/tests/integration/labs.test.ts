import request from "supertest";
import app from "../../src/index.js";
import { generateJWTToken } from "../../src/utils/auth.js";

let admToken: string, admId: string, userToken: string, userId: string, respToken: string, respId: string;

beforeAll(async () => {
    //salva tokens e ids para uso
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

    const res2 = await request(app)
        .post("/user/login")
        .send({
            email: "resp@gmail.com",
            senha: "Senha1@123"
        });

    respId = res2.body.id;
    respToken = res2.headers["set-cookie"][0].split(";")[0].replace("jwtToken=", "");
});


describe("Create", () => {
    it("deve retornar 401 - token não fornecido", async () => {
        const res = await request(app)
            .post("/lab");

        expect(res.status).toBe(401);
        expect(res.text).toBe("Token não fornecido");
    });

    it("deve retornar 401 - token inválido", async () => {
        const res = await request(app)
            .post("/lab")
            .set("Cookie", [`jwtToken=jgasgjjg1tadga`]);

        expect(res.status).toBe(401);
        expect(res.text).toBe("Usuário não autenticado");
    });

    it("deve retornar 422 - dados inválidos", async () => {
        const res = await request(app)
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
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 403 - token de usuário comum", async () => {
        const res = await request(app)
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
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(403);
        expect(res.text).toBe("Função não permitida");
    });

    it("deve retorar 400 - dados do responsável não informados", async () => {
        const res = await request(app)
            .post("/lab")
            .send({
                nome: "Lab 1",
                capacidade: 40,
                projetor: 1,
                quadro: 3,
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            })
            .set("Cookie", [`jwtToken=${admToken}`]);
        
        expect(res.status).toBe(400);
        expect(res.text).toBe("Id ou cpf do responsável pelo laboratório deve ser informado");
    });

    it("deve retornar 404 - cpf invalido", async () => {
        const res = await request(app)
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
            })
            .set("Cookie", [`jwtToken=${admToken}`]);

        expect(res.status).toBe(404);
        expect(res.text).toBe("Responsável não encontrado");
    });

    it("deve retornar 201 - dados corretos", async () => {
        const res = await request(app)
            .post("/lab")
            .send({
                responsavel_cpf: "111.111.111-11",
                nome: "Lab 1",
                capacidade: 40,
                projetor: 1,
                quadro: 3,
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            })
            .set("Cookie", [`jwtToken=${admToken}`]);

        expect(res.status).toBe(201);
        expect(res.text).toBe("Laboratório criado");
    });

    it("deve retornar 409 - nome duplicado", async () => {
        const res = await request(app)
            .post("/lab")
            .send({
                responsavel_id: respId,
                nome: "Lab 1",
                capacidade: 30,
                quadro: 2,
                ar_condicionado: 1,
                computador: 10,
            })
            .set("Cookie", [`jwtToken=${admToken}`]);
        
        expect(res.status).toBe(409);
        expect(res.text).toBe("Nome já cadastrado");
    });
});

describe("Update", () => {
    it("deve retornar 422 - dados inválidos", async () => {
        const res = await request(app)
            .patch("/lab")
            .send({
                capacidade: "aga",
                projetor: 1,
                quadro: "Nenhum",
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            })
            .set("Cookie", [`jwtToken=${respToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 403 - usuário comum", async () => {
        const res = await request(app)
            .patch("/lab")
            .send({
                nome: "Lab 1",
                capacidade: 40,
                projetor: 1,
                quadro: 1,
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(403);
        expect(res.text).toBe("Função não permitida");
    });

    it("deve retornar 403 - usuário não é responsável pelo laboratório", async () => {
        const res = await request(app)
            .patch("/lab")
            .send({
                nome: "Lab 1",
                capacidade: 40,
                projetor: 1,
                quadro: 1,
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            })
            .set("Cookie", [`jwtToken=${generateJWTToken({id: userId, tipo: "Responsável"})}`]);

        expect(res.status).toBe(403);
        expect(res.text).toBe("Você não tem permissão para atualizar esse laboratório");
    });

    it("deve retornar 404 - novo responsável não encontrado", async () => {
        const res = await request(app)
            .patch("/lab")
            .send({
                novo_responsavel: "000.000.000-00",
                nome: "Lab 1",
                capacidade: 40,
                projetor: 1,
                quadro: 1,
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            })
            .set("Cookie", [`jwtToken=${admToken}`]);

        expect(res.status).toBe(404);
        expect(res.text).toBe("Responsável não encontrado");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await request(app)
            .patch("/lab")
            .send({
                nome: "Lab 1",
                capacidade: 40,
                projetor: 1,
                quadro: 1,
                televisao: 1,
                ar_condicionado: 3,
                computador: 20,
            })
            .set("Cookie", [`jwtToken=${admToken}`]);

        expect(res.status).toBe(200);
        expect(res.text).toBe("Laboratório atualizado");
    });
});

describe("Get All", () => {
    it("deve retornar 422 - dados inválidos", async () => {
        const res = await request(app)
            .get("/lab/all")
            .query({
                capacidade_minima: "-1"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await request(app)
            .get("/lab/all")
            .query({
                nome: "Lab 1"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
    });
});

describe("Get", () => {
    it("deve retornar 422 - dados inválidos", async () => {
        const res = await request(app)
            .get("/lab")
            .query({
                nome: ""
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retonar 404 - laboratório inexistente", async () => {
        const res = await request(app)
            .get("/lab")
            .query({
                nome: "Laboratório qualquer"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(404);
        expect(res.text).toBe("Laboratório inexistente");
    });

    it("deve retonar 200 - dados corretos", async () => {
        const res = await request(app)
            .get("/lab")
            .query({
                nome: "Lab 1"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body).toHaveProperty("nome");
        expect(res.body).toHaveProperty("responsavelNome");
        expect(res.body).toHaveProperty("responsavelCpf");
        expect(res.body).toHaveProperty("capacidade");
        expect(res.body).toHaveProperty("projetores");
        expect(res.body).toHaveProperty("quadros");
        expect(res.body).toHaveProperty("televisoes");
        expect(res.body).toHaveProperty("ar_condicionados");
        expect(res.body).toHaveProperty("computadores");
        expect(res.body).toHaveProperty("outro");
    });
});

describe("Get lab names", () => {
    it("deve retornar 422 - dados inválidos", async () => {
        const res = await request(app)
            .post("/lab/user")
            .send({
                user_id: "njhnkakjg"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await request(app)
            .post("/lab/user")
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(2);
    });
});

describe("Get reservas", () => {
    it("deve retornar 422", async () => {
        const res = await request(app)
            .get("/lab/reservasdia")
            .query({
                nome: "Lab 1",
                dia: "2000-14-05"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 404 - laboratório inexistente", async () => {
        const res = await request(app)
            .get("/lab/reservasdia")
            .query({
                nome: "Lab 2",
                dia: "2000-11-05"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(404);
        expect(res.text).toBe("Laboratório inexistente");
    });

    it("deve retornar 404 - nenhuma reserva no dia", async () => {
        const res = await request(app)
            .get("/lab/reservasdia")
            .query({
                nome: "Lab 1",
                dia: "2000-11-05"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(404);
        expect(res.text).toBe("Não há reservas no dia");
    });

    it("deve retornar 200 - dados corretos e reservas encontradas", async () => {
        const res = await request(app)
            .get("/lab/reservasdia")
            .query({
                nome: "Lab",
                dia: "2000-01-01"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(1);
    });
});