import React, { useEffect, useState, useCallback } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Select, Textarea, PriorityBadge, Spinner } from '../components/ui/index';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { formatDate, isOverdue } from '../utils/helpers';

const COLS = [
  { id: 'todo',        label: 'To Do',       color: 'bg-slate-400',  glow: 'rgba(100,116,139,0.3)',  light: 'bg-slate-50 dark:bg-slate-900/30'  },
  { id: 'in_progress', label: 'In Progress',  color: 'bg-blue-500',   glow: 'rgba(59,130,246,0.3)',   light: 'bg-blue-50 dark:bg-blue-900/10'    },
  { id: 'review',      label: 'Review',       color: 'bg-purple-500', glow: 'rgba(168,85,247,0.3)',   light: 'bg-purple-50 dark:bg-purple-900/10'},
  { id: 'done',        label: 'Done',         color: 'bg-emerald-500',glow: 'rgba(16,185,129,0.3)',   light: 'bg-emerald-50 dark:bg-emerald-900/10'},
];

const EMPTY_TASK = { title: '', description: '', status: 'todo', priority: 'medium', project: '', assignedTo: [], deadline: '' };

/* ── Animated form field ── */
const FormField = ({ children, delay = 0 }) => (
  <div style={{ animation: 'fadeSlideIn 0.4s ease forwards', animationDelay: `${delay}ms`, opacity: 0 }}>
    {children}
  </div>
);

/* ── Task card with Draggable ── */
const TaskCard = ({ task, index, onClick }) => {
  const [justAdded, setJustAdded] = useState(task._justAdded || false);

  useEffect(() => {
    if (justAdded) {
      const t = setTimeout(() => setJustAdded(false), 1200);
      return () => clearTimeout(t);
    }
  }, [justAdded]);

  return (
    <Draggable draggableId={task._id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          onClick={() => onClick(task)}
          style={{
            ...provided.draggableProps.style,
            transform: snapshot.isDragging
              ? `${provided.draggableProps.style?.transform} rotate(2deg)`
              : provided.draggableProps.style?.transform,
          }}
          className={`bg-white dark:bg-gray-900 rounded-xl p-3 border cursor-pointer mb-2 transition-all duration-200
            ${snapshot.isDragging
              ? 'shadow-2xl border-indigo-300 dark:border-indigo-700 scale-105'
              : justAdded
                ? 'border-indigo-400 shadow-lg shadow-indigo-500/20'
                : 'border-gray-100 dark:border-gray-800 hover:shadow-md hover:border-gray-200 dark:hover:border-gray-700'
            }`}
        >
          {/* New task pulse ring */}
          {justAdded && (
            <div className="absolute inset-0 rounded-xl pointer-events-none"
              style={{ boxShadow: '0 0 0 2px #6366f1', animation: 'pulse 0.8s ease-in-out 2' }} />
          )}

          <div className="flex items-start justify-between gap-2 mb-2">
            <p className="text-sm font-medium text-gray-900 dark:text-white leading-snug">{task.title}</p>
            <PriorityBadge priority={task.priority} />
          </div>

          {task.description && (
            <p className="text-xs text-gray-400 mb-2 line-clamp-2">{task.description}</p>
          )}

          <div className="flex items-center justify-between">
            <div className="flex -space-x-1.5">
              {task.assignedTo?.slice(0, 3).map(u => <Avatar key={u._id} user={u} size="xs" />)}
              {task.assignedTo?.length > 3 && (
                <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-500 ring-2 ring-white dark:ring-gray-900">
                  +{task.assignedTo.length - 3}
                </div>
              )}
            </div>
            {task.deadline && (
              <span className={`text-[10px] flex items-center gap-0.5 ${isOverdue(task.deadline) && task.status !== 'done' ? 'text-red-500 font-semibold' : 'text-gray-400'}`}>
                {isOverdue(task.deadline) && task.status !== 'done' && '⚠ '}
                {formatDate(task.deadline)}
              </span>
            )}
          </div>

          {task.project?.title && (
            <div className="mt-2 pt-2 border-t border-gray-50 dark:border-gray-800 flex items-center gap-1">
              <div className="w-1.5 h-1.5 rounded-full grad-bg" />
              <span className="text-[10px] text-indigo-500 font-medium">{task.project.title}</span>
            </div>
          )}
        </div>
      )}
    </Draggable>
  );
};

/* ── Kanban column ── */
const KanbanCol = ({ col, tasks, onTaskClick, isOver }) => (
  <div
    className="rounded-2xl p-3 border border-gray-100 dark:border-gray-800 transition-all duration-300"
    style={{
      background: isOver
        ? `linear-gradient(135deg, ${col.glow.replace('0.3', '0.08')}, transparent)`
        : undefined,
      boxShadow: isOver ? `0 0 0 2px ${col.glow.replace('0.3', '0.6')}, 0 8px 32px ${col.glow}` : undefined,
    }}
  >
    {/* Column header */}
    <div className="flex items-center gap-2 mb-3">
      <div className={`w-2.5 h-2.5 rounded-full ${col.color} shadow-sm`}
        style={{ boxShadow: `0 0 6px ${col.glow}` }} />
      <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">{col.label}</span>
      <span className={`ml-auto text-xs font-medium px-2 py-0.5 rounded-full transition-all duration-300
        ${tasks.length > 0 ? 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-400' : 'bg-gray-100 dark:bg-gray-900 text-gray-300 dark:text-gray-700'}`}>
        {tasks.length}
      </span>
    </div>

    {/* Drop zone */}
    <div className={`min-h-[120px] rounded-xl transition-all duration-200 ${isOver ? col.light : ''}`}>
      {tasks.map((task, i) => (
        <TaskCard key={task._id} task={task} index={i} onClick={onTaskClick} />
      ))}
      {tasks.length === 0 && !isOver && (
        <div className="flex flex-col items-center justify-center py-8 text-gray-300 dark:text-gray-700">
          <svg className="w-8 h-8 mb-1 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs">Drop here</span>
        </div>
      )}
      {isOver && tasks.length === 0 && (
        <div className="flex items-center justify-center py-8">
          <div className={`w-10 h-10 rounded-xl ${col.color} opacity-20 animate-pulse`} />
        </div>
      )}
    </div>
  </div>
);

const Tasks = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState(EMPTY_TASK);
  const [saving, setSaving] = useState(false);
  const [filterProject, setFilterProject] = useState('');
  const [filterPriority, setFilterPriority] = useState('');
  const [search, setSearch] = useState('');
  const [draggingOver, setDraggingOver] = useState(null);

  const canManage = ['admin', 'manager'].includes(user?.role);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterProject) params.set('projectId', filterProject);
      if (filterPriority) params.set('priority', filterPriority);
      if (search) params.set('search', search);
      const [t, p, u] = await Promise.all([
        api.get(`/tasks?${params}&limit=100`),
        api.get('/projects'),
        api.get('/users')
      ]);
      setTasks(t.data.tasks);
      setProjects(p.data);
      setUsers(u.data);
    } catch {}
    setLoading(false);
  }, [filterProject, filterPriority, search]);

  useEffect(() => { load(); }, [load]);

  const onDragUpdate = ({ destination }) => setDraggingOver(destination?.droppableId || null);

  const onDragEnd = async ({ source, destination, draggableId }) => {
    setDraggingOver(null);
    if (!destination || (source.droppableId === destination.droppableId && source.index === destination.index)) return;
    const newStatus = destination.droppableId;
    setTasks(prev => prev.map(t => t._id === draggableId ? { ...t, status: newStatus } : t));
    try {
      await api.put(`/tasks/${draggableId}`, { status: newStatus });
      const col = COLS.find(c => c.id === newStatus);
      toast.success(`Moved to ${col?.label}`, { icon: '✦' });
    } catch { load(); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.post('/tasks', form);
      setTasks(prev => [{ ...data, _justAdded: true }, ...prev]);
      toast.success('Task created! 🎯', { icon: '✅' });
      setModal(false);
      setForm(EMPTY_TASK);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const colTasks = (colId) => tasks.filter(t => t.status === colId);

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-12 h-12 rounded-2xl grad-bg flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
      </div>
      <Spinner size="md" />
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center justify-between">
        <div className="flex gap-2 flex-wrap">
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search tasks..."
              className="pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 w-48 transition-all" />
          </div>
          <select value={filterProject} onChange={e => setFilterProject(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300">
            <option value="">All Projects</option>
            {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
          </select>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300">
            <option value="">All Priority</option>
            <option value="critical">🔴 Critical</option>
            <option value="high">🟠 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
        </div>
        {canManage && (
          <Button onClick={() => { setForm(EMPTY_TASK); setModal(true); }} className="group">
            <svg className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Task
          </Button>
        )}
      </div>

      {/* Kanban Board */}
      <DragDropContext onDragEnd={onDragEnd} onDragUpdate={onDragUpdate}>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {COLS.map(col => (
            <Droppable key={col.id} droppableId={col.id}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  <KanbanCol
                    col={col}
                    tasks={colTasks(col.id)}
                    onTaskClick={(t) => navigate(`/tasks/${t._id}`)}
                    isOver={draggingOver === col.id}
                  />
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>

      {/* Create Task Modal */}
      <Modal open={modal} onClose={() => setModal(false)} title="New Task" size="lg">
        <form onSubmit={handleSubmit} className="space-y-4">
          <FormField delay={0}>
            <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Design landing page" />
          </FormField>
          <FormField delay={60}>
            <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="Describe the task..." />
          </FormField>
          <FormField delay={120}>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Project" value={form.project} onChange={e => setForm(f => ({ ...f, project: e.target.value }))} required>
                <option value="">Select project</option>
                {projects.map(p => <option key={p._id} value={p._id}>{p.title}</option>)}
              </Select>
              <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                <option value="todo">To Do</option>
                <option value="in_progress">In Progress</option>
                <option value="review">Review</option>
                <option value="done">Done</option>
              </Select>
            </div>
          </FormField>
          <FormField delay={180}>
            <div className="grid grid-cols-2 gap-3">
              <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">🟢 Low</option>
                <option value="medium">🟡 Medium</option>
                <option value="high">🟠 High</option>
                <option value="critical">🔴 Critical</option>
              </Select>
              <Input label="Deadline" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
            </div>
          </FormField>
          <FormField delay={240}>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                Assign To
                {form.assignedTo.length > 0 && (
                  <span className="ml-2 px-2 py-0.5 rounded-full text-xs grad-bg text-white font-semibold">
                    {form.assignedTo.length} selected
                  </span>
                )}
              </label>
              <div className="max-h-32 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-700 rounded-xl p-2">
                {users.map(u => (
                  <label key={u._id}
                    className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-all duration-200
                      ${form.assignedTo.includes(u._id)
                        ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                    <input type="checkbox"
                      checked={form.assignedTo.includes(u._id)}
                      onChange={() => setForm(f => ({ ...f, assignedTo: f.assignedTo.includes(u._id) ? f.assignedTo.filter(id => id !== u._id) : [...f.assignedTo, u._id] }))}
                      className="rounded accent-indigo-500" />
                    <Avatar user={u} size="xs" />
                    <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{u.name}</span>
                    {form.assignedTo.includes(u._id) && (
                      <svg className="w-3.5 h-3.5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </label>
                ))}
              </div>
            </div>
          </FormField>
          <FormField delay={300}>
            <div className="flex justify-end gap-2 pt-2">
              <Button type="submit" loading={saving} className="min-w-[120px]">Create Task</Button>
            </div>
          </FormField>
        </form>
      </Modal>
    </div>
  );
};

export default Tasks;
