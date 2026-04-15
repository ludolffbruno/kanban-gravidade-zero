"use client"

import type { Task } from "@/lib/types"
import { Pencil, Trash2 } from "lucide-react"

interface TaskCardProps {
  task: Task
  onDragStart: () => void
  onEdit: () => void
  onDelete: () => void
}

export function TaskCard({ task, onDragStart, onEdit, onDelete }: TaskCardProps) {
  return (
    <div
      draggable
      onDragStart={onDragStart}
      className="bg-primary p-4 rounded-lg cursor-grab active:cursor-grabbing group hover:ring-2 hover:ring-secondary transition-all"
    >
      <div className="flex items-start justify-between gap-2">
        <h3 className="font-medium text-primary-foreground">{task.title}</h3>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <Pencil className="w-4 h-4 text-muted-foreground" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
            className="p-1 rounded hover:bg-muted transition-colors"
          >
            <Trash2 className="w-4 h-4 text-secondary" />
          </button>
        </div>
      </div>

      {task.description && (
        <p className="mt-2 text-sm text-muted-foreground line-clamp-2">
          {task.description}
        </p>
      )}

      {task.category && (
        <div className="mt-3">
          <span
            className="inline-block px-2 py-1 text-xs font-medium rounded-full"
            style={{
              backgroundColor: task.category.color + "33",
              color: task.category.color,
            }}
          >
            {task.category.name}
          </span>
        </div>
      )}
    </div>
  )
}
