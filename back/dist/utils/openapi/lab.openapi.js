import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { LabCreate, LabDataResponse, LabNames, LabReserves, LabReservesResponse, LabsGet, LabsGetResponse, LabsNamesResponse, LabUpdateSchema } from "../validation/lab.schema.js";
import { MessageResponseSchema, nomeSchema } from "../validation/default.schema.js";
import { errorResponses } from "./defaults.openapi.js";
export const registry = new OpenAPIRegistry();
registry.registerPath({
    method: "post",
    path: "/lab",
    tags: ["Labs"],
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: LabCreate
                }
            }
        }
    },
    responses: {
        201: {
            description: "Success - Created Message",
            content: {
                "application/json": {
                    schema: MessageResponseSchema
                }
            }
        },
        400: errorResponses[400],
        403: errorResponses[403],
        404: errorResponses[404],
        409: errorResponses[409],
        422: errorResponses[422],
        500: errorResponses[500],
    }
});
registry.registerPath({
    method: "patch",
    path: "/lab",
    tags: ["Labs"],
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: LabUpdateSchema
                }
            }
        }
    },
    responses: {
        200: {
            description: "Success - Updated Message",
            content: {
                "application/json": {
                    schema: MessageResponseSchema
                }
            }
        },
        403: errorResponses[403],
        404: errorResponses[404],
        422: errorResponses[422],
        500: errorResponses[500],
    }
});
registry.registerPath({
    method: "get",
    path: "/lab/all",
    tags: ["Labs"],
    request: {
        query: LabsGet
    },
    responses: {
        200: {
            description: "Success - Labs List",
            content: {
                "application/json": {
                    schema: LabsGetResponse
                }
            }
        },
        422: errorResponses[422],
        500: errorResponses[500],
    }
});
registry.registerPath({
    method: "get",
    path: "/lab",
    tags: ["Labs"],
    request: {
        query: nomeSchema
    },
    responses: {
        200: {
            description: "Success - Lab Data",
            content: {
                "application/json": {
                    schema: LabDataResponse
                }
            }
        },
        404: errorResponses[404],
        422: errorResponses[422],
        500: errorResponses[500],
    }
});
registry.registerPath({
    method: "get",
    path: "/lab/user",
    tags: ["Labs"],
    request: {
        query: LabNames
    },
    responses: {
        200: {
            description: "Success - Labs Names From User",
            content: {
                "application/json": {
                    schema: LabsNamesResponse
                }
            }
        },
        422: errorResponses[422],
        500: errorResponses[500],
    }
});
registry.registerPath({
    method: "get",
    path: "/lab/reservasdia",
    tags: ["Labs"],
    request: {
        query: LabReserves
    },
    responses: {
        200: {
            description: "Success - Reserves on Lab on Given Date",
            content: {
                "application/json": {
                    schema: LabReservesResponse
                }
            }
        },
        404: errorResponses[404],
        422: errorResponses[422],
        500: errorResponses[500],
    }
});
//# sourceMappingURL=lab.openapi.js.map