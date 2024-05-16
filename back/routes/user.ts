import { Request, Response, Router } from 'express'
import { PrismaClient } from '@prisma/client'

const router = Router();
const prisma = new PrismaClient();

//Cadastrar usuário
router.post("/user/create", async(req: Request, res: Response) => {

    //Dados do usuário a ser criado
    const {nome, cpf, d_nas, telefone, email, senha, tipo} = req.body;
    
    const date = new Date(d_nas);

    if(date.toString() === 'Invalid Date') {
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
        
        if(error.code === 'P2002' && error.meta.target[0] === 'cpf') {
            res.status(409).send('CPF ja cadastrado');
            return;
        } else if(error.code === 'P2002' && error.meta.target[0] === 'email') {
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

        res.status(200).send({id: user.id, nome: user.nome, tipo: user.tipo});
        return;

    } catch (error: any) {

        if(error.code === 'P2025') {
            res.status(404).send('Usuário não cadastrado');
            return;
        }
    
        res.status(400).send('database off');
        return;
    }
});


//Atualizar usuário
router.patch("/user", async (req: Request, res: Response) => {

    //Dados a serem atualizados
    const { id, nome, telefone, email, senha, novasenha, tipo } = req.body;

    try {
        await prisma.user.update({
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

    res.status(200).send({nome: nome, tipo: tipo});
    return;

    } catch (error: any) {

        if(error.code === 'P2025') {
            res.status(404).send('Senha invalida');
            return;
        }
        if(error.code === 'P2002' && error.meta.target[0] === 'email') {
            res.status(409).send('Email ja cadastrado');
            return;
        }

        res.status(400).send('database off');
        return;
    }
});


//Deletar usuário
router.delete("/user", async (req: Request, res: Response) => {
    
    const { id, senha } = req.body;

    try {

        const labs = await prisma.laboratorio.findFirst({
            where: {
                responsavel_id: id
            }
        });

        if(labs) {
            res.status(400).send('Usuario ainda responsavel por laboratorios');
            return;
        }

        await prisma.user.delete({
            where: {
                id: String(id),
                senha: senha
            }
        });

        res.status(200).send("Usuario excluido");
        return;

    } catch (error: any) {

        if(error.code === 'P2025') {
            res.status(404).send("Senha invalida");
            return;
        }

        res.status(400).send('database off');
        return;
    }
});


//Ver usuários
router.get("/users", async(req: Request, res: Response) => {

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


//Recuperar dados de um usuário
router.get("/user", async(req: Request, res: Response) => {

    //Filtros para busca de usuário
    //utilizar id e cpf separadamente
    //typeOnly especifica que deseja retornar somente o tipo de usuário
    const { id, cpf, typeOnly } = req.query;


    try {
        const user = await prisma.user.findFirstOrThrow({
            where: {
                OR: [
                    {
                        id: String(id)
                    },
                    {
                        cpf: String(cpf)
                    }
                ]
                
            },
            select: {
                ... (typeOnly? {
                    tipo: true
                } : {
                    email: true,
                    cpf: true,
                    nome: true,
                    data_nasc: true,
                    telefone: true,
                    tipo: true
                })
            }
        });

        if(typeOnly) res.status(200).send(user.tipo);
        else res.status(200).send(user);
        return;

    } catch (error: any) {

        if(error.code === 'P2025') {
            res.status(404).send('Usuario inexistente');
            return;
        }

        res.status(400).send('database off');
        return;
    }
});

export default router;