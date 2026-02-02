import { z } from "zod";
import { extendZodWithOpenApi } from "@asteasolutions/zod-to-openapi";
extendZodWithOpenApi(z);
export const idSchema = z.object({
    id: z.uuidv4("Id deve ser informado")
});
export const nomeSchema = z.object({
    nome: z.string({ error: "Nome deve ser informado" }).min(1, "Nome deve ser informado")
});
export const cpfSchema = z.object({
    cpf: z.string({ error: "CPF deve ser informado" }).length(14, "CPF deve ter 11 caracteres")
});
export const defaultResponse = z.object({
    success: z.boolean()
});
export const ErrorResponseSchema = z.object({
    success: z.literal(false),
    message: z.string().optional(),
}).openapi("ErrorResponse");
export const MessageResponseSchema = defaultResponse
    .extend({
    message: z.string().optional(),
});
//# sourceMappingURL=default.schema.js.map