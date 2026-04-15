export interface Category {
  id: number
  name: string
  color: string
}

export interface Column {
  id: number
  name: string
  position: number
}

export interface Task {
  id: number
  title: string
  description: string | null
  column_id: number
  category_id: number | null
  position: number
  created_at: string
  category?: Category | null
}

export interface KanbanColumn extends Column {
  tasks: Task[]
}
