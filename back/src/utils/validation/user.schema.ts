import z from "zod";
import { cpfSchema, defaultResponse, idSchema, nomeSchema } from "./default.schema.js";

const dataNascSchema = z.object({
    data_nasc: z.string({error: "Data de nascimento deve ser informada"}).refine(val => !isNaN(Date.parse(val)), {
        error: "Data de nascimento inválida"
    })
});

const telefoneSchema = z.object({
    telefone: z.string({error: "Telefone deve ser informado"}).min(8, "Telefone deve ter pelo menos 8 caracteres")
});

const emailSchema = z.object({
    email: z.email({error: "Email deve ser informado"})
});

const senhaSchema = z.object({
    senha: z.string({error: "Senha deve ser informada"}).min(8, "Senha deve ter pelo menos caracteres")
});

const tipoSchema = z.object({
    tipo: z.enum(["Administrador", "Responsável", "Usuário"], {error: "Tipo de usuário inválido. Deve ser Administrador, Responsável ou Usuário"})
});

//----------------- User Schemas ----------------- //

export const UserCreateSchema = nomeSchema
    .extend(cpfSchema.shape)
    .extend(dataNascSchema.shape)
    .extend(telefoneSchema.shape)
    .extend(emailSchema.shape)
    .extend(senhaSchema.shape)
    .extend(tipoSchema.shape);

export const UserLoginSchema = emailSchema
    .extend(senhaSchema.shape);

export const UserLoginResponse = defaultResponse
    .extend({
        data: z.object({
            id: z.uuidv4(),
            nome: z.string(),
            tipo: z.string(),
        })
    });

export const UserCreatedLoginResponse = defaultResponse
    .extend({
        data: z.object({
            id: z.uuidv4(),
            nome: z.string(),
            tipo: z.string(),
            first: z.boolean()
        })
    });

//adm = true não precisa informar senha
//mudarSenha indica se vai mudar a senha ou não
export const UserUpdateSchema = idSchema
    .extend(nomeSchema.shape)
    .extend(telefoneSchema.shape)
    .extend(emailSchema.shape)
    .extend({
        novasenha: z.string({error: "Nova senha deve ser informada"}).min(8, "Nova senha deve ter pelo menos 8 caracteres").optional(),
        tipo: tipoSchema.shape.tipo.optional(),
        senha: senhaSchema.shape.senha.optional(),
        adm: z.number({error: "Valor inválido"}).min(0, "Valor inválido").max(1, "Valor inválido").default(0), //defaults to false
        mudarSenha: z.number({error: "Valor inválido"}).min(0, "Valor inválido").max(1, "Valor inválido").default(0), //defaults to false
        changeType: z.number({error: "Valor inválido"}).min(0, "Valor inválido").max(1, "Valor inválido").default(0) //defaults to false
    });

export const UserUpdateResponse = defaultResponse
    .extend({
        nome: z.string()
    });

export const UserUpdateFirst = idSchema
    .extend(cpfSchema.shape)
    .extend(cpfSchema.shape)
    .extend(dataNascSchema.shape)
    .extend(emailSchema.shape)
    .extend(nomeSchema.shape)
    .extend(senhaSchema.shape)
    .extend(telefoneSchema.shape);

export const UserDelete = idSchema
    .extend({
        senha: senhaSchema.shape.senha.optional(),
        minhaConta: z.coerce.number({error: "Valor inválido"}).min(0, "Valor inválido").max(1, "Valor inválido").default(1) //defaults to true
    });

export const UserRespGet = z.object({
    cpf: z.coerce.number({error: "Valor inválido"}).min(0, "Valor inválido").max(1, "Valor inválido").default(0) //defaults to false
});

export const UserRespGetResponse = defaultResponse
    .extend({
        data: z.array(
            z.object({
                nome: z.string(),
                cpf: z.string()
            })
        )
    });

export const UserData = idSchema
    .extend({
        saveContext: z.coerce.number({error: "Valor inválido"}).min(0, "Valor inválido").max(1, "Valor inválido").default(0) //defaults to false
    });

export const UserDataResponse = defaultResponse
    .extend({
        data: z.object({
            nome: z.string(),
            telefone: z.string(),
            email: z.string(),
            tipo: z.string(),
            cpf:  z.string(),
            data_nasc: z.date()
        })
    });

export const UserMainPageInfoResponse = defaultResponse
    .extend({
        mainInfo: z.array(
            z.object({
                name: z.string(),
                value: z.number()
            })
        ),
        nextReserves: z.array(
            z.object({
                name: z.string(),
                date: z.string(),
                begin: z.string(),
                duration: z.string(),
                dataTotal: z.number()
            })
        )
    });

export const UsersGet = z.object({
    nome: z.string().optional(),
    cpf: z.string().optional(),
    email: z.string().optional(),
    tipo: z.string().optional()
});

export const UsersGetResponse = defaultResponse
    .extend({
        data: z.array(
            z.object({
                id: z.string(),
                cpf: z.string(),
                email: z.string(),
                nome: z.string(),
                tipo: z.string()
            })
        )
    });