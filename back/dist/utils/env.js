"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const zod_1 = require("zod");
dotenv_1.default.config({ path: `${((_a = process.env.NODE_ENV) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes("production")) && process.env.NODE_ENV || ""}.env`, quiet: true });
const envSchema = zod_1.z.object({
    JWT_SECRET: zod_1.z.string(),
    PORT: zod_1.z.number().optional(),
    EMAIL_USER: zod_1.z.string().email(),
    EMAIL_PASS: zod_1.z.string(),
    PAGE_LINK: zod_1.z.string(),
    ALLOWED_LINKS: zod_1.z.string(),
    NODE_ENV: zod_1.z.string().optional()
});
exports.env = envSchema.parse(process.env);
