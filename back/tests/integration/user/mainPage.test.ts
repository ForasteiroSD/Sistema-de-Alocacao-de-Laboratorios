import request from "supertest";
import app from "../../../src/index.js";
import { beforeAll, describe, expect, it } from "vitest";
import { usuarioComum, usuarioResp } from "../vitest.setup.js";
import { prisma } from "../../../src/utils/prisma.js";

let userId: string
const userAgent = request.agent(app);

describe("User main page info", () => {
    beforeAll(async () => {
        const resUser = await userAgent
            .post("/user/login")
            .send({
                email: usuarioComum.email,
                senha: usuarioComum.senha
            });

        userId = resUser.body.data.id;
    });

    it("deve retornar 200 - dados corretos", async () => {
        const dataReserva = new Date();
        dataReserva.setUTCDate(dataReserva.getUTCDate()+1);
        dataReserva.setUTCHours(0, 0, 0, 0);
        const dataFimReserva = new Date(dataReserva.setUTCDate(dataReserva.getUTCDate()+1));

        const lab = await prisma.laboratorio.findFirst();
        const reserva = await prisma.reserva.create({
            data: {
                tipo: "Diária",
                data_inicio: dataReserva,
                data_fim: dataFimReserva,
                laboratorio_id: lab!.id,
                user_id: userId
            }
        });
    
        const dataReservaHorario = new Date(dataReserva);
        const dataFimReservaHorario = new Date(dataFimReserva);
        dataReserva.setUTCHours(14, 0, 0, 0);
        dataReservaHorario.setUTCHours(16, 0, 0, 0);
        dataFimReserva.setUTCHours(14, 0, 0, 0);
        dataFimReservaHorario.setUTCHours(16, 0, 0, 0);
        await prisma.dia.createMany({
            data: [
                {
                    data_inicio: dataReserva,
                    data_fim: dataReservaHorario,
                    duracao: "2:00",
                    reserva_id: reserva.id
                },
                {
                    data_inicio: dataFimReserva,
                    data_fim: dataFimReservaHorario,
                    duracao: "2:00",
                    reserva_id: reserva.id
                }
            ]
        })

        const res = await userAgent
            .get("/user/mainpageinfo");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.mainInfo).toHaveLength(4);
        expect(res.body.nextReserves).toBeInstanceOf(Array);
        
        const mainInfo = res.body.mainInfo;
        
        mainInfo.forEach((element: any) => {
            expect(element).toHaveProperty("name");
            expect(element).toHaveProperty("value");
        });

        expect(mainInfo[0].name).toBe("Meus Laboratórios");
        expect(mainInfo[0].value).toBe(0);

        expect(mainInfo[1].name).toBe("Laboratórios Totais");
        expect(mainInfo[1].value).toBe(2);

        expect(mainInfo[2].name).toBe("Minhas Reservas");
        expect(mainInfo[2].value).toBe(1);

        expect(mainInfo[3].name).toBe("Reservas Totais");
        expect(mainInfo[3].value).toBe(1);

        expect(res.body.nextReserves.length).toBe(2);
    });

    it("deve retornar 200 - dados corretos com quantidade laboratórios do usuário", async () => {
        const respAgent = request.agent(app);

        await respAgent
            .post("/user/login")
            .send({
                email: usuarioResp.email,
                senha: usuarioResp.senha
            }).expect(200);

        const res = await respAgent
            .get("/user/mainpageinfo");

        expect(res.status).toBe(200);
        expect(res.body.success).toBe(true);
        expect(res.body).toBeInstanceOf(Object);
        expect(res.body.mainInfo[0].name).toBe("Meus Laboratórios");
        expect(res.body.mainInfo[0].value).toBe(2);
        expect(res.body.nextReserves.length).toBe(0);
    });

    it("deve retornar 401 - token não fornecido", async () => {
        const res = await request(app)
            .get("/user/mainpageinfo");

        expect(res.status).toBe(401);
        expect(res.body.success).toBe(false);
        expect(res.body.message).toBe("Token não fornecido.");
    });
});