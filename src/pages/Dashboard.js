import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, Spinner } from '../components/ui/index';
import Avatar from '../components/ui/Avatar';
import { timeAgo, isOverdue } from '../utils/helpers';

const StatCard = ({ label, value, icon, color, sub }) => (
  <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800 hover:shadow-lg transition-all duration-300 animate-fade-up">
    <div className="flex items-center justify-between mb-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={icon} />
        </svg>
      </div>
      {sub && <span className="text-xs text-green-500 font-medium bg-green-50 dark:bg-green-900/20 px-2 py-0.5 rounded-full">{sub}</span>}
    </div>
    <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{label}</p>
  </div>
);

const COLORS = ['#0ea5e9', '#06b6d4', '#0284c7', '#38bdf8'];

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState({ projects: [], tasks: [], activities: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [p, t, a] = await Promise.all([
          api.get('/projects'),
          api.get('/tasks?limit=50'),
          api.get('/activity?limit=10')
        ]);
        setData({ projects: p.data, tasks: t.data.tasks, activities: a.data });
      } catch {}
      setLoading(false);
    };
    load();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <Spinner size="lg" />
    </div>
  );

  const { projects, tasks, activities } = data;
  const taskStats = {
    todo: tasks.filter(t => t.status === 'todo').length,
    in_progress: tasks.filter(t => t.status === 'in_progress').length,
    review: tasks.filter(t => t.status === 'review').length,
    done: tasks.filter(t => t.status === 'done').length,
  };
  const projectStats = {
    not_started: projects.filter(p => p.status === 'not_started').length,
    in_progress: projects.filter(p => p.status === 'in_progress').length,
    completed: projects.filter(p => p.status === 'completed').length,
  };
  const overdueTasks = tasks.filter(t => isOverdue(t.deadline) && t.status !== 'done');
  const barData = [
    { name: 'To Do', count: taskStats.todo },
    { name: 'In Progress', count: taskStats.in_progress },
    { name: 'Review', count: taskStats.review },
    { name: 'Done', count: taskStats.done },
  ];
  const pieData = [
    { name: 'Not Started', value: projectStats.not_started },
    { name: 'In Progress', value: projectStats.in_progress },
    { name: 'Completed', value: projectStats.completed },
  ].filter(d => d.value > 0);

  return (
    <div className="space-y-6">
      {/* Welcome */}
      <div className="grad-bg rounded-2xl p-6 text-white relative overflow-hidden"
        style={{ boxShadow: '0 8px 32px rgba(14,165,233,0.35)' }}>
        <div className="absolute right-0 top-0 w-64 h-full opacity-10">
          <div className="w-full h-full animate-spin-slow" style={{ background: 'radial-gradient(circle at 80% 50%, white, transparent)' }} />
        </div>
        <h2 className="text-2xl font-bold mb-1">Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]}! 👋</h2>
        <p className="text-indigo-100 text-sm">You have {taskStats.in_progress} tasks in progress and {overdueTasks.length} overdue.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Projects" value={projects.length} color="grad-bg" icon="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        <StatCard label="Total Tasks" value={tasks.length} color="bg-cyan-500" icon="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        <StatCard label="Completed" value={taskStats.done} color="bg-emerald-500" icon="M5 13l4 4L19 7" sub={tasks.length ? `${Math.round(taskStats.done / tasks.length * 100)}%` : '0%'} />
        <StatCard label="Overdue" value={overdueTasks.length} color="bg-red-500" icon="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Task Overview</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={barData}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} />
              <Bar dataKey="count" fill="url(#grad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Project Status</h3>
          {pieData.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1e293b', border: 'none', borderRadius: 12, color: '#fff', fontSize: 12 }} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-gray-400 text-sm">No project data yet</div>
          )}
        </div>
      </div>

      {/* Recent projects + Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Projects */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-gray-900 dark:text-white">Recent Projects</h3>
            <button onClick={() => navigate('/projects')} className="text-xs text-indigo-500 hover:text-indigo-700 font-medium">View all</button>
          </div>
          <div className="space-y-3">
            {projects.slice(0, 4).map(p => (
              <div key={p._id} onClick={() => navigate(`/projects/${p._id}`)}
                className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all">
                <div className="w-9 h-9 grad-bg rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{p.title[0]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{p.title}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex-1 h-1.5 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="progress-bar h-full" style={{ width: `${p.progress || 0}%` }} />
                    </div>
                    <span className="text-xs text-gray-400">{p.progress || 0}%</span>
                  </div>
                </div>
                <StatusBadge status={p.status} />
              </div>
            ))}
            {projects.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No projects yet</p>}
          </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {activities.slice(0, 6).map(a => (
              <div key={a._id} className="flex items-start gap-3">
                <Avatar user={a.user} size="sm" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-700 dark:text-gray-300">
                    <span className="font-medium">{a.user?.name}</span> {a.action}
                    {a.entityTitle && <span className="font-medium text-indigo-500"> "{a.entityTitle}"</span>}
                  </p>
                  <p className="text-[10px] text-gray-400 mt-0.5">{timeAgo(a.createdAt)}</p>
                </div>
              </div>
            ))}
            {activities.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No activity yet</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
