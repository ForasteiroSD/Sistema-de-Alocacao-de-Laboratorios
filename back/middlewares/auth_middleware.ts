import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { env } from "../utils/env";

export function authenticate(req: Request, res: Response, next: NextFunction) {
    try {
        const token = req.cookies?.jwtToken;
        
        if(!token) {
            return res.status(401).send("Token não fornecido");
        }

        const decoded = jwt.verify(token, env.JWT_SECRET);
        (req as any).userData = decoded;

        next();
    } catch (err) {
        return res.status(401).send("Usuário não autenticado");
    }
}