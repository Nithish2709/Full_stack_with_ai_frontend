import { format, formatDistanceToNow, isPast } from 'date-fns';

export const formatDate = (d) => d ? format(new Date(d), 'MMM dd, yyyy') : '—';
export const timeAgo = (d) => d ? formatDistanceToNow(new Date(d), { addSuffix: true }) : '';
export const isOverdue = (d) => d && isPast(new Date(d));

export const priorityColor = (p) => ({
  critical: 'badge-critical', high: 'badge-high', medium: 'badge-medium', low: 'badge-low'
}[p] || 'badge-low');

export const statusColor = (s) => ({
  todo: 'status-todo', in_progress: 'status-in_progress',
  review: 'status-review', done: 'status-done',
  not_started: 'status-todo', completed: 'status-done', on_hold: 'status-review'
}[s] || 'status-todo');

export const statusLabel = (s) => ({
  todo: 'To Do', in_progress: 'In Progress', review: 'Review', done: 'Done',
  not_started: 'Not Started', completed: 'Completed', on_hold: 'On Hold'
}[s] || s);

export const getInitials = (name = '') =>
  name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

export const avatarColor = (name = '') => {
  const colors = ['#6366f1','#8b5cf6','#06b6d4','#10b981','#f59e0b','#ef4444','#ec4899'];
  let hash = 0;
  for (let c of name) hash = c.charCodeAt(0) + ((hash << 5) - hash);
  return colors[Math.abs(hash) % colors.length];
};
