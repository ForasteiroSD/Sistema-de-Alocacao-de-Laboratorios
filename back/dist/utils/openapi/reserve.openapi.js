import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { ReserveDataResponse, ReserveInsert, ReserveRemove, Reserves, ReservesRespLab, ReservesRespLabResponse, ReservesResponse } from "../validation/reserve.schema.js";
import { idSchema, MessageResponseSchema } from "../validation/default.schema.js";
import { errorResponses } from "./defaults.openapi.js";
export const registry = new OpenAPIRegistry();
registry.registerPath({
    method: "post",
    path: "/reserva",
    tags: ["Reserves"],
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: ReserveInsert
                }
            }
        }
    },
    responses: {
        200: {
            description: "Success - Created Message",
            content: {
                "application/json": {
                    schema: MessageResponseSchema
                }
            }
        },
        404: errorResponses[404],
        409: errorResponses[409],
        422: errorResponses[422],
        500: errorResponses[500]
    }
});
registry.registerPath({
    method: "get",
    path: "/reservas/lab",
    tags: ["Reserves"],
    request: {
        query: ReservesRespLab
    },
    responses: {
        200: {
            description: "Success - Reserves On User Labs",
            content: {
                "application/json": {
                    schema: ReservesRespLabResponse
                }
            }
        },
        422: errorResponses[422],
        500: errorResponses[500]
    }
});
registry.registerPath({
    method: "get",
    path: "/reservas",
    tags: ["Reserves"],
    request: {
        query: Reserves
    },
    responses: {
        200: {
            description: "Success - Reserves List",
            content: {
                "application/json": {
                    schema: ReservesResponse
                }
            }
        },
        422: errorResponses[422],
        500: errorResponses[500]
    }
});
registry.registerPath({
    method: "get",
    path: "/reserva",
    tags: ["Reserves"],
    request: {
        query: idSchema
    },
    responses: {
        200: {
            description: "Success - Reserve Data",
            content: {
                "application/json": {
                    schema: ReserveDataResponse
                }
            }
        },
        403: errorResponses[403],
        404: errorResponses[404],
        422: errorResponses[422],
        500: errorResponses[500]
    }
});
registry.registerPath({
    method: "delete",
    path: "/minhareserva",
    tags: ["Reserves"],
    request: {
        query: ReserveRemove
    },
    responses: {
        200: {
            description: "Success - Deleted Message",
            content: {
                "application/json": {
                    schema: MessageResponseSchema
                }
            }
        },
        404: errorResponses[404],
        422: errorResponses[422],
        500: errorResponses[500]
    }
});
registry.registerPath({
    method: "delete",
    path: "/reserva",
    tags: ["Reserves"],
    request: {
        query: ReserveRemove
    },
    responses: {
        200: {
            description: "Success - Deleted Message",
            content: {
                "application/json": {
                    schema: MessageResponseSchema
                }
            }
        },
        400: errorResponses[400],
        403: errorResponses[403],
        404: errorResponses[404],
        422: errorResponses[422],
        500: errorResponses[500]
    }
});
//# sourceMappingURL=reserve.openapi.js.map