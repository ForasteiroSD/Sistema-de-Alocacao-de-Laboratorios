import { stringData } from '../../utils/formatDate.js';
import { prisma } from '../../utils/prisma.js';
import { LabReserves } from '../../utils/validation/lab.schema.js';
export async function labDayReserve(req, res) {
    const parse = LabReserves.safeParse(req.query);
    if (!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
        });
    }
    const { nome, dia } = parse.data;
    let data = new Date(String(dia));
    let data1 = new Date(String(dia));
    data1.setUTCDate(data1.getUTCDate() + 1);
    data.setUTCHours(0, 0, 0, 0);
    data1.setUTCHours(0, 0, 0, 0);
    try {
        const laboratorio = await prisma.laboratorio.findUnique({
            where: {
                nome: String(nome)
            },
            include: {
                reservas: {
                    where: {
                        data_inicio: {
                            lte: data
                        },
                        data_fim: {
                            gte: data
                        },
                    },
                    include: {
                        dias: {
                            where: {
                                data_inicio: {
                                    gte: data
                                },
                                data_fim: {
                                    lte: data1
                                },
                            },
                            orderBy: {
                                data_inicio: 'asc'
                            }
                        }
                    }
                }
            }
        });
        if (!laboratorio) {
            return res.status(404).send("Laboratório informado não encontrado.");
        }
        const reservasHoje = laboratorio.reservas.flatMap(({ dias }) => dias.map(({ data_inicio, duracao }) => ({
            hora_inicio: stringData(data_inicio, true),
            duracao: duracao,
            hora: data_inicio
        })));
        if (reservasHoje.length === 0) {
            return res.status(404).send('Não há reservas no dia.');
        }
        reservasHoje.sort((a, b) => a.hora.getTime() - b.hora.getTime());
        return res.status(200).json(reservasHoje);
    }
    catch (error) {
        return res.status(500).send('Desculpe, não foi possível buscar as reservas. Tente novamente mais tarde.');
    }
}
//# sourceMappingURL=reserves.service.js.map