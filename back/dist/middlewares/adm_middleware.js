export function adm_authorization(req, res, next) {
    if (req.userData.tipo !== "Administrador") {
        return res.status(403).json({
            success: false,
            message: "Função não permitida."
        });
    }
    next();
}
//# sourceMappingURL=adm_middleware.js.map