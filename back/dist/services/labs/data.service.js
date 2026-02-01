import { prisma } from '../../utils/prisma.js';
import { nomeSchema } from '../../utils/validation/default.schema.js';
export async function labData(req, res) {
    const parse = nomeSchema.safeParse(req.query);
    if (!parse.success) {
        return res.status(422).json({
            success: false,
            message: parse.error.issues[0].message
        });
    }
    const { nome } = parse.data;
    try {
        const lab = await prisma.laboratorio.findUnique({
            where: {
                nome: String(nome)
            },
            include: {
                responsavel: true
            }
        });
        if (!lab) {
            return res.status(404).json({
                success: false,
                message: "Laboratório inexistente."
            });
        }
        return res.status(200).json({
            success: true,
            data: {
                nome: lab.nome,
                responsavelNome: lab.responsavel.nome,
                responsavelCpf: lab.responsavel.cpf,
                capacidade: lab.capacidade,
                projetores: lab.projetor ? lab.projetor : 'Não possui',
                quadros: lab.quadro ? lab.quadro : 'Não possui',
                televisoes: lab.televisao ? lab.televisao : 'Não possui',
                ar_condicionados: lab.ar_condicionado ? lab.ar_condicionado : 'Não possui',
                computadores: lab.computador ? lab.computador : 'Não possui',
                outro: lab.outro ? lab.outro : ''
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Não foi possível buscar os dados do laboratório. Tente novamente mais tarde."
        });
    }
}
//# sourceMappingURL=data.service.js.map