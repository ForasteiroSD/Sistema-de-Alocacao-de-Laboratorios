import { Request, Response, Router } from 'express';
import { prisma } from '../utils/prisma.js';
import { stringData } from '../utils/formatDate.js';
import { LabCreate, LabNames, LabReserves, LabsGet, LabUpdateSchema } from '../utils/validation/lab.schema.js';
import { nomeSchema } from 'src/utils/validation/default.schema.js';

const router = Router();

//Cadastrar laboratório
router.post("/", async (req: Request, res: Response) => {

    //Dados do laboratório a ser criado
    //Utilizar responsavel_cpf caso seja administrador que esteja criado laboratório, responsavel_id caso contrário
    const parse = LabCreate.safeParse(req.body);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        })
    }

    const tokenData = (req as any).userData;
    if(tokenData.tipo !== "Administrador" && tokenData.tipo !== "Responsável") {
        return res.status(403).send("Função não permitida");
    }

    const { ar_condicionado, capacidade, computador, nome, projetor, quadro, televisao, outro, responsavel_cpf } = parse.data;
    let { responsavel_id } = parse.data;

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

        if(!responsavel_id) {
            return res.status(400).send("Id ou cpf do responsável pelo laboratório deve ser informado");
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

        res.status(201).send('Laboratório criado');
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
router.patch("/", async (req: Request, res: Response) => {

    const parse = LabUpdateSchema.safeParse(req.body);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        })
    }

    const tokenData = (req as any).userData;
    if(tokenData.tipo !== "Administrador" && tokenData.tipo !== "Responsável") {
        return res.status(403).send("Função não permitida");
    }

    const { nome, capacidade, projetor, quadro, televisao, ar_condicionado, computador, outro, novo_responsavel } = parse.data;
    
    try {
        if(tokenData.tipo === "Responsável") {
            const user = await prisma.user.findUnique({
                where: {
                    id: tokenData.id,
                },
                include: {
                    laboratorios: {
                        where: {
                            nome: nome
                        }
                    }
                }
            });

            if(user && !user.laboratorios.length) {
                return res.status(403).send("Você não tem permissão para atualizar esse laboratório");
            }
        }
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

        if (error.code === 'P2025') {
            res.status(404).send('Responsável não encontrado');
            return;
        }

        res.status(400).send('Desculpe, não foi possível atualizar o laboratório. Tente novamente mais tarde');
        return;
    }
});

//Consultar laboratórios
router.get("/all", async (req: Request, res: Response) => {

    const parse = LabsGet.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }

    const { nome, responsavel, capacidade_minima } = parse.data;

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


router.get("/", async (req: Request, res: Response) => {

    const parse = nomeSchema.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errros: parse.error.flatten()
        });
    }

    const { nome } = parse.data;

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

//Recupera nomes dos laboratórios de um usuário ou todos os laboratórios caso nenhum id seja passado
router.post("/user", async (req: Request, res: Response) => {

    const parse = LabNames.safeParse(req.body);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        });
    }

    const { user_id } = parse.data;

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

router.get('/reservasdia', async (req: Request, res: Response) => {

    const parse = LabReserves.safeParse(req.query);

    if(!parse.success) {
        return res.status(422).send({
            message: "Dados inválidos",
            errors: parse.error.flatten()
        })
    }

    const { nome, dia } = parse.data;

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