import path from "path";
import { env } from "./env.js";
let prismaInstance;
if (process.env.DB_PROVIDER === "sqlite") {
    const { PrismaClient } = await import("../generated/sqlite/prisma/client.js");
    const { PrismaBetterSqlite3 } = await import("@prisma/adapter-better-sqlite3");
    const databaseUrlSplit = env.DATABASE_URL.split('file:');
    if (databaseUrlSplit.length < 2) {
        throw new Error("Invalid database url. Expect to be file:DATABASE_URL");
    }
    const databaseName = databaseUrlSplit[1];
    const adapter = new PrismaBetterSqlite3({ url: "file:" + path.resolve(process.cwd(), "prisma/sqlite/" + databaseName) });
    prismaInstance = new PrismaClient({ adapter });
}
else {
    const { PrismaClient } = await import("../generated/postgres/prisma/client.js");
    const { PrismaPg } = await import("@prisma/adapter-pg");
    const pg = (await import("pg")).default;
    const pool = new pg.Pool({ connectionString: env.DATABASE_URL });
    const adapter = new PrismaPg(pool);
    prismaInstance = new PrismaClient({ adapter });
}
export const prisma = prismaInstance;
//# sourceMappingURL=prisma.js.map