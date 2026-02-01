import { Request, Response } from 'express';
import { prisma } from 'src/utils/prisma.js';
import { ReserveRemove } from 'src/utils/validation/reserve.schema.js';

export async function deleteReserve(req: Request, res: Response) {
    const parse = ReserveRemove.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).json({
            success: false,
            message: parse.error.issues[0].message
        })
    }

    const { id } = parse.data;

    try {

        const reservaExistente = await prisma.reserva.count({ where: { id: String(id), user_id: (req as any).userData.id } });

        if (!reservaExistente) {
            return res.status(404).json({
                success: false,
                message: "Reserva informada não encontrada."
            });
        }

        await prisma.reserva.delete({
            where: {
                id: String(id),
                user_id: (req as any).userData.id
            }
        });

        res.status(200).json({
            success: true,
            message: "Reserva removida."
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "!Desculpe, não foi possível remover a reserva. Tente novamente mais tarde."
        });
    }
}