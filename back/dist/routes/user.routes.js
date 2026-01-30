import { Router } from 'express';
import { authenticate } from '../middlewares/auth_middleware.js';
import { adm_authorization } from '../middlewares/adm_middleware.js';
import { userLogin } from '../services/user/login.service.js';
import { userLogout } from '../services/user/logout.service.js';
import { updateUser } from '../services/user/update.service.js';
import { deleteUser } from '../services/user/delete.service.js';
import { getResponsibles } from '../services/user/responsibles.service.js';
import { getUserData } from '../services/user/data.service.js';
import { userNextReserves } from '../services/user/mainPage.service.js';
import { newUser } from '../services/user/new.service.js';
import { listUsers } from '../services/user/list.service.js';
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
//# sourceMappingURL=user.routes.js.map