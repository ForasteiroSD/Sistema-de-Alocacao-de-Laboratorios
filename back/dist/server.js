"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = __importDefault(require("./index"));
const env_1 = require("./utils/env");
const PORT = env_1.env.PORT || 5000;
index_1.default.listen(PORT, () => {
    console.log("Server Online na porta " + PORT);
});
exports.default = index_1.default;
