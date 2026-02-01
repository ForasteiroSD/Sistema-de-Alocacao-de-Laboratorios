import { Request, Response } from 'express';
import { prisma } from 'src/utils/prisma.js';
import { LabCreate } from 'src/utils/validation/lab.schema.js';

export async function newLab(req: Request, res: Response) {
    const parse = LabCreate.safeParse(req.body);

    if(!parse.success) {
        return res.status(422).json({
            success: false,
            message: parse.error.issues[0].message
        })
    }

    const tokenData = (req as any).userData;
    if(tokenData.tipo !== "Administrador" && tokenData.tipo !== "Responsável") {
        return res.status(403).json({
            success: false,
            message: "Função não permitida."
        });
    }

    const { ar_condicionado, capacidade, computador, nome, projetor, quadro, televisao, outro, responsavel_cpf } = parse.data;
    let { responsavel_id } = parse.data;

    try {
        if (responsavel_cpf) {
            const user = await prisma.user.findUnique({
                where: {
                    cpf: responsavel_cpf,
                    tipo: 'Responsável'
                },
                select: {
                    id: true
                }
            });
            
            if (!user) {
                return res.status(404).json({
                    success: false,
                    message: "Usuário informado não encontrado."
                });
            }
            
            responsavel_id = user.id;
        }

        if(!responsavel_id) {
            return res.status(400).json({
                success: false,
                message: "Id ou cpf do responsável pelo laboratório deve ser informado."
            });
        }

        const nomeEmUso = await prisma.laboratorio.count({ where: { nome } });

        if (nomeEmUso) {
            return res.status(409).json({
                success: false,
                message: "Nome de laboratório já cadastrado."
            });
        }

        await prisma.laboratorio.create({
            data: {
                nome: nome,
                capacidade: capacidade,
                projetor: projetor,
                quadro: quadro,
                televisao: televisao,
                ar_condicionado: ar_condicionado,
                computador: computador,
                outro: outro,
                responsavel_id: responsavel_id
            }
        });

        return res.status(201).json({
            success: true,
            message: "Laboratório criado."
        });

    } catch (error: any) {
        return res.status(500).json({
            success: false,
            message: "Desculpe, não foi possível criar o laboratório. Tente novamente mais tarde"
        });
    }
}