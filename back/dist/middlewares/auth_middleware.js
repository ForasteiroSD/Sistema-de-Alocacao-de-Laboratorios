import { verifyJWTToken } from "../utils/auth.js";
export function authenticate(req, res, next) {
    if (!req.cookies || !req.cookies.jwtToken) {
        return res.status(401).json({
            success: false,
            message: "Token não fornecido."
        });
    }
    const token = req.cookies.jwtToken;
    const decoded = verifyJWTToken(token);
    if (!decoded) {
        return res.status(401).json({
            success: false,
            message: "Usuário não autenticado."
        });
    }
    req.userData = decoded;
    next();
}
//# sourceMappingURL=auth_middleware.js.map