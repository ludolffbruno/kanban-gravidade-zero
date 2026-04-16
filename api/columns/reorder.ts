import { db } from "../db.js";
import { verifyToken } from "../utils/auth.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await verifyToken(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    try {
      const { columnOrders } = req.body; // Array of { id: number, position: number }

      for (const col of columnOrders) {
        await db.execute({
          sql: "UPDATE columns SET position = ? WHERE id = ? AND user_id = ?",
          args: [col.position, col.id, userId]
        });
      }

      return res.status(200).json({ success: true });
    } catch (error) {
      return res.status(500).json({ error: "Failed to reorder columns" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
