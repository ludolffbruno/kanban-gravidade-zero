import { db } from "../db.js";
import { verifyToken } from "../utils/auth.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await verifyToken(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: "ID is required" });
  }

  if (req.method === "PUT") {
    try {
      const { title, position } = req.body;
      await db.execute({
        sql: "UPDATE columns SET title = ?, position = ? WHERE id = ? AND user_id = ?",
        args: [title, position, Number(id), userId]
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to update column" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await db.execute({
        sql: "DELETE FROM columns WHERE id = ? AND user_id = ?",
        args: [Number(id), userId]
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete column" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
