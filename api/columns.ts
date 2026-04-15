import { db } from "./db";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method === "GET") {
    try {
      const result = await db.execute("SELECT * FROM columns ORDER BY position ASC");
      return res.status(200).json(result.rows);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch columns" });
    }
  }

  if (req.method === "POST") {
    try {
      const { title } = req.body;
      const countResult = await db.execute("SELECT COUNT(*) as c FROM columns");
      const pos = Number(countResult.rows[0].c);

      const result = await db.execute({
        sql: "INSERT INTO columns (title, position) VALUES (?, ?)",
        args: [title, pos]
      });

      return res.status(201).json({ id: result.lastInsertRowid });
    } catch (error) {
      return res.status(500).json({ error: "Failed to create column" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
