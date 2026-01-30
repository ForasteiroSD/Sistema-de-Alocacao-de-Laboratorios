import { prisma } from '../../utils/prisma.js';
import { UserRespGet } from '../../utils/validation/user.schema.js';
export async function getResponsibles(req, res) {
    const parse = UserRespGet.safeParse(req.query);
    if (!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
        });
    }
    //Caso também queira retornar cpf dos responsáveis
    const cpf = parse.data.cpf === 1;
    try {
        const users = await prisma.user.findMany({
            where: {
                tipo: 'Responsável'
            },
            select: {
                nome: true,
                ...(cpf && {
                    cpf: true
                })
            }
        });
        return res.status(200).json(users);
    }
    catch (error) {
        return res.status(500).send('Desculpe, não foi recuperar os usuários. Tente novamente mais tarde');
    }
}
//# sourceMappingURL=responsibles.service.js.map