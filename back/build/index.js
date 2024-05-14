"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routes/user"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const whitelist = ['http://localhost:5173']; // lista das urls que podem acessar o back
app.use((0, cors_1.default)({
    origin: function (origin, callback) {
        if (!origin) {
            callback(new Error('No origin set on headers'));
        }
        else if (whitelist.indexOf(origin) !== -1) {
            callback(null, true);
        }
        else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}));
app.listen(3000, "0.0.0.0", () => {
    console.log("Server On");
});
app.use(user_1.default);
