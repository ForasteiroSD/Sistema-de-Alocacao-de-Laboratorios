import { prisma } from '../../utils/prisma.js';
import { UserData } from '../../utils/validation/user.schema.js';
export async function getUserData(req, res) {
    const parse = UserData.safeParse(req.query);
    if (!parse.success) {
        return res.status(422).json({
            success: false,
            message: parse.error.issues[0].message
        });
    }
    const tokenData = req.userData;
    if (parse.data.id != tokenData.id && tokenData.tipo !== "Administrador") {
        return res.status(403).json({
            success: false,
            message: "Função não permitida."
        });
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
                ...(!saveContext && {
                    email: true,
                    cpf: true,
                    data_nasc: true,
                    telefone: true
                })
            }
        });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "Usuário não encontrado."
            });
        }
        return res.status(200).json({
            success: true,
            data: user
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Desculpe, não foi possível buscar os dados do usuário. Tente novamente mais tarde."
        });
    }
}
//# sourceMappingURL=data.service.js.map