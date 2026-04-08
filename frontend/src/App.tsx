import { useState, useEffect } from 'react'
import { Plus, Clock, MoreVertical, Edit2, Trash2, CheckCircle, List, ArrowRight } from 'lucide-react'
import * as api from './api'
import './App.css'

interface Task {
  id: number;
  title: string;
  description: string;
  priority: 'Alta' | 'Média' | 'Baixa';
  category_id: number;
  status: 'todo' | 'in_progress' | 'done';
  due_date: string;
  category_name?: string;
  category_emoji?: string;
}

interface Category {
  id: number;
  name: string;
  emoji: string;
}

function App() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState<Partial<Task>>({
    priority: 'Média',
    status: 'todo'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [tasksRes, catsRes] = await Promise.all([
        api.getTasks(),
        api.getCategories()
      ]);
      setTasks(tasksRes.data);
      setCategories(catsRes.data);
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
        await api.createTask(formData);
      }
      setIsModalOpen(false);
      setFormData({ priority: 'Média', status: 'todo' });
      fetchData();
    } catch (err) {
      console.error("Error saving task", err);
    }
  };

  const handleDelete = async (id: number) => {
    if (confirm("Tem certeza que deseja excluir esta tarefa?")) {
      try {
        await api.deleteTask(id);
        setIsDetailOpen(false);
        fetchData();
      } catch (err) {
        console.error("Error deleting task", err);
      }
    }
  };

  const updateStatus = async (id: number, status: string) => {
    try {
      await api.updateTask(id, { status });
      fetchData();
    } catch (err) {
      console.error("Error updating status", err);
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

  const renderColumn = (status: 'todo' | 'in_progress' | 'done', title: string) => {
    const columnTasks = tasks.filter(t => t.status === status);
    return (
      <div className="column">
        <div className="column-header">
          <span className="column-title">{title}</span>
          <span className="task-count">{columnTasks.length}</span>
        </div>
        <div className="task-list">
          {columnTasks.map(task => (
            <div key={task.id} className="task-card" onClick={() => openDetail(task)}>
              <div className="task-card-header">
                <span className="task-category">
                  {task.category_emoji} {task.category_name}
                </span>
                <div className={`priority-dot priority-${task.priority}`} title={task.priority} />
              </div>
              <h3 className="task-title">{task.title}</h3>
              <div className="task-footer">
                <div className="task-date">
                  <Clock size={12} />
                  {task.due_date ? new Date(task.due_date).toLocaleDateString('pt-BR') : 'Sem data'}
                </div>
                <div className="task-actions">
                  <button className="icon-btn" onClick={(e) => { e.stopPropagation(); openEdit(task); }}>
                    <Edit2 size={14} />
                  </button>
                  {status !== 'done' && (
                    <button className="icon-btn" onClick={(e) => { 
                      e.stopPropagation(); 
                      updateStatus(task.id, status === 'todo' ? 'in_progress' : 'done');
                    }}>
                      <ArrowRight size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="app-container">
      <header>
        <div>
          <h1>Gravidade Zero</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gestão de tarefas em órbita 🚀</p>
        </div>
        <button className="btn-new" onClick={() => { setFormData({ priority: 'Média', status: 'todo' }); setIsModalOpen(true); }}>
          <Plus size={20} /> Nova Tarefa
        </button>
      </header>

      <div className="kanban-board">
        {renderColumn('todo', 'A Fazer')}
        {renderColumn('in_progress', 'Em Progresso')}
        {renderColumn('done', 'Concluída')}
      </div>

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
              <div className="form-group">
                <label>Data de Vencimento</label>
                <input 
                  type="date" 
                  value={formData.due_date || ''} 
                  onChange={e => setFormData({...formData, due_date: e.target.value})}
                />
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
                <button className="icon-btn" style={{ color: 'var(--high)' }} onClick={() => handleDelete(selectedTask.id)}>
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
            <div className="modal-footer">
               {selectedTask.status !== 'done' && (
                 <button className="btn-save" onClick={() => { updateStatus(selectedTask.id, 'done'); setIsDetailOpen(false); }}>
                   Marcar como Concluída
                 </button>
               )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
