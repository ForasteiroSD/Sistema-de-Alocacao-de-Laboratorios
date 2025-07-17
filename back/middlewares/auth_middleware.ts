import { Request, Response, NextFunction } from "express";
import { verifyJWTToken } from "../utils/auth";

export function authenticate(req: Request, res: Response, next: NextFunction) {
    const token = req.cookies?.jwtToken;
    
    if(!token) {
        return res.status(401).send("Token não fornecido");
    }

    const decoded = verifyJWTToken(token);

    if(!decoded) {
        return res.status(401).send("Usuário não autenticado");
    }

    (req as any).userData = decoded;

    next();
}