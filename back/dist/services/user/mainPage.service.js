import { stringData } from '../../utils/formatDate.js';
import { prisma } from '../../utils/prisma.js';
import { idSchema } from '../../utils/validation/default.schema.js';
export async function userNextReserves(req, res) {
    const parse = idSchema.safeParse(req.query);
    if (!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
        });
    }
    const { id } = req.userData;
    let today = new Date();
    if (today.getUTCHours() < 3)
        today.setUTCDate(today.getUTCDate() - 1);
    today.setUTCHours(0, 0, 0, 0);
    try {
        const user = await prisma.user.findFirst({
            where: {
                id: String(id)
            },
            include: {
                _count: {
                    select: {
                        laboratorios: true,
                    }
                }
            }
        });
        if (!user) {
            return res.status(404).send("Usuário não encontrado.");
        }
        const reservas = await prisma.reserva.findMany({
            where: {
                user_id: user.id,
                data_fim: {
                    gte: today
                }
            },
            include: {
                laboratorio: true,
                dias: {
                    where: {
                        data_inicio: {
                            gte: today
                        }
                    },
                    orderBy: {
                        data_inicio: 'asc'
                    }
                }
            },
            orderBy: {
                data_inicio: 'asc'
            }
        });
        const labsCount = await prisma.laboratorio.count();
        const reservasCount = await prisma.reserva.count({
            where: {
                data_fim: {
                    gte: today
                }
            }
        });
        const nextReservas = reservas.flatMap(({ laboratorio, dias }) => dias.map(({ data_inicio, duracao }) => ({
            name: laboratorio.nome,
            date: stringData(data_inicio, false),
            begin: stringData(data_inicio, true),
            duration: duracao,
            dataTotal: data_inicio.getTime(),
        })));
        nextReservas.sort((a, b) => a.dataTotal - b.dataTotal);
        const mainInfo = [
            {
                name: 'Meus Laboratórios',
                value: user._count.laboratorios
            },
            {
                name: 'Laboratórios Totais',
                value: labsCount
            },
            {
                name: 'Minhas Reservas',
                value: reservas.length
            },
            {
                name: 'Reservas Totais',
                value: reservasCount
            }
        ];
        return res.status(200).json({ mainInfo: mainInfo, nextReserves: nextReservas.slice(0, 3) });
    }
    catch (error) {
        res.status(400).send("Ocorreu um erro ao buscar as próximas reservas.");
        return;
    }
}
//# sourceMappingURL=mainPage.service.js.map