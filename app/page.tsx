import { createClient } from "@/lib/supabase/server";
import { KanbanBoard } from "@/components/kanban-board";
import type { Column, Task, Category } from "@/lib/types";

export const dynamic = "force-dynamic";

export default async function Home() {
  const supabase = await createClient();

  const [columnsRes, tasksRes, categoriesRes] = await Promise.all([
    supabase.from("columns").select("*").order("position"),
    supabase.from("tasks").select("*, category:categories(*)").order("position"),
    supabase.from("categories").select("*"),
  ]);

  const columns = (columnsRes.data || []) as Column[];
  const tasks = (tasksRes.data || []) as Task[];
  const categories = (categoriesRes.data || []) as Category[];

  return (
    <main className="min-h-screen p-6">
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Kanban Gravidade Zero</h1>
        <p className="text-muted-foreground mt-1">Gerencie suas tarefas de forma visual</p>
      </header>
      <KanbanBoard 
        initialColumns={columns} 
        initialTasks={tasks} 
        categories={categories} 
      />
    </main>
  );
}
