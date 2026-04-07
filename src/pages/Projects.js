import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Button, Input, Select, Textarea, StatusBadge, PriorityBadge, Spinner } from '../components/ui/index';
import Modal from '../components/ui/Modal';
import Avatar from '../components/ui/Avatar';
import toast from 'react-hot-toast';
import { formatDate, isOverdue } from '../utils/helpers';

const EMPTY = { title: '', description: '', status: 'not_started', priority: 'medium', deadline: '', members: [] };

/* ── Animated form field wrapper ── */
const FormField = ({ children, delay = 0 }) => (
  <div style={{ animation: `fadeSlideIn 0.4s ease forwards`, animationDelay: `${delay}ms`, opacity: 0 }}>
    {children}
  </div>
);

const ProjectForm = ({ form, setForm, users, onSubmit, loading, isEdit }) => {
  const toggle = (id) => setForm(f => ({
    ...f, members: f.members.includes(id) ? f.members.filter(m => m !== id) : [...f.members, id]
  }));

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <FormField delay={0}>
        <Input label="Title" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required placeholder="e.g. Website Redesign" />
      </FormField>
      <FormField delay={60}>
        <Textarea label="Description" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} rows={3} placeholder="What is this project about?" />
      </FormField>
      <FormField delay={120}>
        <div className="grid grid-cols-2 gap-3">
          <Select label="Status" value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </Select>
          <Select label="Priority" value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="critical">Critical</option>
          </Select>
        </div>
      </FormField>
      <FormField delay={180}>
        <Input label="Deadline" type="date" value={form.deadline} onChange={e => setForm(f => ({ ...f, deadline: e.target.value }))} />
      </FormField>
      <FormField delay={240}>
        <div>
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
            Team Members
            {form.members.length > 0 && (
              <span className="ml-2 px-2 py-0.5 rounded-full text-xs grad-bg text-white font-semibold">
                {form.members.length} selected
              </span>
            )}
          </label>
          <div className="max-h-36 overflow-y-auto space-y-1 border border-gray-200 dark:border-gray-700 rounded-xl p-2">
            {users.map(u => (
              <label key={u._id}
                className={`flex items-center gap-2 p-1.5 rounded-lg cursor-pointer transition-all duration-200
                  ${form.members.includes(u._id)
                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800'
                    : 'hover:bg-gray-50 dark:hover:bg-gray-800'}`}>
                <input type="checkbox" checked={form.members.includes(u._id)} onChange={() => toggle(u._id)} className="rounded accent-indigo-500" />
                <Avatar user={u} size="xs" />
                <span className="text-sm text-gray-700 dark:text-gray-300 flex-1">{u.name}</span>
                <span className="text-xs text-gray-400 capitalize">{u.role}</span>
                {form.members.includes(u._id) && (
                  <svg className="w-3.5 h-3.5 text-indigo-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <Button type="submit" loading={loading} className="min-w-[120px]">
            {isEdit ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </FormField>
    </form>
  );
};

/* ── Project card with entrance animation ── */
const ProjectCard = ({ p, index, canManage, onEdit, onDelete, onClick }) => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 80);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <div
      onClick={onClick}
      style={{
        opacity: mounted ? 1 : 0,
        transform: mounted ? 'translateY(0) scale(1)' : 'translateY(24px) scale(0.97)',
        transition: 'opacity 0.45s ease, transform 0.45s cubic-bezier(0.34,1.2,0.64,1)',
      }}
      className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-5 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group cursor-pointer relative overflow-hidden"
    >
      {/* Hover gradient shimmer */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
        style={{ background: 'linear-gradient(135deg, rgba(99,102,241,0.04) 0%, rgba(139,92,246,0.04) 50%, rgba(6,182,212,0.04) 100%)' }} />

      <div className="flex items-start justify-between mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors duration-200">
            {p.title}
          </h3>
          <p className="text-xs text-gray-400 mt-0.5 line-clamp-2">{p.description || 'No description'}</p>
        </div>
        {canManage && (
          <div className="flex gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0"
            onClick={e => e.stopPropagation()}>
            <button onClick={() => onEdit(p)}
              className="w-7 h-7 rounded-lg hover:bg-indigo-50 dark:hover:bg-indigo-900/20 flex items-center justify-center text-gray-400 hover:text-indigo-500 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button onClick={() => onDelete(p._id)}
              className="w-7 h-7 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center justify-center text-gray-400 hover:text-red-500 transition-all">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-3">
        <StatusBadge status={p.status} />
        <PriorityBadge priority={p.priority} />
      </div>

      {/* Animated progress bar */}
      <div className="mb-3">
        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>Progress</span>
          <span className="font-medium text-gray-600 dark:text-gray-300">{p.progress || 0}%</span>
        </div>
        <div className="h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 ease-out"
            style={{
              width: `${p.progress || 0}%`,
              background: 'linear-gradient(90deg, #6366f1, #8b5cf6, #06b6d4)',
              boxShadow: p.progress > 0 ? '0 0 8px rgba(99,102,241,0.5)' : 'none',
            }}
          />
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {p.members?.slice(0, 4).map(m => <Avatar key={m._id} user={m} size="xs" />)}
          {p.members?.length > 4 && (
            <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-[10px] text-gray-500 ring-2 ring-white dark:ring-gray-900">
              +{p.members.length - 4}
            </div>
          )}
        </div>
        {p.deadline && (
          <span className={`text-xs flex items-center gap-1 ${isOverdue(p.deadline) && p.status !== 'completed' ? 'text-red-500 font-medium' : 'text-gray-400'}`}>
            {isOverdue(p.deadline) && p.status !== 'completed' && (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {formatDate(p.deadline)}
          </span>
        )}
      </div>
    </div>
  );
};

const Projects = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [newId, setNewId] = useState(null);

  const canManage = ['admin', 'manager'].includes(user?.role);

  const load = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (filterStatus) params.set('status', filterStatus);
      const [p, u] = await Promise.all([api.get(`/projects?${params}`), api.get('/users')]);
      setProjects(p.data);
      setUsers(u.data);
    } catch {}
    setLoading(false);
  }, [search, filterStatus]);

  useEffect(() => { load(); }, [load]);

  const openCreate = () => { setEditing(null); setForm(EMPTY); setModal(true); };
  const openEdit = (p) => {
    setEditing(p);
    setForm({ title: p.title, description: p.description, status: p.status, priority: p.priority, deadline: p.deadline ? p.deadline.slice(0, 10) : '', members: p.members.map(m => m._id) });
    setModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editing) {
        const { data } = await api.put(`/projects/${editing._id}`, form);
        setProjects(prev => prev.map(p => p._id === editing._id ? data : p));
        toast.success('Project updated!');
      } else {
        const { data } = await api.post('/projects', form);
        setProjects(prev => [data, ...prev]);
        setNewId(data._id);
        setTimeout(() => setNewId(null), 2000);
        toast.success('Project created! 🎉', { icon: '🚀' });
      }
      setModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this project and all its tasks?')) return;
    try {
      await api.delete(`/projects/${id}`);
      setProjects(prev => prev.filter(p => p._id !== id));
      toast.success('Project deleted');
    } catch { toast.error('Error deleting project'); }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="w-12 h-12 rounded-2xl grad-bg flex items-center justify-center shadow-lg shadow-indigo-500/30 animate-pulse">
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      </div>
      <Spinner size="md" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2 flex-1 max-w-lg">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search projects..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-900 dark:text-gray-100 transition-all" />
          </div>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
            className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 text-sm text-gray-700 dark:text-gray-300">
            <option value="">All Status</option>
            <option value="not_started">Not Started</option>
            <option value="in_progress">In Progress</option>
            <option value="on_hold">On Hold</option>
            <option value="completed">Completed</option>
          </select>
        </div>
        {canManage && (
          <Button onClick={openCreate} className="group">
            <svg className="w-4 h-4 transition-transform group-hover:rotate-90 duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Project
          </Button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {projects.map((p, i) => (
          <div key={p._id} className="relative">
            {/* New project highlight ring */}
            {newId === p._id && (
              <div className="absolute inset-0 rounded-2xl pointer-events-none z-10"
                style={{ boxShadow: '0 0 0 3px #6366f1, 0 0 30px rgba(99,102,241,0.4)', animation: 'pulse 1s ease-in-out 3' }} />
            )}
            <ProjectCard
              p={p} index={i} canManage={canManage}
              onEdit={openEdit} onDelete={handleDelete}
              onClick={() => navigate(`/projects/${p._id}`)}
            />
          </div>
        ))}
        {projects.length === 0 && (
          <div className="col-span-full flex flex-col items-center justify-center py-20 text-gray-400"
            style={{ animation: 'fadeSlideIn 0.5s ease forwards' }}>
            <div className="w-20 h-20 rounded-3xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <svg className="w-10 h-10 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <p className="font-medium text-gray-500 dark:text-gray-400">No projects found</p>
            <p className="text-sm mt-1">Create your first project to get started</p>
            {canManage && (
              <Button onClick={openCreate} className="mt-4" size="sm">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Create Project
              </Button>
            )}
          </div>
        )}
      </div>

      <Modal open={modal} onClose={() => setModal(false)} title={editing ? 'Edit Project' : 'New Project'} size="lg">
        <ProjectForm form={form} setForm={setForm} users={users} onSubmit={handleSubmit} loading={saving} isEdit={!!editing} />
      </Modal>
    </div>
  );
};

export default Projects;
