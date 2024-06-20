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
            res.status(404).send('Responsável não encontrado');
            return;
        }

        if (error.code === 'P2002' && error.meta.target[0] === 'nome') {
            res.status(409).send('Nome já cadastrado');
            return;
        }

        res.status(400).send('Desculpe, não foi possível criar o laboratório. Tente novamente mais tarde');
        return;

    }
});

//Atualizar laboratório
router.patch("/lab", async (req: Request, res: Response) => {

    //Dados de busca e a serem atualizados
    //novoResponsavel é o cpf do usuário que será responsável pelo laboratório (opcional)
    const { nome, capacidade, projetor, quadro, televisao, ar_condicionado, computador, outro, novo_responsavel } = req.body;
    
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
                            nome: nome
                        }
                    }
                }
            })
        }

        await prisma.laboratorio.update({
            where: {
                nome: nome
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

        res.status(200).send('Laboratório atualizado');
        return;

    } catch (error: any) {

        console.log(error)

        if (error.code === 'P2025') {
            res.status(404).send('Responsável não encontrado');
            return;
        }

        res.status(400).send('Desculpe, não foi possível atualizar o laboratório. Tente novamente mais tarde');
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

    const { nome } = req.query;

    try {

        const lab = await prisma.laboratorio.findUniqueOrThrow({
            where: {
                nome: String(nome)
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
            res.status(404).send('Laboratório inexistente');
            return;
        }

        res.status(400).send('Não foi possível buscar os dados do laboratório. Tente novamente mais tarde.');
        return;
    }

});

//Recupera nomes dos laboratórios de um usuário ou todos os laboratórios caso nenhum nome id seja passado
router.post("/userLabs", async (req: Request, res: Response) => {

    const { user_id } = req.body;

    try {

        const labs = await prisma.laboratorio.findMany({
            where: {
                ... (user_id && {
                    responsavel_id: user_id
                })
            },
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

    const { nome, dia } = req.query;
    let data = new Date(String(dia));
    let data1 = new Date(String(dia));
    data1.setUTCDate(data1.getUTCDate() + 1)

    data.setUTCHours(0, 0, 0, 0);
    data1.setUTCHours(0, 0, 0, 0);

    try {

        const laboratorio = await prisma.laboratorio.findUniqueOrThrow({
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

        const reservasHoje = []
        for (const reservaInfo of laboratorio.reservas) {
            for (const reserva of reservaInfo.dias) {

                let string_aux1 = stringData(reserva.data_inicio, true);
                
                reservasHoje.push({
                    hora_inicio: string_aux1,
                    duracao: reserva.duracao,
                    hora: reserva.data_inicio
                });
                
            }
        }

        
        if (reservasHoje.length === 0) {
            res.status(404).send('Não há reservas no dia');
            return;
        }

        reservasHoje.sort((a, b) => a.hora.getTime() - b.hora.getTime());

        res.status(200).send(reservasHoje);
        return;

    } catch (error: any) {

        if (error.code === 'P2025') {
            res.status(404).send('Laboratório inexistente');
            return;
        }

        res.status(400).send('Desculpe, não foi possível buscar as reservas. Tente novamente mais tarde');
        return;

    }

});


export default router;