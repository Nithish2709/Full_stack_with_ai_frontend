import React, { useState } from 'react';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/ui/index';
import Avatar from '../components/ui/Avatar';
import { formatDate } from '../utils/helpers';
import toast from 'react-hot-toast';

const ROLE_COLORS = { admin: 'text-red-500 bg-red-50 dark:bg-red-900/20', manager: 'text-blue-500 bg-blue-50 dark:bg-blue-900/20', user: 'text-gray-500 bg-gray-100 dark:bg-gray-800' };

const Profile = () => {
  const { user, updateUser } = useAuth();
  const [tab, setTab] = useState('profile');
  const [form, setForm] = useState({ name: user?.name || '', avatar: user?.avatar || '' });
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [saving, setSaving] = useState(false);

  const handleProfile = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/auth/profile', form);
      updateUser(data);
      toast.success('Profile updated');
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  const handlePassword = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    setSaving(true);
    try {
      await api.put('/auth/change-password', { currentPassword: pwForm.currentPassword, newPassword: pwForm.newPassword });
      toast.success('Password changed');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Error'); }
    setSaving(false);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Profile card */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 overflow-hidden">
        <div className="h-24 grad-bg relative">
          <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, white, transparent)' }} />
        </div>
        <div className="px-6 pb-5">
          <div className="flex items-end gap-4 -mt-8 mb-4">
            <div className="ring-4 ring-white dark:ring-gray-900 rounded-full">
              <Avatar user={user} size="xl" />
            </div>
            <div className="pb-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">{user?.name}</h2>
              <p className="text-sm text-gray-400">{user?.email}</p>
            </div>
            <span className={`ml-auto mb-1 px-3 py-1 rounded-full text-xs font-semibold capitalize ${ROLE_COLORS[user?.role]}`}>{user?.role}</span>
          </div>
          <div className="flex gap-2 text-sm text-gray-400">
            <span>Joined {formatDate(user?.createdAt)}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {['profile', 'security'].map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex-1 py-2 text-sm font-medium rounded-lg capitalize transition-all ${tab === t ? 'bg-white dark:bg-gray-900 text-gray-900 dark:text-white shadow-sm' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>
            {t}
          </button>
        ))}
      </div>

      {tab === 'profile' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Edit Profile</h3>
          <form onSubmit={handleProfile} className="space-y-4">
            <Input label="Full Name" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            <Input label="Avatar URL" value={form.avatar} onChange={e => setForm(f => ({ ...f, avatar: e.target.value }))} placeholder="https://..." />
            {form.avatar && (
              <div className="flex items-center gap-3">
                <img src={form.avatar} alt="preview" className="w-12 h-12 rounded-full object-cover" onError={e => e.target.style.display = 'none'} />
                <span className="text-xs text-gray-400">Avatar preview</span>
              </div>
            )}
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>Save Changes</Button>
            </div>
          </form>
        </div>
      )}

      {tab === 'security' && (
        <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 border border-gray-100 dark:border-gray-800">
          <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Change Password</h3>
          <form onSubmit={handlePassword} className="space-y-4">
            <Input label="Current Password" type="password" value={pwForm.currentPassword} onChange={e => setPwForm(f => ({ ...f, currentPassword: e.target.value }))} required />
            <Input label="New Password" type="password" value={pwForm.newPassword} onChange={e => setPwForm(f => ({ ...f, newPassword: e.target.value }))} required />
            <Input label="Confirm New Password" type="password" value={pwForm.confirm} onChange={e => setPwForm(f => ({ ...f, confirm: e.target.value }))} required />
            <div className="flex justify-end">
              <Button type="submit" loading={saving}>Update Password</Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default Profile;
