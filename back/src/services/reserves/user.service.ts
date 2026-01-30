import { Request, Response } from 'express';
import { stringData } from 'src/utils/formatDate.js';
import { prisma } from 'src/utils/prisma.js';
import { ReservesUser } from 'src/utils/validation/reserve.schema.js';

export async function userReserves(req: Request, res: Response) {

    const parse = ReservesUser.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
        })
    }

    const { labName, data_inicio, data_fim, tipo } = parse.data;
    const userId = (req as any).userData.id;

    const dataSearch1 = new Date(String(data_inicio));
    dataSearch1.setUTCHours(0, 0, 0, 0);

    const dataSearch2 = new Date(String(data_fim))
    dataSearch2.setUTCHours(0, 0, 0, 0);

    let today = new Date();
    if (today.getUTCHours() < 3) today.setUTCDate(today.getUTCDate() - 1)
    today.setUTCHours(0, 0, 0, 0);

    try {
        const reservas = await prisma.reserva.findMany({
            where: {
                user_id: String(userId),
                ... (labName && {
                    laboratorio: {
                        nome: String(labName)
                    }
                }),
                ... (data_inicio && {
                    data_inicio: {
                        gte: dataSearch1
                    }
                }),
                ... (data_fim ? {
                    data_fim: {
                        lte: dataSearch2
                    }
                } : {
                    data_fim: {
                        gte: today
                    }
                }),
                ... (tipo && {
                    tipo: String(tipo)
                }),
            },
            include: {
                laboratorio: {
                    select: {
                        nome: true
                    }
                }
            }
        });

        const reservasSend = reservas.map((reserva) => {
            let string_aux1 = stringData(reserva.data_inicio, false);
            let string_aux2 = stringData(reserva.data_fim, false);
            
            return {
                id: reserva.id,
                lab: reserva.laboratorio.nome,
                data_inicio: string_aux1,
                data_fim: string_aux2,
                tipo: reserva.tipo
            }
        });

        return res.status(200).json(reservasSend);

    } catch (error) {
        return res.status(500).send('Desculpe, não foi possível buscar as reservas. Tente novamente mais tarde');
    }
}