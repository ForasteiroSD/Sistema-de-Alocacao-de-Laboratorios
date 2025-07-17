import { createDefaultPreset } from "ts-jest";

const tsJestTransformCfg = createDefaultPreset().transform;

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  setupFilesAfterEnv: ["./tests/integration/jest.setup.ts"],
  transform: {
    ...tsJestTransformCfg,
  },
};