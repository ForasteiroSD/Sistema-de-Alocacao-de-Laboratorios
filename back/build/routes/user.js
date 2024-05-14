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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
//Cadastrar usuário
router.post("/user/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nome, cpf, d_nas, telefone, email, senha, tipo } = req.body;
    const date = new Date(d_nas);
    if (date.toString() === 'Invalid Date') {
        res.status(400).send('Data inválida');
        return;
    }
    try {
        const user = yield prisma.user.create({
            data: {
                email: email,
                cpf: cpf,
                nome: nome,
                senha: senha,
                data_nasc: date,
                telefone: telefone,
                tipo: tipo
            }
        });
        res.status(200).send({ id: user.id, nome: nome, tipo: tipo });
    }
    catch (error) {
        if (error.code === 'P2002' && error.meta.target[0] === 'cpf') {
            res.status(409).send('CPF ja cadastrado');
            return;
        }
        else if (error.code === 'P2002' && error.meta.target[0] === 'email') {
            res.status(409).send('Email ja cadastrado');
            return;
        }
        res.status(400).send('database off');
        return;
    }
}));
//Realizar login
router.post("/user/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, senha } = req.body;
    try {
        const user = yield prisma.user.findFirstOrThrow({
            where: {
                AND: {
                    email: email,
                    senha: senha
                }
            },
            select: {
                id: true,
                nome: true,
                tipo: true
            }
        });
        res.status(200).send({ id: user.id, nome: user.nome, tipo: user.tipo });
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).send('Usuário não cadastrado');
            return;
        }
        res.status(400).send('database off');
        return;
    }
}));
//Atualizar usuário
router.patch("/user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, nome, telefone, email, senha, novasenha, tipo } = req.body;
    try {
        yield prisma.user.update({
            where: {
                id: id,
                senha: senha
            },
            data: {
                nome: nome,
                telefone: telefone,
                email: email,
                senha: novasenha,
                tipo: tipo
            }
        });
        res.status(200).send({ nome: nome, tipo: tipo });
        return;
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).send('Senha invalida');
            return;
        }
        if (error.code === 'P2002' && error.meta.target[0] === 'email') {
            res.status(409).send('Email ja cadastrado');
            return;
        }
        res.status(400).send('database off');
        return;
    }
}));
//Deletar usuário
router.delete("/user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, senha } = req.body;
    try {
        const labs = yield prisma.laboratorio.findFirst({
            where: {
                responsavel_id: id
            }
        });
        if (labs) {
            res.status(400).send('Usuario ainda e responsavel por laboratorios');
            return;
        }
        yield prisma.user.delete({
            where: {
                id: String(id),
                senha: senha
            }
        });
        res.status(200).send("Usuario excluido");
        return;
    }
    catch (error) {
        console.log(error);
        if (error.code === 'P2025') {
            res.status(404).send("Senha invalida");
            return;
        }
        res.status(400).send('database off');
        return;
    }
}));
//Ver usuários
router.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { nome, cpf, email, tipo } = req.query;
    try {
        const users = yield prisma.user.findMany({
            where: Object.assign(Object.assign(Object.assign(Object.assign({}, (nome && {
                nome: { contains: String(nome) }
            })), (cpf && {
                cpf: { contains: String(cpf) }
            })), (email && {
                email: { contains: String(email) }
            })), (tipo && {
                tipo: { contains: String(tipo) }
            })),
            select: {
                id: true,
                nome: true,
                cpf: true,
                email: true,
                tipo: true
            }
        });
        res.status(200).send(users);
        return;
    }
    catch (error) {
        res.status(400).send('database off');
        return;
    }
}));
//Recuperar dados de um usuário
router.get("/user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.query;
    try {
        const user = yield prisma.user.findUniqueOrThrow({
            where: {
                id: String(id)
            }
        });
        res.status(200).send(user);
        return;
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).send('Usuario inexistente');
            return;
        }
        res.status(400).send('database off');
        return;
    }
}));
exports.default = router;
