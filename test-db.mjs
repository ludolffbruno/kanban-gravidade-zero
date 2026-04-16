import { createClient } from "@libsql/client";
import dotenv from "dotenv";
dotenv.config({path: ".env.local"});
const db = createClient({url: process.env.TURSO_DATABASE_URL, authToken: process.env.TURSO_AUTH_TOKEN});
async function test() {
  const users = await db.execute("SELECT DISTINCT user_id FROM columns");
  console.log("Users configured in columns:", users.rows);
  const categories = await db.execute("SELECT * FROM categories");
  console.log("Categories:", categories.rows);
}
test();
