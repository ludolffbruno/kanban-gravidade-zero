"use client"

import type { KanbanColumn, Task } from "@/lib/types"
import { TaskCard } from "./task-card"
import { Plus } from "lucide-react"

interface KanbanColumnProps {
  column: KanbanColumn
  onDragStart: (task: Task) => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
  onAddTask: () => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: number) => void
}

export function KanbanColumnComponent({
  column,
  onDragStart,
  onDragOver,
  onDrop,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  return (
    <div
      className="flex-shrink-0 w-80 bg-card rounded-xl p-4"
      onDragOver={onDragOver}
      onDrop={onDrop}
    >
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-card-foreground">
          {column.name}
        </h2>
        <span className="bg-muted text-muted-foreground text-sm px-2 py-1 rounded-full">
          {column.tasks.length}
        </span>
      </div>

      <div className="space-y-3 min-h-[200px]">
        {column.tasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDragStart={() => onDragStart(task)}
            onEdit={() => onEditTask(task)}
            onDelete={() => onDeleteTask(task.id)}
          />
        ))}
      </div>

      <button
        onClick={onAddTask}
        className="mt-4 w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg border-2 border-dashed border-border text-muted-foreground hover:border-secondary hover:text-secondary transition-colors"
      >
        <Plus className="w-4 h-4" />
        Adicionar Tarefa
      </button>
    </div>
  )
}
