import { comparePasswords, createAuthCookie, generateJWTToken, hashPassword } from '../../utils/auth.js';
import { prisma } from '../../utils/prisma.js';
import { UserLoginSchema } from "../../utils/validation/user.schema.js";
export async function userLogin(req, res) {
    const parse = UserLoginSchema.safeParse(req.body);
    if (!parse.success) {
        return res.status(422).json({
            success: false,
            message: parse.error.issues[0].message
        });
    }
    const { email, senha } = parse.data;
    try {
        const user = await prisma.user.findUnique({
            where: {
                email: email,
            },
            select: {
                id: true,
                nome: true,
                tipo: true,
                senha: true
            }
        });
        if (!user) {
            const count = await prisma.user.count();
            if (count === 0) {
                const user = await prisma.user.create({
                    data: {
                        email: email,
                        cpf: 'Master',
                        nome: 'Master',
                        senha: await hashPassword(senha),
                        data_nasc: new Date('2000-01-01'),
                        telefone: '(00) 00000-0000',
                        tipo: 'Administrador'
                    }
                });
                const jwtToken = generateJWTToken({ id: user.id, tipo: user.tipo });
                createAuthCookie(res, jwtToken);
                return res.status(201).json({
                    success: true,
                    data: {
                        id: user.id,
                        nome: user.nome,
                        tipo: user.tipo,
                        first: true
                    }
                });
            }
        }
        if (!user || !(await comparePasswords(senha, user.senha))) {
            return res.status(401).json({
                success: false,
                message: "Email ou senha incorretos."
            });
        }
        const jwtToken = generateJWTToken({ id: user.id, tipo: user.tipo });
        createAuthCookie(res, jwtToken);
        return res.status(200).json({
            success: true,
            data: {
                id: user.id,
                nome: user.nome,
                tipo: user.tipo
            }
        });
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Desculpe, não foi possível realizar o login. Tente novamente mais tarde."
        });
    }
}
//# sourceMappingURL=login.service.js.map