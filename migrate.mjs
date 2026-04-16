import { createClient } from "@libsql/client";


const localDb = createClient({ url: "file:./db/kanban.sqlite" });
const remoteDb = createClient({ 
    url: process.env.TURSO_DATABASE_URL, 
    authToken: process.env.TURSO_AUTH_TOKEN 
});

async function migrate() {
    console.log("Starting migration from local to Turso...");
    try {
        // Fetch local data
        const categories = await localDb.execute("SELECT * FROM categories");
        const columns = await localDb.execute("SELECT * FROM columns");
        const tasks = await localDb.execute("SELECT * FROM tasks");

        console.log(`Found ${categories.rows.length} categories, ${columns.rows.length} columns, ${tasks.rows.length} tasks locally.`);

        // Clear remote
        console.log("Clearing remote database...");
        await remoteDb.execute("DELETE FROM comments");
        await remoteDb.execute("DELETE FROM tasks");
        await remoteDb.execute("DELETE FROM columns");
        await remoteDb.execute("DELETE FROM categories");
        await remoteDb.execute("DELETE FROM sqlite_sequence");

        // Insert categories
        console.log("Inserting categories...");
        for (const cat of categories.rows) {
            await remoteDb.execute({
                sql: "INSERT INTO categories (id, name, emoji) VALUES (?, ?, ?)",
                args: [cat.id, cat.name, cat.emoji]
            });
        }

        // Insert columns
        console.log("Inserting columns...");
        for (const col of columns.rows) {
            await remoteDb.execute({
                sql: "INSERT INTO columns (id, title, position) VALUES (?, ?, ?)",
                args: [col.id, col.title, col.position]
            });
        }

        // Insert tasks
        console.log("Inserting tasks...");
        for (const task of tasks.rows) {
            await remoteDb.execute({
                sql: "INSERT INTO tasks (id, title, description, priority, category_id, column_id, due_date, position, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
                args: [task.id, task.title, task.description, task.priority, task.category_id, task.column_id, task.due_date, task.position, task.created_at]
            });
        }

        console.log("Migration completed successfully!");
    } catch (e) {
        console.error("Migration failed:", e);
    }
}

migrate();
