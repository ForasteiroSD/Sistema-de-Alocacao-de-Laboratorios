import { Router } from 'express';
import { authenticate } from '../middlewares/auth_middleware.js';
import { adm_authorization } from '../middlewares/adm_middleware.js';
import { userLogin } from 'src/services/user/login.service.js';
import { userLogout } from 'src/services/user/logout.service.js';
import { updateUser } from 'src/services/user/update.service.js';
import { deleteUser } from 'src/services/user/delete.service.js';
import { getResponsibles } from 'src/services/user/responsibles.service.js';
import { getUserData } from 'src/services/user/data.service.js';
import { userNextReserves } from 'src/services/user/mainPage.service.js';
import { newUser } from 'src/services/user/new.service.js';
import { listUsers } from 'src/services/user/list.service.js';

const router = Router();

//Realizar login
router.post("/login", userLogin);

//Middleware de autênticação para próximas rotas
router.use(authenticate);

//Realizar logout
router.get("/logout", userLogout);

//Atualizar usuário
router.patch("/", updateUser);

//Deletar usuário
router.delete("/", deleteUser);

//Recuperar nomes dos usuários responsáveis
router.get("/responsaveis", getResponsibles);

//Recuperar dados de um usuário
router.get("/data", getUserData);

//Recupera dados da página inicial
router.get("/mainpageinfo", userNextReserves);

//ROTAS DE ADMIN
router.use(adm_authorization);

//Cadastrar usuário
router.post("/create", newUser);

//Ver usuários
router.get("/all", listUsers);

export default router;