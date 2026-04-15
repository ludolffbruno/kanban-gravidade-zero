"use client"

import { useState, useCallback } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Category, Column, Task, KanbanColumn } from "@/lib/types"
import { KanbanColumnComponent } from "./kanban-column"
import { TaskModal } from "./task-modal"

interface KanbanBoardProps {
  initialColumns: Column[]
  initialTasks: Task[]
  categories: Category[]
}

export function KanbanBoard({ initialColumns, initialTasks, categories }: KanbanBoardProps) {
  const supabase = createClient()
  
  const [columns, setColumns] = useState<KanbanColumn[]>(() => {
    return initialColumns.map((col) => ({
      ...col,
      tasks: initialTasks.filter((task) => task.column_id === col.id),
    }))
  })

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [targetColumnId, setTargetColumnId] = useState<number | null>(null)
  const [draggedTask, setDraggedTask] = useState<Task | null>(null)

  const handleDragStart = useCallback((task: Task) => {
    setDraggedTask(task)
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDrop = useCallback(async (columnId: number) => {
    if (!draggedTask || draggedTask.column_id === columnId) {
      setDraggedTask(null)
      return
    }

    const newColumns = columns.map((col) => {
      if (col.id === draggedTask.column_id) {
        return {
          ...col,
          tasks: col.tasks.filter((t) => t.id !== draggedTask.id),
        }
      }
      if (col.id === columnId) {
        const updatedTask = { ...draggedTask, column_id: columnId }
        return {
          ...col,
          tasks: [...col.tasks, updatedTask],
        }
      }
      return col
    })

    setColumns(newColumns)
    setDraggedTask(null)

    await supabase
      .from("tasks")
      .update({ column_id: columnId })
      .eq("id", draggedTask.id)
  }, [draggedTask, columns, supabase])

  const handleAddTask = useCallback((columnId: number) => {
    setTargetColumnId(columnId)
    setEditingTask(null)
    setIsModalOpen(true)
  }, [])

  const handleEditTask = useCallback((task: Task) => {
    setEditingTask(task)
    setTargetColumnId(task.column_id)
    setIsModalOpen(true)
  }, [])

  const handleSaveTask = useCallback(async (taskData: {
    title: string
    description: string
    category_id: number | null
  }) => {
    if (editingTask) {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          title: taskData.title,
          description: taskData.description || null,
          category_id: taskData.category_id,
        })
        .eq("id", editingTask.id)
        .select("*, category:categories(*)")
        .single()

      if (!error && data) {
        setColumns((prev) =>
          prev.map((col) => ({
            ...col,
            tasks: col.tasks.map((t) =>
              t.id === editingTask.id ? data : t
            ),
          }))
        )
      }
    } else if (targetColumnId) {
      const maxPosition = Math.max(
        0,
        ...columns
          .find((c) => c.id === targetColumnId)
          ?.tasks.map((t) => t.position) || [0]
      )

      const { data, error } = await supabase
        .from("tasks")
        .insert({
          title: taskData.title,
          description: taskData.description || null,
          column_id: targetColumnId,
          category_id: taskData.category_id,
          position: maxPosition + 1,
        })
        .select("*, category:categories(*)")
        .single()

      if (!error && data) {
        setColumns((prev) =>
          prev.map((col) =>
            col.id === targetColumnId
              ? { ...col, tasks: [...col.tasks, data] }
              : col
          )
        )
      }
    }

    setIsModalOpen(false)
    setEditingTask(null)
    setTargetColumnId(null)
  }, [editingTask, targetColumnId, columns, supabase])

  const handleDeleteTask = useCallback(async (taskId: number) => {
    await supabase.from("tasks").delete().eq("id", taskId)

    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        tasks: col.tasks.filter((t) => t.id !== taskId),
      }))
    )
  }, [supabase])

  return (
    <>
      <div className="flex gap-6 overflow-x-auto pb-4">
        {columns.map((column) => (
          <KanbanColumnComponent
            key={column.id}
            column={column}
            onDragStart={handleDragStart}
            onDragOver={handleDragOver}
            onDrop={() => handleDrop(column.id)}
            onAddTask={() => handleAddTask(column.id)}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
          />
        ))}
      </div>

      <TaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setEditingTask(null)
          setTargetColumnId(null)
        }}
        onSave={handleSaveTask}
        task={editingTask}
        categories={categories}
      />
    </>
  )
}
