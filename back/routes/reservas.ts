import { Request, Response, Router } from 'express'
import { PrismaClient, reserva } from '@prisma/client'
import { dias_semana } from '../index';

const router = Router();
const prisma = new PrismaClient();

interface ResTeste {
    dia: Date;
    inicio: number;
    fim: number;
    duracao: string;
}

interface ResIns {
    data_inicio: Date;
    data_fim: Date;
    duracao: string;
}

function verificaConflito(inicio1: Number, fim1: Number, inicio2: Number, fim2: Number) {

    if (inicio1 >= inicio2 && inicio1 < fim2) return true;

    if (inicio2 >= inicio1 && inicio2 < fim1) return true;

    return false;

}

//Inserir reservas
//Tipo Única não precisa informar data_fim
//Somente reservas do tipo Semanal e Personalizada precisam informar o parâmetro horarios
//Reservas do tipo Semanal não precisam informar parâmetros hora_inicio e duracao
//Reservas do tipo Personalizada não precisam informar parâmetros hora_inicio, duracao, data_inicio e data_fim
//Formato do parâmetro horarios para tipo Semanal:
// horarios = [
//     {
//         dia_semana: "Sexta",
//         hora_inicio: "18:00",
//         duracao: "01:30"
//     },
//     {
//         dia_semana: "Sábado",
//         hora_inicio: "13:00",
//         duracao: "02:00"
//     }
// ]
//Formato do parâmetro horarios para tipo Personalizada:
// horarios = [
//     {
//         data: "2024-06-07",
//         hora_inicio: "17:30",
//         duracao: "01:30",
//     },
//     {
//         data: "2024-06-09",
//         hora_inicio: "08:30",
//         duracao: "03:30"
//     }
// ]
router.post('/reserva', async (req: Request, res: Response) => {

    const { userId, labName, tipo, data_inicio, data_fim, hora_inicio, duracao, horarios } = req.body;

    let dataSearch1, dataSearch2;

    if(tipo === 'Personalizada') {

        for(let dia of horarios) {
            dia.data = new Date(dia.data);
        }
    
        horarios.sort((a: any, b: any) => 
            a.data.getTime() - b.data.getTime()
        );

        dataSearch1 = new Date(horarios[0].data);
        dataSearch2 = new Date(horarios[horarios.length-1].data);

    } else {

        dataSearch1 = new Date(data_inicio);
        dataSearch1.setUTCHours(0, 0, 0, 0);
    
        dataSearch2 = data_fim? new Date(data_fim) : new Date(data_inicio)
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
                }
            }
        });

        const dias_reserva: ResTeste[] = []

        const diaInicio = new Date(data_inicio);
        const diaFim = data_fim? new Date(data_fim) : new Date(diaInicio)

        diaInicio.setUTCHours(0, 0, 0, 0);
        diaFim.setUTCHours(0, 0, 0, 0);

        if (tipo === 'Semanal') {

            const dias_res_semana = []
            for(let horario of horarios) {
                dias_res_semana.push({dia: dias_semana.indexOf(horario.dia_semana), horario: horario.hora_inicio, duracao: horario.duracao})
            }
                
            while(diaInicio.getTime() <= diaFim.getTime()) {

                const dia_semana = diaInicio.getUTCDay();

                for(let dia of dias_res_semana) {

                    if(dia.dia === dia_semana) {
                        const inicio = Number(dia.horario.split(':')[0]) + Number(dia.horario.split(':')[1])/60;
                        const fim = inicio + Number(dia.duracao.split(':')[0]) + Number(dia.duracao.split(':')[1])/60;
                        dias_reserva.push({
                            dia: new Date(diaInicio),
                            inicio: inicio,
                            fim: fim,
                            duracao: dia.duracao
                        });
                        break;
                    }

                }

                diaInicio.setUTCDate(diaInicio.getUTCDate()+1);

            }


        } else if (tipo === 'Diária') {

            const inicio = Number(hora_inicio.split(':')[0]) + Number(hora_inicio.split(':')[1])/60;
            const fim = inicio + Number(duracao.split(':')[0]) + Number(duracao.split(':')[1])/60;

            while(diaInicio.getTime() <= diaFim.getTime()) {

                dias_reserva.push({
                    dia: new Date(diaInicio),
                    inicio: inicio,
                    fim: fim,
                    duracao: duracao
                });

                diaInicio.setUTCDate(diaInicio.getUTCDate()+1);
            }


        } else if(tipo === 'Única') {
            //Reserva única

            const inicio = Number(hora_inicio.split(':')[0]) + Number(hora_inicio.split(':')[1])/60;
            const fim = inicio + Number(duracao.split(':')[0]) + Number(duracao.split(':')[1])/60;

            dias_reserva.push({
                dia: new Date(diaInicio),
                inicio: inicio,
                fim: fim,
                duracao: duracao
            });

        } else {
            //Reserva personalizada

            for(const dia of horarios) {

                const inicio = Number(dia.hora_inicio.split(':')[0]) + Number(dia.hora_inicio.split(':')[1])/60;
                const fim = inicio + Number(dia.duracao.split(':')[0]) + Number(dia.duracao.split(':')[1])/60;

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

        for(const reservaInfo of labReservas.reservas) {

            for(const reserva of reservaInfo.dias) {

                const dia = new Date(reserva.data_inicio);
                dia.setUTCHours(0, 0, 0, 0);

                for(const reservaIns of dias_reserva) {

                    if (reservaIns.dia.toISOString() === dia.toISOString()) {

                        const inicio1 = reserva.data_inicio.getUTCHours() + reserva.data_inicio.getUTCMinutes()/60;
                        const fim1 = reserva.data_fim.getUTCHours() + reserva.data_fim.getUTCMinutes()/60;

                        //Horário conflitante entre reservas
                        if (verificaConflito(inicio1, fim1, reservaIns.inicio, reservaIns.fim)) {
                            let string_aux1 = '';
                            if(reserva.data_inicio.getUTCDate() < 10) string_aux1 = '0'+(reserva.data_inicio.getUTCDate());
                            else string_aux1 += reserva.data_inicio.getUTCDate();
                            
                            let string_aux2 = '';
                            if (reserva.data_inicio.getUTCMonth() <= 10) string_aux2 = '0'+(reserva.data_inicio.getUTCMonth()+1);
                            else string_aux2 += (reserva.data_inicio.getUTCMonth()+1);
                            res.status(400).send(`Conflito no dia ${string_aux1}/${string_aux2}/${reserva.data_inicio.getUTCFullYear()}`);
                            return;
                        }
                        
                    }

                    if(dia.getTime() > reservaIns.dia.getTime()) break;

                }
            }
        }

        const reservas: ResIns[] = []
        for(const reservaIns of dias_reserva.reverse()) {
            const inicio = new Date(reservaIns.dia);
            let hora = Math.floor(reservaIns.inicio);
            let min = (reservaIns.inicio - hora)*60;
            inicio.setUTCHours(hora, min, 0, 0);

            const fim = new Date(reservaIns.dia);
            hora = Math.floor(reservaIns.fim);
            min = (reservaIns.fim - hora)*60;
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

        //Enviar email
        //Enviar email
        //Enviar email
        //Enviar email
        //Enviar email
        //Enviar email
        //Enviar email
        //Enviar email
        //Enviar email
        //Enviar email
        //Enviar email

        res.status(200).send('Reserva realizada');
        return;

    } catch (error: any) {

        if (error.code === 'P2025') {
            res.status(404).send('Laboratorio Inexistente');
            return;
        } else if(error.code === 'P2003') {
            res.status(404).send('Usuário Inexistente');
            return;
        }

        res.status(400).send('database off');
        return;

    }

});


//Recuperar reservas de um laboratório
router.get('/reservas/lab', async (req: Request, res: Response) => {

    const { userName, labName, data_inicio, data_fim, tipo } = req.query;

    const dataSearch1 = new Date(String(data_inicio));
    dataSearch1.setUTCHours(0, 0, 0, 0);

    const dataSearch2 = new Date(String(data_fim))
    dataSearch2.setUTCHours(0, 0, 0, 0);

    try {
        
        const reservas = await prisma.reserva.findMany({
            where: {
                ... (userName && {
                    usuario: {
                        nome: String(userName)
                    }
                }),
                ... (data_inicio && {
                    data_inicio: {
                        gte: dataSearch1
                    }
                }),
                ... (data_fim && {
                    data_fim: {
                        lte: dataSearch2
                    }
                }),
                ... (tipo && {
                    tipo: String(tipo)
                }),
                laboratorio: {
                    nome: String(labName)
                }
            },
            include: {
                usuario: {
                    select: {
                        nome: true
                    }
                }
            }
        });

        const reservasSend = [];

        for(const reserva of reservas) {

            let string_aux1 = '';
            if(reserva.data_inicio.getUTCDate() < 10) string_aux1 = '0'+(reserva.data_inicio.getUTCDate());
            else string_aux1 += reserva.data_inicio.getUTCDate();
            
            let string_aux2 = '';
            if (reserva.data_inicio.getUTCMonth() <= 10) string_aux2 = '0'+(reserva.data_inicio.getUTCMonth()+1);
            else string_aux2 += (reserva.data_inicio.getUTCMonth()+1);
            
            string_aux1 = `${string_aux1}/${string_aux2}/${reserva.data_inicio.getUTCFullYear()}`

            let string_aux3 = ''
            if(reserva.data_fim.getUTCDate() < 10) string_aux3 = '0'+(reserva.data_fim.getUTCDate());
            else string_aux3 += reserva.data_fim.getUTCDate();
            
            string_aux2 = '';
            if (reserva.data_fim.getUTCMonth() <= 10) string_aux2 = '0'+(reserva.data_fim.getUTCMonth()+1);
            else string_aux2 += (reserva.data_fim.getUTCMonth()+1);

            string_aux2 = `${string_aux3}/${string_aux2}/${reserva.data_fim.getUTCFullYear()}`

            reservasSend.push({
                id: reserva.id,
                responsavel: reserva.usuario.nome,
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

//Recuperar reservas do usuário
router.post('/reservas/user', async (req: Request, res: Response) => {

    const { userId, labName, data_inicio, data_fim, tipo } = req.body;

    const dataSearch1 = new Date(String(data_inicio));
    dataSearch1.setUTCHours(0, 0, 0, 0);

    const dataSearch2 = new Date(String(data_fim))
    dataSearch2.setUTCHours(0, 0, 0, 0);

    try {
        
        const reservas = await prisma.reserva.findMany({
            where: {
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
                ... (data_fim && {
                    data_fim: {
                        lte: dataSearch2
                    }
                }),
                ... (tipo && {
                    tipo: String(tipo)
                }),
                user_id: String(userId)
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

        for(const reserva of reservas) {

            let string_aux1 = '';
            if(reserva.data_inicio.getUTCDate() < 10) string_aux1 = '0'+(reserva.data_inicio.getUTCDate());
            else string_aux1 += reserva.data_inicio.getUTCDate();
            
            let string_aux2 = '';
            if (reserva.data_inicio.getUTCMonth() <= 10) string_aux2 = '0'+(reserva.data_inicio.getUTCMonth()+1);
            else string_aux2 += (reserva.data_inicio.getUTCMonth()+1);
            
            string_aux1 = `${string_aux1}/${string_aux2}/${reserva.data_inicio.getUTCFullYear()}`

            let string_aux3 = ''
            if(reserva.data_fim.getUTCDate() < 10) string_aux3 = '0'+(reserva.data_fim.getUTCDate());
            else string_aux3 += reserva.data_fim.getUTCDate();
            
            string_aux2 = '';
            if (reserva.data_fim.getUTCMonth() <= 10) string_aux2 = '0'+(reserva.data_fim.getUTCMonth()+1);
            else string_aux2 += (reserva.data_fim.getUTCMonth()+1);

            string_aux2 = `${string_aux3}/${string_aux2}/${reserva.data_fim.getUTCFullYear()}`

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
        res.status(400).send('database off');
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

    try {
        
        const reservas = await prisma.reserva.findMany({
            where: {
                ... (userName && {
                    usuario: {
                        nome: String(userName)
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
                ... (data_fim && {
                    data_fim: {
                        lte: dataSearch2
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
            }
        });

        const reservasSend = [];

        for(const reserva of reservas) {

            let string_aux1 = '';
            if(reserva.data_inicio.getUTCDate() < 10) string_aux1 = '0'+(reserva.data_inicio.getUTCDate());
            else string_aux1 += reserva.data_inicio.getUTCDate();
            
            let string_aux2 = '';
            if (reserva.data_inicio.getUTCMonth() <= 10) string_aux2 = '0'+(reserva.data_inicio.getUTCMonth()+1);
            else string_aux2 += (reserva.data_inicio.getUTCMonth()+1);
            
            string_aux1 = `${string_aux1}/${string_aux2}/${reserva.data_inicio.getUTCFullYear()}`

            let string_aux3 = ''
            if(reserva.data_fim.getUTCDate() < 10) string_aux3 = '0'+(reserva.data_fim.getUTCDate());
            else string_aux3 += reserva.data_fim.getUTCDate();
            
            string_aux2 = '';
            if (reserva.data_fim.getUTCMonth() <= 10) string_aux2 = '0'+(reserva.data_fim.getUTCMonth()+1);
            else string_aux2 += (reserva.data_fim.getUTCMonth()+1);

            string_aux2 = `${string_aux3}/${string_aux2}/${reserva.data_fim.getUTCFullYear()}`

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
                dias: true
            }
        });

        if (reserva.tipo === 'Única' ||  reserva.tipo === 'Diária' ) {
            let string_hora = '';
            if(reserva.dias[0].data_inicio.getUTCHours() < 10) string_hora = '0' + reserva.dias[0].data_inicio.getUTCHours();
            else string_hora += reserva.dias[0].data_inicio.getUTCHours();

            let string_min = '';
            if(reserva.dias[0].data_inicio.getUTCMinutes() < 10) string_min = '0' + reserva.dias[0].data_inicio.getUTCMinutes();
            else string_min += reserva.dias[0].data_inicio.getUTCMinutes();
            
            res.status(200).send({
                hora_inicio: `${string_hora}:${string_min}`,
                duracao: reserva.dias[0].duracao
            });
            return;

        } else if (reserva.tipo === 'Semanal') {

            const reservas = [];
            const dias: number[] = []

            for(const dia of reserva.dias) {

                if(dias.indexOf(dia.data_inicio.getUTCDay()) !== -1) break;
                dias.push(dia.data_inicio.getUTCDay());

                let string_hora = '';
                if(dia.data_inicio.getUTCHours() < 10) string_hora = '0' + dia.data_inicio.getUTCHours();
                else string_hora += dia.data_inicio.getUTCHours();

                let string_min = '';
                if(dia.data_inicio.getUTCMinutes() < 10) string_min = '0' + dia.data_inicio.getUTCMinutes();
                else string_min += dia.data_inicio.getUTCMinutes();

                reservas.push({
                    dia: dias_semana[dia.data_inicio.getUTCDay()],
                    hora_inicio: `${string_hora}:${string_min}`,
                    duracao: dia.duracao
                });
            }

            res.status(200).send(reservas);
            return;
        } else {
            
            const reservas = [];
            
            for(const dia of reserva.dias) {

                let string_aux1 = '';
                if(dia.data_inicio.getUTCDate() < 10) string_aux1 = '0'+(dia.data_inicio.getUTCDate());
                else string_aux1 += dia.data_inicio.getUTCDate();
                
                let string_aux2 = '';
                if (dia.data_inicio.getUTCMonth() <= 10) string_aux2 = '0'+(dia.data_inicio.getUTCMonth()+1);
                else string_aux2 += (dia.data_inicio.getUTCMonth()+1);

                let string_hora = '';
                if(dia.data_inicio.getUTCHours() < 10) string_hora = '0' + dia.data_inicio.getUTCHours();
                else string_hora += dia.data_inicio.getUTCHours();

                let string_min = '';
                if(dia.data_inicio.getUTCMinutes() < 10) string_min = '0' + dia.data_inicio.getUTCMinutes();
                else string_min += dia.data_inicio.getUTCMinutes();

                reservas.push({
                    data: `${string_aux1}/${string_aux2}/${dia.data_inicio.getUTCFullYear()}`,
                    hora_inicio: `${string_hora}:${string_min}`,
                    duracao: dia.duracao
                })
            }

            res.status(200).send(reservas);
            return;
        }

    } catch (error) {
        res.status(400).send('database off');
        return;
    }

});

export default router;