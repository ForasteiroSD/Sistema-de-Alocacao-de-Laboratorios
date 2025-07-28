"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const auth_1 = require("../utils/auth");
function authenticate(req, res, next) {
    if (!req.cookies || !req.cookies.jwtToken) {
        return res.status(401).send("Token não fornecido");
    }
    const token = req.cookies.jwtToken;
    const decoded = (0, auth_1.verifyJWTToken)(token);
    if (!decoded) {
        return res.status(401).send("Usuário não autenticado");
    }
    req.userData = decoded;
    next();
}
exports.authenticate = authenticate;
