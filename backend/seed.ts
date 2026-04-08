import { db, initDB } from "./database";

async function seed() {
  // Reset for new schema
  db.run("DROP TABLE IF EXISTS comments");
  db.run("DROP TABLE IF EXISTS tasks");
  db.run("DROP TABLE IF EXISTS columns");
  db.run("DROP TABLE IF EXISTS categories");
  
  initDB();

  // 1. Categorias
  const categories = [
    { name: "Trabalho", emoji: "💼" },
    { name: "Estudo", emoji: "📚" },
    { name: "Pessoal", emoji: "🏠" },
    { name: "Saúde", emoji: "🍎" },
    { name: "Finanças", emoji: "💰" },
  ];

  const insertCategory = db.prepare("INSERT INTO categories (name, emoji) VALUES ($name, $emoji)");
  const categoryIds: number[] = [];
  for (const cat of categories) {
    const result = insertCategory.run({ $name: cat.name, $emoji: cat.emoji });
    categoryIds.push(result.lastInsertRowid as number);
  }

  // 2. Colunas
  const columns = [
    { title: "A Fazer", pos: 0 },
    { title: "Em Progresso", pos: 1 },
    { title: "Concluída", pos: 2 },
  ];

  const insertColumn = db.prepare("INSERT INTO columns (title, position) VALUES ($title, $pos)");
  const columnIds: number[] = [];
  for (const col of columns) {
    const result = insertColumn.run({ $title: col.title, $pos: col.pos });
    columnIds.push(result.lastInsertRowid as number);
  }

  // 3. Tarefas
  const tasks = [
    { title: "Finalizar relatório mensal", desc: "Revisar planilhas e enviar para o financeiro.", priority: "Alta", cat: categoryIds[0], col: columnIds[0], pos: 0, date: "2026-04-15" },
    { title: "Estudar React Query", desc: "Ver documentação oficial e fazer um projeto simples.", priority: "Média", cat: categoryIds[1], col: columnIds[1], pos: 0, date: "2026-04-10" },
    { title: "Comprar suprimentos", desc: "Ir ao mercado comprar frutas e verduras.", priority: "Baixa", cat: categoryIds[2], col: columnIds[2], pos: 0, date: "2026-04-06" },
    { title: "Academia", desc: "Treino de pernas e cardio.", priority: "Alta", cat: categoryIds[3], col: columnIds[0], pos: 1, date: "2026-04-09" },
  ];

  const insertTask = db.prepare(`
    INSERT INTO tasks (title, description, priority, category_id, column_id, position, due_date)
    VALUES ($title, $desc, $priority, $cat, $col, $pos, $date)
  `);

  for (const task of tasks) {
    insertTask.run({
      $title: task.title,
      $desc: task.desc,
      $priority: task.priority,
      $cat: task.cat,
      $col: task.col,
      $pos: task.pos,
      $date: task.date
    });
  }

  console.log("Database seeded successfully with dynamic columns!");
}

seed().catch(console.error);
