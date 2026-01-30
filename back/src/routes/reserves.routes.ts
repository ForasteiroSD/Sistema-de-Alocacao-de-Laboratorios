import { Router } from 'express';
import { adm_authorization } from '../middlewares/adm_middleware.js';
import { newReserve } from 'src/services/reserves/new.service.js';
import { userLabsReserves } from 'src/services/reserves/userLabs.service.js';
import { userReserves } from 'src/services/reserves/user.service.js';
import { reservesList } from 'src/services/reserves/list.service.js';
import { reserveData } from 'src/services/reserves/data.service.js';
import { deleteReserve } from 'src/services/reserves/delete.service.js';
import { deleteReserveAdm } from 'src/services/reserves/deleteAdm.service.js';

const router = Router();

//Inserir reservas
router.post('/reserva', newReserve);

//Recuperar reservas de laboratórios de um usuário específico
router.post('/reservas/lab', userLabsReserves);

//Recuperar reservas do usuário
router.post('/reservas/user', userReserves);

//Recuperar reservas do sistema
router.get('/reservas', adm_authorization, reservesList);

//Recuperar dados de uma reserva
router.get('/reserva', reserveData);

//Apagar reserva do próprio usuário
router.delete('/minhareserva', deleteReserve);

//Apagar reserva como responsável pelo laboratório ou administrador
router.delete('/reserva', deleteReserveAdm);

export default router;