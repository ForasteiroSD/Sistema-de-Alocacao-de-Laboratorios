import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Response } from 'express';
import { env } from "./env.js";

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
            expiresIn: "15m"
        }
    );
}

export function verifyJWTToken(token: string) {
    try {
        return jwt.verify(token, env.JWT_SECRET);
    } catch (error) {
        return false;
    }
}

export function createAuthCookie(res: Response, jwtToken: string) {
    res.cookie("jwtToken", jwtToken, {
        httpOnly: true,
        ...(env.NODE_ENV?.toLowerCase().includes("production") && {
            secure: true,
            sameSite: "none",
        }),
        maxAge: 60*60*24*1000
    });
}

export function clearAuthCookie(res: Response) {
    res.clearCookie("jwtToken", {
        httpOnly: true,
        ...(env.NODE_ENV?.toLowerCase().includes("production") && {
            secure: true,
            sameSite: "none",
        })
    });
}