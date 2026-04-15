"use client";

import type { Task } from "@/lib/types";

interface TaskCardProps {
  task: Task;
  onEdit: () => void;
  onDelete: () => void;
  onDragStart: () => void;
  onDragEnd: () => void;
}

export function TaskCard({ task, onEdit, onDelete, onDragStart, onDragEnd }: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className="bg-primary rounded-lg p-4 cursor-grab active:cursor-grabbing hover:ring-2 hover:ring-accent transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-primary-foreground">{task.title}</h3>
        <div className="flex gap-1">
          <button
            onClick={onEdit}
            className="text-muted-foreground hover:text-accent p-1 transition-colors"
            aria-label="Editar tarefa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
            </svg>
          </button>
          <button
            onClick={onDelete}
            className="text-muted-foreground hover:text-red-500 p-1 transition-colors"
            aria-label="Excluir tarefa"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
            </svg>
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{task.description}</p>
      )}

      {task.category && (
        <span
          className="inline-block mt-3 text-xs px-2 py-1 rounded-full text-white"
          style={{ backgroundColor: task.category.color }}
        >
          {task.category.name}
        </span>
      )}
    </div>
  );
}
