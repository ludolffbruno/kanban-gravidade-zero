import { db } from "./db";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    try {
      const result = await db.execute(`
        SELECT t.*, c.name as category_name, c.emoji as category_emoji
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        ORDER BY t.position ASC
      `);
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch tasks" });
    }
  }

  if (req.method === "POST") {
    try {
      const body = req.body;
      const result = await db.execute({
        sql: `
          INSERT INTO tasks (title, description, priority, category_id, column_id, position, due_date)
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          body.title,
          body.description || "",
          body.priority || "Média",
          body.category_id,
          body.column_id,
          body.position || 0,
          body.due_date
        ]
      });

      return res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
      return res.status(500).json({ error: "Failed to create task" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
