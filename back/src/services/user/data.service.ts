import { Request, Response } from 'express';
import { prisma } from 'src/utils/prisma.js';
import { UserData } from 'src/utils/validation/user.schema.js';

export async function getUserData(req: Request, res: Response) {
    const parse = UserData.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
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
        const user = await prisma.user.findFirst({
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

        if (!user) {
            return res.status(404).send("Usuário não encontrado.");
        }

        return res.status(200).json(user);

    } catch (error: any) {
        return res.status(500).send('Desculpe, não foi possível buscar os dados do usuário. Tente novamente mais tarde');
    }
}