import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import toast from 'react-hot-toast';

const AuthPage = () => {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);
  const { login, register, googleLogin } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'login') await login(form.email, form.password);
      else await register(form.name, form.email, form.password, form.role);
      toast.success(mode === 'login' ? 'Welcome back!' : 'Account created!');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally { setLoading(false); }
  };

  const handleGoogle = async () => {
    const mockGoogleUser = {
      googleId: 'google_' + Date.now(),
      email: 'demo@gmail.com',
      name: 'Google User',
      avatar: 'https://ui-avatars.com/api/?name=Google+User&background=0ea5e9&color=fff'
    };
    try {
      await googleLogin(mockGoogleUser);
      toast.success('Signed in with Google!');
      navigate('/dashboard');
    } catch { toast.error('Google sign-in failed'); }
  };

  return (
    <div className="min-h-screen flex relative overflow-hidden" style={{ background: '#020f1e' }}>

      {/* ── Animated sky-blue orbs ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] rounded-full opacity-25 animate-float"
          style={{ background: 'radial-gradient(circle, #0ea5e9, transparent 70%)' }} />
        <div className="absolute top-1/3 -right-32 w-[420px] h-[420px] rounded-full opacity-20 animate-float-delay"
          style={{ background: 'radial-gradient(circle, #38bdf8, transparent 70%)' }} />
        <div className="absolute -bottom-32 left-1/4 w-[380px] h-[380px] rounded-full opacity-15 animate-float-delay2"
          style={{ background: 'radial-gradient(circle, #06b6d4, transparent 70%)' }} />
        {/* Dot grid */}
        <div className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: 'radial-gradient(#38bdf8 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
        {/* Horizontal glow line */}
        <div className="absolute top-1/2 left-0 right-0 h-px opacity-10"
          style={{ background: 'linear-gradient(90deg, transparent, #38bdf8, transparent)' }} />
      </div>

      {/* ── Left branding panel ── */}
      <div className="hidden lg:flex flex-1 flex-col justify-center px-16 relative z-10">
        <div className="animate-fade-up">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-10">
            <div className="w-14 h-14 grad-bg rounded-2xl flex items-center justify-center shadow-2xl"
              style={{ boxShadow: '0 0 40px rgba(14,165,233,0.5)' }}>
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">ProManage</span>
              <p className="text-xs text-sky-400 mt-0.5 font-medium">Project Management System</p>
            </div>
          </div>

          <h1 className="text-5xl font-extrabold text-white leading-tight mb-4">
            Manage projects<br />
            <span className="grad-text">smarter & faster</span>
          </h1>
          <p className="text-slate-400 text-lg mb-10 max-w-md leading-relaxed">
            Collaborate with your team, track progress, and deliver projects on time with our powerful sky-blue platform.
          </p>

          {/* Feature list */}
          {[
            { label: 'Real-time collaboration', icon: '⚡' },
            { label: 'Kanban drag-and-drop boards', icon: '📋' },
            { label: 'Smart notifications', icon: '🔔' },
            { label: 'Role-based access control', icon: '🔐' },
          ].map((f, i) => (
            <div key={f.label} className="flex items-center gap-3 mb-3 animate-fade-up"
              style={{ animationDelay: `${0.1 + i * 0.1}s`, opacity: 0 }}>
              <div className="w-8 h-8 rounded-xl grad-bg flex items-center justify-center flex-shrink-0 text-sm shadow-lg"
                style={{ boxShadow: '0 0 12px rgba(14,165,233,0.4)' }}>
                {f.icon}
              </div>
              <span className="text-slate-300 text-sm font-medium">{f.label}</span>
            </div>
          ))}

          {/* Stats row */}
          <div className="flex gap-6 mt-10">
            {[['10K+', 'Projects'], ['50K+', 'Tasks'], ['99.9%', 'Uptime']].map(([val, lbl]) => (
              <div key={lbl}>
                <p className="text-2xl font-bold grad-text">{val}</p>
                <p className="text-xs text-slate-500 mt-0.5">{lbl}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-md">

          {/* Theme toggle */}
          <div className="flex justify-end mb-4">
            <button onClick={toggle}
              className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all border border-white/10">
              {dark
                ? <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                : <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
              }
            </button>
          </div>

          {/* Glass card */}
          <div className="glass border border-white/10 rounded-3xl p-8 shadow-2xl animate-fade-up"
            style={{ background: 'rgba(255,255,255,0.06)', boxShadow: '0 0 60px rgba(14,165,233,0.12), 0 25px 50px rgba(0,0,0,0.4)' }}>

            {/* Mobile logo */}
            <div className="flex lg:hidden items-center justify-center gap-2 mb-6">
              <div className="w-8 h-8 grad-bg rounded-xl flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <span className="text-lg font-bold text-white">ProManage</span>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-2xl font-bold text-white mb-1">
                {mode === 'login' ? 'Welcome back 👋' : 'Get started free'}
              </h2>
              <p className="text-slate-400 text-sm">
                {mode === 'login' ? 'Sign in to your workspace' : 'Create your account today'}
              </p>
            </div>

            {/* Google */}
            <button onClick={handleGoogle}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-white hover:bg-sky-50 text-gray-700 font-medium text-sm transition-all mb-4 shadow-lg hover:shadow-sky-500/20 hover:scale-[1.01] active:scale-[0.99]">
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-slate-500 text-xs font-medium">or continue with email</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'signup' && (
                <div style={{ animation: 'fadeSlideIn 0.3s ease forwards' }}>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Full Name</label>
                  <input value={form.name} onChange={e => set('name', e.target.value)} required
                    placeholder="John Doe"
                    className="w-full px-4 py-2.5 rounded-xl bg-white/8 border border-white/15 text-white placeholder-slate-600 text-sm transition-all focus:border-sky-400 focus:bg-white/12"
                    style={{ background: 'rgba(255,255,255,0.06)' }} />
                </div>
              )}
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Email</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)} required
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/15 text-white placeholder-slate-600 text-sm transition-all focus:border-sky-400"
                  style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Password</label>
                <input type="password" value={form.password} onChange={e => set('password', e.target.value)} required
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-white/15 text-white placeholder-slate-600 text-sm transition-all focus:border-sky-400"
                  style={{ background: 'rgba(255,255,255,0.06)' }} />
              </div>
              {mode === 'signup' && (
                <div style={{ animation: 'fadeSlideIn 0.3s ease forwards' }}>
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5 block">Role</label>
                  <select value={form.role} onChange={e => set('role', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-white/15 text-white text-sm transition-all focus:border-sky-400"
                    style={{ background: 'rgba(14,20,36,0.9)' }}>
                    <option value="user">User</option>
                    <option value="manager">Manager</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              )}

              <button type="submit" disabled={loading}
                className="w-full py-3 rounded-xl text-white font-semibold text-sm transition-all disabled:opacity-60 flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-[0.98] mt-2"
                style={{
                  background: 'linear-gradient(135deg, #0284c7 0%, #0ea5e9 50%, #06b6d4 100%)',
                  boxShadow: '0 4px 24px rgba(14,165,233,0.4)',
                }}>
                {loading && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                {mode === 'login' ? 'Sign In' : 'Create Account'}
              </button>
            </form>

            <p className="text-center text-slate-500 text-sm mt-5">
              {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
              <button onClick={() => setMode(m => m === 'login' ? 'signup' : 'login')}
                className="text-sky-400 hover:text-sky-300 font-semibold transition-colors">
                {mode === 'login' ? 'Sign up free' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
