"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringData = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const user_1 = __importDefault(require("./routes/user"));
const labs_1 = __importDefault(require("./routes/labs"));
const reservas_1 = __importDefault(require("./routes/reservas"));
const node_process_1 = require("node:process");
const PORT = process.env.PORT || 5000;
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
const whitelist = [node_process_1.env.ALLOWED_LINKS]; // lista das urls que podem acessar o back
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
function stringData(data, time) {
    if (!time) {
        let string_aux1 = '';
        if (data.getUTCDate() < 10)
            string_aux1 = '0' + (data.getUTCDate());
        else
            string_aux1 += data.getUTCDate();
        let string_aux2 = '';
        if (data.getUTCMonth() < 10)
            string_aux2 = '0' + (data.getUTCMonth() + 1);
        else
            string_aux2 += (data.getUTCMonth() + 1);
        return `${string_aux1}/${string_aux2}/${data.getUTCFullYear()}`;
    }
    else {
        let string_hora = '';
        if (data.getUTCHours() < 10)
            string_hora = '0' + data.getUTCHours();
        else
            string_hora += data.getUTCHours();
        let string_min = '';
        if (data.getUTCMinutes() < 10)
            string_min = '0' + data.getUTCMinutes();
        else
            string_min += data.getUTCMinutes();
        return `${string_hora}:${string_min}`;
    }
}
exports.stringData = stringData;
app.listen(PORT, () => {
    console.log("Server Online");
});
app.get('/', (req, res) => {
    res.send("Vercel server");
});
app.use(user_1.default);
app.use(labs_1.default);
app.use(reservas_1.default);
exports.default = app;
