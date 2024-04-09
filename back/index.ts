import { Request, Response } from 'express'

import express from 'express'
const cors = require("cors");
const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended: true}));

app.listen(3000, "0.0.0.0", () => {
    console.log("Server On");
})

app.get('/reservar', async(req: Request, res: Response) => {
    res.send('Alo');
});