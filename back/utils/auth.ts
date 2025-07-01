import bcrypt from "bcrypt";

export async function hashPassword(plainTextPassword: string) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
    return hashedPassword;
};

export async function comparePasswords(plainTextPassword: string, hashedPassword: string) {
    const match = await bcrypt.compare(plainTextPassword, hashedPassword);
    return match;
}