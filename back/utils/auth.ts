import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from '../utils/env';

export async function hashPassword(plainTextPassword: string) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
    return hashedPassword;
};

export async function comparePasswords(plainTextPassword: string, hashedPassword: string) {
    const match = await bcrypt.compare(plainTextPassword, hashedPassword);
    return match;
}

export function generateJWTToken(payload: object) {
    return jwt.sign(payload,
        env.JWT_SECRET,
        {
            expiresIn: "1d"
        }
    );
}