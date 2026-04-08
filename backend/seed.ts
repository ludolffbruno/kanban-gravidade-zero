import { db, initDB } from "./database";

async function seed() {
  initDB();

  // Seed Categories
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

  // Seed Tasks
  const tasks = [
    { title: "Finalizar relatório mensal", desc: "Revisar planilhas e enviar para o financeiro.", priority: "Alta", cat: categoryIds[0], status: "todo", date: "2026-04-15" },
    { title: "Estudar React Query", desc: "Ver documentação oficial e fazer um projeto simples.", priority: "Média", cat: categoryIds[1], status: "in_progress", date: "2026-04-10" },
    { title: "Comprar suprimentos", desc: "Ir ao mercado comprar frutas e verduras.", priority: "Baixa", cat: categoryIds[2], status: "done", date: "2026-04-06" },
    { title: "Academia - Treino A", desc: "Focar em peito e tríceps.", priority: "Média", cat: categoryIds[3], status: "todo", date: "2026-04-08" },
    { title: "Pagar aluguel", desc: "Boleto disponível no portal da imobiliária.", priority: "Alta", cat: categoryIds[4], status: "todo", date: "2026-04-10" },
    { title: "Organizar mesa de trabalho", desc: "Limpar o pó e organizar os cabos.", priority: "Baixa", cat: categoryIds[2], status: "in_progress", date: "2026-04-07" },
    { title: "Ler capítulo 4 de Clean Architecture", desc: "Anotar pontos principais sobre SOLID.", priority: "Média", cat: categoryIds[1], status: "todo", date: "2026-04-12" },
    { title: "Planejar viagem de férias", desc: "Pesquisar hotéis e passagens para o final do ano.", priority: "Baixa", cat: categoryIds[2], status: "todo", date: "2026-05-01" },
    { title: "Call com cliente X", desc: "Apresentar protótipo inicial do projeto Stitch.", priority: "Alta", cat: categoryIds[0], status: "in_progress", date: "2026-04-08" },
    { title: "Meditacão diária", desc: "10 minutos de foco na respiração.", priority: "Média", cat: categoryIds[3], status: "done", date: "2026-04-07" },
  ];

  const insertTask = db.prepare("INSERT INTO tasks (title, description, priority, category_id, status, due_date) VALUES ($title, $desc, $priority, $cat, $status, $date)");

  for (const task of tasks) {
    insertTask.run({
      $title: task.title,
      $desc: task.desc,
      $priority: task.priority,
      $cat: task.cat,
      $status: task.status,
      $date: task.date
    });
  }

  console.log("Database seeded successfully with 10 tasks!");
}

seed().catch(console.error);
