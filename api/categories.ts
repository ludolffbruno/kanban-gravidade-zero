import { db } from "./db.js";
import { verifyToken } from "./utils/auth.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await verifyToken(req);
  if (!userId) {
     return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "GET") {
    try {
      const result = await db.execute({
        sql: "SELECT * FROM categories WHERE user_id IS NULL OR user_id = ?",
        args: [userId]
      });
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch categories" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
