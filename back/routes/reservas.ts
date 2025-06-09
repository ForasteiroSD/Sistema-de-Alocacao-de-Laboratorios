import { Request, Response, Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { env } from 'node:process';
import { stringData } from '../utils/formatDate';
import { sendEmail } from '../utils/sendEmail';

const router = Router();
const prisma = new PrismaClient();

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

function createEmailText(tipo: string, labName: string, userName: string, data_inicio: string, data_fim: string, hora_inicio: string, duracao: string,
    horarios: any, email: string) {
    

    let text1 = `Nova reserva ${tipo} feita no laboratório ${labName}\n\nDados da Reserva:\nUsuário: ${userName}\n`;
    let text2 = `<h1>Nova reserva ${tipo} feita no laboratório ${labName}</h1><h3>Dados da Reserva:</h3><p style='margin: 0'>Usuário: ${userName}</p>`

    if (tipo === 'Única') {
        text1 += `Data: ${data_inicio}\nHorário: ${hora_inicio}\nDuração: ${duracao}\n\n`;
        text2 += `<div><p style='margin: 0'>Data: ${data_inicio}</p><p style='margin: 0'>Horário: ${hora_inicio}</p><p style='margin: 0'>Duração: ${duracao}</p></div>`;
    } else if (tipo === 'Personalizada') {
        for (const dia of horarios) {
            text1 += `Data: ${stringData(dia.data, false)}\nHorário: ${dia.hora_inicio}\nDuração: ${dia.duracao}\n\n`;
            text2 += `<div><p style='margin: 0'>Data: ${stringData(dia.data, false)}</p><p style='margin: 0'>Horário: ${dia.hora_inicio}</p><p style='margin: 0'>Duração: ${dia.duracao}</p></div><br>`;
        }
    } else if (tipo === 'Semanal') {
        text1 += `Data Inicial: ${data_inicio}\nData Final: ${data_fim}\n\n`;
        text2 += `<div><p style='margin: 0'>Data Inicial: ${data_inicio}</p><p style='margin: 0'>Data Final: ${data_fim}</p><br>`;
        for (const dia of horarios) {
            text1 += `Dia da semana: ${dia.dia_semana}\nHorário: ${dia.hora_inicio}\nDuração: ${dia.duracao}\n\n`;
            text2 += `<div><p style='margin: 0'>Dia da semana: ${dia.dia_semana}</p><p style='margin: 0'>Horário: ${dia.hora_inicio}</p><p style='margin: 0'>Duração: ${dia.duracao}</p></div><br>`;
        }
        text2 += '</div>';
    } else {
        text1 += `Data Inicial: ${data_inicio}\nData Final: ${data_fim}\nHorário: ${hora_inicio}\nDuração: ${duracao}\n\n`;
        text2 += `<p style='margin: 0'>Data Inicial: ${data_inicio}</p><p style='margin: 0'>Data Final: ${data_fim}</p><p style='margin: 0'>Horário: ${hora_inicio}</p><p style='margin: 0'>Duração: ${duracao}</p><br>`;
    }

    text1 += `\nAcesse ${env.PAGE_LINK} para ver mais!\n\n\nLabHub - Alocação de Laboratórios`;
    text2 += `<br><br><p style='margin: 0'>Acesse <a href="${env.PAGE_LINK}">LabHub</a> para ver mais!</p><br><br>LabHub - Alocação de Laboratórios`;

    sendEmail(email, text1, text2, 'Nova Reserva');
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

interface HorariosSemanal {
    dia_semana: string | Date;
    hora_inicio: string;
    duracao: string;
}

interface HorariosPersonaliza {
    data: string | Date;
    hora_inicio: string;
    duracao: string;
}

interface ReservaPost {
    userId: string;
    userName: string;
    labName: string;
    tipo: 'Única' | 'Semanal' | 'Personalizada' | 'Diária'
    data_inicio?: string;
    data_fim?: string;
    hora_inicio?: string;
    duracao?: string;
    horarios?: HorariosSemanal[] | HorariosPersonaliza[];
}


//Inserir reservas
router.post('/reserva', async (req: Request, res: Response) => {

    const { userId, userName, labName, tipo, data_inicio, data_fim, hora_inicio, duracao, horarios } = req.body;

    let dataSearch1, dataSearch2;

    if (tipo === 'Personalizada' && horarios) {

        for (let dia of horarios) {
            if(dia.data) dia.data = new Date(dia.data);
        }

        horarios.sort((a: any, b: any) =>
            a.data.getTime() - b.data.getTime()
        );

        dataSearch1 = new Date(horarios[0].data);
        dataSearch2 = new Date(horarios[horarios.length - 1].data);

    } else {

        dataSearch1 = new Date(data_inicio);
        dataSearch1.setUTCHours(0, 0, 0, 0);

        dataSearch2 = data_fim ? new Date(data_fim) : new Date(data_inicio)
        dataSearch2.setUTCHours(0, 0, 0, 0);
        dataSearch2.setDate(dataSearch2.getDate());

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
            //Reserva única

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

        createEmailText(tipo, labName, userName, data_inicio, data_fim, hora_inicio, duracao, horarios, labReservas.responsavel.email);

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

    const { resp_id, userName, labName, data_inicio, data_fim, tipo } = req.body;

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

    const { userId, labName, data_inicio, data_fim, tipo } = req.body;

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
router.get('/reservas', async (req: Request, res: Response) => {

    const { userName, labName, data_inicio, data_fim, tipo } = req.query;

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

    const { id } = req.query;
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

    const { reserva_id } = req.query;

    try {

        await prisma.reserva.delete({
            where: {
                id: String(reserva_id)
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

    const { reserva_id, motivo } = req.query;
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
                id: String(reserva_id)
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
                reserva_id: String(reserva_id)
            },
        });

        let text = `Informamos que sua reserva do tipo ${reserva.tipo}, no laboratório ${reserva.laboratorio.nome} do dia ${stringData(reserva.data_inicio, false)} até o dia ${stringData(reserva.data_fim, false)} foi removida.`;
        text += `\n\nMotivo da remoção: ${motivo}`;

        if (diasRestantes.length === 0) {
            await prisma.reserva.delete({
                where: {
                    id: String(reserva_id)
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