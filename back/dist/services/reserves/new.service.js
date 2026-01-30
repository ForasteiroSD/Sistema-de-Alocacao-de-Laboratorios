import { stringData } from '../../utils/formatDate.js';
import { prisma } from '../../utils/prisma.js';
import { createReserveEmailText } from '../../utils/sendEmail.js';
import { DailyReserve, PersonalizedReserves, ReserveInsert, UniqueReserve, WeeklyReserves } from '../../utils/validation/reserve.schema.js';
const dias_semana = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado'
];
function verificaConflito(inicio1, fim1, inicio2, fim2) {
    if (inicio1 >= inicio2 && inicio1 < fim2)
        return true;
    if (inicio2 >= inicio1 && inicio2 < fim1)
        return true;
    return false;
}
export async function newReserve(req, res) {
    const parse = ReserveInsert.safeParse(req.body);
    if (!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
        });
    }
    const { userName, labName, tipo, data_inicio, data_fim, hora_inicio, duracao, horarios } = req.body;
    const userId = req.userData.id;
    let newParse = tipo === "Personalizada" ? PersonalizedReserves.safeParse(req.body)
        : tipo === "Única" ? UniqueReserve.safeParse(req.body)
            : tipo === "Diária" ? DailyReserve.safeParse(req.body)
                : WeeklyReserves.safeParse(req.body);
    if (!newParse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: newParse.error.issues[0].message
        });
    }
    let dataSearch1, dataSearch2;
    const today = new Date();
    if (today.getUTCHours() < 3)
        today.setUTCDate(today.getUTCDate() - 1);
    today.setUTCHours(0, 0, 0, 0);
    if (tipo === "Personalizada") {
        newParse = PersonalizedReserves.safeParse(req.body);
        for (let dia of horarios) {
            dia.data = new Date(dia.data);
            if (dia.data.getTime() < today.getTime()) {
                return res.status(422).send({
                    message: "Dados inválidos",
                    errors: "Data da reserva não pode ser inferior ao dia de hoje"
                });
            }
        }
        horarios.sort((a, b) => a.data.getTime() - b.data.getTime());
        dataSearch1 = new Date(horarios[0].data);
        dataSearch2 = new Date(horarios[horarios.length - 1].data);
    }
    else {
        dataSearch1 = new Date(data_inicio);
        dataSearch2 = data_fim ? new Date(data_fim) : new Date(data_inicio);
        dataSearch1.setUTCHours(23, 59, 0, 0);
        dataSearch2.setUTCHours(23, 59, 0, 0);
        if (dataSearch1.getTime() < today.getTime()) {
            return res.status(422).send({
                message: "Dados inválidos",
                errors: "Data inicial não pode ser inferior ao dia de hoje"
            });
        }
        if (dataSearch1.getTime() > dataSearch2.getTime()) {
            return res.status(422).send({
                message: "Dados inválidos",
                errors: "Data final deve ser após data inicial"
            });
        }
        dataSearch1.setUTCHours(0, 0, 0, 0);
        dataSearch2.setUTCHours(0, 0, 0, 0);
        dataSearch2.setDate(dataSearch2.getDate());
    }
    try {
        const labReservas = await prisma.laboratorio.findUnique({
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
        if (!labReservas) {
            return res.status(404).send("Laboratório informado não encontrado.");
        }
        const dias_reserva = [];
        const diaInicio = new Date(data_inicio);
        const diaFim = data_fim ? new Date(data_fim) : new Date(diaInicio);
        diaInicio.setUTCHours(0, 0, 0, 0);
        diaFim.setUTCHours(0, 0, 0, 0);
        if (tipo === 'Semanal') {
            const dias_res_semana = horarios.map((horario) => {
                return {
                    dia: dias_semana.indexOf(horario.dia_semana),
                    horario: horario.hora_inicio,
                    duracao: horario.duracao
                };
            });
            while (diaInicio.getTime() <= diaFim.getTime()) {
                const dia_semana = diaInicio.getUTCDay();
                for (let dia of dias_res_semana) {
                    if (dia.dia === dia_semana) {
                        const inicio = Number(dia.horario.split(':')[0]) * 60 + Number(dia.horario.split(':')[1]);
                        const fim = inicio + Number(dia.duracao.split(':')[0]) * 60 + Number(dia.duracao.split(':')[1]);
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
        }
        else if (tipo === 'Diária') {
            const inicio = Number(hora_inicio.split(':')[0]) * 60 + Number(hora_inicio.split(':')[1]);
            const fim = inicio + Number(duracao.split(':')[0]) * 60 + Number(duracao.split(':')[1]);
            while (diaInicio.getTime() <= diaFim.getTime()) {
                dias_reserva.push({
                    dia: new Date(diaInicio),
                    inicio: inicio,
                    fim: fim,
                    duracao: duracao
                });
                diaInicio.setUTCDate(diaInicio.getUTCDate() + 1);
            }
        }
        else if (tipo === 'Única') {
            const inicio = Number(hora_inicio.split(':')[0]) * 60 + Number(hora_inicio.split(':')[1]);
            const fim = inicio + Number(duracao.split(':')[0]) * 60 + Number(duracao.split(':')[1]);
            dias_reserva.push({
                dia: new Date(diaInicio),
                inicio: inicio,
                fim: fim,
                duracao: duracao
            });
        }
        else {
            for (const dia of horarios) {
                const inicio = Number(dia.hora_inicio.split(':')[0]) * 60 + Number(dia.hora_inicio.split(':')[1]);
                const fim = inicio + Number(dia.duracao.split(':')[0]) * 60 + Number(dia.duracao.split(':')[1]);
                dias_reserva.push({
                    dia: new Date(dia.data),
                    inicio: inicio,
                    fim: fim,
                    duracao: dia.duracao
                });
            }
        }
        dias_reserva.sort((a, b) => b.dia.getTime() - a.dia.getTime());
        for (const reservaInfo of labReservas.reservas) {
            for (const reserva of reservaInfo.dias) {
                const dia = new Date(reserva.data_inicio);
                dia.setUTCHours(0, 0, 0, 0);
                for (const reservaIns of dias_reserva) {
                    if (reservaIns.dia.toISOString() === dia.toISOString()) {
                        const inicio1 = reserva.data_inicio.getUTCHours() * 60 + reserva.data_inicio.getUTCMinutes();
                        const fim1 = reserva.data_fim.getUTCHours() * 60 + reserva.data_fim.getUTCMinutes();
                        //Horário conflitante entre reservas
                        if (verificaConflito(inicio1, fim1, reservaIns.inicio, reservaIns.fim)) {
                            let string = `Conflito no dia ${stringData(reserva.data_inicio, false)}`;
                            res.status(409).send(string);
                            return;
                        }
                    }
                    if (dia.getTime() > reservaIns.dia.getTime())
                        break;
                }
            }
        }
        const reservas = [];
        for (const reservaIns of dias_reserva.reverse()) {
            const inicio = new Date(reservaIns.dia);
            let hora = Math.floor(reservaIns.inicio / 60);
            let min = reservaIns.inicio - hora * 60;
            inicio.setUTCHours(hora, min, 0, 0);
            const fim = new Date(reservaIns.dia);
            hora = Math.floor(reservaIns.fim / 60);
            min = reservaIns.fim - hora * 60;
            fim.setUTCHours(hora, min, 0, 0);
            reservas.push({
                data_inicio: inicio,
                data_fim: fim,
                duracao: reservaIns.duracao
            });
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
        return res.status(200).send('Reserva realizada');
    }
    catch (error) {
        res.status(400).send('Desculpe, não foi possível realizar a reserva. Tente novamente mais tarde');
        return;
    }
}
//# sourceMappingURL=new.service.js.map