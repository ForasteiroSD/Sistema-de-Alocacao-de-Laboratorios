import { Request, Response, Router } from 'express'
import { PrismaClient } from '@prisma/client'

interface nextReservas {
    name: String;
    date: String;
    begin: String | null;
    duration: String | null;
    horario_total: Date;
}

function adicionaReservaSemanal(ordem_dias: any, prox_dia: number, dia: Date, reserva: any) {

    //acha proxima data da reserva
    while(dia.getUTCDay() !== ordem_dias[prox_dia].dia.dia) {
        dia.setUTCDate(dia.getUTCDate()+1);
    }

    //verifica se a data n ultrapassou o fim da reserva
    if(dia > reserva.data_fim) return null;

    //constroi reserva
    let string_month = '';
    if (dia.getUTCMonth() <= 10) string_month = '0'+(dia.getUTCMonth()+1);
    else string_month += (dia.getUTCMonth()+1);

    const string_data = `${dia.getUTCDate()}/${string_month}/${dia.getUTCFullYear()}`
    const string_dia = `${(dia.toISOString()).split('T')[0]}T${ordem_dias[prox_dia].dia.horario}:00.000Z`

    let reserva_inserir : nextReservas = {
        date: string_data,
        begin: ordem_dias[prox_dia].dia.horario,
        duration: ordem_dias[prox_dia].dia.duracao + 'hrs',
        name: reserva.laboratorio.nome,
        horario_total: new Date(string_dia)
    }

    return reserva_inserir;
}

function insereReserva(reserva: nextReservas, nextReservas: nextReservas[]) {
    let pos = nextReservas.length;
    while(pos > 0 && reserva.horario_total < nextReservas[pos-1].horario_total) pos--;
    pos < 3 && nextReservas.splice(pos, 0, reserva);
    nextReservas.length > 3 && nextReservas.pop();
}

const router = Router();
const prisma = new PrismaClient();

const dias_semana = [
    'Domingo',
    'Segunda',
    'Terça',
    'Quarta',
    'Quinta',
    'Sexta',
    'Sábado'
]

//Cadastrar usuário
router.post("/user/create", async(req: Request, res: Response) => {

    //Dados do usuário a ser criado
    const {nome, cpf, d_nas, telefone, email, senha, tipo} = req.body;
    
    const date = new Date(d_nas);

    if(date.toString() === 'Invalid Date') {
        res.status(400).send('Data inválida');
        return;
    }

    try {
        await prisma.user.create({
            data: {
                email: email,
                cpf: cpf,
                nome: nome,
                senha: senha,
                data_nasc: date,
                telefone: telefone,
                tipo: tipo
            }
        });

        res.status(200).send('Usuario criado');
        return;

    } catch (error: any) {
        
        if(error.code === 'P2002' && error.meta.target[0] === 'cpf') {
            res.status(409).send('CPF ja cadastrado');
            return;
        } else if(error.code === 'P2002' && error.meta.target[0] === 'email') {
            res.status(409).send('Email ja cadastrado');
            return;
        }

        res.status(400).send('database off');
        return;

    }
});


//Realizar login
router.post("/user/login", async (req: Request, res: Response) => {
    
    const { email, senha } = req.body;

    try {
        const user = await prisma.user.findFirstOrThrow({
            where: {
                AND: {
                    email: email,
                    senha: senha
                }
            },
            select: {
                id: true,
                nome: true,
                tipo: true
            }
        });

        res.status(200).send({id: user.id, nome: user.nome, tipo: user.tipo});
        return;

    } catch (error: any) {

        if(error.code === 'P2025') {
            res.status(404).send('Usuário não cadastrado');
            return;
        }
    
        res.status(400).send('database off');
        return;
    }
});


//Atualizar usuário
router.patch("/user", async (req: Request, res: Response) => {

    //Dados a serem atualizados
    const { id, nome, telefone, email, senha, novasenha, tipo } = req.body;

    try {
        await prisma.user.update({
            where: {
                id: id,
                senha: senha
            },
            data: {
                nome: nome,
                telefone: telefone,
                email: email,
                senha: novasenha,
                tipo: tipo
            }
    });

    res.status(200).send({nome: nome, tipo: tipo});
    return;

    } catch (error: any) {

        if(error.code === 'P2025') {
            res.status(404).send('Senha invalida');
            return;
        }
        if(error.code === 'P2002' && error.meta.target[0] === 'email') {
            res.status(409).send('Email ja cadastrado');
            return;
        }

        res.status(400).send('database off');
        return;
    }
});


//Deletar usuário
router.delete("/user", async (req: Request, res: Response) => {
    
    const { id, senha } = req.body;

    try {

        const labs = await prisma.laboratorio.findFirst({
            where: {
                responsavel_id: id
            }
        });

        if(labs) {
            res.status(400).send('Usuario ainda responsavel por laboratorios');
            return;
        }

        await prisma.user.delete({
            where: {
                id: String(id),
                senha: senha
            }
        });

        res.status(200).send("Usuario excluido");
        return;

    } catch (error: any) {

        if(error.code === 'P2025') {
            res.status(404).send("Senha invalida");
            return;
        }

        res.status(400).send('database off');
        return;
    }
});


//Ver usuários
router.get("/users", async(req: Request, res: Response) => {

    //Filtros de busca
    const { nome, cpf, email, tipo } = req.query;

    try {
        const users = await prisma.user.findMany({
            where: {
                ... (nome && {
                    nome: { contains: String(nome) }
                }),
                ... (cpf && {
                    cpf: { contains: String(cpf) }
                }),
                ... (email && {
                    email: { contains: String(email) }
                }),
                ... (tipo && {
                    tipo: { contains: String(tipo) }
                })
            },
            select: {
                nome: true,
                cpf: true,
                email: true,
                tipo: true
            },
            orderBy: [
                {
                    tipo: 'asc'
                },
                {
                    nome: 'asc'
                },
            ]
        });

        res.status(200).send(users);
        return;

    } catch (error) {
        res.status(400).send('database off');
        return;
    }
});


//Recuperar dados de um usuário
router.post("/user/data", async(req: Request, res: Response) => {

    //Filtros para busca de usuário
    //utilizar id e cpf separadamente
    //typeOnly especifica que deseja retornar somente o tipo de usuário
    const { id, cpf, typeOnly } = req.query;


    try {
        const user = await prisma.user.findFirstOrThrow({
            where: {
                OR: [
                    {
                        id: String(id)
                    },
                    {
                        cpf: String(cpf)
                    }
                ]
                
            },
            select: {
                ... (typeOnly? {
                    tipo: true
                } : {
                    email: true,
                    cpf: true,
                    nome: true,
                    data_nasc: true,
                    telefone: true,
                    tipo: true
                })
            }
        });

        if(typeOnly) res.status(200).send(user.tipo);
        else res.status(200).send(user);
        return;

    } catch (error: any) {

        if(error.code === 'P2025') {
            res.status(404).send('Usuario inexistente');
            return;
        }

        res.status(400).send('database off');
        return;
    }
});


//Recupera dados da página inicial
router.post("/mainpageinfo", async (req: Request, res: Response) => {
    
    const { id } = req.body;
    let today = new Date();
    
    today.setUTCHours(0, 0, 0, 0);

    try {
        const user = await prisma.user.findUniqueOrThrow({
            where: {
                id: String(id)
            },
            include: {
                _count: {
                    select: {
                        laboratorios: true,
                        reservas: {
                            where: {
                                data_fim: {
                                    gte: today
                                }
                            }
                        }
                    }
                }
            }
        });

        const reservas = await prisma.reserva.findMany({
            where: {
                user_id: String(id),
                data_fim: {
                    gte: today
                }
            },
            include: {
                laboratorio: true,
                horarios: true
            }
        });

        const labsCount = await prisma.laboratorio.count();
        const reservasCount = await prisma.reserva.count({
            where: {
                data_fim: {
                    gte: today
                }
            }
        });

        const mainInfo = [
            {
                name: 'Meus Laboratórios',
                value: user._count.laboratorios
            },
            {
                name: 'Laboratórios Totais',
                value: labsCount
            },
            {
                name: 'Minhas Reservas',
                value: user._count.reservas
            },
            {
                name: 'Reservas Totais',
                value: reservasCount
            }
        ];

        const nextReservas : nextReservas[]  = []
        for (let reserva of reservas) {

            let dia = new Date();

            if(dia < reserva.data_inicio) dia = reserva.data_inicio;

            dia.setUTCHours(0, 0, 0, 0);

            //Reserva analisado é do tipo semanal
            if(reserva.tipo === 'Semanal') {
                
                //array que possui todos os dias da semana da reserva com cada dia sendo um valor de 0 a 6
                const dias_reserva = []
                for(let horario of reserva.horarios) {
                    dias_reserva.push({dia: dias_semana.indexOf(horario.dia_semana), horario: horario.hora_inicio, duracao: horario.duracao})
                }
                
                //array com os proximos dias da reserva 
                const ordem_dias = []
                for(let i=0; i<dias_reserva.length; i++) {
                    let dif = dias_reserva[i].dia - dia.getUTCDay();
                    if(dif < 0) dif = 7 + dif;

                    ordem_dias.push({dia: dias_reserva[i], dif: dif});
                }
    
                ordem_dias.sort((a, b) => {
                    return a.dif - b.dif;
                });

                //variavel que define qual é o proximo dia do array ordem_dias
                let prox_dia = 0;

                //inserção de reservas caso tamanho seja menor q 3
                if(nextReservas.length < 3) {

                    while(nextReservas.length < 3) {
                        let reserva_inserir = adicionaReservaSemanal(ordem_dias, prox_dia, dia, reserva);

                        if(!reserva_inserir) break;

                        insereReserva(reserva_inserir, nextReservas);

                        //passa para proximo dia da semana e verifica se deve voltar ao inicio
                        prox_dia++;
                        if(prox_dia === ordem_dias.length) prox_dia = 0;
                    }

                } else {
                    do {
                        let reserva_inserir = adicionaReservaSemanal(ordem_dias, prox_dia, dia, reserva);
                        
                        if(!reserva_inserir || reserva_inserir.horario_total > nextReservas[2].horario_total) break;

                        insereReserva(reserva_inserir, nextReservas);

                        //passa para proximo dia da semana e verifica se deve voltar ao inicio
                        prox_dia++;
                        if(prox_dia === ordem_dias.length) prox_dia = 0;

                    } while(true);
                }

            } else if (reserva.tipo === 'Diária'){

                if(nextReservas.length < 3) {

                    while(nextReservas.length < 3) {
                        
                        //constroi reserva
                        let string_month = '';
                        if (dia.getUTCMonth() <= 10) string_month = '0'+(dia.getUTCMonth()+1);
                        else string_month += (dia.getUTCMonth()+1);

                        const string_data = `${dia.getUTCDate()}/${string_month}/${dia.getUTCFullYear()}`
                        const string_dia = `${(dia.toISOString()).split('T')[0]}T${reserva.hora_inicio}:00.000Z`
                        let reserva_inserir : nextReservas = {
                            date: string_data,
                            begin: reserva.hora_inicio,
                            duration: reserva.duracao + 'hrs',
                            name: reserva.laboratorio.nome,
                            horario_total: new Date(string_dia)
                        }

                        insereReserva(reserva_inserir, nextReservas);
                        
                        dia.setUTCDate(dia.getUTCDate()+1)

                        //verifica se a data n ultrapassou o fim da reserva
                        if(dia > reserva.data_fim) break;
                    }

                } else {
                    do {
                        
                        if(dia > nextReservas[2].horario_total) break;

                        //constroi reserva
                        let string_month = '';
                        if (dia.getUTCMonth() <= 10) string_month = '0'+(dia.getUTCMonth()+1);
                        else string_month += (dia.getUTCMonth()+1);

                        const string_data = `${dia.getUTCDate()}/${string_month}/${dia.getUTCFullYear()}` 
                        const string_dia = `${(dia.toISOString()).split('T')[0]}T${reserva.hora_inicio}:00.000Z`
                        let reserva_inserir : nextReservas = {
                            date: string_data,
                            begin: reserva.hora_inicio,
                            duration: reserva.duracao + 'hrs',
                            name: reserva.laboratorio.nome,
                            horario_total: new Date(string_dia)
                        }

                        insereReserva(reserva_inserir, nextReservas);

                        dia.setUTCDate(dia.getUTCDate()+1);

                        //verifica se a data n ultrapassou o fim da reserva
                        if(dia > reserva.data_fim) break;

                    } while(true);
                }

            } else {
                if(nextReservas.length < 3) {
                    //constroi reserva
                    let string_month = '';
                    if (reserva.data_inicio.getUTCMonth() <= 10) string_month = '0'+(reserva.data_inicio.getUTCMonth()+1);
                    else string_month += (reserva.data_inicio.getUTCMonth()+1);

                    const string_data = `${reserva.data_inicio.getUTCDate()}/${string_month}/${reserva.data_inicio.getUTCFullYear()}`
                    const string_dia = `${(reserva.data_inicio.toISOString()).split('T')[0]}T${reserva.hora_inicio}:00.000Z`
                    let reserva_inserir : nextReservas = {
                        date: string_data,
                        begin: reserva.hora_inicio,
                        duration: reserva.duracao + 'hrs',
                        name: reserva.laboratorio.nome,
                        horario_total: new Date(string_dia)
                    }

                    insereReserva(reserva_inserir, nextReservas);

                } else {
                    //constroi reserva
                    let string_month = '';
                    if (reserva.data_inicio.getUTCMonth() <= 10) string_month = '0'+(reserva.data_inicio.getUTCMonth()+1);
                    else string_month += (reserva.data_inicio.getUTCMonth()+1);

                    const string_data = `${reserva.data_inicio.getUTCDate()}/${string_month}/${reserva.data_inicio.getUTCFullYear()}`
                    const string_dia = `${(reserva.data_inicio.toISOString()).split('T')[0]}T${reserva.hora_inicio}:00.000Z`
                    let reserva_inserir : nextReservas = {
                        date: string_data,
                        begin: reserva.hora_inicio,
                        duration: reserva.duracao + 'hrs',
                        name: reserva.laboratorio.nome,
                        horario_total: new Date(string_dia)
                    }

                    insereReserva(reserva_inserir, nextReservas);
                }

            }
        }
        res.send({mainInfo: mainInfo, nextReserves: nextReservas});
        return;

    } catch (error: any) {

        if(error.code === 'P2025') {
            res.status(404).send('Usuario inexistente');
            return;
        }

        res.status(400).send('database off');
        return;
    }


});

export default router;