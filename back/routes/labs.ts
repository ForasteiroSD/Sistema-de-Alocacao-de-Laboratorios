import { Request, Response, Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { dias_semana } from '../index';

const router = Router();
const prisma = new PrismaClient();

router.get("/lab", async (req: Request, res: Response) => {

    const { nome } = req.query;

    try {
        
        const lab = await prisma.laboratorio.findUniqueOrThrow({
            where: {
                nome: String(nome).toLocaleUpperCase()
            },
            include: {
                responsavel: true
            }
        });

        const labRet = {
            nome: lab.nome,
            responsavel: lab.responsavel.nome,
            capacidade: lab.capacidade,
            projetores: lab.projetor? lab.projetor : 'Não possui',
            quadros: lab.quadro? lab.quadro : 'Não possui',
            televisoes: lab.televisao? lab.televisao : 'Não possui',
            ar_condicionados: lab.ar_contidionado? lab.ar_contidionado : 'Não possui',
            computadores: lab.computador? lab.computador : 'Não possui',
            outro: lab.outro? lab.outro : ''
        }

        res.status(200).send(labRet);
        return;

    } catch (error: any) {

        if(error.code === 'P2025') {
            res.status(404).send('Laboratorio inexistente');
            return;
        }

        res.status(400).send('database off');
        return;
    }

});

router.get('/lab/reservas', async (req: Request, res: Response) => {

    const { nome, dia } = req.query;
    let data = new Date(String(dia));

    data.setUTCHours(0, 0, 0, 0);

    try {
        
        const laboratorio = await prisma.laboratorio.findUniqueOrThrow({
            where: {
                nome: String(nome).toLocaleUpperCase()
            },
            include: {
                reservas: {
                    where: {
                        AND: {
                            data_inicio: {
                                lte: data
                            },
                            data_fim: {
                                gte: data
                            }
                        }
                    },
                    include: {
                        horarios: true
                    }
                }
            }
        });
        
        if(!laboratorio?.reservas) {
            res.status(404).send('Nao ha reservas no dia');
            return;
        }

        const reservasHoje = []
        for(let reserva of laboratorio.reservas) {
            if(reserva.tipo === 'Semanal') {

                for(let dia of reserva.horarios) {
                    if(dia.dia_semana === dias_semana[data.getUTCDay()]) {
                        const string_dia = `${(data.toISOString()).split('T')[0]}T${dia.hora_inicio}:00.000Z`
                        reservasHoje.push({
                            begin: dia.hora_inicio,
                            duration: dia.duracao + 'hrs',
                            horario_total: new Date(string_dia)
                        });
                        break;
                    }
                }

            } else {
                const string_dia = `${(data.toISOString()).split('T')[0]}T${reserva.hora_inicio}:00.000Z`
                    reservasHoje.push({
                        begin: reserva.hora_inicio,
                        duration: reserva.duracao + 'hrs',
                        horario_total: new Date(string_dia)
                });
            }
        }

        reservasHoje.sort((a, b) => {
            return a.horario_total.getTime() - b.horario_total.getTime()
        });

        res.status(200).send(reservasHoje);
        return;

    } catch (error: any) {
        
        if(error.code === 'P2025') {
            res.status(404).send('Laboratorio inexistente');
            return;
        }

        res.status(400).send('database off');
        return;

    }

});


export default router;