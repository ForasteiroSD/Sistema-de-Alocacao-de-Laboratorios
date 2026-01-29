export function adm_authorization(req, res, next) {
    if (req.userData.tipo !== "Administrador") {
        return res.status(403).send("Função não permitida");
    }
    next();
}
//# sourceMappingURL=adm_middleware.js.map