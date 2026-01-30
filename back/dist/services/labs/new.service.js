import { prisma } from '../../utils/prisma.js';
import { LabCreate } from '../../utils/validation/lab.schema.js';
export async function newLab(req, res) {
    const parse = LabCreate.safeParse(req.body);
    if (!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
        });
    }
    const tokenData = req.userData;
    if (tokenData.tipo !== "Administrador" && tokenData.tipo !== "Responsável") {
        return res.status(403).send("Função não permitida");
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
                return res.status(404).send("Usuário informado não encontrado.");
            }
            responsavel_id = user.id;
        }
        if (!responsavel_id) {
            return res.status(400).send("Id ou cpf do responsável pelo laboratório deve ser informado.");
        }
        const nomeEmUso = await prisma.laboratorio.count({ where: { nome } });
        if (nomeEmUso) {
            return res.status(409).send("Nome de laboratório já cadastrado.");
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
        return res.status(201).send('Laboratório criado');
    }
    catch (error) {
        return res.status(500).send('Desculpe, não foi possível criar o laboratório. Tente novamente mais tarde');
    }
}
//# sourceMappingURL=new.service.js.map