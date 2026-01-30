import { Request, Response } from 'express';
import { prisma } from 'src/utils/prisma.js';
import { UsersGet } from 'src/utils/validation/user.schema.js';

export async function listUsers(req: Request, res: Response) {
    const parse = UsersGet.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
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

        return res.status(200).json(users);
    } catch (error) {
        res.status(400).send("Desculpe, não foi possível buscar os dados dos usuários.");
        return;
    }
}