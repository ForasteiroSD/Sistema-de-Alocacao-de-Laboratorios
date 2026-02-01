import { prisma } from '../../utils/prisma.js';
import { LabsGet } from '../../utils/validation/lab.schema.js';
export async function listLabs(req, res) {
    const parse = LabsGet.safeParse(req.query);
    if (!parse.success) {
        return res.status(422).json({
            success: false,
            message: parse.error.issues[0].message
        });
    }
    const { nome, responsavel, capacidade_minima } = parse.data;
    try {
        const labs = await prisma.laboratorio.findMany({
            where: {
                ...(nome && {
                    nome: { contains: String(nome) }
                }),
                ...(responsavel && {
                    responsavel: {
                        nome: { contains: String(responsavel) }
                    }
                }),
                ...(capacidade_minima && {
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
        return res.status(200).json({
            success: true,
            data: labs.map(lab => {
                return {
                    nome: lab.nome,
                    responsavel: lab.responsavel.nome,
                    capacidade: lab.capacidade
                };
            })
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Desculpe, ocorreu um erro ao buscar os dados dos laboratórios."
        });
    }
}
//# sourceMappingURL=list.service.js.map