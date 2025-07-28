"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const auth_1 = require("../../utils/auth");
let hashedPassword, password = "Senha1@123";
let jwtToken, randomToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.KMUFsIDTnFmyG3nMiGM6H9FNFUROf3wh7SmqJp-QV30";
beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
    hashedPassword = yield (0, auth_1.hashPassword)(password);
    jwtToken = (0, auth_1.generateJWTToken)({ id: "1", tipo: "Usuário" });
}));
describe("auth", () => {
    it("test hash password", () => __awaiter(void 0, void 0, void 0, function* () {
        const newHashedPassword = yield (0, auth_1.hashPassword)(password);
        expect(newHashedPassword).toBeDefined();
    }));
    it("test compare passwords - not equal", () => __awaiter(void 0, void 0, void 0, function* () {
        const equal = yield (0, auth_1.comparePasswords)("Senhaqualquer", hashedPassword);
        expect(equal).toBe(false);
    }));
    it("test compare passwords - equal", () => __awaiter(void 0, void 0, void 0, function* () {
        const equal = yield (0, auth_1.comparePasswords)(password, hashedPassword);
        expect(equal).toBe(true);
    }));
    it("test generate jwt token", () => {
        const newToken = (0, auth_1.generateJWTToken)({ id: "1", tipo: "Usuário" });
        expect(newToken).toBeDefined();
    });
    it("test verify jwt token - fail", () => {
        expect(() => {
            (0, auth_1.verifyJWTToken)(randomToken);
        }).not.toThrow();
        expect((0, auth_1.verifyJWTToken)(randomToken)).toBe(false);
    });
    it("test verify jwt token - succeed", () => {
        const decoded = (0, auth_1.verifyJWTToken)(jwtToken);
        expect(decoded).toBeDefined();
        expect(decoded).toBeInstanceOf(Object);
    });
});
