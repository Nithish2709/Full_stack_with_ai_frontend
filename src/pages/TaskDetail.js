import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Button, Select, PriorityBadge, StatusBadge, Spinner } from '../components/ui/index';
import Avatar from '../components/ui/Avatar';
import { formatDate, timeAgo, isOverdue } from '../utils/helpers';
import toast from 'react-hot-toast';

const TaskDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [task, setTask] = useState(null);
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [posting, setPosting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef();

  useEffect(() => {
    const load = async () => {
      try {
        const [t, c] = await Promise.all([api.get(`/tasks/${id}`), api.get(`/comments/${id}`)]);
        setTask(t.data);
        setComments(c.data);
      } catch { navigate('/tasks'); }
      setLoading(false);
    };
    load();
  }, [id, navigate]);

  const updateStatus = async (status) => {
    try {
      const { data } = await api.put(`/tasks/${id}`, { status });
      setTask(data);
      toast.success('Status updated');
    } catch { toast.error('Error'); }
  };

  const postComment = async (e) => {
    e.preventDefault();
    if (!comment.trim()) return;
    setPosting(true);
    try {
      const { data } = await api.post(`/comments/${id}`, { text: comment });
      setComments(prev => [...prev, data]);
      setComment('');
    } catch { toast.error('Error posting comment'); }
    setPosting(false);
  };

  const deleteComment = async (cid) => {
    try {
      await api.delete(`/comments/${cid}`);
      setComments(prev => prev.filter(c => c._id !== cid));
    } catch { toast.error('Error'); }
  };

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const { data } = await api.post(`/tasks/${id}/upload`, fd);
      setTask(data);
      toast.success('File uploaded');
    } catch { toast.error('Upload failed'); }
    setUploading(false);
  };

  if (loading) return <div className="flex items-center justify-center h-64"><Spinner size="lg" /></div>;
  if (!task) return null;

  return (
    <div className="max-w-4xl mx-auto space-y-5">
      {/* Back */}
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
        Back
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
            <div className="flex items-start gap-3 mb-4">
              <div className="flex-1">
                <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{task.title}</h1>
                <div className="flex flex-wrap gap-2">
                  <StatusBadge status={task.status} />
                  <PriorityBadge priority={task.priority} />
                  {task.project && (
                    <span className="text-xs bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-medium">
                      {task.project.title}
                    </span>
                  )}
                </div>
              </div>
            </div>
            {task.description && (
              <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{task.description}</p>
            )}
          </div>

          {/* Comments */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Comments ({comments.length})</h3>
            <div className="space-y-4 mb-4">
              {comments.map(c => (
                <div key={c._id} className="flex gap-3">
                  <Avatar user={c.user} size="sm" />
                  <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{c.user?.name}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-gray-400">{timeAgo(c.createdAt)}</span>
                        {c.user?._id === user?._id && (
                          <button onClick={() => deleteComment(c._id)} className="text-gray-300 hover:text-red-500 transition-colors">
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{c.text}</p>
                  </div>
                </div>
              ))}
              {comments.length === 0 && <p className="text-sm text-gray-400 text-center py-4">No comments yet</p>}
            </div>
            <form onSubmit={postComment} className="flex gap-2">
              <Avatar user={user} size="sm" />
              <div className="flex-1 flex gap-2">
                <input value={comment} onChange={e => setComment(e.target.value)} placeholder="Add a comment..."
                  className="flex-1 px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-sm text-gray-900 dark:text-gray-100" />
                <Button type="submit" size="sm" loading={posting}>Post</Button>
              </div>
            </form>
          </div>

          {/* Attachments */}
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">Attachments ({task.attachments?.length || 0})</h3>
              <Button size="sm" variant="secondary" onClick={() => fileRef.current?.click()} loading={uploading}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                Upload
              </Button>
              <input ref={fileRef} type="file" className="hidden" onChange={handleUpload} />
            </div>
            <div className="space-y-2">
              {task.attachments?.map((a, i) => (
                <a key={i} href={a.path} target="_blank" rel="noreferrer"
                  className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all group">
                  <div className="w-8 h-8 bg-indigo-50 dark:bg-indigo-900/20 rounded-lg flex items-center justify-center">
                    <svg className="w-4 h-4 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13" /></svg>
                  </div>
                  <span className="text-sm text-gray-700 dark:text-gray-300 group-hover:text-indigo-500 transition-colors truncate">{a.filename}</span>
                </a>
              ))}
              {!task.attachments?.length && <p className="text-sm text-gray-400 text-center py-3">No attachments</p>}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl p-5 border border-gray-100 dark:border-gray-800">
            <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Details</h3>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-gray-400 mb-1">Status</p>
                <Select value={task.status} onChange={e => updateStatus(e.target.value)}>
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="review">Review</option>
                  <option value="done">Done</option>
                </Select>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Priority</p>
                <PriorityBadge priority={task.priority} />
              </div>
              {task.deadline && (
                <div>
                  <p className="text-xs text-gray-400 mb-1">Deadline</p>
                  <p className={`text-sm font-medium ${isOverdue(task.deadline) && task.status !== 'done' ? 'text-red-500' : 'text-gray-700 dark:text-gray-300'}`}>
                    {formatDate(task.deadline)}
                    {isOverdue(task.deadline) && task.status !== 'done' && ' (Overdue)'}
                  </p>
                </div>
              )}
              <div>
                <p className="text-xs text-gray-400 mb-1">Created by</p>
                <div className="flex items-center gap-2">
                  <Avatar user={task.createdBy} size="xs" />
                  <span className="text-sm text-gray-700 dark:text-gray-300">{task.createdBy?.name}</span>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-2">Assigned to</p>
                <div className="space-y-1.5">
                  {task.assignedTo?.map(u => (
                    <div key={u._id} className="flex items-center gap-2">
                      <Avatar user={u} size="xs" />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{u.name}</span>
                    </div>
                  ))}
                  {!task.assignedTo?.length && <p className="text-xs text-gray-400">Unassigned</p>}
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-1">Created</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{timeAgo(task.createdAt)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TaskDetail;
