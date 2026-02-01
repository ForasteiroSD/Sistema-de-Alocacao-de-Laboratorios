import { Request, Response } from 'express';
import { comparePasswords } from 'src/utils/auth.js';
import { prisma } from 'src/utils/prisma.js';
import { UserDelete } from "src/utils/validation/user.schema.js";

export async function deleteUser(req: Request, res: Response) {
    const parse = UserDelete.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).json({
            success: false,
            message: parse.error.issues[0].message
        });
    }

    const tokenData = (req as any).userData;
    const { id, senha } = parse.data;
    const minhaConta = parse.data.minhaConta === 1;

    if((!minhaConta || id != tokenData.id) && tokenData.tipo !== "Administrador") {
        return res.status(403).json({
            success: false,
            message: "Função não permitida."
        })
    }

    if(minhaConta && !senha) {
        return res.status(422).json({
            success: false,
            message: "A senha da conta deve ser informada."
        });
    }

    try {
        const user = await prisma.user.findFirst({
            where: {
                id: String(id)
            }
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado."
            });
        }

        const labs = await prisma.laboratorio.findFirst({
            where: {
                responsavel_id: String(id)
            }
        });

        if (labs) {
            return res.status(400).json({
                success: false,
                message: "Usuário ainda é responsável por laboratórios."
            });
        }

        if(user.cpf === "Master") {
            return res.status(400).json({
                success: false,
                message: "Você não pode excluir essa conta."
            });
        }

        if(minhaConta && !(await comparePasswords(senha || "", user.senha))) {
            return res.status(401).json({
                success: false,
                message: "Senha inválida."
            });
        }

        await prisma.user.delete({
            where: {
                id: user.id
            }
        });

        return res.status(200).json({
            success: true,
            message: "Usuário excluido."
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Desculpe, não foi possível remover o usuário. Tente novamente mais tarde."
        });
    }
}