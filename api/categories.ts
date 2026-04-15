import { db } from "./db";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    try {
      const result = await db.execute("SELECT * FROM categories");
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch categories" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
