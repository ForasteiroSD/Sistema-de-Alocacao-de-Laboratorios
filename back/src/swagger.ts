import { OpenApiGeneratorV3 } from "@asteasolutions/zod-to-openapi";
import { openApiDefinitions } from "./utils/openapi/index.openapi.js";
import { env } from "./utils/env.js";

export const openApiDocument = new OpenApiGeneratorV3(openApiDefinitions).generateDocument({
    openapi: "3.0.0",
    info: {
        title: "LabHub API",
        version: "1.0.0",
    },
    servers: [
        { url: "http://localhost:" + env.PORT },
    ],
    security: [{ cookieAuth: [] }],
});
