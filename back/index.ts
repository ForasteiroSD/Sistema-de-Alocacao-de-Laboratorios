import express from 'express'
import cors from "cors";
import user from "./routes/user";
import labs from "./routes/labs"

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// const whitelist = ['http://localhost:5173']; // lista das urls que podem acessar o back
// app.use(cors({
//     origin: function (origin, callback) {
//         if(!origin) {
//             callback(new Error('No origin set on headers'))
//         } else if (whitelist.indexOf(origin) !== -1) {
//             callback(null, true)
//         } else {
//             callback(new Error('Not allowed by CORS'))
//         }
//     }
// }));

app.listen(3000, "0.0.0.0", () => {
    console.log("Server Online");
});

app.use(user);
app.use(labs);