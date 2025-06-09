import { Request, Response, Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { stringData } from '../utils/formatDate';
import { z } from 'zod';


const router = Router();
const prisma = new PrismaClient();

const nomeSchema = z.object({
    nome: z.string({required_error: "Nome deve ser informado", invalid_type_error: "Nome deve ser uma string"})
});

const idSchema = z.object({
    id: z.string({required_error: "Id deve ser informado", invalid_type_error: "Id deve ser uma string"}).uuid("Id deve ser um uuid")
})

const cpfSchema = z.object({
    cpf: z.string({required_error: "CPF deve ser informado", invalid_type_error: "CPF deve ser uma string"}).length(11, "CPF deve ter 11 caracteres")
});

const dataNascSchema = z.object({
    data_nasc: z.string({required_error: "Data de nascimento deve ser informada", invalid_type_error: "Data de nascimento deve ser uma string"}).refine(val => !isNaN(Date.parse(val)), {
        message: "Data de nascimento inválida"
    })
});

const telefoneSchema = z.object({
    telefone: z.string({required_error: "Telefone deve ser informado", invalid_type_error: "Telefone deve ser uma string"}).min(8, "Telefone deve ter pelo menos 8 caracteres")
});

const emailSchema = z.object({
    email: z.string({required_error: "Email deve ser informado", invalid_type_error: "Email deve ser uma string"}).email({message: "Email inválido"})
});

const senhaSchema = z.object({
    senha: z.string({required_error: "Senha deve ser informada", invalid_type_error: "Senha deve ser uma string"}).min(8, "Senha deve ter pelo menos caracteres")
});

const tipoSchema = z.object({
    tipo: z.enum(["Administrador", "Responsável", "Comum"], {message: "Tipo de usuário inválido. Deve ser Administrador, Responsável ou Comum"})
});

const UserCreateSchema = nomeSchema.merge(cpfSchema).merge(dataNascSchema).merge(telefoneSchema).merge(emailSchema).merge(senhaSchema).merge(tipoSchema);

//Cadastrar usuário
router.post("/create", async (req: Request, res: Response) => {

    const parse = UserCreateSchema.safeParse(req.body);

    if (!parse.success) {
        return res.status(402).send({
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
                senha: senha,
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

const UserLoginSchema = emailSchema.merge(senhaSchema);

//Realizar login
router.post("/login", async (req: Request, res: Response) => {

    const parse = UserLoginSchema.safeParse(req.body);

    if(!parse.success) {
        return res.status(402).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        })
    }

    const { email, senha } = parse.data;

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
                        cpf: 'Master',
                        nome: 'Master',
                        senha: senha,
                        data_nasc: new Date('2000-01-01'),
                        telefone: '(00) 00000-0000',
                        tipo: 'Administrador'
                    }
                });

                res.status(200).send({ id: user.id, nome: user.nome, tipo: user.tipo, first: true });
                return;
            }
        } catch (error1) {
            res.status(400).send('Desculpe, não foi possível realizar o login. Tente novamente mais tarde');
            return;
            }
            
        res.status(404).send('Email ou senha incorretos');
        return;

    }
});


//Dados de busca e a serem atualizados
//adm = true não precisa informar senha
//mudarSenha indica se vai mudar a senha ou não
const UserUpdateSchema = z.object({
    novasenha: z.string({required_error: "Email deve ser informado", invalid_type_error: "Email deve ser uma string"}).min(8, "Nova senha deve ter pelo menos 8 caracteres").optional(),
    tipo: tipoSchema.shape.tipo.optional(),
    adm: z.string().default('0'), //defaults to false
    mudarSenha: z.string().default('0'), //defaults to false
    changeType: z.string().default('0') //defaults to false
}).merge(idSchema).merge(nomeSchema).merge(telefoneSchema).merge(emailSchema).merge(senhaSchema)


//Atualizar usuário
router.patch("/", async (req: Request, res: Response) => {

    const parse = UserUpdateSchema.safeParse(req.body);

    if(!parse.success) {
        return res.status(402).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }

    const { id, nome, telefone, email, senha, novasenha, tipo } = parse.data;
    const adm = parse.data.adm !== '0';
    const mudarSenha = parse.data.mudarSenha !== '0';
    const changeType = parse.data.mudarSenha !== '0';

    if(mudarSenha && !novasenha) {
        return res.status(400).send("Nova senha deve ser informada");
    }

    if(changeType && !tipo) {
        return res.status(400).send("Tipo de usuário deve ser informado");
    }

    try {
        await prisma.user.update({
            where: {
                id: id,
                ... (adm && {
                    senha: senha
                })
            },
            data: {
                nome: nome,
                telefone: telefone,
                email: email,
                ... (changeType && {
                    tipo: tipo,
                }),
                ... (mudarSenha && {
                    senha: novasenha
                })
            }
        });

        res.status(200).send({ nome: nome });
        return;

    } catch (error: any) {

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
});


const UserUpdateFirst = idSchema.merge(cpfSchema).merge(cpfSchema).merge(dataNascSchema).merge(emailSchema).merge(nomeSchema).merge(senhaSchema).merge(telefoneSchema);

//Atualizar primeiro usuário do sistema, utilizado somente logo após primeiro usuário fazer login
router.patch("/first", async (req: Request, res: Response) => {

    const parse = UserUpdateFirst.safeParse(req.body);

    if(!parse.success) {
        return res.status(402).send({
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


const UserDelete = z.object({
    senha: senhaSchema.shape.senha.optional(),
    minhaConta: z.string().default('1') //defaults to true
}).merge(idSchema);

//Deletar usuário
router.delete("/", async (req: Request, res: Response) => {

    const parse = UserDelete.safeParse(req.query);

    if(!parse.success) {
        return res.status(402).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }

    const { id, senha } = parse.data;
    const minhaConta = parse.data.minhaConta === '1';

    if(minhaConta && !senha) {
        return res.status(400).send("A senha da conta deve ser informada");
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

        await prisma.user.delete({
            where: {
                id: String(id),
                ... (minhaConta && {
                    senha: String(senha)
                })
            }
        });

        res.status(200).send("Usuário excluido");
        return;

    } catch (error: any) {

        if (error.code === 'P2025') {
            res.status(404).send("Senha inválida");
            return;
        }

        res.status(400).send('Desculpe, não foi possível remover o usuário. Tente novamente mais tarde');
        return;
    }
});


interface UsersGet {
    nome?: string;
    cpf?: string;
    email?: string;
    tipo?: string;
}

const UsersGet = z.object({
    nome: z.string().optional(),
    cpf: z.string().optional(),
    email: z.string().optional(),
    tipo: z.string().optional()
});

//Ver usuários
router.get("/all", async (req: Request, res: Response) => {

    const parse = UsersGet.safeParse(req.query);

    if(!parse.success) {
        return res.status(402).send({
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


const UserRespGet = z.object({
    cpf: z.string().default('0') //defaults to false
});

//Recuperar nomes do usuário responsáveis
router.get("/responsaveis", async (req: Request, res: Response) => {

    const parse = UserRespGet.safeParse(req.query);

    if(!parse.success) {
        return res.status(402).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }

    //Caso também queira retornar cpf dos responsáveis
    const cpf  = parse.data.cpf !== '0';

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
        res.status(400).send('database off');
        return;
    }
})


const UserData = z.object({
    saveContext: z.string().default('0') //defaults to false
}).merge(idSchema);

//Recuperar dados de um usuário
router.post("/data", async (req: Request, res: Response) => {

    const parse = UserData.safeParse(req.body);

    if(!parse.success) {
        return res.status(402).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }

    //Filtros para busca de usuário
    //saveContext especifica que deseja retornar somente o nome e tipo de usuário
    const { id } = parse.data;
    const saveContext = parse.data.saveContext !== '0';

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
        return res.status(402).json({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }

    const { id } = parse.data;

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

export default router;