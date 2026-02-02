import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { ErrorResponseSchema } from "../validation/default.schema.js";
export const registry = new OpenAPIRegistry();
registry.registerComponent("securitySchemes", "cookieAuth", {
    type: "apiKey",
    in: "cookie",
    name: "jwtToken"
});
registry.register("ErrorResponse", ErrorResponseSchema);
export const errorResponses = {
    400: {
        description: "General error",
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
        },
    },
    401: {
        description: "Not authenticated",
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
        },
    },
    403: {
        description: "Unauthorized",
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
        },
    },
    404: {
        description: "Not found",
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
        },
    },
    409: {
        description: "Conflict",
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
        },
    },
    422: {
        description: "Validation error",
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
        },
    },
    500: {
        description: "Internal server error",
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
        },
    },
    502: {
        description: "External service error",
        content: {
            "application/json": {
                schema: { $ref: "#/components/schemas/ErrorResponse" },
            },
        },
    },
};
//# sourceMappingURL=defaults.openapi.js.map