import { createClient } from "@libsql/client";

const remoteDb = createClient({ 
    url: process.env.TURSO_DATABASE_URL, 
    authToken: process.env.TURSO_AUTH_TOKEN 
});

async function migrate() {
    console.log("Adding user_id column to tables...");
    const tables = ["categories", "columns", "tasks"];
    
    for (const table of tables) {
        try {
            await remoteDb.execute(`ALTER TABLE ${table} ADD COLUMN user_id TEXT`);
            console.log(`Added user_id to ${table}`);
        } catch (e) {
            if (e.message.includes("duplicate column name")) {
                console.log(`Column user_id already exists in ${table}`);
            } else {
                console.error(`Failed to alter table ${table}:`, e.message);
            }
        }
    }

    // Add indexes for parity/performance if possible
    try {
        await remoteDb.execute("CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id)");
        await remoteDb.execute("CREATE INDEX IF NOT EXISTS idx_columns_user_id ON columns(user_id)");
        console.log("Indexes created.");
    } catch (e) {
        console.error("Index creation failed:", e.message);
    }
}

migrate();
