import z from "zod";
import { defaultResponse, idSchema, nomeSchema } from "./default.schema.js";

const reserveTypeSchema = z.object({
    tipo: z.enum(["Única", "Semanal", "Personalizada", "Diária"], {message: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária"})
});

const initialDateSchema = z.object({
    data_inicio: z.string({error: "Data inicial deve ser informada"}).refine(val => !isNaN(Date.parse(val)), {
        message: "Data de início inválida"
    })
});

const finalDateSchema = z.object({
    data_fim: z.string({error: "Data final deve ser informada"}).refine(val => !isNaN(Date.parse(val)), {
        message: "Data final inválida"
    })
});

const labNameSchema = z.object({
    labName: z.string({error: "Nome do laboratório deve ser informado"}).min(1, "Nome do laboratório deve ser informado")
});

const horaInicioSchema = z.object({
    hora_inicio: z.string({error: "Hora de início deve ser informada"}).min(4, "Horário deve ter pelo menos quatro caracteres").max(5, {
        message: "Horário deve ter no máximo cinco caracteres"
    }).refine((val) => {
        const valSplit = val.split(":");
        if(valSplit.length !== 2) return false;

        if(valSplit[0].length > 2 || valSplit[1].length !== 2) return false;
        
        let hour, minutes;
        try {
            hour = Number(valSplit[0]);
            minutes = Number(valSplit[1]);
        } catch (error) {
            return false;
        }

        if(isNaN(hour) || isNaN(minutes)) return false;

        if(minutes % 5 !== 0) return false;

        if(hour < 0 || hour > 23) return false;

        return true;
    }, {
        message: "Horário inválido"
    })
});

const duracaoSchema = z.object({
    duracao: z.string({error: "Duração deve ser informada"}).min(4, "Duração deve ter pelo menos quatro caracteres").max(5, {
        message: "Duração deve ter no máximo cinco caracteres"
    }).refine((val) => {
        let valSplit = val.split(":");
        if(valSplit.length !== 2) return false;

        if(valSplit[0].length > 2 || valSplit[1].length !== 2) return false;
        
        let hour, minutes;
        try {
            hour = Number(valSplit[0]);
            minutes = Number(valSplit[1]);
        } catch (error) {
            return false;
        }

        if(isNaN(hour) || isNaN(minutes)) return false;

        if(minutes < 0 || minutes % 5 !== 0) return false;

        if(hour < 0 || hour > 23) return false;

        if(hour === 0 && minutes < 30) return false;

        return true;
    }, {
        message: "Duração inválida"
    })
});

//----------------- Reserves Schemas ----------------- //

const WeeklyReserve = horaInicioSchema
    .extend(duracaoSchema.shape)
    .extend({
            dia_semana: z.enum(["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"], {error: "Dia da semana deve ser informado"}),
        });

export const WeeklyReserves = initialDateSchema
    .extend(finalDateSchema.shape)
    .extend({
        horarios: z.array(WeeklyReserve).min(1, "Pelo menos uma reserva deve ser feita")
    });

const PersonalizedReserve = horaInicioSchema
    .extend(duracaoSchema.shape)
    .extend({
        data: z.string({error: "Data deve ser informada"}).refine(val => !isNaN(Date.parse(val)), {
            message: "Data inválida"
        }),
    });

export const PersonalizedReserves = z.object({
    horarios: z.array(PersonalizedReserve).min(1, "Pelo menos uma reserva deve ser feita")
});

export const UniqueReserve = initialDateSchema.extend(horaInicioSchema.shape).extend(duracaoSchema.shape);

export const DailyReserve = initialDateSchema.extend(finalDateSchema.shape).extend(horaInicioSchema.shape).extend(duracaoSchema.shape);

export const ReserveInsert = reserveTypeSchema
    .extend(labNameSchema.shape)
    .extend({
        userId: idSchema.shape.id,
        userName: nomeSchema.shape.nome,
    });

export const ReservesRespLab = z.object({
    resp_id: idSchema.shape.id,
    userName: z.string().optional(),
    labName: z.string().optional(),
    data_inicio: z
        .string({error: "Data de início deve ser uma string"})
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
            message: "Data de início inválida"
        }),
    data_fim: z
        .string({error: "Data final deve ser uma string"})
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
            message: "Data final inválida"
        }),
    tipo: z.enum(["Única", "Semanal", "Personalizada", "Diária", ""], {
            error: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária"
        }).optional()
});

export const ReservesRespLabResponse = defaultResponse
    .extend({
        data: z.array(
            z.object({
                id: z.string(),
                responsavel: z.string(),
                lab: z.string(),
                data_inicio: z.string(),
                data_fim: z.string(),
                tipo: z.string()
            })
        )
    });

export const ReservesUser = z.object({
    userId: idSchema.shape.id,
    labName: z.string().optional(),
    data_inicio: z
        .string({error: "Data de início deve ser uma string"})
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
            message: "Data de início inválida"
        }),
    data_fim: z
        .string({error: "Data final deve ser uma string"})
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
            message: "Data final inválida"
        }),
    tipo: z.enum(["Única", "Semanal", "Personalizada", "Diária", ""], {
            error: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária",
        }).optional()
});

export const ReservesUserResponse = defaultResponse
    .extend({
        data: z.array(
            z.object({
                id: z.string(),
                lab: z.string(),
                data_inicio: z.string(),
                data_fim: z.string(),
                tipo: z.string()
            })
        )
    });

export const Reserves = z.object({
    userName: z.string().optional(),
    labName: z.string().optional(),
    data_inicio: z
        .string({error: "Data de início deve ser uma string"})
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
            message: "Data de início inválida"
        }),
    data_fim: z
        .string({error: "Data final deve ser uma string"})
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
            message: "Data final inválida"
        }),
    tipo: z.enum(["Única", "Semanal", "Personalizada", "Diária", ""], {
            error: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária",
        }).optional()
});

export const ReservesResponse = defaultResponse
    .extend({
        data: z.array(
            z.object({
                id: z.string(),
                responsavel: z.string(),
                lab: z.string(),
                data_inicio: z.string(),
                data_fim: z.string(),
                tipo: z.string()
            })
        )
    })

export const ReserveDataResponse = defaultResponse
    .extend({
        data: z.object({
            usuario: z.string(),
            laboratorio: z.string(),
            tipo: z.string(),
            data_inicio: z.string(),
            data_fim: z.string(),
            hora_inicio: z.string(),
            duracao: z.string()
        }).or(
            z.object({
                usuario: z.string(),
                laboratorio: z.string(),
                tipo: z.string(),
                data_inicio: z.string(),
                data_fim: z.string(),
                dias_semana: z.array(
                    z.object({
                        dia: z.string(),
                        hora_inicio: z.string(),
                        duracao: z.string()
                    })
                )
            })
        ).or(
            z.object({
                usuario: z.string(),
                laboratorio: z.string(),
                tipo: z.string(),
                data_inicio: z.string(),
                data_fim: z.string(),
                horarios: z.array(
                    z.object({
                        data: z.string(),
                        hora_inicio: z.string(),
                        duracao: z.string(),
                    })
                )
            })
        )
    });

export const ReserveRemove = idSchema
    .extend({
        motivo: z.string({error: "Motivo deve ser informado"}).min(1, "Motivo de remoção da reserva deve ser informado").optional()
    });