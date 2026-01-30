import { Request, Response } from 'express';
import { prisma } from 'src/utils/prisma.js';
import { nomeSchema } from 'src/utils/validation/default.schema.js';

export async function labData(req: Request, res: Response) {
    const parse = nomeSchema.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errros: parse.error.issues[0].message
        });
    }

    const { nome } = parse.data;

    try {
        const lab = await prisma.laboratorio.findUnique({
            where: {
                nome: String(nome)
            },
            include: {
                responsavel: true
            }
        });

        if (!lab) {
            return res.status(404).send('Laboratório inexistente');
        }

        return res.status(200).json({
            nome: lab.nome,
            responsavelNome: lab.responsavel.nome,
            responsavelCpf: lab.responsavel.cpf,
            capacidade: lab.capacidade,
            projetores: lab.projetor ? lab.projetor : 'Não possui',
            quadros: lab.quadro ? lab.quadro : 'Não possui',
            televisoes: lab.televisao ? lab.televisao : 'Não possui',
            ar_condicionados: lab.ar_contidionado ? lab.ar_contidionado : 'Não possui',
            computadores: lab.computador ? lab.computador : 'Não possui',
            outro: lab.outro ? lab.outro : ''
        });

    } catch (error: any) {
        res.status(500).send('Não foi possível buscar os dados do laboratório. Tente novamente mais tarde.');
        return;
    }
}