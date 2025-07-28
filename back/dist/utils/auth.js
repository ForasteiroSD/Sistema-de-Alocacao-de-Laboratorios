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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJWTToken = exports.generateJWTToken = exports.comparePasswords = exports.hashPassword = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const env_1 = require("../utils/env");
function hashPassword(plainTextPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const saltRounds = 10;
        const hashedPassword = yield bcrypt_1.default.hash(plainTextPassword, saltRounds);
        return hashedPassword;
    });
}
exports.hashPassword = hashPassword;
;
function comparePasswords(plainTextPassword, hashedPassword) {
    return __awaiter(this, void 0, void 0, function* () {
        const match = yield bcrypt_1.default.compare(plainTextPassword, hashedPassword);
        return match;
    });
}
exports.comparePasswords = comparePasswords;
function generateJWTToken(payload) {
    return jsonwebtoken_1.default.sign(payload, env_1.env.JWT_SECRET, {
        expiresIn: "1d"
    });
}
exports.generateJWTToken = generateJWTToken;
function verifyJWTToken(token) {
    try {
        return jsonwebtoken_1.default.verify(token, env_1.env.JWT_SECRET);
    }
    catch (error) {
        return false;
    }
}
exports.verifyJWTToken = verifyJWTToken;
