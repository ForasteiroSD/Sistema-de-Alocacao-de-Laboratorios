import { Request, Response } from 'express';
import { clearAuthCookie } from 'src/utils/auth.js';

export async function userLogout (req: Request, res: Response) {

    clearAuthCookie(res);

    return res.status(200).send({
        success: true
    });
}