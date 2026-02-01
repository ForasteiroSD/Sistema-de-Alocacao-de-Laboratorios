import { Router } from 'express';
import { adm_authorization } from '../middlewares/adm_middleware.js';
import { newReserve } from '../services/reserves/new.service.js';
import { userLabsReserves } from '../services/reserves/userLabs.service.js';
import { userReserves } from '../services/reserves/user.service.js';
import { reservesList } from '../services/reserves/list.service.js';
import { reserveData } from '../services/reserves/data.service.js';
import { deleteReserve } from '../services/reserves/delete.service.js';
import { deleteReserveAdm } from '../services/reserves/deleteAdm.service.js';
const router = Router();
//Inserir reservas
router.post('/reserva', newReserve);
//Recuperar reservas de laboratórios de um usuário específico
router.get('/reservas/lab', userLabsReserves);
//Recuperar reservas do usuário
router.get('/reservas/user', userReserves);
//Recuperar reservas do sistema
router.get('/reservas', adm_authorization, reservesList);
//Recuperar dados de uma reserva
router.get('/reserva', reserveData);
//Apagar reserva do próprio usuário
router.delete('/minhareserva', deleteReserve);
//Apagar reserva como responsável pelo laboratório ou administrador
router.delete('/reserva', deleteReserveAdm);
export default router;
//# sourceMappingURL=reserves.routes.js.map