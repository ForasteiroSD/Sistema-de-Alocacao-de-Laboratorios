import express from "express";
import cors from "cors";
import user from "./routes/user";
import labs from "./routes/labs";
import reservas from "./routes/reservas";
import { env } from "./utils/env";

const PORT = env.PORT || 5000;
const app = express();
// const whitelist = [env.ALLOWED_LINKS];
// app.use(cors({
//     origin: (origin, callback) => {
//         if (!origin) {
//             callback(new Error('Origin not defined'));
//         }

//         if (whitelist.includes(String(origin))) {
//             callback(null, origin);
//         } else {
//             callback(new Error('Origin not allowed'));
//         }
//     }
// }));
app.use(cors({credentials: true}));
app.use(express.json({limit: '2mb'}));
app.use(express.urlencoded({ extended: true, limit: "2mb", parameterLimit: 5000 }));


app.listen(PORT, () => {
    console.log("Server Online na porta " + PORT);
});

app.get('/', (req, res) => {
    res.send("Vercel server");
});

app.use("/user", user);

app.use("/lab", labs);
app.use(reservas);

export default app;