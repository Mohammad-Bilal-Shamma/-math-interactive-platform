import { sql } from "drizzle-orm";
import { getDb } from "../server/db.ts";

const db = await getDb();
if (!db) throw new Error("DATABASE_URL is required to repair the Aiven migration state.");

await db.execute(sql`ALTER TABLE learning_lessons DROP COLUMN summary`);
console.log("Removed the empty summary column created by the interrupted migration.");
