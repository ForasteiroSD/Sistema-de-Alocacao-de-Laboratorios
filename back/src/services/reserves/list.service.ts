import { Request, Response } from 'express';
import { stringData } from 'src/utils/formatDate.js';
import { prisma } from 'src/utils/prisma.js';
import { Reserves } from 'src/utils/validation/reserve.schema.js';

export async function reservesList(req: Request, res: Response) {

    const parse = Reserves.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).json({
            success: false,
            message: parse.error.issues[0].message
        })
    }

    const { userName, labName, data_inicio, data_fim, tipo } = parse.data;

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
                ... (userName && {
                    usuario: {
                        nome: {
                            contains: String(userName)
                        }
                    }
                }),
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
            }
        });

        return res.status(200).json({
            success: true,
            data: reservasSend
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Desculpe, não foi possível buscar os dados das reservas."
        });
    }
}