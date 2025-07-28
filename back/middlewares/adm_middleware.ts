import { Request, Response, NextFunction } from "express";

export function adm_authorization(req: Request, res: Response, next: NextFunction) {

    if((req as any).userData.tipo !== "Administrador") {
        return res.status(403).send("Função não permitida");
    }

    next();
}