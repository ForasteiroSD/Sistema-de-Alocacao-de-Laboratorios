import app from "./index.js";
import { env } from "./utils/env.js";
const PORT = env.PORT || 5000;
app.listen(PORT, () => {
    console.log("Server Online na porta " + PORT);
});
export default app;
//# sourceMappingURL=server.js.map