import { stringData } from '../../utils/formatDate.js';
import { prisma } from '../../utils/prisma.js';
import { Reserves } from '../../utils/validation/reserve.schema.js';
export async function reservesList(req, res) {
    const parse = Reserves.safeParse(req.query);
    if (!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
        });
    }
    const { userName, labName, data_inicio, data_fim, tipo } = parse.data;
    const dataSearch1 = new Date(String(data_inicio));
    dataSearch1.setUTCHours(0, 0, 0, 0);
    const dataSearch2 = new Date(String(data_fim));
    dataSearch2.setUTCHours(0, 0, 0, 0);
    let today = new Date();
    if (today.getUTCHours() < 3)
        today.setUTCDate(today.getUTCDate() - 1);
    today.setUTCHours(0, 0, 0, 0);
    try {
        const reservas = await prisma.reserva.findMany({
            where: {
                ...(userName && {
                    usuario: {
                        nome: {
                            contains: String(userName)
                        }
                    }
                }),
                ...(labName && {
                    laboratorio: {
                        nome: String(labName)
                    }
                }),
                ...(data_inicio && {
                    data_inicio: {
                        gte: dataSearch1
                    }
                }),
                ...(data_fim ? {
                    data_fim: {
                        lte: dataSearch2
                    }
                } : {
                    data_fim: {
                        gte: today
                    }
                }),
                ...(tipo && {
                    tipo: String(tipo)
                }),
            },
            include: {
                laboratorio: {
                    select: {
                        nome: true
                    }
                },
                usuario: {
                    select: {
                        nome: true
                    }
                }
            },
            orderBy: {
                data_inicio: 'asc'
            }
        });
        const reservasSend = reservas.map((reserva) => {
            let string_aux1 = stringData(reserva.data_inicio, false);
            let string_aux2 = stringData(reserva.data_fim, false);
            return {
                id: reserva.id,
                responsavel: reserva.usuario.nome,
                lab: reserva.laboratorio.nome,
                data_inicio: string_aux1,
                data_fim: string_aux2,
                tipo: reserva.tipo
            };
        });
        return res.status(200).json(reservasSend);
    }
    catch (error) {
        res.status(400).send('Desculpe, não foi possível buscar os dados das reservas.');
        return;
    }
}
//# sourceMappingURL=list.service.js.map