import { z } from 'zod';

//base schemas
export const nomeSchema = z.object({
    nome: z.string({required_error: "Nome deve ser informado", invalid_type_error: "Nome deve ser uma string"}).min(1, "Nome deve ser informado")
});

export const idSchema = z.object({
    id: z.string({required_error: "Id deve ser informado", invalid_type_error: "Id deve ser uma string"}).uuid("Id deve ser um uuid")
})

const cpfSchema = z.object({
    cpf: z.string({required_error: "CPF deve ser informado", invalid_type_error: "CPF deve ser uma string"}).length(14, "CPF deve ter 11 caracteres")
});

const dataNascSchema = z.object({
    data_nasc: z.string({required_error: "Data de nascimento deve ser informada", invalid_type_error: "Data de nascimento deve ser uma string"}).refine(val => !isNaN(Date.parse(val)), {
        message: "Data de nascimento inválida"
    })
});

const telefoneSchema = z.object({
    telefone: z.string({required_error: "Telefone deve ser informado", invalid_type_error: "Telefone deve ser uma string"}).min(8, "Telefone deve ter pelo menos 8 caracteres")
});

const emailSchema = z.object({
    email: z.string({required_error: "Email deve ser informado", invalid_type_error: "Email deve ser uma string"}).email({message: "Email inválido"})
});

const senhaSchema = z.object({
    senha: z.string({required_error: "Senha deve ser informada", invalid_type_error: "Senha deve ser uma string"}).min(8, "Senha deve ter pelo menos caracteres")
});

const tipoSchema = z.object({
    tipo: z.enum(["Administrador", "Responsável", "Usuário"], {message: "Tipo de usuário inválido. Deve ser Administrador, Responsável ou Usuário"})
});

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

const reserveTypeSchema = z.object({
    tipo: z.enum(["Única", "Semanal", "Personalizada", "Diária"], {message: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária", required_error: "Tipo de reserva deve ser informado", invalid_type_error: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária"})
});

const initialDateSchema = z.object({
    data_inicio: z.string({invalid_type_error: "Data de início deve ser uma string"}).refine(val => !isNaN(Date.parse(val)), {
        message: "Data de início inválida"
    })
});

const finalDateSchema = z.object({
    data_fim: z.string({invalid_type_error: "Data final deve ser uma string"}).refine(val => !isNaN(Date.parse(val)), {
        message: "Data final inválida"
    })
});

const labNameSchema = z.object({
    labName: z.string({required_error: "Nome do laboratório deve ser informado", invalid_type_error: "Nome do laboratório deve ser uma string"}).min(1, "Nome do laboratório deve ser informado")
});

//------------------------------------ Route Schemas ------------------------------------ //


//----------------- User Schemas ----------------- //

export const UserCreateSchema = nomeSchema.merge(cpfSchema).merge(dataNascSchema).merge(telefoneSchema).merge(emailSchema).merge(senhaSchema).merge(tipoSchema);

export const UserLoginSchema = emailSchema.merge(senhaSchema);

//adm = true não precisa informar senha
//mudarSenha indica se vai mudar a senha ou não
export const UserUpdateSchema = z.object({
    novasenha: z.string({required_error: "Nova senha deve ser informada", invalid_type_error: "Nova senha deve ser uma string"}).min(8, "Nova senha deve ter pelo menos 8 caracteres").optional(),
    tipo: tipoSchema.shape.tipo.optional(),
    senha: senhaSchema.shape.senha.optional(),
    adm: z.number({invalid_type_error: "adm deve ser 0 ou 1"}).min(0, "adm deve ser 0 ou 1").max(1, "adm deve ser 0 ou 1").default(0), //defaults to false
    mudarSenha: z.number({invalid_type_error: "mudanSenha deve ser 0 ou 1"}).min(0, "mudanSenha deve ser 0 ou 1").max(1, "mudanSenha deve ser 0 ou 1").default(0), //defaults to false
    changeType: z.number({invalid_type_error: "changeType deve ser 0 ou 1"}).min(0, "changeType deve ser 0 ou 1").max(1, "changeType deve ser 0 ou 1").default(0) //defaults to false
}).merge(idSchema).merge(nomeSchema).merge(telefoneSchema).merge(emailSchema);

export const UserUpdateFirst = idSchema.merge(cpfSchema).merge(cpfSchema).merge(dataNascSchema).merge(emailSchema).merge(nomeSchema).merge(senhaSchema).merge(telefoneSchema);

export const UserDelete = z.object({
    senha: senhaSchema.shape.senha,
    minhaConta: z.coerce.number({invalid_type_error: "minhaConta deve ser 0 ou 1"}).min(0, "minhaConta deve ser 0 ou 1").max(1, "minhaConta deve ser 0 ou 1").default(1) //defaults to true
}).merge(idSchema);

export const UsersGet = z.object({
    nome: z.string().optional(),
    cpf: z.string().optional(),
    email: z.string().optional(),
    tipo: z.string().optional()
});

export const UserRespGet = z.object({
    cpf: z.coerce.number({invalid_type_error: "cpf deve ser 0 ou 1"}).min(0, "cpf deve ser 0 ou 1").max(1, "cpf deve ser 0 ou 1").default(0) //defaults to false
});

export const UserData = z.object({
    saveContext: z.number({invalid_type_error: "saveContext deve ser 0 ou 1"}).min(0, "saveContext deve ser 0 ou 1").max(1, "saveContext deve ser 0 ou 1").default(0) //defaults to false
}).merge(idSchema);



//----------------- Labs Schemas ----------------- //

//Utilizar responsavel_cpf caso seja administrador que esteja criado laboratório, responsavel_id caso contrário
export const LabCreate = z.object({
    responsavel_cpf: cpfSchema.shape.cpf.optional(),
    responsavel_id: idSchema.shape.id.optional()
}).merge(nomeSchema).merge(capacidadeSchema).merge(projetorSchema).merge(quadroSchema).merge(televisaoSchema).merge(ar_condicionadoSchema).merge(computadorSchema).merge(outroSchema);

//novoResponsavel é o cpf do usuário que será responsável pelo laboratório (opcional)
export const LabUpdateSchema = z.object({
    novo_responsavel: cpfSchema.shape.cpf.optional()
}).merge(nomeSchema).merge(capacidadeSchema).merge(projetorSchema).merge(quadroSchema).merge(televisaoSchema).merge(ar_condicionadoSchema).merge(computadorSchema).merge(outroSchema);

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

export const LabReserves = z.object({
    dia: z.string({required_error: "Data deve ser informada", invalid_type_error: "Data deve ser uma string"}).refine(val => !isNaN(Date.parse(val)), {
        message: "Data inválida"
    })
}).merge(nomeSchema);



//----------------- Reservas Schemas ----------------- //

const WeeklyReserves = z.object({
    dia_semana: z.enum(["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"], {required_error: "Dia da semana deve ser informado", invalid_type_error: "Dia da semana deve ser: Domingo, Segunda, Terça, Quarta, Quinta, Sexta ou Sábado"}),
    hora_inicio: z.string({required_error: "Hora de início deve ser informada", invalid_type_error: "Hora de início deve ser uma string"}),
    duracao: z.string({required_error: "Duração deve ser informada", invalid_type_error: "Duração deve ser uma string"})
});

const PersonalizedReserves = z.object({
    data: z.string({required_error: "Data deve ser informada", invalid_type_error: "Data deve ser uma string"}).refine(val => !isNaN(Date.parse(val)), {
        message: "Data inválida"
    }),
    hora_inicio: z.string({required_error: "Hora de início deve ser informada", invalid_type_error: "Hora de início deve ser uma string"}),
    duracao: z.string({required_error: "Duração deve ser informada", invalid_type_error: "Duração deve ser uma string"})
});

export const ReserveInsert = z.object({
    userId: idSchema.shape.id,
    userName: nomeSchema.shape.nome,
    data_inicio: initialDateSchema.shape.data_inicio.optional(),
    data_fim: finalDateSchema.shape.data_fim.optional(),
    hora_inicio: z.string({invalid_type_error: "Hora de início deve ser uma string"}).optional(),
    duracao: z.string({invalid_type_error: "Duração deve ser uma string"}).optional(),
    horarios: z.union([z.array(WeeklyReserves), z.array(PersonalizedReserves)]).optional()
}).merge(reserveTypeSchema).merge(labNameSchema);

export const ReservesRespLab = z.object({
    resp_id: idSchema.shape.id,
    userName: z.string().optional(),
    labName: z.string().optional(),
    data_inicio: z
        .string({invalid_type_error: "Data de início deve ser uma string"})
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
            message: "Data de início inválida"
        }),
    data_fim: z
        .string({invalid_type_error: "Data final deve ser uma string"})
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
            message: "Data final inválida"
        }),
    tipo: z.enum(["Única", "Semanal", "Personalizada", "Diária", ""], {
            message: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária",
            required_error: "Tipo de reserva deve ser informado",
            invalid_type_error: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária"
        }).optional()
});

export const ReservesUser = z.object({
    userId: idSchema.shape.id,
    labName: z.string().optional(),
    data_inicio: z
        .string({invalid_type_error: "Data de início deve ser uma string"})
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
            message: "Data de início inválida"
        }),
    data_fim: z
        .string({invalid_type_error: "Data final deve ser uma string"})
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
            message: "Data final inválida"
        }),
    tipo: z.enum(["Única", "Semanal", "Personalizada", "Diária", ""], {
            message: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária",
            required_error: "Tipo de reserva deve ser informado",
            invalid_type_error: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária"
        }).optional()
});

export const Reserves = z.object({
    userName: z.string().optional(),
    labName: z.string().optional(),
    data_inicio: z
        .string({invalid_type_error: "Data de início deve ser uma string"})
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
            message: "Data de início inválida"
        }),
    data_fim: z
        .string({invalid_type_error: "Data final deve ser uma string"})
        .transform(val => val.trim() === "" ? undefined : val)
        .optional()
        .refine(val => val === undefined || !isNaN(Date.parse(val)), {
            message: "Data final inválida"
        }),
    tipo: z.enum(["Única", "Semanal", "Personalizada", "Diária", ""], {
            message: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária",
            required_error: "Tipo de reserva deve ser informado",
            invalid_type_error: "Tipo de reserva deve ser: Única, Semanal, Personalizada ou Diária"
        }).optional()
});

export const ReserveRemove = z.object({
    motivo: z.string({invalid_type_error: "Motivo deve ser uma string"}).min(1, "Motivo de remoção da reserva deve ser informado").optional()
}).merge(idSchema);