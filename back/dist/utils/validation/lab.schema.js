import z from "zod";
import { cpfSchema, defaultResponse, idSchema, nomeSchema } from "./default.schema.js";
const capacidadeSchema = z.object({
    capacidade: z.coerce.number({ error: "Capacidade deve ser informada" })
        .min(0, "Capacidade mínima de um laboratório deve ser 1")
        .int("Capacidade deve ser um número inteiro")
});
const projetorSchema = z.object({
    projetor: z.coerce.number({ error: "Número de projetores deve ser informado" }).int("Número de projetores deve ser um número inteiro").default(0)
});
const quadroSchema = z.object({
    quadro: z.coerce.number({ error: "Número de quadros deve ser informado" }).int("Número de quadros deve ser um número inteiro").default(0)
});
const televisaoSchema = z.object({
    televisao: z.coerce.number({ error: "Número de televisões deve ser informado" }).int("Número de televisões deve ser um número inteiro").default(0)
});
const ar_condicionadoSchema = z.object({
    ar_condicionado: z.coerce.number({ error: "Número de ar condicionados deve ser informado" }).int("Número de ar condicionados deve ser um número inteiro").default(0)
});
const computadorSchema = z.object({
    computador: z.coerce.number({ error: "Número de computadores deve ser informado" }).int("Número de computadores deve ser um número inteiro").default(0)
});
const outroSchema = z.object({
    outro: z.string({ error: "Informações adicionais inválidas" }).optional()
});
//----------------- Labs Schemas ----------------- //
//Utilizar responsavel_cpf caso seja administrador que esteja criado laboratório, responsavel_id caso contrário
export const LabCreate = nomeSchema
    .extend(capacidadeSchema.shape)
    .extend(projetorSchema.shape)
    .extend(quadroSchema.shape)
    .extend(televisaoSchema.shape)
    .extend(ar_condicionadoSchema.shape)
    .extend(computadorSchema.shape)
    .extend(outroSchema.shape)
    .extend({
    responsavel_cpf: cpfSchema.shape.cpf.optional(),
    responsavel_id: idSchema.shape.id.optional()
});
//novoResponsavel é o cpf do usuário que será responsável pelo laboratório (opcional)
export const LabUpdateSchema = nomeSchema
    .extend(capacidadeSchema.shape)
    .extend(projetorSchema.shape)
    .extend(quadroSchema.shape)
    .extend(televisaoSchema.shape)
    .extend(ar_condicionadoSchema.shape)
    .extend(computadorSchema.shape)
    .extend(outroSchema.shape)
    .extend({
    novo_responsavel: cpfSchema.shape.cpf.optional()
});
export const LabsGet = z.object({
    nome: z.string().optional(),
    responsavel: z.string().optional(),
    capacidade_minima: z.string()
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .transform(val => val === undefined ? undefined : Number(val))
        .refine(val => val === undefined || (!isNaN(val) && Number.isInteger(val) && val >= 0), {
        error: "Capacidade mínima de um laboratório deve ser um número inteiro maior ou igual a 1"
    })
});
export const LabsGetResponse = defaultResponse
    .extend({
    data: z.array(z.object({
        nome: z.string(),
        responsavel: z.string(),
        capacidade: z.number()
    }))
});
export const LabDataResponse = defaultResponse
    .extend({
    data: z.object({
        nome: z.string(),
        responsavelNome: z.string(),
        responsavelCpf: z.string(),
        capacidade: z.number().or(z.string()),
        projetores: z.number().or(z.string()),
        quadros: z.number().or(z.string()),
        televisoes: z.number().or(z.string()),
        ar_condicionados: z.number().or(z.string()),
        computadores: z.number().or(z.string()),
        outro: z.string()
    })
});
export const LabNames = z.object({
    user_id: idSchema.shape.id.optional()
});
export const LabsNamesResponse = defaultResponse
    .extend({
    data: z.array(z.object({
        nome: z.string()
    }))
});
export const LabReserves = nomeSchema
    .extend({
    dia: z.string({ error: "Data deve ser informada" }).refine(val => !isNaN(Date.parse(val)), {
        error: "Data inválida"
    })
});
export const LabReservesResponse = defaultResponse
    .extend({
    data: z.array(z.object({
        hora_inicio: z.string(),
        duracao: z.string(),
        hora: z.date()
    }))
});
//# sourceMappingURL=lab.schema.js.map