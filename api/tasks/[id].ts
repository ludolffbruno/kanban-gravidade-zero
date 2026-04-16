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
      const body = req.body;
      const updates: string[] = [];
      const args: any[] = [];

      const fields = ["title", "description", "priority", "category_id", "column_id", "position", "due_date"];
      fields.forEach(f => {
        if (body[f] !== undefined) {
          updates.push(`${f} = ?`);
          args.push(body[f]);
        }
      });

      if (updates.length > 0) {
        args.push(Number(id));
        args.push(userId);
        await db.execute({
          sql: `UPDATE tasks SET ${updates.join(", ")} WHERE id = ? AND user_id = ?`,
          args: args
        });
      }
      
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to update task" });
    }
  }

  if (req.method === "DELETE") {
    try {
      await db.execute({
        sql: "DELETE FROM tasks WHERE id = ? AND user_id = ?",
        args: [Number(id), userId]
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete task" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
