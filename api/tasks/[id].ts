import { db } from "../db";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
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
        args.push(Number(id)); // add id for WHERE clause
        await db.execute({
          sql: `UPDATE tasks SET ${updates.join(", ")} WHERE id = ?`,
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
        sql: "DELETE FROM tasks WHERE id = ?",
        args: [Number(id)]
      });
      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to delete task" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
