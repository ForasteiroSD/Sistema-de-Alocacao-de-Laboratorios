"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReserveRemove = exports.Reserves = exports.ReservesUser = exports.ReservesRespLab = exports.ReserveInsert = exports.DailyReserve = exports.UniqueReserve = exports.PersonalizedReserves = exports.WeeklyReserves = exports.LabReserves = exports.LabNames = exports.LabsGet = exports.LabUpdateSchema = exports.LabCreate = exports.UserData = exports.UserRespGet = exports.UsersGet = exports.UserDelete = exports.UserUpdateFirst = exports.UserUpdateSchema = exports.UserLoginSchema = exports.UserCreateSchema = exports.idSchema = exports.nomeSchema = void 0;
const zod_1 = require("zod");
//base schemas
exports.nomeSchema = zod_1.z.object({
    nome: zod_1.z.string({ required_error: "Nome deve ser informado", invalid_type_error: "Nome deve ser uma string" }).min(1, "Nome deve ser informado")
});
exports.idSchema = zod_1.z.object({
    id: zod_1.z.string({ required_error: "Id deve ser informado", invalid_type_error: "Id deve ser uma string" }).uuid("Id deve ser um uuid")
});
const cpfSchema = zod_1.z.object({
    cpf: zod_1.z.string({ required_error: "CPF deve ser informado", invalid_type_error: "CPF deve ser uma string" }).length(14, "CPF deve ter 11 caracteres")
});
const dataNascSchema = zod_1.z.object({
    data_nasc: zod_1.z.string({ required_error: "Data de nascimento deve ser informada", invalid_type_error: "Data de nascimento deve ser uma string" }).refine(val => !isNaN(Date.parse(val)), {
        message: "Data de nascimento inválida"
    })
});
const telefoneSchema = zod_1.z.object({
    telefone: zod_1.z.string({ required_error: "Telefone deve ser informado", invalid_type_error: "Telefone deve ser uma string" }).min(8, "Telefone deve ter pelo menos 8 caracteres")
});
const emailSchema = zod_1.z.object({
    email: zod_1.z.string({ required_error: "Email deve ser informado", invalid_type_error: "Email deve ser uma string" }).email({ message: "Email inválido" })
});
const senhaSchema = zod_1.z.object({
    senha: zod_1.z.string({ required_error: "Senha deve ser informada", invalid_type_error: "Senha deve ser uma string" }).min(8, "Senha deve ter pelo menos caracteres")
});
const tipoSchema = zod_1.z.object({
    tipo: zod_1.z.enum(["Administrador", "Responsável", "Usuário"], { message: "Tipo de usuário inválido. Deve ser Administrador, Responsável ou Usuário" })
});
const capacidadeSchema = zod_1.z.object({
    capacidade: zod_1.z.coerce.number({ required_error: "Capacidade deve ser fornecida", invalid_type_error: "Capacidade deve ser um número" })
        .min(0, "Capacidade mínima de um laboratório deve ser 1")
        .int("Capacidade deve ser um número inteiro")
});
const projetorSchema = zod_1.z.object({
    projetor: zod_1.z.coerce.number({ invalid_type_error: "Projetor deve ser um número" }).int("Projetor deve ser um número inteiro").default(0)
});
const quadroSchema = zod_1.z.object({
    quadro: zod_1.z.coerce.number({ invalid_type_error: "Quadro deve ser um número" }).int("Quadro deve ser um número inteiro").default(0)
});
const televisaoSchema = zod_1.z.object({
    televisao: zod_1.z.coerce.number({ invalid_type_error: "Televisao deve ser um número" }).int("Televisao deve ser um número inteiro").default(0)
});
const ar_condicionadoSchema = zod_1.z.object({
    ar_condicionado: zod_1.z.coerce.number({ invalid_type_error: "Ar condicionado deve ser um número" }).int("Ar condicionado deve ser um número inteiro").default(0)
});
const computadorSchema = zod_1.z.object({
    computador: zod_1.z.coerce.number({ invalid_type_error: "Computador deve ser um número" }).int("Computador deve ser um número inteiro").default(0)
});
const outroSchema = zod_1.z.object({
    outro: zod_1.z.string({ invalid_type_error: "Outro deve ser uma string" }).optional()
});
const reserveTypeSchema = zod_1.z.object({
    tipo: zod_1.z.enum(["Única", "Semanal", "Personalizada", "Diária"], { message: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária", required_error: "Tipo de reserva deve ser informado", invalid_type_error: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária" })
});
const initialDateSchema = zod_1.z.object({
    data_inicio: zod_1.z.string({ required_error: "Data inicial deve ser informada", invalid_type_error: "Data de início deve ser uma string" }).refine(val => !isNaN(Date.parse(val)), {
        message: "Data de início inválida"
    })
});
const finalDateSchema = zod_1.z.object({
    data_fim: zod_1.z.string({ required_error: "Data final deve ser informada", invalid_type_error: "Data final deve ser uma string" }).refine(val => !isNaN(Date.parse(val)), {
        message: "Data final inválida"
    })
});
const labNameSchema = zod_1.z.object({
    labName: zod_1.z.string({ required_error: "Nome do laboratório deve ser informado", invalid_type_error: "Nome do laboratório deve ser uma string" }).min(1, "Nome do laboratório deve ser informado")
});
const horaInicioSchema = zod_1.z.object({
    hora_inicio: zod_1.z.string({ required_error: "Hora de início deve ser informada", invalid_type_error: "Hora de início deve ser uma string" }).min(4, "Horário deve ter pelo menos quatro caracteres").max(5, {
        message: "Horário deve ter no máximo cinco caracteres"
    }).refine((val) => {
        const valSplit = val.split(":");
        if (valSplit.length !== 2)
            return false;
        if (valSplit[0].length > 2 || valSplit[1].length !== 2)
            return false;
        let hour, minutes;
        try {
            hour = Number(valSplit[0]);
            minutes = Number(valSplit[1]);
        }
        catch (error) {
            return false;
        }
        if (isNaN(hour) || isNaN(minutes))
            return false;
        if (minutes % 5 !== 0)
            return false;
        if (hour < 0 || hour > 23)
            return false;
        return true;
    }, {
        message: "Horário inválido"
    })
});
const duracaoSchema = zod_1.z.object({
    duracao: zod_1.z.string({ required_error: "Duração deve ser informada", invalid_type_error: "Duração deve ser uma string" }).min(4, "Duração deve ter pelo menos quatro caracteres").max(5, {
        message: "Duração deve ter no máximo cinco caracteres"
    }).refine((val) => {
        let valSplit = val.split(":");
        if (valSplit.length !== 2)
            return false;
        if (valSplit[0].length > 2 || valSplit[1].length !== 2)
            return false;
        let hour, minutes;
        try {
            hour = Number(valSplit[0]);
            minutes = Number(valSplit[1]);
        }
        catch (error) {
            return false;
        }
        if (isNaN(hour) || isNaN(minutes))
            return false;
        if (minutes < 0 || minutes % 5 !== 0)
            return false;
        if (hour < 0 || hour > 23)
            return false;
        if (hour === 0 && minutes < 30)
            return false;
        return true;
    }, {
        message: "Duração inválida"
    })
});
//------------------------------------ Route Schemas ------------------------------------ //
//----------------- User Schemas ----------------- //
exports.UserCreateSchema = exports.nomeSchema.merge(cpfSchema).merge(dataNascSchema).merge(telefoneSchema).merge(emailSchema).merge(senhaSchema).merge(tipoSchema);
exports.UserLoginSchema = emailSchema.merge(senhaSchema);
//adm = true não precisa informar senha
//mudarSenha indica se vai mudar a senha ou não
exports.UserUpdateSchema = zod_1.z.object({
    novasenha: zod_1.z.string({ required_error: "Nova senha deve ser informada", invalid_type_error: "Nova senha deve ser uma string" }).min(8, "Nova senha deve ter pelo menos 8 caracteres").optional(),
    tipo: tipoSchema.shape.tipo.optional(),
    senha: senhaSchema.shape.senha.optional(),
    adm: zod_1.z.number({ invalid_type_error: "adm deve ser 0 ou 1" }).min(0, "adm deve ser 0 ou 1").max(1, "adm deve ser 0 ou 1").default(0), //defaults to false
    mudarSenha: zod_1.z.number({ invalid_type_error: "mudanSenha deve ser 0 ou 1" }).min(0, "mudanSenha deve ser 0 ou 1").max(1, "mudanSenha deve ser 0 ou 1").default(0), //defaults to false
    changeType: zod_1.z.number({ invalid_type_error: "changeType deve ser 0 ou 1" }).min(0, "changeType deve ser 0 ou 1").max(1, "changeType deve ser 0 ou 1").default(0) //defaults to false
}).merge(exports.idSchema).merge(exports.nomeSchema).merge(telefoneSchema).merge(emailSchema);
exports.UserUpdateFirst = exports.idSchema.merge(cpfSchema).merge(cpfSchema).merge(dataNascSchema).merge(emailSchema).merge(exports.nomeSchema).merge(senhaSchema).merge(telefoneSchema);
exports.UserDelete = zod_1.z.object({
    senha: senhaSchema.shape.senha.optional(),
    minhaConta: zod_1.z.coerce.number({ invalid_type_error: "minhaConta deve ser 0 ou 1" }).min(0, "minhaConta deve ser 0 ou 1").max(1, "minhaConta deve ser 0 ou 1").default(1) //defaults to true
}).merge(exports.idSchema);
exports.UsersGet = zod_1.z.object({
    nome: zod_1.z.string().optional(),
    cpf: zod_1.z.string().optional(),
    email: zod_1.z.string().optional(),
    tipo: zod_1.z.string().optional()
});
exports.UserRespGet = zod_1.z.object({
    cpf: zod_1.z.coerce.number({ invalid_type_error: "cpf deve ser 0 ou 1" }).min(0, "cpf deve ser 0 ou 1").max(1, "cpf deve ser 0 ou 1").default(0) //defaults to false
});
exports.UserData = zod_1.z.object({
    saveContext: zod_1.z.number({ invalid_type_error: "saveContext deve ser 0 ou 1" }).min(0, "saveContext deve ser 0 ou 1").max(1, "saveContext deve ser 0 ou 1").default(0) //defaults to false
}).merge(exports.idSchema);
//----------------- Labs Schemas ----------------- //
//Utilizar responsavel_cpf caso seja administrador que esteja criado laboratório, responsavel_id caso contrário
exports.LabCreate = zod_1.z.object({
    responsavel_cpf: cpfSchema.shape.cpf.optional(),
    responsavel_id: exports.idSchema.shape.id.optional()
}).merge(exports.nomeSchema).merge(capacidadeSchema).merge(projetorSchema).merge(quadroSchema).merge(televisaoSchema).merge(ar_condicionadoSchema).merge(computadorSchema).merge(outroSchema);
//novoResponsavel é o cpf do usuário que será responsável pelo laboratório (opcional)
exports.LabUpdateSchema = zod_1.z.object({
    novo_responsavel: cpfSchema.shape.cpf.optional()
}).merge(exports.nomeSchema).merge(capacidadeSchema).merge(projetorSchema).merge(quadroSchema).merge(televisaoSchema).merge(ar_condicionadoSchema).merge(computadorSchema).merge(outroSchema);
exports.LabsGet = zod_1.z.object({
    nome: zod_1.z.string().optional(),
    responsavel: zod_1.z.string().optional(),
    capacidade_minima: zod_1.z.string()
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .transform(val => val === undefined ? undefined : Number(val))
        .refine(val => val === undefined || (!isNaN(val) && Number.isInteger(val) && val >= 0), {
        message: "Capacidade mínima de um laboratório deve ser um número inteiro maior ou igual a 1"
    })
});
exports.LabNames = zod_1.z.object({
    user_id: exports.idSchema.shape.id.optional()
});
exports.LabReserves = zod_1.z.object({
    dia: zod_1.z.string({ required_error: "Data deve ser informada", invalid_type_error: "Data deve ser uma string" }).refine(val => !isNaN(Date.parse(val)), {
        message: "Data inválida"
    })
}).merge(exports.nomeSchema);
//----------------- Reservas Schemas ----------------- //
const WeeklyReserve = zod_1.z.object({
    dia_semana: zod_1.z.enum(["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"], { required_error: "Dia da semana deve ser informado", invalid_type_error: "Dia da semana deve ser: Domingo, Segunda, Terça, Quarta, Quinta, Sexta ou Sábado", message: "Dia da semana deve ser: Domingo, Segunda, Terça, Quarta, Quinta, Sexta ou Sábado" }),
}).merge(horaInicioSchema).merge(duracaoSchema);
exports.WeeklyReserves = zod_1.z.object({
    horarios: zod_1.z.array(WeeklyReserve).min(1, "Pelo menos uma reserva deve ser feita")
}).merge(initialDateSchema).merge(finalDateSchema);
const PersonalizedReserve = zod_1.z.object({
    data: zod_1.z.string({ required_error: "Data deve ser informada", invalid_type_error: "Data deve ser uma string" }).refine(val => !isNaN(Date.parse(val)), {
        message: "Data inválida"
    }),
}).merge(horaInicioSchema).merge(duracaoSchema);
exports.PersonalizedReserves = zod_1.z.object({
    horarios: zod_1.z.array(PersonalizedReserve).min(1, "Pelo menos uma reserva deve ser feita")
});
exports.UniqueReserve = initialDateSchema.merge(horaInicioSchema).merge(duracaoSchema);
exports.DailyReserve = initialDateSchema.merge(finalDateSchema).merge(horaInicioSchema).merge(duracaoSchema);
exports.ReserveInsert = zod_1.z.object({
    userId: exports.idSchema.shape.id,
    userName: exports.nomeSchema.shape.nome,
}).merge(reserveTypeSchema).merge(labNameSchema);
exports.ReservesRespLab = zod_1.z.object({
    resp_id: exports.idSchema.shape.id,
    userName: zod_1.z.string().optional(),
    labName: zod_1.z.string().optional(),
    data_inicio: zod_1.z
        .string({ invalid_type_error: "Data de início deve ser uma string" })
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
        message: "Data de início inválida"
    }),
    data_fim: zod_1.z
        .string({ invalid_type_error: "Data final deve ser uma string" })
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
        message: "Data final inválida"
    }),
    tipo: zod_1.z.enum(["Única", "Semanal", "Personalizada", "Diária", ""], {
        message: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária",
        required_error: "Tipo de reserva deve ser informado",
        invalid_type_error: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária"
    }).optional()
});
exports.ReservesUser = zod_1.z.object({
    userId: exports.idSchema.shape.id,
    labName: zod_1.z.string().optional(),
    data_inicio: zod_1.z
        .string({ invalid_type_error: "Data de início deve ser uma string" })
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
        message: "Data de início inválida"
    }),
    data_fim: zod_1.z
        .string({ invalid_type_error: "Data final deve ser uma string" })
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
        message: "Data final inválida"
    }),
    tipo: zod_1.z.enum(["Única", "Semanal", "Personalizada", "Diária", ""], {
        message: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária",
        required_error: "Tipo de reserva deve ser informado",
        invalid_type_error: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária"
    }).optional()
});
exports.Reserves = zod_1.z.object({
    userName: zod_1.z.string().optional(),
    labName: zod_1.z.string().optional(),
    data_inicio: zod_1.z
        .string({ invalid_type_error: "Data de início deve ser uma string" })
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
        message: "Data de início inválida"
    }),
    data_fim: zod_1.z
        .string({ invalid_type_error: "Data final deve ser uma string" })
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
        message: "Data final inválida"
    }),
    tipo: zod_1.z.enum(["Única", "Semanal", "Personalizada", "Diária", ""], {
        message: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária",
        required_error: "Tipo de reserva deve ser informado",
        invalid_type_error: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária"
    }).optional()
});
exports.ReserveRemove = zod_1.z.object({
    motivo: zod_1.z.string({ invalid_type_error: "Motivo deve ser uma string" }).min(1, "Motivo de remoção da reserva deve ser informado").optional()
}).merge(exports.idSchema);
