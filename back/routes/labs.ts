import { Request, Response, Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { stringData } from '../index';

const router = Router();
const prisma = new PrismaClient();

//Cadastrar laboratório
router.post("/lab", async (req: Request, res: Response) => {

    //Dados do laboratório a ser criado
    //Utilizar responsavel_cpf caso seja administrador que esteja criado laboratório, responsavel_id caso contrário
    const { responsavel_cpf, nome, capacidade, projetor, quadro, televisao, ar_condicionado, computador, outro } = req.body;
    let { responsavel_id } = req.body;

    try {
        if (responsavel_cpf) {
            const user = await prisma.user.findUniqueOrThrow({
                where: {
                    cpf: responsavel_cpf,
                    tipo: 'Responsável'
                },
                select: {
                    id: true
                }
            });
            responsavel_id = user.id;
        }

        await prisma.laboratorio.create({
            data: {
                nome: nome,
                capacidade: capacidade,
                projetor: projetor,
                quadro: quadro,
                televisao: televisao,
                ar_contidionado: ar_condicionado,
                computador: computador,
                outro: outro,
                responsavel_id: responsavel_id
            }
        });

        res.status(200).send('Laboratório criado');
        return;

    } catch (error: any) {

        if (error.code === 'P2025') {
            res.status(404).send('Responsavel nao encontrado');
            return;
        }

        if (error.code === 'P2002' && error.meta.target[0] === 'nome') {
            res.status(409).send('Nome ja cadastrado');
            return;
        }

        res.status(400).send('database off');
        return;

    }
});

//Atualizar laboratório
router.patch("/lab", async (req: Request, res: Response) => {

    //Dados de busca e a serem atualizados
    //novoResponsavel é o cpf do usuário que será responsável pelo laboratório (opcional)
    const { id, capacidade, projetor, quadro, televisao, ar_condicionado, computador, outro, novo_responsavel } = req.body;

    try {
        if (novo_responsavel) {
            await prisma.user.update({
                where: {
                    cpf: novo_responsavel,
                    tipo: 'Responsável'
                },
                data: {
                    laboratorios: {
                        connect: {
                            id: id
                        }
                    }
                }
            })
        } else {
            await prisma.laboratorio.update({
                where: {
                    id: id
                },
                data: {
                    capacidade: capacidade,
                    projetor: projetor,
                    quadro: quadro,
                    televisao: televisao,
                    ar_contidionado: ar_condicionado,
                    computador: computador,
                    outro: outro
                }
            });
        }

        res.status(200).send('Laboratorio atualizado');
        return;

    } catch (error: any) {

        if (error.code === 'P2025') {
            res.status(404).send('Responsavel nao encontrado');
            return;
        }

        res.status(400).send('database off');
        return;
    }
});

//Consultar laboratórios
router.get("/labs", async (req: Request, res: Response) => {

    //Filtros de busca
    const { nome, responsavel, capacidade_minima } = req.query;

    try {
        const labs = await prisma.laboratorio.findMany({
            where: {
                ... (nome && {
                    nome: { contains: String(nome) }
                }),
                ... (responsavel && {
                    responsavel: {
                        nome: { contains: String(responsavel) }
                    }
                }),
                ... (capacidade_minima && {
                    capacidade: {
                        gte: Number(capacidade_minima)
                    }
                })
            },
            select: {
                id: true,
                nome: true,
                responsavel: true,
                capacidade: true
            },
            orderBy: [
                {
                    nome: 'asc'
                },
            ]
        });

        const labsRet = [];
        for (let lab of labs) {
            labsRet.push({
                id: lab.id,
                nome: lab.nome,
                responsavel: lab.responsavel.nome,
                capacidade: lab.capacidade
            })
        }

        res.status(200).send(labsRet);
        return;

    } catch (error) {
        res.status(400).send('database off');
        return;
    }
});


router.get("/lab", async (req: Request, res: Response) => {

    const { id } = req.query;

    try {

        const lab = await prisma.laboratorio.findUniqueOrThrow({
            where: {
                id: String(id)
            },
            include: {
                responsavel: true
            }
        });

        const labRet = {
            nome: lab.nome,
            responsavelNome: lab.responsavel.nome,
            responsavelCpf: lab.responsavel.cpf,
            capacidade: lab.capacidade,
            projetores: lab.projetor ? lab.projetor : 'Não possui',
            quadros: lab.quadro ? lab.quadro : 'Não possui',
            televisoes: lab.televisao ? lab.televisao : 'Não possui',
            ar_condicionados: lab.ar_contidionado ? lab.ar_contidionado : 'Não possui',
            computadores: lab.computador ? lab.computador : 'Não possui',
            outro: lab.outro ? lab.outro : ''
        }

        res.status(200).send(labRet);
        return;

    } catch (error: any) {

        if (error.code === 'P2025') {
            res.status(404).send('Laboratorio inexistente');
            return;
        }

        res.status(400).send('database off');
        return;
    }

});

router.get("/labNames", async (req: Request, res: Response) => {

    try {

        const labs = await prisma.laboratorio.findMany({
            select: {
                nome: true
            }
        });

        res.status(200).send(labs);
        return;

    } catch (error: any) {

        res.status(400).send('database off');
        return;
    }

});

router.get('/lab/reservasdia', async (req: Request, res: Response) => {

    const { id, dia } = req.query;
    let data = new Date(String(dia));
    let data1 = new Date(String(dia));
    data1.setUTCDate(data1.getUTCDate() + 1)

    data.setUTCHours(0, 0, 0, 0);
    data1.setUTCHours(0, 0, 0, 0);

    try {

        const laboratorio = await prisma.laboratorio.findUniqueOrThrow({
            where: {
                id: String(id)
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
                            }
                        }
                    },
                    orderBy: {
                        data_inicio: 'asc'
                    },
                }
            }
        });

        if (!laboratorio?.reservas) {
            res.status(404).send('Nao ha reservas no dia');
            return;
        }

        const reservasHoje = []
        for (const reservaInfo of laboratorio.reservas) {
            for (const reserva of reservaInfo.dias) {

                let string_aux1 = stringData(reserva.data_inicio, true);

                reservasHoje.push({
                    hora_inicio: string_aux1,
                    duracao: reserva.duracao
                });

            }
        }

        res.status(200).send(reservasHoje);
        return;

    } catch (error: any) {

        if (error.code === 'P2025') {
            res.status(404).send('Laboratorio inexistente');
            return;
        }

        res.status(400).send('database off');
        return;

    }

});


export default router;