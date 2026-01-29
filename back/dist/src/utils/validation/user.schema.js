import z from "zod";
import { cpfSchema, idSchema, nomeSchema } from "./default.schema.js";
const dataNascSchema = z.object({
    data_nasc: z.string({ required_error: "Data de nascimento deve ser informada", invalid_type_error: "Data de nascimento deve ser uma string" }).refine(val => !isNaN(Date.parse(val)), {
        message: "Data de nascimento inválida"
    })
});
const telefoneSchema = z.object({
    telefone: z.string({ required_error: "Telefone deve ser informado", invalid_type_error: "Telefone deve ser uma string" }).min(8, "Telefone deve ter pelo menos 8 caracteres")
});
const emailSchema = z.object({
    email: z.string({ required_error: "Email deve ser informado", invalid_type_error: "Email deve ser uma string" }).email({ message: "Email inválido" })
});
const senhaSchema = z.object({
    senha: z.string({ required_error: "Senha deve ser informada", invalid_type_error: "Senha deve ser uma string" }).min(8, "Senha deve ter pelo menos caracteres")
});
const tipoSchema = z.object({
    tipo: z.enum(["Administrador", "Responsável", "Usuário"], { message: "Tipo de usuário inválido. Deve ser Administrador, Responsável ou Usuário" })
});
//----------------- User Schemas ----------------- //
export const UserCreateSchema = nomeSchema
    .merge(cpfSchema)
    .merge(dataNascSchema)
    .merge(telefoneSchema)
    .merge(emailSchema)
    .merge(senhaSchema)
    .merge(tipoSchema);
export const UserLoginSchema = emailSchema
    .merge(senhaSchema);
//adm = true não precisa informar senha
//mudarSenha indica se vai mudar a senha ou não
export const UserUpdateSchema = idSchema
    .merge(nomeSchema)
    .merge(telefoneSchema)
    .merge(emailSchema)
    .merge(z.object({
    novasenha: z.string({ required_error: "Nova senha deve ser informada", invalid_type_error: "Nova senha deve ser uma string" }).min(8, "Nova senha deve ter pelo menos 8 caracteres").optional(),
    tipo: tipoSchema.shape.tipo.optional(),
    senha: senhaSchema.shape.senha.optional(),
    adm: z.number({ invalid_type_error: "adm deve ser 0 ou 1" }).min(0, "adm deve ser 0 ou 1").max(1, "adm deve ser 0 ou 1").default(0), //defaults to false
    mudarSenha: z.number({ invalid_type_error: "mudanSenha deve ser 0 ou 1" }).min(0, "mudanSenha deve ser 0 ou 1").max(1, "mudanSenha deve ser 0 ou 1").default(0), //defaults to false
    changeType: z.number({ invalid_type_error: "changeType deve ser 0 ou 1" }).min(0, "changeType deve ser 0 ou 1").max(1, "changeType deve ser 0 ou 1").default(0) //defaults to false
}));
export const UserUpdateFirst = idSchema
    .merge(cpfSchema)
    .merge(cpfSchema)
    .merge(dataNascSchema)
    .merge(emailSchema)
    .merge(nomeSchema)
    .merge(senhaSchema)
    .merge(telefoneSchema);
export const UserDelete = idSchema
    .merge(z.object({
    senha: senhaSchema.shape.senha.optional(),
    minhaConta: z.coerce.number({ invalid_type_error: "minhaConta deve ser 0 ou 1" }).min(0, "minhaConta deve ser 0 ou 1").max(1, "minhaConta deve ser 0 ou 1").default(1) //defaults to true
}));
export const UsersGet = z.object({
    nome: z.string().optional(),
    cpf: z.string().optional(),
    email: z.string().optional(),
    tipo: z.string().optional()
});
export const UserRespGet = z.object({
    cpf: z.coerce.number({ invalid_type_error: "cpf deve ser 0 ou 1" }).min(0, "cpf deve ser 0 ou 1").max(1, "cpf deve ser 0 ou 1").default(0) //defaults to false
});
export const UserData = idSchema
    .merge(z.object({
    saveContext: z.number({ invalid_type_error: "saveContext deve ser 0 ou 1" }).min(0, "saveContext deve ser 0 ou 1").max(1, "saveContext deve ser 0 ou 1").default(0) //defaults to false
}));
//# sourceMappingURL=user.schema.js.map