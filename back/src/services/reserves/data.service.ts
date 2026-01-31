import { Request, Response } from 'express';
import { stringData } from 'src/utils/formatDate.js';
import { prisma } from 'src/utils/prisma.js';
import { idSchema } from 'src/utils/validation/default.schema.js';

const dias_semana = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado'
];

export async function reserveData(req: Request, res: Response) {
    const parse = idSchema.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
        })
    }

    const { id } = parse.data;

    try {
        const reserva = await prisma.reserva.findUnique({
            where: {
                id: String(id)
            },
            include: {
                dias: true,
                laboratorio: {
                    select: {
                        nome: true,
                        responsavel_id: true
                    }
                },
                usuario: {
                    select: {
                        nome: true
                    }
                }
            }
        });

        if (!reserva) {
            return res.status(404).send("Reserva não encontrada.");
        }

        if (reserva.user_id !== (req as any).userData.id) {
            if ((req as any).userData.tipo === "Usuário") {
                return res.status(403).send("Você não pode visualizar essa reserva.");
            }

            if ((req as any).userData.tipo === "Responsável" && reserva.laboratorio.responsavel_id !== (req as any).userData.id) {
                return res.status(403).send("Você não pode visualizar essa reserva.");
            }
        }

        if (reserva.tipo === 'Única' || reserva.tipo === 'Diária') {

            let string_aux1 = stringData(reserva.dias[0].data_inicio, true);

            return res.status(200).json({
                usuario: reserva.usuario.nome,
                laboratorio: reserva.laboratorio.nome,
                tipo: reserva.tipo,
                data_inicio: stringData(reserva.data_inicio, false),
                data_fim: stringData(reserva.data_fim, false),
                hora_inicio: string_aux1,
                duracao: reserva.dias[0].duracao
            });

        } else if (reserva.tipo === 'Semanal') {

            const reservas = [];
            const dias: number[] = []

            for (const dia of reserva.dias) {

                if (dias.indexOf(dia.data_inicio.getUTCDay()) !== -1) break;
                dias.push(dia.data_inicio.getUTCDay());

                let string_aux1 = stringData(dia.data_inicio, true);

                reservas.push({
                    dia: dias_semana[dia.data_inicio.getUTCDay()],
                    hora_inicio: string_aux1,
                    duracao: dia.duracao
                });
            }

            return res.status(200).send({
                usuario: reserva.usuario.nome,
                laboratorio: reserva.laboratorio.nome,
                tipo: reserva.tipo,
                data_inicio: stringData(reserva.data_inicio, false),
                data_fim: stringData(reserva.data_fim, false),
                dias_semana: reservas
            });

        } else {

            const reservas = reserva.dias.map((dia) => {
                let string_aux1 = stringData(dia.data_inicio, false);
                let string_aux2 = stringData(dia.data_inicio, true);

                return {
                    data: string_aux1,
                    hora_inicio: string_aux2,
                    duracao: dia.duracao
                }
            });

            return res.status(200).json({
                usuario: reserva.usuario.nome,
                laboratorio: reserva.laboratorio.nome,
                tipo: reserva.tipo,
                data_inicio: stringData(reserva.data_inicio, false),
                data_fim: stringData(reserva.data_fim, false),
                horarios: reservas
            });
        }

    } catch (error) {
        return res.status(500).send('Desculpe, não foi possível buscar os dados da reserva informada.');
    }
}