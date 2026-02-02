import { z } from "zod";

export const idSchema = z.object({
    id: z.uuidv4("Id deve ser informado")
})

export const nomeSchema = z.object({
    nome: z.string({error: "Nome deve ser informado"}).min(1, "Nome deve ser informado")
});

export const cpfSchema = z.object({
    cpf: z.string({error: "CPF deve ser informado"}).length(14, "CPF deve ter 11 caracteres")
});