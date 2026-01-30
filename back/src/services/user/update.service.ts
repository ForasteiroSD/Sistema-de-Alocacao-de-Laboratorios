import { Request, Response } from 'express';
import { comparePasswords, hashPassword } from 'src/utils/auth.js';
import { prisma } from 'src/utils/prisma.js';
import { UserUpdateSchema } from "src/utils/validation/user.schema.js";

export async function updateUser(req: Request, res: Response) {
    const parse = UserUpdateSchema.safeParse(req.body);

    if(!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
        });
    }

    const tokenData = (req as any).userData;
    const { id, nome, telefone, email, senha, novasenha, tipo } = parse.data;
    const adm = parse.data.adm === 1;
    const mudarSenha = parse.data.mudarSenha === 1;
    const changeType = parse.data.changeType === 1;
    let novasenhaHash: string;

    //Valida se usuário realmente é um administrador
    if((adm || id != tokenData.id) && tokenData.tipo !== "Administrador") {
        return res.status(403).send("Função não permitida");
    }

    if(mudarSenha) {
        if(!novasenha) return res.status(422).send("Nova senha deve ser informada.");
        else novasenhaHash = await hashPassword(novasenha);
    }

    if(changeType && !tipo) {
        return res.status(422).send("Tipo de usuário deve ser informado.");
    }
    
    if(!adm && !senha) {
        return res.status(422).send("Senha deve ser informada.");
    }

    try {
        if(!adm) {
            const user = await prisma.user.findUnique({
                where: {
                    id: tokenData.id
                }
            });

            if(!user || !(await comparePasswords(senha || "", user.senha))) {
                return res.status(401).send('Senha inválida.');
            }
        }

        const emailEmUso = await prisma.user.findFirst({ where: { id: { not: id }, email: email } });

        if (emailEmUso) {
            return res.status(409).send("Este email já está cadastrado.");
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

        return res.status(200).json({ nome: nome });

    } catch (error: any) {
        return res.status(500).send('Desculpe, não foi possível alterar o usuário. Tente novamente mais tarde.');
    }
}