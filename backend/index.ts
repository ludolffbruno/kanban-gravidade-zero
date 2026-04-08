import { db } from "./database";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

const server = Bun.serve({
  port: 3001,
  async fetch(req) {
    const url = new URL(req.url);
    const method = req.method;

    // Handle CORS preflight
    if (method === "OPTIONS") {
      return new Response(null, { headers: CORS_HEADERS });
    }

    // GET /api/tasks
    if (url.pathname === "/api/tasks" && method === "GET") {
      const tasks = db.query(`
        SELECT t.*, c.name as category_name, c.emoji as category_emoji
        FROM tasks t
        LEFT JOIN categories c ON t.category_id = c.id
        ORDER BY t.created_at DESC
      `).all();
      return Response.json(tasks, { headers: CORS_HEADERS });
    }

    // GET /api/categories
    if (url.pathname === "/api/categories" && method === "GET") {
      const categories = db.query("SELECT * FROM categories").all();
      return Response.json(categories, { headers: CORS_HEADERS });
    }

    // POST /api/tasks
    if (url.pathname === "/api/tasks" && method === "POST") {
      const body = await req.json();
      const result = db.prepare(`
        INSERT INTO tasks (title, description, priority, category_id, status, due_date)
        VALUES ($title, $desc, $priority, $cat, $status, $date)
      `).run({
        $title: body.title,
        $desc: body.description || "",
        $priority: body.priority || "Média",
        $cat: body.category_id,
        $status: body.status || "todo",
        $date: body.due_date
      });
      return Response.json({ id: result.lastInsertRowid }, { headers: CORS_HEADERS });
    }

    // PUT /api/tasks/:id
    if (url.pathname.startsWith("/api/tasks/") && method === "PUT") {
      const id = url.pathname.split("/")[3];
      const body = await req.json();
      db.prepare(`
        UPDATE tasks SET 
          title = COALESCE($title, title),
          description = COALESCE($desc, description),
          priority = COALESCE($priority, priority),
          category_id = COALESCE($cat, category_id),
          status = COALESCE($status, status),
          due_date = COALESCE($date, due_date)
        WHERE id = $id
      `).run({
        $id: id,
        $title: body.title,
        $desc: body.description,
        $priority: body.priority,
        $cat: body.category_id,
        $status: body.status,
        $date: body.due_date
      });
      return Response.json({ success: true }, { headers: CORS_HEADERS });
    }

    // DELETE /api/tasks/:id
    if (url.pathname.startsWith("/api/tasks/") && method === "DELETE") {
      const id = url.pathname.split("/")[3];
      db.prepare("DELETE FROM tasks WHERE id = $id").run({ $id: id });
      return Response.json({ success: true }, { headers: CORS_HEADERS });
    }

    // GET /api/tasks/:id/comments
    if (url.pathname.endsWith("/comments") && method === "GET") {
      const id = url.pathname.split("/")[3];
      const comments = db.query("SELECT * FROM comments WHERE task_id = $id ORDER BY created_at ASC").all({ $id: id });
      return Response.json(comments, { headers: CORS_HEADERS });
    }

    // POST /api/tasks/:id/comments
    if (url.pathname.endsWith("/comments") && method === "POST") {
      const id = url.pathname.split("/")[3];
      const body = await req.json();
      db.prepare("INSERT INTO comments (task_id, content) VALUES ($id, $content)").run({
        $id: id,
        $content: body.content
      });
      return Response.json({ success: true }, { headers: CORS_HEADERS });
    }

    return new Response("Not Found", { status: 404, headers: CORS_HEADERS });
  },
});

console.log(`Server running on http://localhost:${server.port}`);