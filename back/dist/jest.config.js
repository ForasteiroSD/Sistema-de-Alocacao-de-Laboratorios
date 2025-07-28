"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const ts_jest_1 = require("ts-jest");
const tsJestTransformCfg = (0, ts_jest_1.createDefaultPreset)().transform;
/** @type {import("jest").Config} **/
const config = {
    testEnvironment: "node",
    transform: Object.assign({}, tsJestTransformCfg),
    projects: [
        {
            displayName: "integration",
            preset: "ts-jest",
            testMatch: ["<rootDir>/tests/integration/*.test.ts"],
            setupFilesAfterEnv: ["<rootDir>/tests/integration/jest.setup.ts"],
            coveragePathIgnorePatterns: ["/prisma/"],
            testPathIgnorePatterns: ["/prisma/"]
        },
        {
            displayName: "unit",
            preset: "ts-jest",
            testMatch: ["<rootDir>/tests/unit/**/*.test.ts"],
            setupFilesAfterEnv: ["<rootDir>/tests/unit/jest.setup.ts"],
            coveragePathIgnorePatterns: ["/prisma/"],
            testPathIgnorePatterns: ["/prisma/"]
        },
    ],
};
exports.default = config;
