import { createClient } from "@libsql/client";

// No Vercel, devemos preencher TURSO_DATABASE_URL em Environment Variables
// Em modo de desenvolvimento local, vai usar o banco SQLite em arquivo.
export const db = createClient({
  url: process.env.TURSO_DATABASE_URL || "file:./kanban.sqlite",
  authToken: process.env.TURSO_AUTH_TOKEN,
});

// A inicialização das tabelas pode rodar sempre que necessário
export async function initDB() {
  await db.execute(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      emoji TEXT
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS columns (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      position INTEGER DEFAULT 0
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS tasks (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      title TEXT NOT NULL,
      description TEXT,
      priority TEXT CHECK(priority IN ('Alta', 'Média', 'Baixa')) DEFAULT 'Média',
      category_id INTEGER,
      column_id INTEGER,
      due_date TEXT,
      position INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id),
      FOREIGN KEY (column_id) REFERENCES columns(id) ON DELETE CASCADE
    )
  `);

  await db.execute(`
    CREATE TABLE IF NOT EXISTS comments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      task_id INTEGER,
      content TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (task_id) REFERENCES tasks(id) ON DELETE CASCADE
    )
  `);
}
