import { z } from "zod";

export const idSchema = z.object({
    id: z.string({required_error: "Id deve ser informado", invalid_type_error: "Id deve ser uma string"}).uuid("Id deve ser um uuid")
})

export const nomeSchema = z.object({
    nome: z.string({required_error: "Nome deve ser informado", invalid_type_error: "Nome deve ser uma string"}).min(1, "Nome deve ser informado")
});

export const cpfSchema = z.object({
    cpf: z.string({required_error: "CPF deve ser informado", invalid_type_error: "CPF deve ser uma string"}).length(14, "CPF deve ter 11 caracteres")
});