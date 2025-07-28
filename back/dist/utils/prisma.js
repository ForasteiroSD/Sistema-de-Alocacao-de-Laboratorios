"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.prisma = void 0;
const env_1 = require("./env");
let prisma;
if (env_1.env.NODE_ENV && env_1.env.NODE_ENV.toLowerCase().includes('production')) {
    const { PrismaClient } = require("@prisma/client");
    exports.prisma = prisma = new PrismaClient();
}
else {
    const { PrismaClient } = require("./../prisma/dev/dev-client");
    exports.prisma = prisma = new PrismaClient();
}
