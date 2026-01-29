import { execSync } from "child_process";
import fs from "fs";
import path from "path";

export default async function globalSetup() {
    const testDbPath = path.resolve(process.cwd(), "prisma/sqlite/test.db");

    if (fs.existsSync(testDbPath)) {
        try {
            fs.unlinkSync(testDbPath);
        } catch (e) {
            console.warn("Could not delete old test DB.");
        }
    }

    console.log("Running migrations on test database...");
    execSync("npx prisma migrate deploy --schema=prisma/sqlite/schema.prisma", { stdio: "inherit" });

    return async () => {
        const testDbPath = path.resolve(process.cwd(), "prisma/sqlite/test.db");

        if (fs.existsSync(testDbPath)) {
            try {
                console.log("\nDeleting test database");
                fs.unlinkSync(testDbPath);
            } catch (e) {
                console.error("Failed to delete test database file. It might still be locked by a process.", e);
            }
        }
    }
}