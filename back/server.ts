import app from "./index";
import { env } from "./utils/env"

const PORT = env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server Online na porta " + PORT);
});