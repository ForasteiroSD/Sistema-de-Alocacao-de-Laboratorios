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
const index_1 = require("../index");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
//Cadastrar usuário
router.post("/user/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Dados do usuário a ser criado
    const { nome, cpf, d_nas, telefone, email, senha, tipo } = req.body;
    const date = new Date(d_nas);
    if (date.toString() === 'Invalid Date') {
        res.status(400).send('Formato de data inválido');
        return;
    }
    try {
        yield prisma.user.create({
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
        res.status(200).send('Usuário cadastrado');
        return;
    }
    catch (error) {
        if (error.code === 'P2002' && error.meta.target[0] === 'cpf') {
            res.status(409).send('CPF já cadastrado');
            return;
        }
        else if (error.code === 'P2002' && error.meta.target[0] === 'email') {
            res.status(409).send('Email já cadastrado');
            return;
        }
        res.status(400).send('Desculpe, não foi possível cadastrar o usuário. Tente novamente mais tarde');
        return;
    }
}));
//Realizar login
router.post("/user/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, senha } = req.body;
    try {
        const user = yield prisma.user.findFirstOrThrow({
            where: {
                email: email,
                senha: senha
            },
            select: {
                id: true,
                nome: true,
                tipo: true
            }
        });
        res.status(200).send({ id: user.id, nome: user.nome, tipo: user.tipo });
        return;
    }
    catch (error) {
        try {
            const count = yield prisma.user.count();
            if (count === 0) {
                const user = yield prisma.user.create({
                    data: {
                        email: email,
                        cpf: 'Master',
                        nome: 'Master',
                        senha: senha,
                        data_nasc: new Date('2000-01-01'),
                        telefone: '(00) 00000-0000',
                        tipo: 'Administrador'
                    }
                });
                res.status(201).send({ id: user.id, nome: user.nome, tipo: user.tipo, first: true });
                return;
            }
        }
        catch (error1) {
            res.status(400).send('Desculpe, não foi possível realizar o login. Tente novamente mais tarde');
            return;
        }
        res.status(404).send('Email ou senha incorretos');
        return;
    }
}));
//Atualizar usuário
router.patch("/user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Dados de busca e a serem atualizados
    //adm = true não precisa informar senha
    //mudarSenha usado com adm, caso administrador queira trocar a senha também sem saber a anterior
    const { id, nome, telefone, email, senha, novasenha, tipo, adm, mudarSenha, changeType } = req.body;
    try {
        yield prisma.user.update({
            where: Object.assign({ id: id }, (!adm && {
                senha: senha
            })),
            data: Object.assign(Object.assign({ nome: nome, telefone: telefone, email: email }, (changeType && {
                tipo: tipo,
            })), (adm && !mudarSenha || {
                senha: novasenha
            }))
        });
        res.status(200).send({ nome: nome });
        return;
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).send('Senha inválida');
            return;
        }
        if (error.code === 'P2002' && error.meta.target[0] === 'email') {
            res.status(409).send('Email já cadastrado');
            return;
        }
        res.status(400).send('Desculpe, não foi possível alterar o usuário. Tente novamente mais tarde');
        return;
    }
}));
//Atualizar primeiro usuário do sistema, utilizado somente logo após primeiro usuário fazer login
router.patch("/user/first", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Dados do primeiro adm do sistema
    const { id, cpf, data_nasc, email, nome, senha, telefone, } = req.body;
    try {
        yield prisma.user.update({
            where: {
                id: id
            },
            data: {
                cpf: cpf,
                data_nasc: new Date(data_nasc),
                email: email,
                nome: nome,
                senha: senha,
                telefone: telefone
            }
        });
        res.status(200).send({ nome: nome });
        return;
    }
    catch (error) {
        res.status(400).send('database off');
        return;
    }
}));
//Deletar usuário
router.delete("/user", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id, senha, minhaConta } = req.query;
    try {
        const labs = yield prisma.laboratorio.findFirst({
            where: {
                responsavel_id: String(id)
            }
        });
        if (labs) {
            res.status(400).send('Usuário ainda é responsável por laboratórios');
            return;
        }
        const user = yield prisma.user.findUnique({
            where: {
                cpf: 'Master'
            }
        });
        if ((user === null || user === void 0 ? void 0 : user.id) === String(id)) {
            res.status(400).send('Você não pode excluir essa conta');
            return;
        }
        yield prisma.user.delete({
            where: Object.assign({ id: String(id) }, (minhaConta && {
                senha: String(senha)
            }))
        });
        res.status(200).send("Usuário excluido");
        return;
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).send("Senha inválida");
            return;
        }
        res.status(400).send('Desculpe, não foi possível remover o usuário. Tente novamente mais tarde');
        return;
    }
}));
//Ver usuários
router.get("/users", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Filtros de busca
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
            },
            orderBy: [
                {
                    tipo: 'asc'
                },
                {
                    nome: 'asc'
                },
            ]
        });
        res.status(200).send(users);
        return;
    }
    catch (error) {
        res.status(400).send('database off');
        return;
    }
}));
//Recuperar nomes do usuário responsáveis
router.get("/users/responsavel", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Caso também queira retornar cpf dos responsáveis
    const { cpf } = req.query;
    try {
        const users = yield prisma.user.findMany({
            where: {
                tipo: 'Responsável'
            },
            select: Object.assign({ nome: true }, (cpf && {
                cpf: true
            }))
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
router.post("/user/data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    //Filtros para busca de usuário
    //saveContext especifica que deseja retornar somente o nome e tipo de usuário
    const { id, saveContext } = req.body;
    try {
        const user = yield prisma.user.findFirstOrThrow({
            where: {
                id: String(id)
            },
            select: Object.assign({ nome: true, tipo: true }, (!saveContext && {
                email: true,
                cpf: true,
                data_nasc: true,
                telefone: true
            }))
        });
        res.status(200).send(user);
        return;
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).send('Usuário inexistente');
            return;
        }
        res.status(400).send('Desculpe, não foi possível buscar os dados do usuário. Tente novamente mais tarde');
        return;
    }
}));
//Recupera dados da página inicial
router.post("/mainpageinfo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.body;
    let today = new Date();
    if (today.getUTCHours() < 3)
        today.setUTCDate(today.getUTCDate() - 1);
    today.setUTCHours(0, 0, 0, 0);
    try {
        const user = yield prisma.user.findUniqueOrThrow({
            where: {
                id: String(id)
            },
            include: {
                _count: {
                    select: {
                        laboratorios: true,
                    }
                }
            }
        });
        const reservas = yield prisma.reserva.findMany({
            where: {
                user_id: String(id),
                data_fim: {
                    gte: today
                }
            },
            include: {
                laboratorio: true,
                dias: {
                    where: {
                        data_inicio: {
                            gte: today
                        }
                    },
                    orderBy: {
                        data_inicio: 'asc'
                    }
                }
            },
            orderBy: {
                data_inicio: 'asc'
            }
        });
        const labsCount = yield prisma.laboratorio.count();
        const reservasCount = yield prisma.reserva.count({
            where: {
                data_fim: {
                    gte: today
                }
            }
        });
        const nextReservas = [];
        for (const reservaInfo of reservas) {
            for (const reserva of reservaInfo.dias) {
                let string_aux1 = (0, index_1.stringData)(reserva.data_inicio, false);
                let string_aux2 = (0, index_1.stringData)(reserva.data_inicio, true);
                nextReservas.push({
                    name: reservaInfo.laboratorio.nome,
                    date: string_aux1,
                    begin: string_aux2,
                    duration: reserva.duracao,
                    dataTotal: reserva.data_inicio.getTime()
                });
            }
        }
        nextReservas.sort((a, b) => a.dataTotal - b.dataTotal);
        nextReservas.slice();
        const mainInfo = [
            {
                name: 'Meus Laboratórios',
                value: user._count.laboratorios
            },
            {
                name: 'Laboratórios Totais',
                value: labsCount
            },
            {
                name: 'Minhas Reservas',
                value: reservas.length
            },
            {
                name: 'Reservas Totais',
                value: reservasCount
            }
        ];
        res.send({ mainInfo: mainInfo, nextReserves: nextReservas.slice(0, 3) });
        return;
    }
    catch (error) {
        if (error.code === 'P2025') {
            res.status(404).send('Usuário inexistente');
            return;
        }
        res.status(400).send('database off');
        return;
    }
}));
exports.default = router;
