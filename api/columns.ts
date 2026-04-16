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
        sql: "SELECT * FROM columns WHERE user_id = ? ORDER BY position ASC",
        args: [userId]
      });
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch columns" });
    }
  }

  if (req.method === "POST") {
    try {
      const { title } = req.body;
      const countResult = await db.execute({
        sql: "SELECT COUNT(*) as c FROM columns WHERE user_id = ?",
        args: [userId]
      });
      const pos = Number(countResult.rows[0].c);

      const result = await db.execute({
        sql: "INSERT INTO columns (title, position, user_id) VALUES (?, ?, ?)",
        args: [title, pos, userId]
      });

      return res.status(201).json({ id: Number(result.lastInsertRowid) });
    } catch (error) {
      return res.status(500).json({ error: "Failed to create column" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
