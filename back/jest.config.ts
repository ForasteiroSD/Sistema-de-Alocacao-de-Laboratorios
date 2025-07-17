import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/jest.setup.ts"],
  globalTeardown: "./tests/jest.teardown.ts",
  transform: {
    ...tsJestTransformCfg,
  },
};