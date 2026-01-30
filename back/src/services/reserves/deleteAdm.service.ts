import { Request, Response } from 'express';
import { stringData } from 'src/utils/formatDate.js';
import { prisma } from 'src/utils/prisma.js';
import { sendEmail } from 'src/utils/sendEmail.js';
import { ReserveRemove } from 'src/utils/validation/reserve.schema.js';

export async function deleteReserveAdm(req: Request, res: Response) {
    const parse = ReserveRemove.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
        })
    }

    const tokenData =(req as any).userData;
    if(tokenData.tipo !== "Administrador" && tokenData.tipo !== "Responsável") {
        return res.status(403).send("Você não pode excluir essa reserva");
    }

    const { id, motivo } = parse.data;

    let dia_min = new Date();
    let today = new Date();

    if (dia_min.getUTCHours() < 3) dia_min.setUTCDate(dia_min.getUTCDate() - 1);
    if (today.getUTCHours() < 3) today.setUTCDate(today.getUTCDate() - 1);

    dia_min.setUTCDate(dia_min.getUTCDate() + 3);
    
    dia_min.setUTCHours(0, 0, 0, 0);
    today.setUTCHours(0, 0, 0, 0);

    try {
        const reserva = await prisma.reserva.findUnique({
            where: {
                id: String(id),
                ...(tokenData.tipo === "Responsável" && {
                    laboratorio: {
                        responsavel_id: tokenData.id
                    }
                })
            },
            include: {
                usuario: true,
                laboratorio: true,
                dias: true,
            }
        });

        if (!reserva) {
            return res.status(404).send('Reserva não encontrada');
        }

        const diasRemoviveis = reserva.dias.filter(dia => (dia.data_inicio > dia_min || dia.data_inicio < today));

        if (diasRemoviveis.length === 0) {
            return res.status(400).send('Não é possível remover nenhum dia da reserva');
        }

        await prisma.dia.deleteMany({
            where: {
                id: {
                    in: diasRemoviveis.map(dia => dia.id),
                },
            },
        });

        const diasRestantes = await prisma.dia.findMany({
            where: {
                reserva_id: String(id)
            },
        });

        let text = `Informamos que sua reserva do tipo ${reserva.tipo}, no laboratório ${reserva.laboratorio.nome} do dia ${stringData(reserva.data_inicio, false)} até o dia ${stringData(reserva.data_fim, false)} foi removida.`;
        text += `\n\nMotivo da remoção: ${motivo}`;

        if (diasRestantes.length === 0) {
            await prisma.reserva.delete({
                where: {
                    id: String(id)
                },
            });

            res.status(200).send('Reserva removida');

        } else {
            res.status(200).send(`Dias da reserva removidos, as reservas que iriam ocorrer até ${stringData(dia_min, false)} ainda estão marcadas`);
            text += `\n\nAs reservas que iriam ocorrer até ${stringData(dia_min, false)} ainda estão marcadas`;
        }

        sendEmail(reserva.usuario.email, text, '', 'Remoção de Reserva');

        return;

    } catch (error: any) {
        return res.status(500).send('Desculpe, não foi possível remover a reserva. Tente novamente mais tarde');
    }
}