import z from "zod";
import { cpfSchema, idSchema, nomeSchema } from "./default.schema.js";

const capacidadeSchema = z.object({
    capacidade: z.coerce.number({required_error: "Capacidade deve ser fornecida", invalid_type_error: "Capacidade deve ser um número"})
    .min(0, "Capacidade mínima de um laboratório deve ser 1")
    .int("Capacidade deve ser um número inteiro")
});

const projetorSchema = z.object({
    projetor: z.coerce.number({invalid_type_error: "Projetor deve ser um número"}).int("Projetor deve ser um número inteiro").default(0)
});

const quadroSchema = z.object({
    quadro: z.coerce.number({invalid_type_error: "Quadro deve ser um número"}).int("Quadro deve ser um número inteiro").default(0)
});

const televisaoSchema = z.object({
    televisao: z.coerce.number({invalid_type_error: "Televisao deve ser um número"}).int("Televisao deve ser um número inteiro").default(0)
});

const ar_condicionadoSchema = z.object({
    ar_condicionado: z.coerce.number({invalid_type_error: "Ar condicionado deve ser um número"}).int("Ar condicionado deve ser um número inteiro").default(0)
});

const computadorSchema = z.object({
    computador: z.coerce.number({invalid_type_error: "Computador deve ser um número"}).int("Computador deve ser um número inteiro").default(0)
});

const outroSchema = z.object({
    outro: z.string({invalid_type_error: "Outro deve ser uma string"}).optional()
});

//----------------- Labs Schemas ----------------- //

//Utilizar responsavel_cpf caso seja administrador que esteja criado laboratório, responsavel_id caso contrário
export const LabCreate = nomeSchema
    .merge(capacidadeSchema)
    .merge(projetorSchema)
    .merge(quadroSchema)
    .merge(televisaoSchema)
    .merge(ar_condicionadoSchema)
    .merge(computadorSchema)
    .merge(outroSchema)
    .merge(z.object({
            responsavel_cpf: cpfSchema.shape.cpf.optional(),
            responsavel_id: idSchema.shape.id.optional()
        })
    );

//novoResponsavel é o cpf do usuário que será responsável pelo laboratório (opcional)
export const LabUpdateSchema = nomeSchema
    .merge(capacidadeSchema)
    .merge(projetorSchema)
    .merge(quadroSchema)
    .merge(televisaoSchema)
    .merge(ar_condicionadoSchema)
    .merge(computadorSchema)
    .merge(outroSchema)
    .merge(z.object({
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
            message: "Capacidade mínima de um laboratório deve ser um número inteiro maior ou igual a 1"
        })
});

export const LabNames = z.object({
    user_id: idSchema.shape.id.optional()
});

export const LabReserves = nomeSchema
    .merge(z.object({
        dia: z.string({required_error: "Data deve ser informada", invalid_type_error: "Data deve ser uma string"}).refine(val => !isNaN(Date.parse(val)), {
            message: "Data inválida"
        })
    }));