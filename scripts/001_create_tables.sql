-- Criação das tabelas do Kanban Gravidade Zero

-- Tabela de categorias
CREATE TABLE IF NOT EXISTS categories (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  emoji TEXT NOT NULL
);

-- Tabela de colunas
CREATE TABLE IF NOT EXISTS columns (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0
);

-- Tabela de tarefas
CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  priority TEXT NOT NULL DEFAULT 'Média' CHECK (priority IN ('Alta', 'Média', 'Baixa')),
  category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  column_id INTEGER REFERENCES columns(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  due_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);
CREATE INDEX IF NOT EXISTS idx_tasks_category_id ON tasks(category_id);
