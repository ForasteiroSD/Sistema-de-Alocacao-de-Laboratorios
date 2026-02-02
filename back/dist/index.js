import express from "express";
import cors from "cors";
import swaggerUi from "swagger-ui-express";
import user from "./routes/user.routes.js";
import labs from "./routes/labs.routes.js";
import reservas from "./routes/reserves.routes.js";
import { authenticate } from "./middlewares/auth_middleware.js";
import { env } from "./utils/env.js";
import cookieParser from "cookie-parser";
import { openApiDocument } from "./swagger.js";
const app = express();
const whitelist = env.ALLOWED_LINKS.split(",");
app.use(cors({
    origin: (origin, callback) => {
        if (env.NODE_ENV?.toLowerCase().includes("test")) {
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
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(express.urlencoded({ extended: true, limit: "2mb", parameterLimit: 5000 }));
app.get("/", (req, res) => {
    res.send("Vercel server");
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(openApiDocument));
app.use("/user", user);
app.use(authenticate);
app.use("/lab", labs);
app.use(reservas);
export default app;
//# sourceMappingURL=index.js.map