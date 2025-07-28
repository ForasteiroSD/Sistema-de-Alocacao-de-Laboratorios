"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routes/user"));
const labs_1 = __importDefault(require("./routes/labs"));
const reservas_1 = __importDefault(require("./routes/reservas"));
const auth_middleware_1 = require("./middlewares/auth_middleware");
const env_1 = require("./utils/env");
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const app = (0, express_1.default)();
const whitelist = env_1.env.ALLOWED_LINKS.split(",");
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        var _a;
        if ((_a = env_1.env.NODE_ENV) === null || _a === void 0 ? void 0 : _a.toLowerCase().includes("test")) {
            return callback(null, true);
        }
        if (!origin) {
            return callback(new Error("Origin not defined"));
        }
        if (whitelist.includes(String(origin))) {
            callback(null, origin);
        }
        else {
            callback(new Error("Origin not allowed"));
        }
    },
    credentials: true
}));
app.use((0, cookie_parser_1.default)());
app.use(express_1.default.json({ limit: "2mb" }));
app.use(express_1.default.urlencoded({ extended: true, limit: "2mb", parameterLimit: 5000 }));
app.get("/", (req, res) => {
    res.send("Vercel server");
});
app.use("/user", user_1.default);
app.use(auth_middleware_1.authenticate);
app.use("/lab", labs_1.default);
app.use(reservas_1.default);
exports.default = app;
