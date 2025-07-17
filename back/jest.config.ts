import { createDefaultPreset } from "ts-jest";
import type { Config } from "jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
const config: Config = {
    testEnvironment: "node",
    transform: {
        ...tsJestTransformCfg,
    },
    projects: [
        {
            displayName: "integration",
            preset: "ts-jest",
            testMatch: ["<rootDir>/tests/integration/*.test.ts"],
            setupFilesAfterEnv: ["<rootDir>/tests/integration/jest.setup.ts"],
        },
        {
            displayName: "unit",
            preset: "ts-jest",
            testMatch: ["<rootDir>/tests/unit/**/*.test.ts"],
            setupFilesAfterEnv: ["<rootDir>/tests/unit/jest.setup.ts"],
        },
    ],
};

export default config;