import { db, initDB } from "./db";
import type { VercelRequest, VercelResponse } from "@vercel/node";

export default async function handler(req: VercelRequest, res: VercelResponse) {
  // ATENÇÃO: Em produção, você deve proteger essa rota ou excluí-la após usar
  if (req.method === "GET" || req.method === "POST") {
    try {
      // Cria as tabelas se não existirem
      await initDB();

      // Verifica se já existem categorias
      const catCount = await db.execute("SELECT COUNT(*) as c FROM categories");
      if (Number(catCount.rows[0].c) === 0) {
        const categories = [
          { name: "Trabalho", emoji: "💼" },
          { name: "Estudo", emoji: "📚" },
          { name: "Pessoal", emoji: "🏠" },
          { name: "Saúde", emoji: "🏃" },
          { name: "Finanças", emoji: "💰" }
        ];

        for (const cat of categories) {
          await db.execute({
            sql: "INSERT INTO categories (name, emoji) VALUES (?, ?)",
            args: [cat.name, cat.emoji]
          });
        }
      }

      // Verifica se já existem colunas
      const colCount = await db.execute("SELECT COUNT(*) as c FROM columns");
      if (Number(colCount.rows[0].c) === 0) {
        const columns = [
          { title: "A Fazer", position: 0 },
          { title: "Em Progresso", position: 1 },
          { title: "Concluída", position: 2 }
        ];

        for (const col of columns) {
          await db.execute({
            sql: "INSERT INTO columns (title, position) VALUES (?, ?)",
            args: [col.title, col.position]
          });
        }
      }

      return res.status(200).json({ success: true, message: "Database seeded successfully" });
    } catch (error: any) {
      return res.status(500).json({ error: "Failed to seed database", details: error.message });
    }
  }

  return res.status(405).json({ error: "Method not allowed" });
}
