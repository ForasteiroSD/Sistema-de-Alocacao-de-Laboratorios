import { Request, Response } from 'express';
import { prisma } from 'src/utils/prisma.js';
import { LabNames } from 'src/utils/validation/lab.schema.js';

export async function labNames(req: Request, res: Response) {
    const parse = LabNames.safeParse(req.body);

    if(!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
        });
    }

    const { user_id } = parse.data;

    try {

        const labs = await prisma.laboratorio.findMany({
            where: {
                ... (user_id && {
                    responsavel_id: user_id
                })
            },
            select: {
                nome: true
            }
        });

        return res.status(200).json(labs);

    } catch (error: any) {
        res.status(500).send('Desculpe, ocorreu um erro ao buscar os dados dos laboratórios.');
        return;
    }

}