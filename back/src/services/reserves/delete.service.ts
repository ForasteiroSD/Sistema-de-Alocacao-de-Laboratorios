import { Request, Response } from 'express';
import { prisma } from 'src/utils/prisma.js';
import { ReserveRemove } from 'src/utils/validation/reserve.schema.js';

export async function deleteReserve(req: Request, res: Response) {
    const parse = ReserveRemove.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
        })
    }

    const { id } = parse.data;

    try {

        const reservaExistente = await prisma.reserva.count({ where: { id: String(id), user_id: (req as any).userData.id } });

        if (!reservaExistente) {
            return res.status(404).send("Reserva informada não encontrada.");
        }

        await prisma.reserva.delete({
            where: {
                id: String(id),
                user_id: (req as any).userData.id
            }
        });

        res.status(200).send('Reserva removida');

    } catch (error: any) {
        res.status(400).send('Desculpe, não foi possível remover a reserva. Tente novamente mais tarde');
        return;
    }

}