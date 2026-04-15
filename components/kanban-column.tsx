"use client";

import { TaskCard } from "./task-card";
import type { Column, Task } from "@/lib/types";

interface KanbanColumnProps {
  column: Column;
  tasks: Task[];
  onAddTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: number) => void;
  onDragStart: (task: Task) => void;
  onDragEnd: () => void;
  onDrop: () => void;
  isDragOver: boolean;
}

export function KanbanColumn({
  column,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragOver,
}: KanbanColumnProps) {
  return (
    <div
      className={`flex-shrink-0 w-80 bg-card rounded-lg p-4 transition-all ${
        isDragOver ? "ring-2 ring-accent ring-opacity-50" : ""
      }`}
      onDragOver={(e) => e.preventDefault()}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-semibold text-card-foreground">{column.name}</h2>
        <span className="text-sm text-muted-foreground bg-muted px-2 py-1 rounded">
          {tasks.length}
        </span>
      </div>

      <div className="space-y-3 min-h-[200px]">
        {tasks
          .sort((a, b) => a.position - b.position)
          .map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={() => onEditTask(task)}
              onDelete={() => onDeleteTask(task.id)}
              onDragStart={() => onDragStart(task)}
              onDragEnd={onDragEnd}
            />
          ))}
      </div>

      <button
        onClick={onAddTask}
        className="w-full mt-4 py-2 px-4 border-2 border-dashed border-border rounded-lg text-muted-foreground hover:border-accent hover:text-accent transition-colors"
      >
        + Adicionar tarefa
      </button>
    </div>
  );
}
