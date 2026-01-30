import { Request, Response } from 'express';
import { prisma } from 'src/utils/prisma.js';
import { LabsGet } from 'src/utils/validation/lab.schema.js';

export async function listLabs(req: Request, res: Response) {
    const parse = LabsGet.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
        });
    }

    const { nome, responsavel, capacidade_minima } = parse.data;

    try {
        const labs = await prisma.laboratorio.findMany({
            where: {
                ... (nome && {
                    nome: { contains: String(nome) }
                }),
                ... (responsavel && {
                    responsavel: {
                        nome: { contains: String(responsavel) }
                    }
                }),
                ... (capacidade_minima && {
                    capacidade: {
                        gte: Number(capacidade_minima)
                    }
                })
            },
            select: {
                nome: true,
                responsavel: true,
                capacidade: true
            },
            orderBy: [
                {
                    nome: 'asc'
                },
            ]
        });

        return res.status(200).json(
            labs.map(lab => {
                return {
                    nome: lab.nome,
                    responsavel: lab.responsavel.nome,
                    capacidade: lab.capacidade
                }
            })
        );

    } catch (error) {
        return res.status(500).send('Desculpe, ocorreu um erro ao buscar os dados dos laboratórios.');
    }
}