import { Request, Response, NextFunction } from "express";

export function adm_authorization(req: Request, res: Response, next: NextFunction) {

    if((req as any).userData.tipo !== "Administrador") {
        return res.status(403).json({
            success: false,
            message: "Função não permitida."
        });
    }

    next();
}