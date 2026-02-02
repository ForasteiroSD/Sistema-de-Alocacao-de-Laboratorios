import { registry as defaults } from "./defaults.openapi.js";
import { registry as user } from "./user.openapi.js";
import { registry as lab } from "./lab.openapi.js";
import { registry as reserve } from "./reserve.openapi.js";

export const openApiDefinitions = [
    ...defaults.definitions,
    ...user.definitions,
    ...lab.definitions,
    ...reserve.definitions,
];