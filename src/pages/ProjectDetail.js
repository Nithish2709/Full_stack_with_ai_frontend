import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { StatusBadge, PriorityBadge, Spinner } from '../components/ui/index';
import Avatar from '../components/ui/Avatar';
import { formatDate, isOverdue } from '../utils/helpers';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, t, s] = await Promise.all([
          api.get(`/projects/${id}`),
          api.get(`/tasks?projectId=${id}&limit=100`),
          api.get(`/projects/${id}/stats`)
        ]);
        setProject(p.data);
        setTasks(t.data.tasks);
        setStats(s.data);
      } catch { navigate('/projects'); }
      setLoading(false);
    };
    load();
  }, [id, navigate]);

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!project) return null;

  return (
    <div className="space-y-5">
      <button onClick={() => navigate('/projects')} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back to Projects
      </button>

      {/* Header */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">{project.title}</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">{project.description}</p>
          </div>
          <div className="flex gap-2 flex-shrink-0">
            <StatusBadge status={project.status} />
            <PriorityBadge priority={project.priority} />
          </div>
        </div>

        {/* Progress */}
        <div className="mb-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-gray-500 dark:text-gray-400">Overall Progress</span>
            <span className="font-semibold text-gray-900 dark:text-white">{stats?.progress || 0}%</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div className="progress-bar h-full" style={{ width: `${stats?.progress || 0}%` }} />
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Total', value: stats?.total || 0, color: 'text-gray-600' },
            { label: 'To Do', value: stats?.todo || 0, color: 'text-gray-500' },
            { label: 'In Progress', value: stats?.inProgress || 0, color: 'text-blue-500' },
            { label: 'Done', value: stats?.done || 0, color: 'text-green-500' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <p className={`text-xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-400 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Tasks */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Tasks</h3>
          <div className="space-y-2">
            {tasks.map(t => (
              <div key={t._id} onClick={() => navigate(`/tasks/${t._id}`)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all group">
                <div className={`w-2 h-2 rounded-full flex-shrink-0 ${t.status === 'done' ? 'bg-green-500' : t.status === 'in_progress' ? 'bg-blue-500' : t.status === 'review' ? 'bg-purple-500' : 'bg-gray-300'}`} />
                <div className="flex-1 min-w-0">
                  <p className={`text-sm font-medium group-hover:text-indigo-500 transition-colors ${t.status === 'done' ? 'line-through text-gray-400' : 'text-gray-900 dark:text-white'}`}>{t.title}</p>
                </div>
                <div className="flex items-center gap-2">
                  <PriorityBadge priority={t.priority} />
                  {t.deadline && <span className={`text-xs ${isOverdue(t.deadline) && t.status !== 'done' ? 'text-red-500' : 'text-gray-400'}`}>{formatDate(t.deadline)}</span>}
                  <div className="flex -space-x-1">
                    {t.assignedTo?.slice(0, 2).map(u => <Avatar key={u._id} user={u} size="xs" />)}
                  </div>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-sm text-gray-400 text-center py-6">No tasks yet</p>}
          </div>
        </div>

        {/* Members + Info */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Team Members</h3>
            <div className="space-y-2">
              {project.members?.map(m => (
                <div key={m._id} className="flex items-center gap-2">
                  <Avatar user={m} size="sm" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{m.name}</p>
                    <p className="text-xs text-gray-400 capitalize">{m.role}</p>
                  </div>
                </div>
              ))}
              {!project.members?.length && <p className="text-xs text-gray-400">No members</p>}
            </div>
          </div>
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Info</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-gray-400">Created by</span><span className="text-gray-700 dark:text-gray-300">{project.createdBy?.name}</span></div>
              {project.deadline && <div className="flex justify-between"><span className="text-gray-400">Deadline</span><span className={isOverdue(project.deadline) && project.status !== 'completed' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}>{formatDate(project.deadline)}</span></div>}
              <div className="flex justify-between"><span className="text-gray-400">Created</span><span className="text-gray-700 dark:text-gray-300">{formatDate(project.createdAt)}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
