import { Request, Response, Router } from 'express';
import { stringData } from '../utils/formatDate';
import { idSchema, UserCreateSchema, UserData, UserDelete, UserLoginSchema, UserRespGet, UsersGet, UserUpdateFirst, UserUpdateSchema } from '../schemas';
import { comparePasswords, generateJWTToken, hashPassword } from '../utils/auth';
import { prisma } from '../utils/prisma';
import { env } from '../utils/env';
import { authenticate } from '../middlewares/auth_middleware';
import { adm_authorization } from '../middlewares/adm_middleware';

const router = Router();

//Realizar login
router.post("/login", async (req: Request, res: Response) => {

    const parse = UserLoginSchema.safeParse(req.body);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }

    const { email, senha } = parse.data;

    try {
        const user = await prisma.user.findUnique({
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

        if(!user || !(await comparePasswords(senha, user.senha))) {
            return res.status(401).send('Email ou senha incorretos');
        }

        const jwtToken = generateJWTToken({id: user.id, tipo: user.tipo});

        res.cookie("jwtToken", jwtToken, {
            httpOnly: true,
            ...(env.NODE_ENV?.toLowerCase().includes("production") && {
                secure: true, //true para https e sameSite = none
                sameSite: "none",
            }),
            maxAge: 60*60*24*1000
        });

        return res.status(200).json({
            id: user.id,
            nome: user.nome,
            tipo: user.tipo
        });

    } catch (error: any) {
        res.status(500).send('Desculpe, não foi possível realizar o login. Tente novamente mais tarde');
        return;
    }
});


//Middleware de autênticação para próximas rotas
router.use(authenticate);


//Atualizar usuário
router.patch("/", async (req: Request, res: Response) => {

    const parse = UserUpdateSchema.safeParse(req.body);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }

    const tokenData = (req as any).userData;
    const { id, nome, telefone, email, senha, novasenha, tipo } = parse.data;
    const adm = parse.data.adm === 1;
    const mudarSenha = parse.data.mudarSenha === 1;
    const changeType = parse.data.changeType === 1;
    let novasenhaHash;

    //Valida se usuáio realmente é um administrador
    if((adm || id != tokenData.id) && tokenData.tipo !== "Administrador") {
        return res.status(403).send("Função não permitida");
    }

    if(mudarSenha) {
        if(!novasenha) return res.status(422).send("Nova senha deve ser informada");
        else novasenhaHash = await hashPassword(novasenha);
    }

    if(changeType && !tipo) {
        return res.status(422).send("Tipo de usuário deve ser informado");
    }
    
    if(!adm && !senha) {
        return res.status(422).send("Senha deve ser informada");
    }

    try {
        if(!adm) {
            const user = await prisma.user.findUnique({
                where: {
                    id: tokenData.id
                }
            });

            if(!user || !(await comparePasswords(senha || "", user.senha))) {
                return res.status(401).send('Senha inválida');
            }
        }

        await prisma.user.update({
            where: {
                id: id
            },
            data: {
                nome: nome,
                telefone: telefone,
                email: email,
                ... (changeType && adm && {
                    tipo: tipo,
                }),
                ... (mudarSenha && {
                    senha: novasenhaHash
                })
            }
        });

        res.status(200).send({ nome: nome });
        return;

    } catch (error: any) {

        if (error.code === 'P2002' && error.meta.target[0] === 'email') {
            res.status(409).send('Email já cadastrado');
            return;
        }

        res.status(500).send('Desculpe, não foi possível alterar o usuário. Tente novamente mais tarde');
        return;
    }
});


//Deletar usuário
router.delete("/", async (req: Request, res: Response) => {

    const parse = UserDelete.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }

    const tokenData = (req as any).userData;
    const { id, senha } = parse.data;
    const minhaConta = parse.data.minhaConta === 1;

    if((!minhaConta || id != tokenData.id) && tokenData.tipo !== "Administrador") {
        return res.status(403).send("Função não permitida")
    }

    if(minhaConta && !senha) {
        return res.status(422).send("A senha da conta deve ser informada");
    }

    try {

        const labs = await prisma.laboratorio.findFirst({
            where: {
                responsavel_id: String(id)
            }
        });

        if (labs) {
            res.status(400).send('Usuário ainda é responsável por laboratórios');
            return;
        }

        const user = await prisma.user.findUnique({
            where: {
                cpf: 'Master'
            }
        });

        if(user?.id === String(id)) {
            res.status(400).send('Você não pode excluir essa conta');
            return;
        }

        const userDelete = await prisma.user.findUnique({
            where: {
                id: String(id)
            }
        });

        if(!userDelete) {
            return res.status(404).send("Usuário não encontrado");
        }

        if(minhaConta && !(await comparePasswords(senha || "", userDelete.senha))) {
            return res.status(401).send("Senha inválida");
        }

        await prisma.user.delete({
            where: {
                id: userDelete.id
            }
        });

        res.status(200).send("Usuário excluido");
        return;

    } catch (error) {

        res.status(500).send('Desculpe, não foi possível remover o usuário. Tente novamente mais tarde');
        return;
    }
});


//Recuperar nomes dos usuários responsáveis
router.get("/responsaveis", async (req: Request, res: Response) => {

    const parse = UserRespGet.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }

    //Caso também queira retornar cpf dos responsáveis
    const cpf  = parse.data.cpf === 1;

    try {
        const users = await prisma.user.findMany({
            where: {
                tipo: 'Responsável'
            },
            select: {
                nome: true,
                ... (cpf && {
                    cpf: true
                })
            }
        });

        res.status(200).send(users);
        return;

    } catch (error) {
        res.status(500).send('Desculpe, não foi recuperar os usuários. Tente novamente mais tarde');
        return;
    }
})


//Recuperar dados de um usuário
router.post("/data", async (req: Request, res: Response) => {

    const parse = UserData.safeParse(req.body);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }

    const tokenData = (req as any).userData;
    if(parse.data.id != tokenData.id && tokenData.tipo !== "Administrador")
    {
        return res.status(403).send("Função não permitida");
    }

    //Filtros para busca de usuário
    //saveContext especifica que deseja retornar somente o nome e tipo de usuário
    const { id } = parse.data;
    const saveContext = parse.data.saveContext === 1;

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
            res.status(404).send('Usuário inexistente');
            return;
        }

        res.status(400).send('Desculpe, não foi possível buscar os dados do usuário. Tente novamente mais tarde');
        return;
    }
});


interface nextReservas {
    name: String;
    date: String;
    begin: String | null;
    duration: String | null;
    dataTotal: number;
}

//Recupera dados da página inicial
router.get("/mainpageinfo", async (req: Request, res: Response) => {

    const parse = idSchema.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }

    const { id } = (req as any).userData;

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
            res.status(404).send('Usuário inexistente');
            return;
        }

        res.status(400).send('database off');
        return;
    }

});

//ROTAS DE ADMIN
router.use(adm_authorization);

//Cadastrar usuário
router.post("/create", async (req: Request, res: Response) => {

    const parse = UserCreateSchema.safeParse(req.body);

    if (!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        })
    }

    //Dados do usuário a ser criado
    const { nome, cpf, data_nasc, telefone, email, senha, tipo } = parse.data;

    const date = new Date(data_nasc);

    if (date.toString() === 'Invalid Date') {
        res.status(400).send('Formato de data inválido');
        return;
    }

    try {
        await prisma.user.create({
            data: {
                email: email,
                cpf: cpf,
                nome: nome,
                senha: await hashPassword(senha),
                data_nasc: date,
                telefone: telefone,
                tipo: tipo
            }
        });

        res.status(201).send('Usuário cadastrado');
        return;

    } catch (error: any) {

        if (error.code === 'P2002' && error.meta.target[0] === 'cpf') {
            res.status(409).send('CPF já cadastrado');
            return;
        } else if (error.code === 'P2002' && error.meta.target[0] === 'email') {
            res.status(409).send('Email já cadastrado');
            return;
        }

        res.status(400).send('Desculpe, não foi possível cadastrar o usuário. Tente novamente mais tarde');
        return;

    }
});


//Atualizar primeiro usuário do sistema, utilizado somente logo após primeiro usuário fazer login
router.patch("/first", async (req: Request, res: Response) => {

    const parse = UserUpdateFirst.safeParse(req.body);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }

    //Dados do primeiro adm do sistema
    const { id, cpf, data_nasc, email, nome, senha, telefone } = parse.data;

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
                senha: await hashPassword(senha),
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


//Ver usuários
router.get("/all", async (req: Request, res: Response) => {

    const parse = UsersGet.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }

    //Filtros de busca
    const { nome, cpf, email, tipo } = parse.data;

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

export default router;