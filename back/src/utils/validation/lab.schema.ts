import z from "zod";
import { cpfSchema, idSchema, nomeSchema } from "./default.schema.js";

const capacidadeSchema = z.object({
    capacidade: z.coerce.number({error: "Capacidade deve ser informada"})
    .min(0, "Capacidade mínima de um laboratório deve ser 1")
    .int("Capacidade deve ser um número inteiro")
});

const projetorSchema = z.object({
    projetor: z.coerce.number({error: "Número de projetores deve ser informado"}).int("Número de projetores deve ser um número inteiro").default(0)
});

const quadroSchema = z.object({
    quadro: z.coerce.number({error: "Número de quadros deve ser informado"}).int("Número de quadros deve ser um número inteiro").default(0)
});

const televisaoSchema = z.object({
    televisao: z.coerce.number({error: "Número de televisões deve ser informado"}).int("Número de televisões deve ser um número inteiro").default(0)
});

const ar_condicionadoSchema = z.object({
    ar_condicionado: z.coerce.number({error: "Número de ar condicionados deve ser informado"}).int("Número de ar condicionados deve ser um número inteiro").default(0)
});

const computadorSchema = z.object({
    computador: z.coerce.number({error: "Número de computadores deve ser informado"}).int("Número de computadores deve ser um número inteiro").default(0)
});

const outroSchema = z.object({
    outro: z.string({error: "Informações adicionais inválidas"}).optional()
});

//----------------- Labs Schemas ----------------- //

//Utilizar responsavel_cpf caso seja administrador que esteja criado laboratório, responsavel_id caso contrário
export const LabCreate = nomeSchema
    .extend(capacidadeSchema)
    .extend(projetorSchema)
    .extend(quadroSchema)
    .extend(televisaoSchema)
    .extend(ar_condicionadoSchema)
    .extend(computadorSchema)
    .extend(outroSchema)
    .extend(z.object({
            responsavel_cpf: cpfSchema.shape.cpf.optional(),
            responsavel_id: idSchema.shape.id.optional()
        })
    );

//novoResponsavel é o cpf do usuário que será responsável pelo laboratório (opcional)
export const LabUpdateSchema = nomeSchema
    .extend(capacidadeSchema)
    .extend(projetorSchema)
    .extend(quadroSchema)
    .extend(televisaoSchema)
    .extend(ar_condicionadoSchema)
    .extend(computadorSchema)
    .extend(outroSchema)
    .extend(z.object({
        novo_responsavel: cpfSchema.shape.cpf.optional()
    }));

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

export const LabNames = z.object({
    user_id: idSchema.shape.id.optional()
});

export const LabReserves = nomeSchema
    .extend(z.object({
        dia: z.string({error: "Data deve ser informada"}).refine(val => !isNaN(Date.parse(val)), {
            error: "Data inválida"
        })
    }));