/* Created by: Bruno Ludolff */
import { db } from "./database";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const server = Bun.serve({
  port: 3030,
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method;

    if (method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // COLUMNS API
    if (url.pathname === "/api/columns" && method === "GET") {
      const columns = db.query("SELECT * FROM columns ORDER BY position ASC").all();
      return Response.json(columns, { headers: CORS_HEADERS });
    }

    if (url.pathname === "/api/columns" && method === "POST") {
      const body = await req.json() as any;
      const count = db.query("SELECT COUNT(*) as c FROM columns").get() as any;
      const result = db.prepare("INSERT INTO columns (title, position) VALUES ($title, $pos)").run({
        $title: body.title,
        $pos: count.c
      });
      return Response.json({ id: result.lastInsertRowid }, { headers: CORS_HEADERS });
    }

    if (url.pathname.startsWith("/api/columns/") && method === "PUT") {
      const id = url.pathname.split("/")[3];
      const body = await req.json() as any;
      db.prepare("UPDATE columns SET title = $title, position = $pos WHERE id = $id").run({
        $id: id,
        $title: body.title,
        $pos: body.position
      });
      return Response.json({ success: true }, { headers: CORS_HEADERS });
    }

    if (url.pathname.startsWith("/api/columns/") && method === "DELETE") {
      const id = url.pathname.split("/")[3];
      db.prepare("DELETE FROM columns WHERE id = $id").run({ $id: id });
      return Response.json({ success: true }, { headers: CORS_HEADERS });
    }

    // TASKS API
    if (url.pathname === "/api/tasks" && method === "GET") {
      const tasks = db.query(`
        SELECT t.*, c.name as category_name, c.emoji as category_emoji
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        ORDER BY t.position ASC
      `).all();
      return Response.json(tasks, { headers: CORS_HEADERS });
    }

    if (url.pathname === "/api/tasks" && method === "POST") {
      const body = await req.json() as any;
      const result = db.prepare(`
        INSERT INTO tasks (title, description, priority, category_id, column_id, position, due_date)
        VALUES ($title, $desc, $priority, $cat, $col, $pos, $date)
      `).run({
        $title: body.title,
        $desc: body.description || "",
        $priority: body.priority || "Média",
        $cat: body.category_id,
        $col: body.column_id,
        $pos: body.position || 0,
        $date: body.due_date
      });
      return Response.json({ id: result.lastInsertRowid }, { headers: CORS_HEADERS });
    }

    if (url.pathname.startsWith("/api/tasks/") && method === "PUT") {
      const id = url.pathname.split("/")[3];
      const body = await req.json() as any;
      
      // Suporte para atualização parcial (drag and drop ou edição)
      const updates: string[] = [];
      const params: any = { $id: id };

      const fields = ["title", "description", "priority", "category_id", "column_id", "position", "due_date"];
      fields.forEach(f => {
        if (body[f] !== undefined) {
          updates.push(`${f} = $${f}`);
          params[`$${f}`] = body[f];
        }
      });

      if (updates.length > 0) {
        db.prepare(`UPDATE tasks SET ${updates.join(", ")} WHERE id = $id`).run(params);
      }
      
      return Response.json({ success: true }, { headers: CORS_HEADERS });
    }

    if (url.pathname.startsWith("/api/tasks/") && method === "DELETE") {
      const id = url.pathname.split("/")[3];
      db.prepare("DELETE FROM tasks WHERE id = $id").run({ $id: id });
      return Response.json({ success: true }, { headers: CORS_HEADERS });
    }

    // CATEGORIES API
    if (url.pathname === "/api/categories" && method === "GET") {
      const categories = db.query("SELECT * FROM categories").all();
      return Response.json(categories, { headers: CORS_HEADERS });
    }

    return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
  },
});

console.log(`Server running on http://localhost:${server.port}`);