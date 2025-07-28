"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.adm_authorization = void 0;
function adm_authorization(req, res, next) {
    if (req.userData.tipo !== "Administrador") {
        return res.status(403).send("Função não permitida");
    }
    next();
}
exports.adm_authorization = adm_authorization;
