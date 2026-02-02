import { OpenAPIRegistry } from "@asteasolutions/zod-to-openapi";
import { UserCreatedLoginResponse, UserCreateSchema, UserData, UserDataResponse, UserDelete, UserLoginResponse, UserLoginSchema, UserMainPageInfoResponse, UserRespGet, UserRespGetResponse, UsersGet, UsersGetResponse, UserUpdateResponse, UserUpdateSchema } from "../validation/user.schema.js";
import { errorResponses } from "./defaults.openapi.js";
import { defaultResponse, MessageResponseSchema } from "../validation/default.schema.js";
export const registry = new OpenAPIRegistry();
registry.registerPath({
    method: "post",
    path: "/user/login",
    tags: ["User"],
    security: [],
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: UserLoginSchema
                }
            }
        }
    },
    responses: {
        200: {
            description: "Success - User Data",
            content: {
                "application/json": {
                    schema: UserLoginResponse
                }
            }
        },
        201: {
            description: "Success - Created User Data",
            content: {
                "application/json": {
                    schema: UserCreatedLoginResponse
                }
            }
        },
        401: errorResponses[401],
        422: errorResponses[422],
        500: errorResponses[500],
    }
});
registry.registerPath({
    method: "get",
    path: "/user/logout",
    tags: ["User"],
    security: [],
    responses: {
        200: {
            description: "Success",
            content: {
                "application/json": {
                    schema: defaultResponse
                }
            }
        }
    }
});
registry.registerPath({
    method: "patch",
    path: "/user",
    tags: ["User"],
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: UserUpdateSchema
                }
            }
        }
    },
    responses: {
        200: {
            description: "Success",
            content: {
                "application/json": {
                    schema: UserUpdateResponse
                }
            }
        },
        401: errorResponses[401],
        403: errorResponses[403],
        409: errorResponses[409],
        422: errorResponses[422],
        500: errorResponses[500],
    }
});
registry.registerPath({
    method: "delete",
    path: "/user",
    tags: ["User"],
    request: {
        query: UserDelete
    },
    responses: {
        200: {
            description: "Success",
            content: {
                "application/json": {
                    schema: MessageResponseSchema
                }
            }
        },
        400: errorResponses[400],
        401: errorResponses[401],
        403: errorResponses[403],
        404: errorResponses[404],
        422: errorResponses[422],
        500: errorResponses[500],
    }
});
registry.registerPath({
    method: "get",
    path: "/user/responsaveis",
    tags: ["User"],
    request: {
        query: UserRespGet
    },
    responses: {
        200: {
            description: "Success - Responsibles Users Data",
            content: {
                "application/json": {
                    schema: UserRespGetResponse
                }
            }
        },
        422: errorResponses[422],
        500: errorResponses[500],
    }
});
registry.registerPath({
    method: "get",
    path: "/user/data",
    tags: ["User"],
    request: {
        query: UserData
    },
    responses: {
        200: {
            description: "Success - User Data",
            content: {
                "application/json": {
                    schema: UserDataResponse
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
    path: "/user/mainpageinfo",
    tags: ["User"],
    responses: {
        200: {
            description: "Success - User Main Page Info",
            content: {
                "application/json": {
                    schema: UserMainPageInfoResponse
                }
            }
        },
        500: errorResponses[500],
    }
});
registry.registerPath({
    method: "post",
    path: "/user/create",
    tags: ["User"],
    request: {
        body: {
            required: true,
            content: {
                "application/json": {
                    schema: UserCreateSchema
                }
            }
        }
    },
    responses: {
        201: {
            description: "Success",
            content: {
                "application/json": {
                    schema: MessageResponseSchema
                }
            }
        },
        409: errorResponses[409],
        422: errorResponses[422],
        500: errorResponses[500],
    }
});
registry.registerPath({
    method: "get",
    path: "/user/all",
    tags: ["User"],
    request: {
        body: {
            content: {
                "application/json": {
                    schema: UsersGet
                }
            }
        }
    },
    responses: {
        200: {
            description: "Success - Users List",
            content: {
                "application/json": {
                    schema: UsersGetResponse
                }
            }
        },
        422: errorResponses[422],
        500: errorResponses[500],
    }
});
//# sourceMappingURL=user.openapi.js.map