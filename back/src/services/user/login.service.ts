import { Request, Response } from 'express';
import { comparePasswords, createAuthCookie, generateJWTToken, hashPassword } from 'src/utils/auth.js';
import { prisma } from 'src/utils/prisma.js';
import { UserLoginSchema } from "src/utils/validation/user.schema.js";

export async function userLogin (req: Request, res: Response) {
    const parse = UserLoginSchema.safeParse(req.body);

    if(!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
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

        if(!user) {
            const count = await prisma.user.count();
            if (count === 0) {
                const user = await prisma.user.create({
                    data: {
                        email: email,
                        cpf: 'Master',
                        nome: 'Master',
                        senha: await hashPassword(senha),
                        data_nasc: new Date('2000-01-01'),
                        telefone: '(00) 00000-0000',
                        tipo: 'Administrador'
                    }
                });

                const jwtToken = generateJWTToken({id: user.id, tipo: user.tipo});

                createAuthCookie(res, jwtToken);

                return res.status(201).json({
                    id: user.id,
                    nome: user.nome,
                    tipo: user.tipo,
                    first: true
                });                
            }
        }

        if(!user || !(await comparePasswords(senha, user.senha))) {
            return res.status(401).send('Email ou senha incorretos');
        }

        const jwtToken = generateJWTToken({id: user.id, tipo: user.tipo});

        createAuthCookie(res, jwtToken);

        return res.status(200).json({
            id: user.id,
            nome: user.nome,
            tipo: user.tipo
        });

    } catch (error: any) {
        res.status(500).send('Desculpe, não foi possível realizar o login. Tente novamente mais tarde');
        return;
    }
}