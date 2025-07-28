"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const supertest_1 = __importDefault(require("supertest"));
const index_1 = __importDefault(require("../../index"));
let admToken, admId, userToken, userId, respToken, respId;
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    //salva tokens e ids para uso
    const res = yield (0, supertest_1.default)(index_1.default)
        .post("/user/login")
        .send({
        email: "adm@gmail.com",
        senha: "Senha1@123"
    });
    admId = res.body.id;
    admToken = res.headers["set-cookie"][0].split(";")[0].replace("jwtToken=", "");
    const res1 = yield (0, supertest_1.default)(index_1.default)
        .post("/user/login")
        .send({
        email: "user@gmail.com",
        senha: "Senha1@123"
    });
    userId = res1.body.id;
    userToken = res1.headers["set-cookie"][0].split(";")[0].replace("jwtToken=", "");
    const res2 = yield (0, supertest_1.default)(index_1.default)
        .post("/user/login")
        .send({
        email: "resp@gmail.com",
        senha: "Senha1@123"
    });
    respId = res2.body.id;
    respToken = res2.headers["set-cookie"][0].split(";")[0].replace("jwtToken=", "");
}));
describe("Create", () => {
    it("deve retornar 401 - token não fornecido", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .post("/reserva");
        expect(res.status).toBe(401);
        expect(res.text).toBe("Token não fornecido");
    }));
    it("deve retornar 401 - token inválido", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .post("/reserva")
            .set("Cookie", [`jwtToken=jgasgjjg1tadga`]);
        expect(res.status).toBe(401);
        expect(res.text).toBe("Usuário não autenticado");
    }));
    it("deve retornar 422 - dados incorretos", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
    it("deve retornar 422 - dados incorretos (reserva Única)", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
    it("deve retornar 422 - dados incorretos (reserva Única) - data", () => __awaiter(void 0, void 0, void 0, function* () {
        const date = new Date();
        date.setDate(date.getDate() - 7); //date 7 days before today
        const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
    it("deve retornar 422 - dados incorretos (reserva Única) - hora e duracao", () => __awaiter(void 0, void 0, void 0, function* () {
        const date = new Date();
        date.setDate(date.getDate() + 7); //date 7 days from today
        const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
    it("deve retornar 404 - laboratório inexistente", () => __awaiter(void 0, void 0, void 0, function* () {
        const date = new Date();
        date.setDate(date.getDate() + 7); //date 7 days from today
        const res = yield (0, supertest_1.default)(index_1.default)
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
        expect(res.text).toBe("Laboratório Inexistente");
    }));
    it("deve retornar 200 - dados corretos (reserva Única)", () => __awaiter(void 0, void 0, void 0, function* () {
        const date = new Date();
        date.setDate(date.getDate() + 7); //date 7 days from today
        const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
    it("deve retornar 409 - conflito entre horários", () => __awaiter(void 0, void 0, void 0, function* () {
        const date = new Date();
        date.setDate(date.getDate() + 7); //date 7 days from today
        const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
    it("deve retornar 422 - dados incorretos (reserva Diária) - data_fim", () => __awaiter(void 0, void 0, void 0, function* () {
        const date = new Date();
        date.setDate(date.getDate() + 7); //date 7 days from today
        const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
    it("deve retornar 200 - dados corretos (reserva Diária)", () => __awaiter(void 0, void 0, void 0, function* () {
        const initialDate = new Date(), finalDate = new Date();
        initialDate.setDate(initialDate.getDate() + 6); //date 6 days from today
        finalDate.setDate(finalDate.getDate() + 10); //date 10 days from today
        const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
    it("deve retornar 422 - dados incorretos (reserva Semanal) - horarios", () => __awaiter(void 0, void 0, void 0, function* () {
        const initialDate = new Date(), finalDate = new Date();
        initialDate.setDate(initialDate.getDate() + 6); //date 6 days from today
        finalDate.setDate(finalDate.getDate() + 20); //date 20 days from today
        const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
    it("deve retornar 422 - dados incorretos (reserva Semanal) - dia_semana", () => __awaiter(void 0, void 0, void 0, function* () {
        const initialDate = new Date(), finalDate = new Date();
        initialDate.setDate(initialDate.getDate() + 6); //date 6 days from today
        finalDate.setDate(finalDate.getDate() + 20); //date 20 days from today
        const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
    it("deve retornar 200 - dados corretos (reserva Semanal)", () => __awaiter(void 0, void 0, void 0, function* () {
        const initialDate = new Date(), finalDate = new Date();
        initialDate.setDate(initialDate.getDate() + 6); //date 6 days from today
        finalDate.setDate(finalDate.getDate() + 20); //date 20 days from today
        const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
    it("deve retornar 422 - dados incorretos (reserva Personalizada) - horarios", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
    it("deve retornar 422 - dados incorretos (reserva Personalizada) - data", () => __awaiter(void 0, void 0, void 0, function* () {
        const date = new Date();
        date.setDate(date.getDate() - 7); //date 7 days before from today
        const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
    it("deve retornar 200 - dados corretos (reserva Personalizada)", () => __awaiter(void 0, void 0, void 0, function* () {
        const firstDate = new Date(), secondDate = new Date();
        firstDate.setDate(firstDate.getDate() + 6); //date 6 days from today
        secondDate.setDate(secondDate.getDate() + 9); //date 9 days from today
        const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
});
describe("Get reservas lab", () => {
    it("deve retornar 422 - dados incorretos", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .post("/reservas/lab")
            .send({
            resp_id: respId,
            data_inicio: "2025-02-30",
            tipo: "Diaria"
        })
            .set("Cookie", [`jwtToken=${respToken}`]);
        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    }));
    it("deve retornar 200 - dados corretos", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .post("/reservas/lab")
            .send({
            resp_id: respId,
            data_inicio: new Date().toISOString()
        })
            .set("Cookie", [`jwtToken=${respToken}`]);
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(1);
    }));
});
describe("Get reservas user", () => {
    it("deve retonar 422 - dados incorretos", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
    it("deve retonar 200 - dados corretos", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .post("/reservas/user")
            .send({
            userId: userId,
            tipo: "Única",
        })
            .set("Cookie", [`jwtToken=${userToken}`]);
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBe(1);
    }));
});
describe("Get reservas", () => {
    it("deve retonar 403 - token não é de adm", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .get("/reservas")
            .set("Cookie", [`jwtToken=${respToken}`]);
        expect(res.status).toBe(403);
        expect(res.text).toBe("Função não permitida");
    }));
    it("deve retonar 422 - dados incorretos", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
    it("deve retonar 200 - dados corretos", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .get("/reservas")
            .query({
            labName: "Lab",
        })
            .set("Cookie", [`jwtToken=${admToken}`]);
        expect(res.status).toBe(200);
        expect(res.body).toBeInstanceOf(Array);
        expect(res.body.length).toBeGreaterThan(1);
    }));
});
describe("Get reserva", () => {
    it("deve retornar 422 - dados incorretos", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .get("/reserva")
            .query({
            id: "iderrado"
        })
            .set("Cookie", [`jwtToken=${userToken}`]);
        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    }));
    it("deve retornar 200 - dados corretos", () => __awaiter(void 0, void 0, void 0, function* () {
        const reserves = yield (0, supertest_1.default)(index_1.default)
            .post("/reservas/user")
            .send({
            userId: userId,
        })
            .set("Cookie", [`jwtToken=${userToken}`]);
        for (const reserve of reserves.body) {
            const res = yield (0, supertest_1.default)(index_1.default)
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
    }));
});
describe("Delete minha reserva", () => {
    it("deve retornar 422 - dados incorretos", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .delete("/minhareserva")
            .query({
            id: "iderrado"
        })
            .set("Cookie", [`jwtToken=${userToken}`]);
        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    }));
    it("deve retornar 404 - reserva inexistente", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .delete("/minhareserva")
            .query({
            id: userId
        })
            .set("Cookie", [`jwtToken=${userToken}`]);
        expect(res.status).toBe(404);
        expect(res.text).toBe("Reserva inexistente");
    }));
    it("deve retornar 200 - reserva removida", () => __awaiter(void 0, void 0, void 0, function* () {
        const reserves = yield (0, supertest_1.default)(index_1.default)
            .post("/reservas/user")
            .send({
            userId: userId,
        })
            .set("Cookie", [`jwtToken=${userToken}`]);
        const res = yield (0, supertest_1.default)(index_1.default)
            .delete("/minhareserva")
            .query({
            id: reserves.body[0].id
        })
            .set("Cookie", [`jwtToken=${userToken}`]);
        expect(res.status).toBe(200);
        expect(res.text).toBe("Reserva removida");
    }));
});
describe("Delete reserva", () => {
    it("deve retornar 422 - dados incorretos", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .delete("/reserva")
            .query({
            id: "iderrado"
        })
            .set("Cookie", [`jwtToken=${respToken}`]);
        expect(res.status).toBe(422);
        expect(res.body.message).toBe("Dados inválidos");
    }));
    it("deve retornar 403 - token não tem permissão", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .delete("/reserva")
            .query({
            id: userId
        })
            .set("Cookie", [`jwtToken=${userToken}`]);
        expect(res.status).toBe(403);
        expect(res.text).toBe("Você não pode excluir essa reserva");
    }));
    it("deve retornar 404 - reserva inexistente", () => __awaiter(void 0, void 0, void 0, function* () {
        const res = yield (0, supertest_1.default)(index_1.default)
            .delete("/reserva")
            .query({
            id: userId
        })
            .set("Cookie", [`jwtToken=${respToken}`]);
        expect(res.status).toBe(404);
        expect(res.text).toBe("Reserva não encontrada");
    }));
    it("deve retornar 200 - reserva removida", () => __awaiter(void 0, void 0, void 0, function* () {
        const reserves = yield (0, supertest_1.default)(index_1.default)
            .post("/reservas/user")
            .send({
            userId: userId,
        })
            .set("Cookie", [`jwtToken=${userToken}`]);
        const res = yield (0, supertest_1.default)(index_1.default)
            .delete("/reserva")
            .query({
            id: reserves.body[0].id
        })
            .set("Cookie", [`jwtToken=${respToken}`]);
        expect(res.status).toBe(200);
        expect(res.text).toBe("Reserva removida");
    }));
});
