import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import mysql from "mysql2/promise";
import { buildDatabaseConnection } from "../server/db.ts";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required to verify the Aiven schema.");

const pool = mysql.createPool(buildDatabaseConnection(process.env.DATABASE_URL));
const db = drizzle({ client: pool });

let exitCode = 0;
try {
  const result = await db.execute(sql`SHOW TABLES`);
  const tableNames = result[0].map(row => Object.values(row)[0]).sort();
  console.log(JSON.stringify(tableNames));
} catch (error) {
  exitCode = 1;
  console.error(error);
} finally {
  await pool.end();
}

process.exit(exitCode);
