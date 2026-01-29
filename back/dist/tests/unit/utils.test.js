import { comparePasswords, generateJWTToken, hashPassword, verifyJWTToken } from "../../src/utils/auth.js";
let hashedPassword, password = "Senha1@123";
let jwtToken, randomToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";
beforeAll(async () => {
    hashedPassword = await hashPassword(password);
    jwtToken = generateJWTToken({ id: "1", tipo: "Usuário" });
});
describe("auth", () => {
    it("test hash password", async () => {
        const newHashedPassword = await hashPassword(password);
        expect(newHashedPassword).toBeDefined();
    });
    it("test compare passwords - not equal", async () => {
        const equal = await comparePasswords("Senhaqualquer", hashedPassword);
        expect(equal).toBe(false);
    });
    it("test compare passwords - equal", async () => {
        const equal = await comparePasswords(password, hashedPassword);
        expect(equal).toBe(true);
    });
    it("test generate jwt token", () => {
        const newToken = generateJWTToken({ id: "1", tipo: "Usuário" });
        expect(newToken).toBeDefined();
    });
    it("test verify jwt token - fail", () => {
        expect(() => {
            verifyJWTToken(randomToken);
        }).not.toThrow();
        expect(verifyJWTToken(randomToken)).toBe(false);
    });
    it("test verify jwt token - succeed", () => {
        const decoded = verifyJWTToken(jwtToken);
        expect(decoded).toBeDefined();
        expect(decoded).toBeInstanceOf(Object);
    });
});
//# sourceMappingURL=utils.test.js.map