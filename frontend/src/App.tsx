/* Created by: Bruno Ludolff */
import { useState, useEffect } from 'react'
import { Plus, Clock, Edit2, Trash2, ArrowRight, List } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import * as api from './api'
import './App.css'

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  category_id: number;
  column_id: number;
  due_date: string;
  position: number;
  category_name?: string;
  category_emoji?: string;
}

interface Column {
  id: number;
  title: string;
  position: number;
}

interface Category {
  id: number;
  name: string;
  emoji: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [columns, setColumns] = useState<Column[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [isAddColumnModalOpen, setIsAddColumnModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [editingColumnId, setEditingColumnId] = useState<number | null>(null);
  const [columnTitleInput, setColumnTitleInput] = useState('');
  const [newColumnTitle, setNewColumnTitle] = useState('');
  
  const [formData, setFormData] = useState<Partial<Task>>({
    priority: 'Média',
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, catsRes, colsRes] = await Promise.all([
        api.getTasks(),
        api.getCategories(),
        api.getColumns()
      ]);
      setTasks(tasksRes.data);
      setCategories(catsRes.data);
      setColumns(colsRes.data);
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const handleCreateOrEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (formData.id) {
        await api.updateTask(formData.id, formData);
      } else {
        // Se não houver coluna definida, usa a primeira
        const defaultCol = formData.column_id || (columns.length > 0 ? columns[0].id : undefined);
        await api.createTask({ ...formData, column_id: defaultCol });
      }
      setIsModalOpen(false);
      setFormData({ priority: 'Média' });
      fetchData();
    } catch (err) {
      console.error("Error saving task", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir esta tarefa?")) {
      try {
        await api.deleteTask(id);
        setIsDetailOpen(false);
        fetchData();
      } catch (err) {
        console.error("Error deleting task", err);
      }
    }
  };

  const handleAddColumn = () => {
    setNewColumnTitle('');
    setIsAddColumnModalOpen(true);
  };

  const handleAddColumnSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newColumnTitle.trim()) return;
    try {
      await api.createColumn({ title: newColumnTitle.trim() });
      setIsAddColumnModalOpen(false);
      setNewColumnTitle('');
      fetchData();
    } catch (err) {
      console.error("Error adding column", err);
    }
  };

  const handleRenameColumn = async (id: number) => {
    if (columnTitleInput.trim()) {
      try {
        const col = columns.find(c => c.id === id);
        if (col) {
          await api.updateColumn(id, { ...col, title: columnTitleInput });
          setEditingColumnId(null);
          fetchData();
        }
      } catch (err) {
        console.error("Error renaming column", err);
      }
    }
  };

  const handleDeleteColumn = async (id: number) => {
    if (window.confirm("Excluir esta coluna apagará todas as tarefas nela. Continuar?")) {
      try {
        await api.deleteColumn(id);
        fetchData();
      } catch (err) {
        console.error("Error deleting column", err);
      }
    }
  };

  const onDragEnd = async (result: DropResult) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    const taskId = parseInt(draggableId);
    const newColumnId = parseInt(destination.droppableId);
    const newPosition = destination.index;

    // Otimização Otimista
    const updatedTasks = Array.from(tasks);
    const taskIndex = updatedTasks.findIndex(t => t.id === taskId);
    if (taskIndex !== -1) {
      updatedTasks[taskIndex].column_id = newColumnId;
      updatedTasks[taskIndex].position = newPosition;
      setTasks(updatedTasks);
    }

    try {
      await api.updateTask(taskId, { 
        column_id: newColumnId,
        position: newPosition 
      });
      fetchData(); // Sincroniza posições de todos
    } catch (err) {
      console.error("Error moving task", err);
      fetchData(); // Reverte em caso de erro
    }
  };

  const openEdit = (task: Task) => {
    setFormData(task);
    setIsModalOpen(true);
  };

  const openDetail = (task: Task) => {
    setSelectedTask(task);
    setIsDetailOpen(true);
  };

  return (
    <div className="app-container">
      <header>
        <div>
          <h1>Gravidade Zero</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gestão de tarefas em órbita 🚀</p>
        </div>
        <div className="header-actions">
          <button className="btn-secondary" onClick={handleAddColumn}>
            <List size={18} /> Nova Coluna
          </button>
          <button className="btn-new" onClick={() => { setFormData({ priority: 'Média' }); setIsModalOpen(true); }}>
            <Plus size={20} /> Nova Tarefa
          </button>
        </div>
      </header>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="kanban-board">
          {columns.map(column => (
            <div key={column.id} className="column">
              <div className="column-header">
                {editingColumnId === column.id ? (
                  <input
                    autoFocus
                    className="column-title-edit"
                    value={columnTitleInput}
                    onChange={e => setColumnTitleInput(e.target.value)}
                    onBlur={() => handleRenameColumn(column.id)}
                    onKeyDown={e => e.key === 'Enter' && handleRenameColumn(column.id)}
                  />
                ) : (
                  <span 
                    className="column-title" 
                    onClick={() => { setEditingColumnId(column.id); setColumnTitleInput(column.title); }}
                  >
                    {column.title}
                  </span>
                )}
                <div className="column-header-right">
                  <span className="task-count">{tasks.filter(t => t.column_id === column.id).length}</span>
                  <button className="icon-btn-danger" onClick={() => handleDeleteColumn(column.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <Droppable droppableId={column.id.toString()}>
                {(provided, snapshot) => (
                  <div 
                    className={`task-list ${snapshot.isDraggingOver ? 'dragging-over' : ''}`}
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {tasks
                      .filter(t => t.column_id === column.id)
                      .sort((a, b) => a.position - b.position)
                      .map((task, index) => (
                        <Draggable key={task.id} draggableId={task.id.toString()} index={index}>
                          {(provided, snapshot) => (
                            <div 
                              className={`task-card ${snapshot.isDragging ? 'is-dragging' : ''}`}
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              onClick={() => openDetail(task)}
                            >
                              <div className="task-card-header">
                                <span className="task-category">
                                  {task.category_emoji} {task.category_name}
                                </span>
                                <div className={`priority-dot priority-${task.priority}`} />
                              </div>
                              <h3 className="task-title">{task.title}</h3>
                              <div className="task-footer">
                                <div className="task-date">
                                  <Clock size={12} />
                                  {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : 'Sem data'}
                                </div>
                                <div className="task-actions">
                                  <button className="icon-btn" onClick={(e) => { e.stopPropagation(); openEdit(task); }}>
                                    <Edit2 size={13} />
                                  </button>
                                  <button className="icon-btn delete-btn" onClick={(e) => { e.stopPropagation(); handleDelete(task.id); }}>
                                    <Trash2 size={13} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          ))}
          <button className="add-column-ghost" onClick={handleAddColumn}>
             <Plus size={24} />
             <span>Adicionar Coluna</span>
          </button>
        </div>
      </DragDropContext>

      {/* Modal Criar/Editar */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>{formData.id ? 'Editar Tarefa' : 'Nova Tarefa'}</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleCreateOrEdit}>
              <div className="form-group">
                <label>Título</label>
                <input 
                  type="text" 
                  value={formData.title || ''} 
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  required 
                />
              </div>
              <div className="form-group">
                <label>Descrição</label>
                <textarea 
                  value={formData.description || ''} 
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Prioridade</label>
                  <select 
                    value={formData.priority} 
                    onChange={e => setFormData({...formData, priority: e.target.value as any})}
                  >
                    <option value="Baixa">Baixa 🟢</option>
                    <option value="Média">Média 🟡</option>
                    <option value="Alta">Alta 🔴</option>
                  </select>
                </div>
                <div>
                  <label>Categoria</label>
                  <select 
                    value={formData.category_id || ''} 
                    onChange={e => setFormData({...formData, category_id: parseInt(e.target.value)})}
                  >
                    <option value="">Selecione...</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.emoji} {c.name}</option>)}
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div>
                  <label>Data de Vencimento</label>
                  <input 
                    type="date" 
                    value={formData.due_date || ''} 
                    onChange={e => setFormData({...formData, due_date: e.target.value})}
                  />
                </div>
                <div>
                  <label>Coluna</label>
                  <select 
                    value={formData.column_id || ''} 
                    onChange={e => setFormData({...formData, column_id: parseInt(e.target.value)})}
                  >
                    {columns.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-save">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Detalhes */}
      {isDetailOpen && selectedTask && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <span className="task-category">{selectedTask.category_emoji} {selectedTask.category_name}</span>
              <div className="task-actions">
                <button className="icon-btn" onClick={() => { setIsDetailOpen(false); openEdit(selectedTask); }}>
                  <Edit2 size={18} />
                </button>
                <button className="icon-btn danger" onClick={() => handleDelete(selectedTask.id)}>
                  <Trash2 size={18} />
                </button>
                <button className="icon-btn" onClick={() => setIsDetailOpen(false)}>✕</button>
              </div>
            </div>
            <h2 className="task-title" style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>{selectedTask.title}</h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: '1.6' }}>
              {selectedTask.description || 'Sem descrição.'}
            </p>
            <div className="task-footer" style={{ border: 'none', background: 'rgba(255,255,255,0.02)', padding: '1rem', borderRadius: '8px' }}>
              <div className="task-date">
                <Clock size={14} /> <b>Vencimento:</b> {selectedTask.due_date ? new Date(selectedTask.due_date).toLocaleDateString('pt-BR') : 'Sem data'}
              </div>
              <div className="task-date">
                <div className={`priority-dot priority-${selectedTask.priority}`} /> <b>Prioridade:</b> {selectedTask.priority}
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Modal Adicionar Coluna */}
      {isAddColumnModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px' }}>
            <div className="modal-header">
              <h2>Nova Coluna</h2>
              <button className="icon-btn" onClick={() => setIsAddColumnModalOpen(false)}>✕</button>
            </div>
            <form onSubmit={handleAddColumnSubmit}>
              <div className="form-group">
                <label>Nome da Coluna</label>
                <input
                  type="text"
                  autoFocus
                  placeholder="Ex: Revisão, Teste, Bloqueado..."
                  value={newColumnTitle}
                  onChange={e => setNewColumnTitle(e.target.value)}
                  required
                />
              </div>
              <div className="modal-footer">
                <button type="button" className="btn-cancel" onClick={() => setIsAddColumnModalOpen(false)}>Cancelar</button>
                <button type="submit" className="btn-save">Criar Coluna</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
