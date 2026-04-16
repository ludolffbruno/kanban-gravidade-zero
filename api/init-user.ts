import { db } from "./db.js";
import { verifyToken } from "./utils/auth.js";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  const userId = await verifyToken(req);
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (req.method === "POST") {
    try {
      // 1. Check if user already has columns
      const existing = await db.execute({
        sql: "SELECT id FROM columns WHERE user_id = ? LIMIT 1",
        args: [userId]
      });

      if (existing.rows.length > 0) {
        return res.status(200).json({ message: "User already initialized", initialized: false });
      }

      // 2. Insert Default Columns
      const colData = ["A Fazer", "Em Progresso", "Concluído"];
      const colIds: number[] = [];
      for (let i = 0; i < colData.length; i++) {
        const result = await db.execute({
          sql: "INSERT INTO columns (title, position, user_id) VALUES (?, ?, ?)",
          args: [colData[i], i, userId]
        });
        colIds.push(Number(result.lastInsertRowid));
      }

      // 3. Insert Example Tasks
      const catsResult = await db.execute("SELECT id, name FROM categories WHERE user_id IS NULL");
      const catMap: Record<string, number> = {};
      catsResult.rows.forEach(r => {
        catMap[String(r.name)] = Number(r.id);
      });

      const examples = [
        { title: "Finalizar relatório Semanal", col: colIds[0], cat: catMap["Trabalho"] || null, priority: "Alta", pos: 0 },
        { title: "Estudar React e TypeScript", col: colIds[0], cat: catMap["Estudo"] || null, priority: "Média", pos: 1 },
        { title: "Ir à academia", col: colIds[1], cat: catMap["Saúde"] || null, priority: "Baixa", pos: 0 },
        { title: "Organizar finanças", col: colIds[2], cat: catMap["Finanças"] || null, priority: "Média", pos: 0 },
      ];

      for (const t of examples) {
        await db.execute({
          sql: `INSERT INTO tasks (title, description, priority, category_id, column_id, position, user_id) 
                VALUES (?, ?, ?, ?, ?, ?, ?)`,
          args: [t.title, "Tarefa de exemplo para você começar!", t.priority, t.cat, t.col, t.pos, userId]
        });
      }

      return res.status(200).json({ success: true, initialized: true });
    } catch (error) {
      console.error("Initialization error:", error);
      return res.status(500).json({ error: "Failed to initialize user board" });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
