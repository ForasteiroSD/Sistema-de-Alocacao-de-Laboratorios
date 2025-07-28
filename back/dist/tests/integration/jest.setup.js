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
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const child_process_1 = require("child_process");
const prisma_1 = require("../../utils/prisma");
const auth_1 = require("../../utils/auth");
const testDbPath = path_1.default.resolve(__dirname, "test.db");
//faz configurações iniciais para testes
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    //apaga arquivo do banco
    if (fs_1.default.existsSync(testDbPath)) {
        fs_1.default.unlinkSync(testDbPath);
    }
    //cria arquivo do banco
    (0, child_process_1.execSync)("npx prisma migrate deploy --schema=prisma/dev/schema.dev.prisma", { stdio: "inherit" });
    const users = yield prisma_1.prisma.user.createManyAndReturn({
        data: [
            {
                nome: "Adm",
                cpf: "1",
                data_nasc: new Date("2000-01-01"),
                email: "adm@gmail.com",
                senha: yield (0, auth_1.hashPassword)("Senha1@123"),
                telefone: "1",
                tipo: "Administrador",
            },
            {
                nome: "User",
                cpf: "000.000.000-00",
                data_nasc: new Date("2000-01-01"),
                email: "user@gmail.com",
                senha: yield (0, auth_1.hashPassword)("Senha1@123"),
                telefone: "1",
                tipo: "Usuário",
            },
            {
                nome: "Resp",
                cpf: "111.111.111-11",
                data_nasc: new Date("2000-01-01"),
                email: "resp@gmail.com",
                senha: yield (0, auth_1.hashPassword)("Senha1@123"),
                telefone: "2",
                tipo: "Responsável",
            }
        ],
    });
    const lab = yield prisma_1.prisma.laboratorio.create({
        data: {
            nome: "Lab",
            capacidade: 30,
            ar_contidionado: 1,
            computador: 10,
            projetor: 1,
            quadro: 2,
            televisao: 0,
            responsavel_id: users[2].id
        },
    });
    const dataReserva = new Date("2000-01-01");
    dataReserva.setUTCHours(0, 0, 0, 0);
    const reserva = yield prisma_1.prisma.reserva.create({
        data: {
            tipo: "Única",
            data_fim: dataReserva,
            data_inicio: dataReserva,
            laboratorio_id: lab.id,
            user_id: users[2].id
        }
    });
    const dataReservaAux = new Date(dataReserva);
    dataReserva.setUTCHours(14, 0, 0, 0);
    dataReservaAux.setUTCHours(16, 0, 0, 0);
    const dia = yield prisma_1.prisma.dia.create({
        data: {
            data_inicio: dataReserva,
            data_fim: dataReservaAux,
            duracao: "2:00",
            reserva_id: reserva.id
        }
    });
}));
//apaga arquivo do banco
afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
    yield prisma_1.prisma.$disconnect();
    if (fs_1.default.existsSync(testDbPath)) {
        fs_1.default.unlinkSync(testDbPath);
    }
}));
