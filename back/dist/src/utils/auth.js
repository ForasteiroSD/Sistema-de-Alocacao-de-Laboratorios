import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { env } from "./env.js";
export async function hashPassword(plainTextPassword) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
    return hashedPassword;
}
;
export async function comparePasswords(plainTextPassword, hashedPassword) {
    const match = await bcrypt.compare(plainTextPassword, hashedPassword);
    return match;
}
export function generateJWTToken(payload) {
    return jwt.sign(payload, env.JWT_SECRET, {
        expiresIn: "1d"
    });
}
export function verifyJWTToken(token) {
    try {
        return jwt.verify(token, env.JWT_SECRET);
    }
    catch (error) {
        return false;
    }
}
//# sourceMappingURL=auth.js.map