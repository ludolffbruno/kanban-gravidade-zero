import { useState, useEffect, useRef } from 'react'
import { Plus, Clock, Edit2, Trash2, List, LogIn, LogOut, GripVertical } from 'lucide-react'
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd'
import type { DropResult } from '@hello-pangea/dnd'
import { Joyride, STATUS } from 'react-joyride'
import type { EventData as CallBackProps, Step } from 'react-joyride'
import { auth, googleProvider } from './lib/firebase'
import { signInWithPopup, signOut, onAuthStateChanged, type User } from 'firebase/auth'
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
const App = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
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
  const [runTour, setRunTour] = useState(false);
  const boardRef = useRef<HTMLDivElement | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [tourSteps] = useState<Step[]>([
    {
      target: '.kanban-board',
      content: 'Bem-vindo ao Gravidade Zero! 🚀 Este é o seu painel. Tudo aqui acontece em tempo real.',
      skipBeacon: true,
    },
    {
      target: '.column',
      content: 'Estas são as suas colunas. Você pode arrastá-las na horizontal para organizar o seu fluxo de trabalho!',
    },
    {
      target: '.task-card',
      content: 'Arraste as tarefas entre as colunas conforme elas avançam. Clique para ver e editar os detalhes da tarefa!',
    },
    {
      target: '.btn-new',
      content: 'Se precisar de mais coisas para fazer (espero que não muitas!), é só clicar aqui.',
    }
  ]);
  
  const [formData, setFormData] = useState<Partial<Task>>({
    priority: 'Média',
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        fetchData();
      } else {
        setTasks([]);
        setColumns([]);
        setCategories([]);
      }
    });

    return () => unsubscribe();
  }, []);

  // Reseta scroll do board para o início sempre que as colunas carregarem
  useEffect(() => {
    if (columns.length > 0 && boardRef.current) {
      boardRef.current.scrollLeft = 0;
    }
  }, [columns]);

  // Detecta mobile de forma reativa (funciona após hidratação e em rotação)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    setIsMobile(mq.matches);
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error("Login failed", err);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const fetchData = async () => {
    try {
      const [tasksRes, catsRes, colsRes] = await Promise.all([
        api.getTasks(),
        api.getCategories(),
        api.getColumns()
      ]);
      
      let fetchedColumns = colsRes.data;
      
      // Se não houver colunas, inicializa com exemplos (Primeiro acesso)
      if (fetchedColumns.length === 0) {
        const initRes = await api.initUser();
        if (initRes.data.success || initRes.data.initialized) {
          // Busca novamente após inicialização
          const [newTasks, newCols] = await Promise.all([
            api.getTasks(),
            api.getColumns()
          ]);
          setTasks(newTasks.data);
          setColumns(newCols.data);
          setCategories(catsRes.data);
          
          // Trigger tour for new users
          const hasSeenTour = localStorage.getItem('hasSeenTour');
          if (!hasSeenTour) {
            setTimeout(() => setRunTour(true), 1000);
          }
          return;
        }
      }

      setTasks(tasksRes.data);
      setCategories(catsRes.data);
      setColumns(fetchedColumns);

      // Also check for existing users who haven't seen the tour
      const hasSeenTour = localStorage.getItem('hasSeenTour');
      if (!hasSeenTour && fetchedColumns.length > 0) {
        setTimeout(() => setRunTour(true), 1000);
      }
    } catch (err) {
      console.error("Error fetching data", err);
    }
  };

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status } = data;
    const finishedStatuses: string[] = [STATUS.FINISHED, STATUS.SKIPPED];

    if (finishedStatuses.includes(status)) {
      setRunTour(false);
      localStorage.setItem('hasSeenTour', 'true');
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
    // Guarda contra double-call (Enter + onBlur)
    if (editingColumnId === null) return;
    if (columnTitleInput.trim()) {
      try {
        const col = columns.find(c => c.id === id);
        if (col) {
          setEditingColumnId(null); // seta null ANTES do await para bloquear segundo call
          await api.updateColumn(id, { ...col, title: columnTitleInput });
          fetchData();
        }
      } catch (err) {
        console.error("Error renaming column", err);
      }
    } else {
      setEditingColumnId(null); // cancela se vazio
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
    const { destination, source, draggableId, type } = result;

    if (!destination) return;
    if (destination.droppableId === source.droppableId && destination.index === source.index) return;

    // Lógica para Colunas
    if (type === 'column') {
      const newColumns = Array.from(columns);
      const [movedColumn] = newColumns.splice(source.index, 1);
      newColumns.splice(destination.index, 0, movedColumn);

      // Atualiza localmente com as novas posições
      const finalColumns = newColumns.map((col, idx) => ({ ...col, position: idx }));
      setColumns(finalColumns);

      try {
        await api.reorderColumns(finalColumns.map(c => ({ id: c.id, position: c.position })));
      } catch (err) {
        console.error("Error reordering columns", err);
        fetchData();
      }
      return;
    }

    // Lógica para Tarefas
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
      fetchData(); 
    } catch (err) {
      console.error("Error moving task", err);
      fetchData(); 
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
      <Joyride
        onEvent={handleJoyrideCallback}
        continuous
        run={runTour && !isMobile}
        scrollToFirstStep
        steps={tourSteps}
        options={{
          zIndex: 10000,
          primaryColor: '#6366f1',
          backgroundColor: '#1e293b',
          textColor: '#f8fafc',
          arrowColor: '#1e293b',
          showProgress: true,
          buttons: ['back', 'close', 'primary', 'skip'],
        }}
        styles={{
          buttonPrimary: {
            borderRadius: '8px',
            fontSize: '14px',
            padding: '8px 16px',
            fontWeight: 600,
          },
          buttonBack: {
            marginRight: '10px',
            color: '#94a3b8',
          },
          buttonSkip: {
            color: '#94a3b8',
          },
          tooltip: {
            borderRadius: '16px',
            padding: '12px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          },
          tooltipContainer: {
            textAlign: 'left',
          },
        }}
        locale={{
          back: 'Voltar',
          close: 'Fechar',
          last: 'Finalizar',
          next: 'Próximo',
          skip: 'Pular Tour',
        }}
      />
      <header>
        <div>
          <h1>Gravidade Zero</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>Gestão de tarefas em órbita 🚀</p>
        </div>
        <div className="header-actions">
          {user ? (
            <>
              <div className="user-profile">
                <img src={user.photoURL || ''} alt={user.displayName || ''} />
                <span className="user-name-label">{user.displayName}</span>
              </div>
              <button className="btn-secondary" onClick={handleAddColumn} title="Nova Coluna">
                <List size={18} /> <span className="btn-label">Nova Coluna</span>
              </button>
              <button className="btn-new" onClick={() => { setFormData({ priority: 'Média' }); setIsModalOpen(true); }} title="Nova Tarefa">
                <Plus size={20} /> <span className="btn-label">Nova Tarefa</span>
              </button>
              <button className="btn-logout" onClick={handleLogout} title="Sair">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <button className="btn-login" onClick={handleLogin}>
              <LogIn size={18} /> Entrar com Google
            </button>
          )}
        </div>
      </header>

      {loading ? (
        <div className="loading-container">
          <div className="orbit-loader">
            <div className="planet"></div>
            <div className="satellite"></div>
          </div>
          <p>Sincronizando com a estação espacial...</p>
        </div>
      ) : !user ? (
        <div className="landing-page">
          <div className="landing-content">
            <div className="badge">Nova Era na Gestão de Tarefas</div>
            <h2>Sua Produtividade em <span className="gradient-text">Gravidade Zero</span></h2>
            <p>
              Organize seus projetos com a leveza do espaço. 
              Um Kanban minimalista, poderoso e pensado para quem busca foco total.
            </p>
            <div className="landing-features">
              <div className="feature">
                <h3>Isolamento Total</h3>
                <p>Seus dados são só seus. Kanban 100% pessoal.</p>
              </div>
              <div className="feature">
                <h3>Drag & Drop Fluido</h3>
                <p>Mova colunas e tarefas com suavidade orbital.</p>
              </div>
            </div>
            <button className="btn-login-hero" onClick={handleLogin}>
              <LogIn size={20} /> Entrar com Google
            </button>
            <span className="trust-badge">Acesso seguro via Google Auth</span>
          </div>
          <div className="landing-visual">
             {/* Preview simplificado ou gráfico */}
             <div className="preview-card">
                <div className="preview-header"></div>
                <div className="preview-line"></div>
                <div className="preview-line short"></div>
             </div>
             <div className="preview-card float">
                <div className="preview-header secondary"></div>
                <div className="preview-line"></div>
             </div>
          </div>
        </div>
      ) : (
        <DragDropContext onDragEnd={onDragEnd}>
          <Droppable droppableId="board" type="column" direction="horizontal">
            {(provided) => (
              <div 
                className="kanban-board"
                {...provided.droppableProps}
                ref={(el) => {
                  provided.innerRef(el);
                  boardRef.current = el;
                }}
              >
                {columns.sort((a, b) => a.position - b.position).map((column, index) => (
                  <Draggable key={column.id} draggableId={column.id.toString()} index={index}>
                    {(provided, snapshot) => (
                      <div 
                        key={column.id} 
                        className={`column ${snapshot.isDragging ? 'is-dragging-column' : ''}`}
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                      >
                        <div className="column-header" {...provided.dragHandleProps}>
                          <div className="column-title-wrapper">
                            <GripVertical size={14} className="drag-handle-icon" />
                            {editingColumnId === column.id ? (
                              <input
                                autoFocus
                                className="column-title-edit"
                                value={columnTitleInput}
                                onChange={e => setColumnTitleInput(e.target.value)}
                                onBlur={() => handleRenameColumn(column.id)}
                                onKeyDown={e => {
                                  if (e.key === 'Enter') {
                                    e.preventDefault();
                                    e.currentTarget.blur(); // dispara onBlur uma única vez
                                  } else if (e.key === 'Escape') {
                                    setEditingColumnId(null); // cancela sem salvar
                                  }
                                }}
                              />
                            ) : (
                              <span 
                                className="column-title" 
                                onClick={() => { setEditingColumnId(column.id); setColumnTitleInput(column.title); }}
                              >
                                {column.title}
                              </span>
                            )}
                          </div>
                          <div className="column-header-right">
                            <span className="task-count">{tasks.filter(t => t.column_id === column.id).length}</span>
                            <button className="icon-btn-danger" onClick={() => handleDeleteColumn(column.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </div>

                        <Droppable droppableId={column.id.toString()} type="task">
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
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
                <button className="add-column-ghost" onClick={handleAddColumn}>
                  <Plus size={24} />
                  <span>Adicionar Coluna</span>
                </button>
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}

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
      <footer className="dev-footer">
        Desenvolvido por <a href="https://github.com/ludolffbruno" target="_blank" rel="noopener noreferrer">MrLudolff</a>
      </footer>
    </div>
  )
}

export default App
