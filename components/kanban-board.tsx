"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { createClient } from "@/lib/supabase/client";
import { KanbanColumn } from "./kanban-column";
import { TaskModal } from "./task-modal";
import type { Column, Task, Category, TaskFormData } from "@/lib/types";

interface KanbanBoardProps {
  initialColumns: Column[];
  initialTasks: Task[];
  categories: Category[];
}

const fetcher = async (key: string) => {
  const supabase = createClient();
  if (key === "tasks") {
    const { data } = await supabase
      .from("tasks")
      .select("*, category:categories(*)")
      .order("position");
    return data || [];
  }
  return [];
};

export function KanbanBoard({ initialColumns, initialTasks, categories }: KanbanBoardProps) {
  const [columns] = useState<Column[]>(initialColumns);
  const { data: tasks = initialTasks } = useSWR<Task[]>("tasks", fetcher, {
    fallbackData: initialTasks,
    revalidateOnFocus: false,
  });
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedColumnId, setSelectedColumnId] = useState<number | null>(null);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);

  const supabase = createClient();

  const handleAddTask = (columnId: number) => {
    setSelectedColumnId(columnId);
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setSelectedColumnId(task.column_id);
    setIsModalOpen(true);
  };

  const handleSaveTask = async (formData: TaskFormData) => {
    if (editingTask) {
      await supabase
        .from("tasks")
        .update({
          title: formData.title,
          description: formData.description || null,
          category_id: formData.category_id,
        })
        .eq("id", editingTask.id);
    } else if (selectedColumnId) {
      const maxPosition = tasks
        .filter((t) => t.column_id === selectedColumnId)
        .reduce((max, t) => Math.max(max, t.position), 0);

      await supabase.from("tasks").insert({
        title: formData.title,
        description: formData.description || null,
        column_id: selectedColumnId,
        category_id: formData.category_id,
        position: maxPosition + 1,
      });
    }
    mutate("tasks");
    setIsModalOpen(false);
  };

  const handleDeleteTask = async (taskId: number) => {
    await supabase.from("tasks").delete().eq("id", taskId);
    mutate("tasks");
  };

  const handleDragStart = (task: Task) => {
    setDraggedTask(task);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const handleDrop = async (columnId: number) => {
    if (!draggedTask || draggedTask.column_id === columnId) return;

    const maxPosition = tasks
      .filter((t) => t.column_id === columnId)
      .reduce((max, t) => Math.max(max, t.position), 0);

    await supabase
      .from("tasks")
      .update({ column_id: columnId, position: maxPosition + 1 })
      .eq("id", draggedTask.id);

    mutate("tasks");
    setDraggedTask(null);
  };

  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumn
            key={column.id}
            column={column}
            tasks={tasks.filter((t) => t.column_id === column.id)}
            onAddTask={() => handleAddTask(column.id)}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onDrop={() => handleDrop(column.id)}
            isDragOver={draggedTask !== null && draggedTask.column_id !== column.id}
          />
        ))}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveTask}
        task={editingTask}
        categories={categories}
      />
    </>
  );
}
