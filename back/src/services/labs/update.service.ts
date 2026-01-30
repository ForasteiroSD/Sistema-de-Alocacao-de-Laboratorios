import { Request, Response } from 'express';
import { prisma } from 'src/utils/prisma.js';
import { LabUpdateSchema } from 'src/utils/validation/lab.schema.js';

export async function updateLab(req: Request, res: Response) {
    const parse = LabUpdateSchema.safeParse(req.body);

    if(!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
        })
    }

    const tokenData = (req as any).userData;
    if(tokenData.tipo !== "Administrador" && tokenData.tipo !== "Responsável") {
        return res.status(403).send("Função não permitida");
    }

    const { nome, capacidade, projetor, quadro, televisao, ar_condicionado, computador, outro, novo_responsavel } = parse.data;
    
    try {
        const laboratorioExiste = await prisma.laboratorio.count({ where: { nome } });

        if (!laboratorioExiste) {
            return res.status(404).send("Laboratório informado não encontrado.");
        }

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
                return res.status(403).send("Você não tem permissão para atualizar esse laboratório.");
            }
        }
        

        await prisma.$transaction(async (tx: typeof prisma) => {
            if (novo_responsavel) {
                await tx.user.findFirstOrThrow({ where: { cpf: novo_responsavel, tipo: 'Responsável' } });

                await tx.user.update({
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

            await tx.laboratorio.update({
                where: {
                    nome: nome
                },
                data: {
                    capacidade: capacidade,
                    projetor: projetor,
                    quadro: quadro,
                    televisao: televisao,
                    ar_condicionado: ar_condicionado,
                    computador: computador,
                    outro: outro
                }
            });

        });

        return res.status(200).send('Laboratório atualizado.');

    } catch (error: any) {

        if (error.code === 'P2025') {
            return res.status(404).send('Novo responsável não encontrado.');
        }

        res.status(500).send('Desculpe, não foi possível atualizar o laboratório. Tente novamente mais tarde.');
        return;
    }
}