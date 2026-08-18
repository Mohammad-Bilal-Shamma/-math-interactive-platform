import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";
import { migrate } from "drizzle-orm/mysql2/migrator";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { buildDatabaseConnection } from "../server/db.ts";

const currentDirectory = dirname(fileURLToPath(import.meta.url));
const migrationsFolder = resolve(currentDirectory, "../drizzle");

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is required to migrate the Aiven database.");
}

const pool = mysql.createPool(buildDatabaseConnection(process.env.DATABASE_URL));
const db = drizzle({ client: pool });

let exitCode = 0;
try {
  await migrate(db, { migrationsFolder });
  console.log("Aiven MySQL schema migrations completed successfully.");
} catch (error) {
  exitCode = 1;
  console.error(error);
} finally {
  await pool.end();
}

process.exit(exitCode);
