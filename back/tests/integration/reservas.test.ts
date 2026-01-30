import request from "supertest";
import app from "../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";

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
            .post("/reserva");

        expect(res.status).toBe(401);
        expect(res.text).toBe("Token não fornecido");
    });

    it("deve retornar 401 - token inválido", async () => {
        const res = await request(app)
            .post("/reserva")
            .set("Cookie", [`jwtToken=jgasgjjg1tadga`]);

        expect(res.status).toBe(401);
        expect(res.text).toBe("Usuário não autenticado");
    });

    it("deve retornar 422 - dados incorretos", async () => {
        const res = await request(app)
            .post("/reserva")
            .send({
                userId: userId,
                userName: "Nome",
                tipo: "A",
                labName: "Lab"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 422 - dados incorretos (reserva Única)", async () => {
        const res = await request(app)
            .post("/reserva")
            .send({
                userId: userId,
                userName: "Nome",
                tipo: "Única",
                labName: "Lab",
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 422 - dados incorretos (reserva Única) - data", async () => {
        const date = new Date();
        date.setDate(date.getDate()-7); //date 7 days before today

        const res = await request(app)
            .post("/reserva")
            .send({
                userId: userId,
                userName: "Nome",
                tipo: "Única",
                labName: "Lab",
                data_inicio: date.toISOString(),
                hora_inicio: "14:00",
                duracao: "1:00"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 422 - dados incorretos (reserva Única) - hora e duracao", async () => {
        const date = new Date();
        date.setDate(date.getDate()+7); //date 7 days from today

        const res = await request(app)
            .post("/reserva")
            .send({
                userId: userId,
                userName: "Nome",
                tipo: "Única",
                labName: "Lab",
                data_inicio: date.toISOString(),
                hora_inicio: "14:03",
                duracao: "0:20"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 404 - laboratório inexistente", async () => {
        const date = new Date();
        date.setDate(date.getDate()+7); //date 7 days from today

        const res = await request(app)
            .post("/reserva")
            .send({
                userId: userId,
                userName: "Nome",
                tipo: "Única",
                labName: "Lab 1",
                data_inicio: date.toISOString(),
                hora_inicio: "14:00",
                duracao: "1:00"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(404);
        expect(res.text).toBe("Laboratório informado não encontrado.");
    });

    it("deve retornar 200 - dados corretos (reserva Única)", async () => {
        const date = new Date();
        date.setDate(date.getDate()+7); //date 7 days from today

        const res = await request(app)
            .post("/reserva")
            .send({
                userId: userId,
                userName: "Nome",
                tipo: "Única",
                labName: "Lab",
                data_inicio: date.toISOString(),
                hora_inicio: "14:00",
                duracao: "1:00"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(200);
        expect(res.text).toBe("Reserva realizada");
    });

    it("deve retornar 409 - conflito entre horários", async () => {
        const date = new Date();
        date.setDate(date.getDate()+7); //date 7 days from today

        const res = await request(app)
            .post("/reserva")
            .send({
                userId: userId,
                userName: "Nome",
                tipo: "Única",
                labName: "Lab",
                data_inicio: date.toISOString(),
                hora_inicio: "14:30",
                duracao: "2:00"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(409);
        expect(res.text).toContain("Conflito no dia");
    });

    it("deve retornar 422 - dados incorretos (reserva Diária) - data_fim", async () => {
        const date = new Date();
        date.setDate(date.getDate()+7); //date 7 days from today

        const res = await request(app)
            .post("/reserva")
            .send({
                userId: userId,
                userName: "Nome",
                tipo: "Diária",
                labName: "Lab",
                data_inicio: date.toISOString(),
                data_fim: new Date().toISOString(),
                hora_inicio: "14:00",
                duracao: "0:30"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 200 - dados corretos (reserva Diária)", async () => {
        const initialDate = new Date(), finalDate = new Date();
        initialDate.setDate(initialDate.getDate()+6); //date 6 days from today
        finalDate.setDate(finalDate.getDate()+10); //date 10 days from today

        const res = await request(app)
            .post("/reserva")
            .send({
                userId: userId,
                userName: "Nome",
                tipo: "Diária",
                labName: "Lab",
                data_inicio: initialDate.toISOString(),
                data_fim: finalDate.toISOString(),
                hora_inicio: "15:00",
                duracao: "1:30"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(200);
        expect(res.text).toBe("Reserva realizada");
    });

    it("deve retornar 422 - dados incorretos (reserva Semanal) - horarios", async () => {
        const initialDate = new Date(), finalDate = new Date();
        initialDate.setDate(initialDate.getDate()+6); //date 6 days from today
        finalDate.setDate(finalDate.getDate()+20); //date 20 days from today

        const res = await request(app)
            .post("/reserva")
            .send({
                userId: userId,
                userName: "Nome",
                tipo: "Semanal",
                labName: "Lab",
                data_inicio: initialDate.toISOString(),
                data_fim: finalDate.toISOString(),
                horarios: []
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 422 - dados incorretos (reserva Semanal) - dia_semana", async () => {
        const initialDate = new Date(), finalDate = new Date();
        initialDate.setDate(initialDate.getDate()+6); //date 6 days from today
        finalDate.setDate(finalDate.getDate()+20); //date 20 days from today

        const res = await request(app)
            .post("/reserva")
            .send({
                userId: userId,
                userName: "Nome",
                tipo: "Semanal",
                labName: "Lab",
                data_inicio: initialDate.toISOString(),
                data_fim: finalDate.toISOString(),
                horarios: [
                    {
                        dia_semana: "Hoje",
                        hora_inicio: "15:00",
                        duracao: "1:30"
                    }
                ]
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 200 - dados corretos (reserva Semanal)", async () => {
        const initialDate = new Date(), finalDate = new Date();
        initialDate.setDate(initialDate.getDate()+6); //date 6 days from today
        finalDate.setDate(finalDate.getDate()+20); //date 20 days from today

        const res = await request(app)
            .post("/reserva")
            .send({
                userId: userId,
                userName: "Nome",
                tipo: "Semanal",
                labName: "Lab",
                data_inicio: initialDate.toISOString(),
                data_fim: finalDate.toISOString(),
                horarios: [
                    {
                        dia_semana: "Terça",
                        hora_inicio: "19:00",
                        duracao: "1:00"
                    },
                    {
                        dia_semana: "Quinta",
                        hora_inicio: "19:00",
                        duracao: "1:00"
                    }
                ]
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(200);
        expect(res.text).toBe("Reserva realizada");
    });

    it("deve retornar 422 - dados incorretos (reserva Personalizada) - horarios", async () => {
        const res = await request(app)
            .post("/reserva")
            .send({
                userId: userId,
                userName: "Nome",
                tipo: "Personalizada",
                labName: "Lab",
                horarios: []
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 422 - dados incorretos (reserva Personalizada) - data", async () => {
        const date = new Date();
        date.setDate(date.getDate()-7); //date 7 days before from today

        const res = await request(app)
            .post("/reserva")
            .send({
                userId: userId,
                userName: "Nome",
                tipo: "Personalizada",
                labName: "Lab",
                horarios: [
                    {
                        data: date.toISOString(),
                        hora_inicio: "15:00",
                        duracao: "1:30"
                    }
                ]
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 200 - dados corretos (reserva Personalizada)", async () => {
        const firstDate = new Date(), secondDate = new Date();
        firstDate.setDate(firstDate.getDate()+6); //date 6 days from today
        secondDate.setDate(secondDate.getDate()+9); //date 9 days from today

        const res = await request(app)
            .post("/reserva")
            .send({
                userId: userId,
                userName: "Nome",
                tipo: "Personalizada",
                labName: "Lab",
                data_fim: secondDate.toISOString(),
                horarios: [
                    {
                        data: firstDate.toISOString(),
                        hora_inicio: "19:00",
                        duracao: "1:00"
                    },
                    {
                        data: secondDate.toISOString(),
                        hora_inicio: "19:00",
                        duracao: "1:00"
                    }
                ]
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(200);
        expect(res.text).toBe("Reserva realizada");
    });
});


describe("Get reservas lab", () => {
    it("deve retornar 422 - dados incorretos", async () => {
        const res = await request(app)
            .post("/reservas/lab")
            .send({
                resp_id: respId,
                data_inicio: "2025-02-30",
                tipo: "Diaria"
            })
            .set("Cookie", [`jwtToken=${respToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const res = await request(app)
            .post("/reservas/lab")
            .send({
                resp_id: respId,
                data_inicio: new Date().toISOString()
            })
            .set("Cookie", [`jwtToken=${respToken}`]);

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(1);
    });
});

describe("Get reservas user", () => {
    it("deve retonar 422 - dados incorretos", async () => {
        const res = await request(app)
            .post("/reservas/user")
            .send({
                userId: userId,
                data_inicio: "2025-11--1",
                data_fim: "data",
                tipo: "Tipo errado",
            })
            .set("Cookie", [`jwtToken=${userToken}`]);
        
        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retonar 200 - dados corretos", async () => {
        const res = await request(app)
            .post("/reservas/user")
            .send({
                userId: userId,
                tipo: "Única",
            })
            .set("Cookie", [`jwtToken=${userToken}`]);
        
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(1);
    });
});

describe("Get reservas", () => {
    it("deve retonar 403 - token não é de adm", async () => {
        const res = await request(app)
            .get("/reservas")
            .set("Cookie", [`jwtToken=${respToken}`]);

        expect(res.status).toBe(403);
        expect(res.text).toBe("Função não permitida");
    });

    it("deve retonar 422 - dados incorretos", async () => {
        const res = await request(app)
            .get("/reservas")
            .query({
                labName: "Lab 1",
                data_inicio: "2025-12-06",
                data_fim: "data",
                tipo: "Tipo errado",
            })
            .set("Cookie", [`jwtToken=${admToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retonar 200 - dados corretos", async () => {
        const res = await request(app)
            .get("/reservas")
            .query({
                labName: "Lab",
            })
            .set("Cookie", [`jwtToken=${admToken}`]);

        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(1);
    });
});

describe("Get reserva", () => {
    it("deve retornar 422 - dados incorretos", async () => {
        const res = await request(app)
            .get("/reserva")
            .query({
                id: "iderrado"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 200 - dados corretos", async () => {
        const reserves = await request(app)
            .post("/reservas/user")
            .send({
                userId: userId,
            })
            .set("Cookie", [`jwtToken=${userToken}`]);
            
        for(const reserve of reserves.body) {
            const res = await request(app)
                .get("/reserva")
                .query({
                    id: reserve.id
                })
                .set("Cookie", [`jwtToken=${userToken}`]);

            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty("usuario");
            expect(res.body).toHaveProperty("laboratorio");
            expect(res.body).toHaveProperty("tipo");
            expect(res.body).toHaveProperty("data_inicio");
            expect(res.body).toHaveProperty("data_fim");
        }
    });
});

describe("Delete minha reserva", () => {
    it("deve retornar 422 - dados incorretos", async () => {
        const res = await request(app)
            .delete("/minhareserva")
            .query({
                id: "iderrado"
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 404 - reserva inexistente", async () => {
        const res = await request(app)
            .delete("/minhareserva")
            .query({
                id: userId
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(404);
        expect(res.text).toBe("Reserva informada não encontrada.");
    });

    it("deve retornar 200 - reserva removida", async () => {
        const reserves = await request(app)
            .post("/reservas/user")
            .send({
                userId: userId,
            })
            .set("Cookie", [`jwtToken=${userToken}`]);


        const res = await request(app)
            .delete("/minhareserva")
            .query({
                id: reserves.body[0].id
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(200);
        expect(res.text).toBe("Reserva removida");
    });
});

describe("Delete reserva", () => {
    it("deve retornar 422 - dados incorretos", async () => {
        const res = await request(app)
            .delete("/reserva")
            .query({
                id: "iderrado"
            })
            .set("Cookie", [`jwtToken=${respToken}`]);

        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    });

    it("deve retornar 403 - token não tem permissão", async () => {
        const res = await request(app)
            .delete("/reserva")
            .query({
                id: userId
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        expect(res.status).toBe(403);
        expect(res.text).toBe("Você não pode excluir essa reserva");
    });

    it("deve retornar 404 - reserva inexistente", async () => {
        const res = await request(app)
            .delete("/reserva")
            .query({
                id: userId
            })
            .set("Cookie", [`jwtToken=${respToken}`]);

        expect(res.status).toBe(404);
        expect(res.text).toBe("Reserva não encontrada");
    });

    it("deve retornar 200 - reserva removida", async () => {
        const reserves = await request(app)
            .post("/reservas/user")
            .send({
                userId: userId,
            })
            .set("Cookie", [`jwtToken=${userToken}`]);

        const res = await request(app)
            .delete("/reserva")
            .query({
                id: reserves.body[0].id
            })
            .set("Cookie", [`jwtToken=${respToken}`]);

        expect(res.status).toBe(200);
        expect(res.text).toBe("Reserva removida");
    });
});