import { Request, Response, Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { env } from 'node:process';
import { stringData } from '../index';

interface nextReservas {
    name: String;
    date: String;
    begin: String | null;
    duration: String | null;
    dataTotal: number;
}

const router = Router();
const prisma = new PrismaClient();

//Cadastrar usuário
router.post("/user/create", async (req: Request, res: Response) => {

    //Dados do usuário a ser criado
    const { nome, cpf, d_nas, telefone, email, senha, tipo } = req.body;

    const date = new Date(d_nas);

    if (date.toString() === 'Invalid Date') {
        res.status(400).send('Data inválida');
        return;
    }

    try {
        await prisma.user.create({
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

        res.status(200).send('Usuario criado');
        return;

    } catch (error: any) {

        if (error.code === 'P2002' && error.meta.target[0] === 'cpf') {
            res.status(409).send('CPF ja cadastrado');
            return;
        } else if (error.code === 'P2002' && error.meta.target[0] === 'email') {
            res.status(409).send('Email ja cadastrado');
            return;
        }

        res.status(400).send('database off');
        return;

    }
});


//Realizar login
router.post("/user/login", async (req: Request, res: Response) => {

    const { email, senha } = req.body;

    try {
        const user = await prisma.user.findFirstOrThrow({
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

    } catch (error: any) {

        try {
            const count = await prisma.user.count();
            if (count === 0) {
                const user = await prisma.user.create({
                    data: {
                        email: email,
                        cpf: 'cpf',
                        nome: 'adm1',
                        senha: senha,
                        data_nasc: new Date('2000-01-01'),
                        telefone: 'telefone',
                        tipo: 'Administrador'
                    }
                });

                res.status(201).send({ id: user.id, nome: user.nome, tipo: user.tipo, first: true });
                return;
            }
        } catch (error1) {
            res.status(400).send('database off');
            return;
        }

        res.status(404).send('Usuário não cadastrado');
        return;

    }
});


//Atualizar usuário
router.patch("/user", async (req: Request, res: Response) => {

    //Dados de busca e a serem atualizados
    //adm = true não precisa informar senha
    //mudarSenha usado com adm, caso administrador queira trocar a senha também sem saber a anterior
    const { id, nome, telefone, email, senha, novasenha, tipo, adm, mudarSenha } = req.body;

    try {
        await prisma.user.update({
            where: {
                id: id,
                ... (!adm && {
                    senha: senha
                })
            },
            data: {
                nome: nome,
                telefone: telefone,
                email: email,
                tipo: tipo,
                ... (adm && !mudarSenha || {
                    senha: novasenha
                })
            }
        });

        res.status(200).send({ nome: nome });
        return;

    } catch (error: any) {

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
});

//Atualizar primeiro usuário do sistema, utilizado somente logo após primeiro usuário fazer login
router.patch("/user/first", async (req: Request, res: Response) => {

    //Dados do primeiro adm do sistema
    const { id, cpf, data_nasc, email, nome, senha, telefone, } = req.body;

    try {
        await prisma.user.update({
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

    } catch (error: any) {

        res.status(400).send('database off');
        return;
    }
});


//Deletar usuário
router.delete("/user", async (req: Request, res: Response) => {

    //adm = true não precisa informar senha para excluir conta
    const { id, senha, adm } = req.body;

    try {

        const labs = await prisma.laboratorio.findFirst({
            where: {
                responsavel_id: id
            }
        });

        if (labs) {
            res.status(400).send('Usuario ainda responsavel por laboratorios');
            return;
        }

        await prisma.user.delete({
            where: {
                id: String(id),
                ... (!adm && {
                    senha: senha
                })
            }
        });

        res.status(200).send("Usuario excluido");
        return;

    } catch (error: any) {

        if (error.code === 'P2025') {
            res.status(404).send("Senha invalida");
            return;
        }

        res.status(400).send('database off');
        return;
    }
});


//Ver usuários
router.get("/users", async (req: Request, res: Response) => {

    //Filtros de busca
    const { nome, cpf, email, tipo } = req.query;

    try {
        const users = await prisma.user.findMany({
            where: {
                ... (nome && {
                    nome: { contains: String(nome) }
                }),
                ... (cpf && {
                    cpf: { contains: String(cpf) }
                }),
                ... (email && {
                    email: { contains: String(email) }
                }),
                ... (tipo && {
                    tipo: { contains: String(tipo) }
                })
            },
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

    } catch (error) {
        res.status(400).send('database off');
        return;
    }
});

//Recuperar nomes do usuário responsáveis
router.get("/users/responsavel", async (req: Request, res: Response) => {

    try {
        const users = await prisma.user.findMany({
            where: {
                tipo: 'Responsável'
            },
            select: {
                nome: true,
            }
        });

        res.status(200).send(users);
        return;

    } catch (error) {
        res.status(400).send('database off');
        return;
    }
})


//Recuperar dados de um usuário
router.post("/user/data", async (req: Request, res: Response) => {

    //Filtros para busca de usuário
    //saveContext especifica que deseja retornar somente o tipo de usuário
    const { id, saveContext } = req.body;

    try {
        const user = await prisma.user.findFirstOrThrow({
            where: {
                id: String(id)
            },
            select: {
                nome: true,
                tipo: true,
                ... (!saveContext && {
                    email: true,
                    cpf: true,
                    data_nasc: true,
                    telefone: true
                })
            }
        });

        res.status(200).send(user);
        return;

    } catch (error: any) {

        if (error.code === 'P2025') {
            res.status(404).send('Usuario inexistente');
            return;
        }

        res.status(400).send('database off');
        return;
    }
});


//Recupera dados da página inicial
router.post("/mainpageinfo", async (req: Request, res: Response) => {

    const { id } = req.body;
    let today = new Date();

    if (today.getUTCHours() < 3) today.setUTCDate(today.getUTCDate() - 1)

    today.setUTCHours(0, 0, 0, 0);

    try {
        const user = await prisma.user.findUniqueOrThrow({
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

        const reservas = await prisma.reserva.findMany({
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

        const labsCount = await prisma.laboratorio.count();
        const reservasCount = await prisma.reserva.count({
            where: {
                data_fim: {
                    gte: today
                }
            }
        });

        const nextReservas: nextReservas[] = []
        for (const reservaInfo of reservas) {
            for (const reserva of reservaInfo.dias) {

                let string_aux1 = stringData(reserva.data_inicio, false);
                let string_aux2 = stringData(reserva.data_inicio, true);

                nextReservas.push({
                    name: reservaInfo.laboratorio.nome,
                    date: string_aux1,
                    begin: string_aux2,
                    duration: reserva.duracao,
                    dataTotal: reserva.data_inicio.getTime()
                });

            }
        }

        nextReservas.sort((a, b) =>
            a.dataTotal - b.dataTotal
        );

        nextReservas.slice()

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

    } catch (error: any) {

        if (error.code === 'P2025') {
            res.status(404).send('Usuario inexistente');
            return;
        }

        res.status(400).send('database off');
        return;
    }

});

export default router;