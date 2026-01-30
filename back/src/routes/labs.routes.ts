import { Router } from 'express';
import { newLab } from 'src/services/labs/new.service.js';
import { updateLab } from 'src/services/labs/update.service.js';
import { listLabs } from 'src/services/labs/list.service.js';
import { labData } from 'src/services/labs/data.service.js';
import { labNames } from 'src/services/labs/names.service.js';
import { labDayReserve } from 'src/services/labs/reserves.service.js';

const router = Router();

//Cadastrar laboratório
router.post("/", newLab);

//Atualizar laboratório
router.patch("/", updateLab);

//Consultar laboratórios
router.get("/all", listLabs);

//Consultar dados de um laboratório
router.get("/", labData);

//Recupera nomes dos laboratórios de um usuário ou todos os laboratórios caso nenhum id seja passado
router.post("/user", labNames);

//Consultar reservas de um dia específico no laboratório
router.get('/reservasdia', labDayReserve);

export default router;