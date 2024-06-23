import express from "express";
import cors from "cors";
import user from "./routes/user";
import labs from "./routes/labs";
import reservas from "./routes/reservas";
import { env } from "node:process";

const PORT = process.env.PORT || 5000;
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const whitelist = [env.ALLOWED_LINKS]; // lista das urls que podem acessar o back
app.use(cors({
    origin: function (origin, callback) {
        if(!origin) {
            callback(new Error('No origin set on headers'))
        } else if (whitelist.indexOf(origin) !== -1) {
            callback(null, true)
        } else {
            callback(new Error('Not allowed by CORS'))
        }
    }
}));

export function stringData(data: Date, time: boolean) {
    if (!time) {
        let string_aux1 = '';
        if(data.getUTCDate() < 10) string_aux1 = '0'+(data.getUTCDate());
        else string_aux1 += data.getUTCDate();
        
        let string_aux2 = '';
        if (data.getUTCMonth() < 10) string_aux2 = '0'+(data.getUTCMonth()+1);
        else string_aux2 += (data.getUTCMonth()+1);

        return `${string_aux1}/${string_aux2}/${data.getUTCFullYear()}`;

    } else {
        let string_hora = '';
        if(data.getUTCHours() < 10) string_hora = '0' + data.getUTCHours();
        else string_hora += data.getUTCHours();

        let string_min = '';
        if(data.getUTCMinutes() < 10) string_min = '0' + data.getUTCMinutes();
        else string_min += data.getUTCMinutes();

        return `${string_hora}:${string_min}`;
    }
}

app.listen(PORT, () => {
    console.log("Server Online");
});

app.get('/', (req, res) => {
    res.send("Vercel server");
});

app.use(user);
app.use(labs);
app.use(reservas);

export default app;