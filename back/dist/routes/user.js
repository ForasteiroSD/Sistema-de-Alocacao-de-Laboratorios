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
const formatDate_1 = require("../utils/formatDate");
const schemas_1 = require("../schemas");
const auth_1 = require("../utils/auth");
const prisma_1 = require("../utils/prisma");
const env_1 = require("../utils/env");
const auth_middleware_1 = require("../middlewares/auth_middleware");
const adm_middleware_1 = require("../middlewares/adm_middleware");
const router = (0, express_1.Router)();
//Realizar login
router.post("/login", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const parse = schemas_1.UserLoginSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }
    const { email, senha } = parse.data;
    try {
        const user = yield prisma_1.prisma.user.findUnique({
            where: {
                email: email,
            },
            select: {
                id: true,
                nome: true,
                tipo: true,
                senha: true
            }
        });
        if (!user) {
            const count = yield prisma_1.prisma.user.count();
            if (count === 0) {
                const user = yield prisma_1.prisma.user.create({
                    data: {
                        email: email,
                        cpf: 'Master',
                        nome: 'Master',
                        senha: yield (0, auth_1.hashPassword)(senha),
                        data_nasc: new Date('2000-01-01'),
                        telefone: '(00) 00000-0000',
                        tipo: 'Administrador'
                    }
                });
                const jwtToken = (0, auth_1.generateJWTToken)({ id: user.id, tipo: user.tipo });
                res.cookie("jwtToken", jwtToken, Object.assign(Object.assign({ httpOnly: true }, (((_a = env_1.env.NODE_ENV) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes("production")) && {
                    secure: true, //true para https e sameSite = none
                    sameSite: "none",
                })), { maxAge: 60 * 60 * 24 * 1000 }));
                res.status(201).send({ id: user.id, nome: user.nome, tipo: user.tipo, first: true });
                return;
            }
        }
        if (!user || !(yield (0, auth_1.comparePasswords)(senha, user.senha))) {
            return res.status(401).send('Email ou senha incorretos');
        }
        const jwtToken = (0, auth_1.generateJWTToken)({ id: user.id, tipo: user.tipo });
        res.cookie("jwtToken", jwtToken, Object.assign(Object.assign({ httpOnly: true }, (((_b = env_1.env.NODE_ENV) === null || _b === void 0 ? void 0 : _b.toLowerCase().includes("production")) && {
            secure: true, //true para https e sameSite = none
            sameSite: "none",
        })), { maxAge: 60 * 60 * 24 * 1000 }));
        return res.status(200).json({
            id: user.id,
            nome: user.nome,
            tipo: user.tipo
        });
    }
    catch (error) {
        res.status(500).send('Desculpe, não foi possível realizar o login. Tente novamente mais tarde');
        return;
    }
}));
//Middleware de autênticação para próximas rotas
router.use(auth_middleware_1.authenticate);
//Atualizar usuário
router.patch("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parse = schemas_1.UserUpdateSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }
    const tokenData = req.userData;
    const { id, nome, telefone, email, senha, novasenha, tipo } = parse.data;
    const adm = parse.data.adm === 1;
    const mudarSenha = parse.data.mudarSenha === 1;
    const changeType = parse.data.changeType === 1;
    let novasenhaHash;
    //Valida se usuáio realmente é um administrador
    if ((adm || id != tokenData.id) && tokenData.tipo !== "Administrador") {
        return res.status(403).send("Função não permitida");
    }
    if (mudarSenha) {
        if (!novasenha)
            return res.status(422).send("Nova senha deve ser informada");
        else
            novasenhaHash = yield (0, auth_1.hashPassword)(novasenha);
    }
    if (changeType && !tipo) {
        return res.status(422).send("Tipo de usuário deve ser informado");
    }
    if (!adm && !senha) {
        return res.status(422).send("Senha deve ser informada");
    }
    try {
        if (!adm) {
            const user = yield prisma_1.prisma.user.findUnique({
                where: {
                    id: tokenData.id
                }
            });
            if (!user || !(yield (0, auth_1.comparePasswords)(senha || "", user.senha))) {
                return res.status(401).send('Senha inválida');
            }
        }
        yield prisma_1.prisma.user.update({
            where: {
                id: id
            },
            data: Object.assign(Object.assign({ nome: nome, telefone: telefone, email: email }, (changeType && adm && {
                tipo: tipo,
            })), (mudarSenha && {
                senha: novasenhaHash
            }))
        });
        res.status(200).send({ nome: nome });
        return;
    }
    catch (error) {
        if (error.code === 'P2002' && error.meta.target[0] === 'email') {
            res.status(409).send('Email já cadastrado');
            return;
        }
        res.status(500).send('Desculpe, não foi possível alterar o usuário. Tente novamente mais tarde');
        return;
    }
}));
//Deletar usuário
router.delete("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parse = schemas_1.UserDelete.safeParse(req.query);
    if (!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }
    const tokenData = req.userData;
    const { id, senha } = parse.data;
    const minhaConta = parse.data.minhaConta === 1;
    if ((!minhaConta || id != tokenData.id) && tokenData.tipo !== "Administrador") {
        return res.status(403).send("Função não permitida");
    }
    if (minhaConta && !senha) {
        return res.status(422).send("A senha da conta deve ser informada");
    }
    try {
        const labs = yield prisma_1.prisma.laboratorio.findFirst({
            where: {
                responsavel_id: String(id)
            }
        });
        if (labs) {
            res.status(400).send('Usuário ainda é responsável por laboratórios');
            return;
        }
        const user = yield prisma_1.prisma.user.findUnique({
            where: {
                cpf: 'Master'
            }
        });
        if ((user === null || user === void 0 ? void 0 : user.id) === String(id)) {
            res.status(400).send('Você não pode excluir essa conta');
            return;
        }
        const userDelete = yield prisma_1.prisma.user.findUnique({
            where: {
                id: String(id)
            }
        });
        if (!userDelete) {
            return res.status(404).send("Usuário não encontrado");
        }
        if (minhaConta && !(yield (0, auth_1.comparePasswords)(senha || "", userDelete.senha))) {
            return res.status(401).send("Senha inválida");
        }
        yield prisma_1.prisma.user.delete({
            where: {
                id: userDelete.id
            }
        });
        res.status(200).send("Usuário excluido");
        return;
    }
    catch (error) {
        res.status(500).send('Desculpe, não foi possível remover o usuário. Tente novamente mais tarde');
        return;
    }
}));
//Recuperar nomes dos usuários responsáveis
router.get("/responsaveis", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parse = schemas_1.UserRespGet.safeParse(req.query);
    if (!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }
    //Caso também queira retornar cpf dos responsáveis
    const cpf = parse.data.cpf === 1;
    try {
        const users = yield prisma_1.prisma.user.findMany({
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
        res.status(500).send('Desculpe, não foi recuperar os usuários. Tente novamente mais tarde');
        return;
    }
}));
//Recuperar dados de um usuário
router.post("/data", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parse = schemas_1.UserData.safeParse(req.body);
    if (!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }
    const tokenData = req.userData;
    if (parse.data.id != tokenData.id && tokenData.tipo !== "Administrador") {
        return res.status(403).send("Função não permitida");
    }
    //Filtros para busca de usuário
    //saveContext especifica que deseja retornar somente o nome e tipo de usuário
    const { id } = parse.data;
    const saveContext = parse.data.saveContext === 1;
    try {
        const user = yield prisma_1.prisma.user.findFirstOrThrow({
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
router.get("/mainpageinfo", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parse = schemas_1.idSchema.safeParse(req.query);
    if (!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }
    const { id } = req.userData;
    let today = new Date();
    if (today.getUTCHours() < 3)
        today.setUTCDate(today.getUTCDate() - 1);
    today.setUTCHours(0, 0, 0, 0);
    try {
        const user = yield prisma_1.prisma.user.findUniqueOrThrow({
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
        const reservas = yield prisma_1.prisma.reserva.findMany({
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
        const labsCount = yield prisma_1.prisma.laboratorio.count();
        const reservasCount = yield prisma_1.prisma.reserva.count({
            where: {
                data_fim: {
                    gte: today
                }
            }
        });
        const nextReservas = [];
        for (const reservaInfo of reservas) {
            for (const reserva of reservaInfo.dias) {
                let string_aux1 = (0, formatDate_1.stringData)(reserva.data_inicio, false);
                let string_aux2 = (0, formatDate_1.stringData)(reserva.data_inicio, true);
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
//ROTAS DE ADMIN
router.use(adm_middleware_1.adm_authorization);
//Cadastrar usuário
router.post("/create", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parse = schemas_1.UserCreateSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }
    //Dados do usuário a ser criado
    const { nome, cpf, data_nasc, telefone, email, senha, tipo } = parse.data;
    const date = new Date(data_nasc);
    if (date.toString() === 'Invalid Date') {
        res.status(400).send('Formato de data inválido');
        return;
    }
    try {
        yield prisma_1.prisma.user.create({
            data: {
                email: email,
                cpf: cpf,
                nome: nome,
                senha: yield (0, auth_1.hashPassword)(senha),
                data_nasc: date,
                telefone: telefone,
                tipo: tipo
            }
        });
        res.status(201).send('Usuário cadastrado');
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
//Atualizar primeiro usuário do sistema, utilizado somente logo após primeiro usuário fazer login
router.patch("/first", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parse = schemas_1.UserUpdateFirst.safeParse(req.body);
    if (!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }
    //Dados do primeiro adm do sistema
    const { id, cpf, data_nasc, email, nome, senha, telefone } = parse.data;
    try {
        yield prisma_1.prisma.user.update({
            where: {
                id: id
            },
            data: {
                cpf: cpf,
                data_nasc: new Date(data_nasc),
                email: email,
                nome: nome,
                senha: yield (0, auth_1.hashPassword)(senha),
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
//Ver usuários
router.get("/all", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const parse = schemas_1.UsersGet.safeParse(req.query);
    if (!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }
    //Filtros de busca
    const { nome, cpf, email, tipo } = parse.data;
    try {
        const users = yield prisma_1.prisma.user.findMany({
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
exports.default = router;
