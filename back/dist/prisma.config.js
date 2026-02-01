import { env } from "./utils/env.js";
import { defineConfig } from "prisma/config";
const directory = env.DB_PROVIDER === 'pg' ? "postgres" : "sqlite";
export default defineConfig({
    schema: `prisma/${directory}/schema.prisma`,
    migrations: {
        path: `prisma/${directory}/migrations`,
    },
    datasource: {
        url: env.DATABASE_URL,
    },
});
//# sourceMappingURL=prisma.config.js.map