import { Request, Response, Router } from 'express';
import { prisma } from '../utils/prisma';
import { stringData } from '../utils/formatDate';
import { createReserveEmailText, sendEmail } from '../utils/sendEmail';
import { DailyReserve, idSchema, PersonalizedReserves, ReserveInsert, ReserveRemove, Reserves, ReservesRespLab, ReservesUser, UniqueReserve, WeeklyReserves } from '../schemas';
import { adm_authorization } from '../middlewares/adm_middleware';

const router = Router();

const dias_semana = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado'
];

function verificaConflito(inicio1: Number, fim1: Number, inicio2: Number, fim2: Number) {

    if (inicio1 >= inicio2 && inicio1 < fim2) return true;

    if (inicio2 >= inicio1 && inicio2 < fim1) return true;

    return false;
}


interface ReservaParcial {
    dia: Date;
    inicio: number;
    fim: number;
    duracao: string;
}

interface ReservaInsercao {
    data_inicio: Date;
    data_fim: Date;
    duracao: string;
}

//Inserir reservas
router.post('/reserva', async (req: Request, res: Response) => {

    const parse = ReserveInsert.safeParse(req.body);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        })
    }

    const { userName, labName, tipo, data_inicio, data_fim, hora_inicio, duracao, horarios, userId } = req.body;
    // const userId = (req as any).userData.id;

    let newParse;
    let dataSearch1, dataSearch2;
    const today = new Date();
    if (today.getUTCHours() < 3) today.setUTCDate(today.getUTCDate() - 1)
    today.setUTCHours(0, 0, 0, 0);

    if (tipo === "Personalizada") {
        newParse = PersonalizedReserves.safeParse(req.body);

        if(!newParse.success) {
            return res.status(422).send({
                message: "Dados inválidos",
                errors: newParse.error.flatten()
            });
        }

        for (let dia of horarios) {
            dia.data = new Date(dia.data);
            if(dia.data.getTime() < today.getTime()) {
                return res.status(422).send({
                    message: "Dados inválidos",
                    errors: {
                        fieldErrors: {
                            data: ["Data da reserva não pode ser inferior ao dia de hoje"],
                        }
                    }
                });
            }
        }

        horarios.sort((a: any, b: any) =>
            a.data.getTime() - b.data.getTime()
        );

        dataSearch1 = new Date(horarios[0].data);
        dataSearch2 = new Date(horarios[horarios.length - 1].data);

    } else {

        dataSearch1 = new Date(data_inicio);
        dataSearch2 = data_fim ? new Date(data_fim) : new Date(data_inicio);
        dataSearch1.setUTCHours(23, 59, 0, 0);
        dataSearch2.setUTCHours(23, 59, 0, 0);

        if(dataSearch1.getTime() < today.getTime() || dataSearch1.getTime() > dataSearch2.getTime()) {
            return res.status(422).send({
                message: "Dados inválidos",
                errors: {
                    fieldErrors: {
                        data_inicio: ["Data inicial não pode ser inferior ao dia de hoje"],
                        data_fim: ["Data final deve ser após data inicial"]
                    }
                }
            });
        }
        
        dataSearch1.setUTCHours(0, 0, 0, 0);
        dataSearch2.setUTCHours(0, 0, 0, 0);
        dataSearch2.setDate(dataSearch2.getDate());

        if(tipo === "Única") newParse = UniqueReserve.safeParse(req.body);
        else if(tipo === "Diária") newParse = DailyReserve.safeParse(req.body);
        else newParse = WeeklyReserves.safeParse(req.body);

        if(!newParse.success) {
            return res.status(422).send({
                message: "Dados inválidos",
                errors: newParse.error.flatten()
            });
        }
    }

    try {
        const labReservas = await prisma.laboratorio.findUniqueOrThrow({
            where: {
                nome: String(labName)
            },
            include: {
                reservas: {
                    where: {
                        data_inicio: {
                            lte: dataSearch2
                        },
                        data_fim: {
                            gte: dataSearch1
                        }
                    },
                    include: {
                        dias: true
                    }
                },
                responsavel: true
            }
        });

        const dias_reserva: ReservaParcial[] = []

        const diaInicio = new Date(data_inicio);
        const diaFim = data_fim ? new Date(data_fim) : new Date(diaInicio)

        diaInicio.setUTCHours(0, 0, 0, 0);
        diaFim.setUTCHours(0, 0, 0, 0);

        if (tipo === 'Semanal') {

            const dias_res_semana = []
            for (let horario of horarios) {
                dias_res_semana.push({ dia: dias_semana.indexOf(horario.dia_semana), horario: horario.hora_inicio, duracao: horario.duracao })
            }

            while (diaInicio.getTime() <= diaFim.getTime()) {

                const dia_semana = diaInicio.getUTCDay();

                for (let dia of dias_res_semana) {

                    if (dia.dia === dia_semana) {
                        const inicio = Number(dia.horario.split(':')[0])*60 + Number(dia.horario.split(':')[1]);
                        const fim = inicio + Number(dia.duracao.split(':')[0])*60 + Number(dia.duracao.split(':')[1]);
                        dias_reserva.push({
                            dia: new Date(diaInicio),
                            inicio: inicio,
                            fim: fim,
                            duracao: dia.duracao
                        });
                        break;
                    }

                }

                diaInicio.setUTCDate(diaInicio.getUTCDate() + 1);

            }


        } else if (tipo === 'Diária') {

            const inicio = Number(hora_inicio.split(':')[0])*60 + Number(hora_inicio.split(':')[1]);
            const fim = inicio + Number(duracao.split(':')[0])*60 + Number(duracao.split(':')[1]);

            while (diaInicio.getTime() <= diaFim.getTime()) {

                dias_reserva.push({
                    dia: new Date(diaInicio),
                    inicio: inicio,
                    fim: fim,
                    duracao: duracao
                });

                diaInicio.setUTCDate(diaInicio.getUTCDate() + 1);
            }


        } else if (tipo === 'Única') {

            const inicio = Number(hora_inicio.split(':')[0])*60 + Number(hora_inicio.split(':')[1]);
            const fim = inicio + Number(duracao.split(':')[0])*60 + Number(duracao.split(':')[1]);

            dias_reserva.push({
                dia: new Date(diaInicio),
                inicio: inicio,
                fim: fim,
                duracao: duracao
            });

        } else {
            //Reserva personalizada

            for (const dia of horarios) {

                const inicio = Number(dia.hora_inicio.split(':')[0])*60 + Number(dia.hora_inicio.split(':')[1]);
                const fim = inicio + Number(dia.duracao.split(':')[0])*60 + Number(dia.duracao.split(':')[1]);

                dias_reserva.push({
                    dia: new Date(dia.data),
                    inicio: inicio,
                    fim: fim,
                    duracao: dia.duracao
                });
            }

        }

        dias_reserva.sort((a, b) =>
            b.dia.getTime() - a.dia.getTime()
        );

        for (const reservaInfo of labReservas.reservas) {

            for (const reserva of reservaInfo.dias) {

                const dia = new Date(reserva.data_inicio);
                dia.setUTCHours(0, 0, 0, 0);

                for (const reservaIns of dias_reserva) {

                    if (reservaIns.dia.toISOString() === dia.toISOString()) {

                        const inicio1 = reserva.data_inicio.getUTCHours()*60 + reserva.data_inicio.getUTCMinutes();
                        const fim1 = reserva.data_fim.getUTCHours()*60 + reserva.data_fim.getUTCMinutes();

                        //Horário conflitante entre reservas
                        if (verificaConflito(inicio1, fim1, reservaIns.inicio, reservaIns.fim)) {
                            let string = `Conflito no dia ${stringData(reserva.data_inicio, false)}`
                            res.status(400).send(string)
                            return;
                        }

                    }

                    if (dia.getTime() > reservaIns.dia.getTime()) break;

                }
            }
        }

        const reservas: ReservaInsercao[] = []
        for (const reservaIns of dias_reserva.reverse()) {
            const inicio = new Date(reservaIns.dia);
            let hora = Math.floor(reservaIns.inicio/60);
            let min = reservaIns.inicio - hora*60;
            inicio.setUTCHours(hora, min, 0, 0);

            const fim = new Date(reservaIns.dia);
            hora = Math.floor(reservaIns.fim/60);
            min = reservaIns.fim - hora*60;
            fim.setUTCHours(hora, min, 0, 0);

            reservas.push({
                data_inicio: inicio,
                data_fim: fim,
                duracao: reservaIns.duracao
            })
        }

        await prisma.reserva.create({
            data: {
                data_inicio: dataSearch1,
                data_fim: dataSearch2,
                tipo: tipo,
                laboratorio_id: labReservas.id,
                user_id: userId,
                dias: {
                    createMany: {
                        data: reservas
                    }
                }
            }
        });

        createReserveEmailText(tipo, labName, userName, data_inicio, data_fim, hora_inicio, duracao, horarios, labReservas.responsavel.email);

        res.status(200).send('Reserva realizada');
        return;

    } catch (error: any) {

        if (error.code === 'P2025') {
            res.status(404).send('Laboratório Inexistente');
            return;
        } else if (error.code === 'P2003') {
            res.status(404).send('Usuário Inexistente');
            return;
        }

        res.status(400).send('Desculpe, não foi possível realizar a reserva. Tente novamente mais tarde');
        return;

    }

});

//Recuperar reservas de laboratórios de um usuário específico
router.post('/reservas/lab', async (req: Request, res: Response) => {

    const parse = ReservesRespLab.safeParse(req.body);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        })
    }

    const { userName, labName, data_inicio, data_fim, tipo } = parse.data;
    const resp_id = (req as any).userData.id;

    const dataSearch1 = new Date(String(data_inicio));
    dataSearch1.setUTCHours(0, 0, 0, 0);

    const dataSearch2 = new Date(String(data_fim));
    dataSearch2.setUTCHours(0, 0, 0, 0);

    let today = new Date();
    if (today.getUTCHours() < 3) today.setUTCDate(today.getUTCDate() - 1)
    today.setUTCHours(0, 0, 0, 0);

    try {
        
        const reservas = await prisma.reserva.findMany({
            where: {
                laboratorio: {
                    responsavel_id: String(resp_id)
                },
                ... (userName && {
                    usuario: {
                        nome: {
                            contains: String(userName)
                        }
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
                ... (labName && {
                    laboratorio: {
                        nome: String(labName)
                    }
                })
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

        const reservasSend = [];

        for (const reserva of reservas) {

            let string_aux1 = stringData(reserva.data_inicio, false);
            let string_aux2 = stringData(reserva.data_fim, false);

            reservasSend.push({
                id: reserva.id,
                responsavel: reserva.usuario.nome,
                lab: reserva.laboratorio.nome,
                data_inicio: string_aux1,
                data_fim: string_aux2,
                tipo: reserva.tipo
            })
        }

        res.status(200).send(reservasSend);
        return;

    } catch (error) {
        res.status(400).send('Desculpe, não foi possível buscar as reservas. Tente novamente mais tarde');
        return;
    }

});

//Recuperar reservas do usuário
router.post('/reservas/user', async (req: Request, res: Response) => {

    const parse = ReservesUser.safeParse(req.body);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
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

        const reservasSend = [];

        for (const reserva of reservas) {

            let string_aux1 = stringData(reserva.data_inicio, false);
            let string_aux2 = stringData(reserva.data_fim, false);

            reservasSend.push({
                id: reserva.id,
                lab: reserva.laboratorio.nome,
                data_inicio: string_aux1,
                data_fim: string_aux2,
                tipo: reserva.tipo
            })
        }

        res.status(200).send(reservasSend);
        return;

    } catch (error) {
        res.status(400).send('Desculpe, não foi possível buscar as reservas. Tente novamente mais tarde');
        return;
    }

});

//Recuperar reservas do sistema
router.get('/reservas', adm_authorization, async (req: Request, res: Response) => {

    const parse = Reserves.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
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

        const reservasSend = [];

        for (const reserva of reservas) {

            let string_aux1 = stringData(reserva.data_inicio, false);
            let string_aux2 = stringData(reserva.data_fim, false);

            reservasSend.push({
                id: reserva.id,
                responsavel: reserva.usuario.nome,
                lab: reserva.laboratorio.nome,
                data_inicio: string_aux1,
                data_fim: string_aux2,
                tipo: reserva.tipo
            })
        }

        res.status(200).send(reservasSend);
        return;

    } catch (error) {
        res.status(400).send('database off');
        return;
    }

});


router.get('/reserva', async (req: Request, res: Response) => {

    const parse = idSchema.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        })
    }

    const { id } = (req as any).userData.id;

    try {

        const reserva = await prisma.reserva.findUniqueOrThrow({
            where: {
                id: String(id)
            },
            include: {
                dias: true,
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
            }
        });

        if (reserva.tipo === 'Única' || reserva.tipo === 'Diária') {

            let string_aux1 = stringData(reserva.dias[0].data_inicio, true);

            res.status(200).send({
                usuario: reserva.usuario.nome,
                laboratorio: reserva.laboratorio.nome,
                tipo: reserva.tipo,
                data_inicio: stringData(reserva.data_inicio, false),
                data_fim: stringData(reserva.data_fim, false),
                hora_inicio: string_aux1,
                duracao: reserva.dias[0].duracao
            });
            return;

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

            res.status(200).send({
                usuario: reserva.usuario.nome,
                laboratorio: reserva.laboratorio.nome,
                tipo: reserva.tipo,
                data_inicio: stringData(reserva.data_inicio, false),
                data_fim: stringData(reserva.data_fim, false),
                dias_semana: reservas
            });
            return;
        } else {

            const reservas = [];

            for (const dia of reserva.dias) {

                let string_aux1 = stringData(dia.data_inicio, false);
                let string_aux2 = stringData(dia.data_inicio, true);

                reservas.push({
                    data: string_aux1,
                    hora_inicio: string_aux2,
                    duracao: dia.duracao
                })
            }

            res.status(200).send({
                usuario: reserva.usuario.nome,
                laboratorio: reserva.laboratorio.nome,
                tipo: reserva.tipo,
                data_inicio: stringData(reserva.data_inicio, false),
                data_fim: stringData(reserva.data_fim, false),
                horarios: reservas
            });
            return;
        }

    } catch (error) {
        res.status(400).send('database off');
        return;
    }

});

router.delete('/minhareserva', async (req: Request, res: Response) => {

    const parse = ReserveRemove.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        })
    }

    const { id } = parse.data;

    try {

        await prisma.reserva.delete({
            where: {
                id: String(id),
                user_id: (req as any).userData.id
            }
        });

        res.status(200).send('Reserva removida');

    } catch (error: any) {

        if (error.code === 'P2025') {
            res.status(404).send("Reserva inexistente");
            return;
        }

        res.status(400).send('Desculpe, não foi possível remover a reserva. Tente novamente mais tarde');
        return;
    }

});

router.delete('/reserva', async (req: Request, res: Response) => {

    const parse = ReserveRemove.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
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
            res.status(404).send('Reserva não encontrada');
            return;
        }

        const diasRemoviveis = reserva.dias.filter(dia => (dia.data_inicio > dia_min || dia.data_inicio < today));

        if (diasRemoviveis.length === 0) {
            res.status(400).send('Não é possível remover nenhum dia da reserva');
            return;
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

        if (error.code === 'P2025') {
            res.status(404).send("Reserva inexistente");
            return;
        }

        res.status(400).send('Desculpe, não foi possível remover a reserva. Tente novamente mais tarde');
        return;
    }

});

export default router;