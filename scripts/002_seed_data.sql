-- Seed de dados iniciais para o Kanban

-- Categorias
INSERT INTO categories (name, emoji) VALUES
  ('Trabalho', '💼'),
  ('Estudo', '📚'),
  ('Pessoal', '🏠'),
  ('Saúde', '🍎'),
  ('Finanças', '💰')
ON CONFLICT DO NOTHING;

-- Colunas
INSERT INTO columns (title, position) VALUES
  ('A Fazer', 0),
  ('Em Progresso', 1),
  ('Concluída', 2)
ON CONFLICT DO NOTHING;

-- Tarefas de exemplo
INSERT INTO tasks (title, description, priority, category_id, column_id, position, due_date) VALUES
  ('Finalizar relatório mensal', 'Revisar planilhas e enviar para o financeiro.', 'Alta', 1, 1, 0, '2026-04-14'),
  ('Reunião com o cliente', 'Alinhar escopo do projeto e próximas entregas.', 'Alta', 1, 2, 0, '2026-04-09'),
  ('Estudar React e TypeScript', 'Ver documentação oficial e fazer projetos práticos.', 'Média', 2, 1, 1, '2026-04-16'),
  ('Revisar flashcards de inglês', 'Dedicar 20 minutos ao Anki para consolidar vocabulário.', 'Baixa', 2, 3, 0, '2026-04-08'),
  ('Ir à academia', 'Treino de força: pernas e core. Cardio no final.', 'Média', 4, 2, 1, '2026-04-09'),
  ('Consulta médica anual', 'Agendar check-up completo e exames de rotina.', 'Alta', 4, 1, 2, '2026-04-22'),
  ('Organizar finanças do mês', 'Categorizar gastos e planejar orçamento de maio.', 'Média', 5, 1, 3, '2026-04-30'),
  ('Ligar para a família', 'Marcar almoço do domingo com os pais.', 'Baixa', 3, 3, 1, '2026-04-13')
ON CONFLICT DO NOTHING;
