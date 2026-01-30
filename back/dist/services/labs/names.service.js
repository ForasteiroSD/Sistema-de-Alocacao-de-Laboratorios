import { prisma } from '../../utils/prisma.js';
import { LabNames } from '../../utils/validation/lab.schema.js';
export async function labNames(req, res) {
    const parse = LabNames.safeParse(req.query);
    if (!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
        });
    }
    const { user_id } = parse.data;
    try {
        const labs = await prisma.laboratorio.findMany({
            where: {
                ...(user_id && {
                    responsavel_id: user_id
                })
            },
            select: {
                nome: true
            }
        });
        return res.status(200).json(labs);
    }
    catch (error) {
        res.status(500).send('Desculpe, ocorreu um erro ao buscar os dados dos laboratórios.');
        return;
    }
}
//# sourceMappingURL=names.service.js.map