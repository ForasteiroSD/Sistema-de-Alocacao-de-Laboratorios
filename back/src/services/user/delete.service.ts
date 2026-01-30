import { Request, Response } from 'express';
import { comparePasswords } from 'src/utils/auth.js';
import { prisma } from 'src/utils/prisma.js';
import { UserDelete } from "src/utils/validation/user.schema.js";

export async function deleteUser(req: Request, res: Response) {
    const parse = UserDelete.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
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
        const user = await prisma.user.findFirst({
            where: {
                id: String(id)
            }
        });

        if (!user) {
            return res.status(404).send('Usuário não encontrado');
        }

        const labs = await prisma.laboratorio.findFirst({
            where: {
                responsavel_id: String(id)
            }
        });

        if (labs) {
            return res.status(400).send('Usuário ainda é responsável por laboratórios');
        }

        if(user.cpf === "Master") {
            return res.status(400).send('Você não pode excluir essa conta');
        }

        if(minhaConta && !(await comparePasswords(senha || "", user.senha))) {
            return res.status(401).send("Senha inválida");
        }

        await prisma.user.delete({
            where: {
                id: user.id
            }
        });

        return res.status(200).send("Usuário excluido");

    } catch (error) {
        return res.status(500).send('Desculpe, não foi possível remover o usuário. Tente novamente mais tarde');
    }
}