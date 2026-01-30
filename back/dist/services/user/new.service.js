import { hashPassword } from '../../utils/auth.js';
import { prisma } from '../../utils/prisma.js';
import { UserCreateSchema } from '../../utils/validation/user.schema.js';
export async function newUser(req, res) {
    const parse = UserCreateSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(422).json({
            message: "Dados inválidos",
            errors: parse.error.issues[0].message
        });
    }
    //Dados do usuário a ser criado
    const { nome, cpf, data_nasc, telefone, email, senha, tipo } = parse.data;
    const date = new Date(data_nasc);
    try {
        await prisma.user.create({
            data: {
                email: email,
                cpf: cpf,
                nome: nome,
                senha: await hashPassword(senha),
                data_nasc: date,
                telefone: telefone,
                tipo: tipo
            }
        });
        return res.status(201).send('Usuário cadastrado');
    }
    catch (error) {
        if (error.code === 'P2002' && error.meta.target[0] === 'cpf')
            return res.status(409).send('CPF já cadastrado');
        else if (error.code === 'P2002' && error.meta.target[0] === 'email')
            return res.status(409).send('Email já cadastrado');
        res.status(400).send('Desculpe, não foi possível cadastrar o usuário. Tente novamente mais tarde');
        return;
    }
}
//# sourceMappingURL=new.service.js.map