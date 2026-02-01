import { prisma } from '../../utils/prisma.js';
import { ReserveRemove } from '../../utils/validation/reserve.schema.js';
export async function deleteReserve(req, res) {
    const parse = ReserveRemove.safeParse(req.query);
    if (!parse.success) {
        return res.status(422).json({
            success: false,
            message: parse.error.issues[0].message
        });
    }
    const { id } = parse.data;
    try {
        const reservaExistente = await prisma.reserva.count({ where: { id: String(id), user_id: req.userData.id } });
        if (!reservaExistente) {
            return res.status(404).json({
                success: false,
                message: "Reserva informada não encontrada."
            });
        }
        await prisma.reserva.delete({
            where: {
                id: String(id),
                user_id: req.userData.id
            }
        });
        res.status(200).json({
            success: true,
            message: "Reserva removida."
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "!Desculpe, não foi possível remover a reserva. Tente novamente mais tarde."
        });
    }
}
//# sourceMappingURL=delete.service.js.map