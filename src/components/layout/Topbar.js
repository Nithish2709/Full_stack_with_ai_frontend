import React, { useState, useRef, useEffect } from 'react';
import { useNotif } from '../../context/NotifContext';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../ui/Avatar';
import { timeAgo } from '../../utils/helpers';
import { useNavigate } from 'react-router-dom';

const NOTIF_ICONS = {
  task_assigned:    { icon: '📋', color: 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400' },
  task_updated:     { icon: '✏️', color: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-600 dark:text-yellow-400' },
  comment_added:    { icon: '💬', color: 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' },
  project_added:    { icon: '🚀', color: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400' },
  deadline_reminder:{ icon: '⏰', color: 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400' },
};

const NotifItem = ({ n, index, onClick }) => {
  const [visible, setVisible] = useState(false);
  const meta = NOTIF_ICONS[n.type] || { icon: '🔔', color: 'bg-gray-100 text-gray-600' };

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 50);
    return () => clearTimeout(t);
  }, [index]);

  return (
    <button
      onClick={() => onClick(n)}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateX(0)' : 'translateX(20px)',
        transition: 'opacity 0.3s ease, transform 0.3s ease',
      }}
      className={`w-full text-left px-4 py-3 flex gap-3 items-start
        hover:bg-gray-50 dark:hover:bg-gray-800/80 transition-colors duration-150
        border-b border-gray-50 dark:border-gray-800/50 last:border-0
        ${!n.read ? 'bg-indigo-50/60 dark:bg-indigo-900/10' : ''}`}
    >
      {/* Icon badge */}
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-sm ${meta.color}`}>
        {meta.icon}
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">{n.message}</p>
        <div className="flex items-center gap-2 mt-1">
          {n.sender && (
            <span className="text-[10px] text-gray-400 font-medium">{n.sender.name}</span>
          )}
          <span className="text-[10px] text-gray-300 dark:text-gray-600">·</span>
          <span className="text-[10px] text-gray-400">{timeAgo(n.createdAt)}</span>
        </div>
      </div>

      {!n.read && (
        <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0 shadow-sm shadow-indigo-500/50" />
      )}
    </button>
  );
};

const Topbar = ({ onMenuClick, title }) => {
  const { notifications, unread, markAllRead, markOneRead } = useNotif();
  const { user } = useAuth();
  const [showNotif, setShowNotif] = useState(false);
  const [panelVisible, setPanelVisible] = useState(false);
  const [bellShake, setBellShake] = useState(false);
  const [prevUnread, setPrevUnread] = useState(unread);
  const notifRef = useRef();
  const navigate = useNavigate();

  /* Shake bell when new notification arrives */
  useEffect(() => {
    if (unread > prevUnread) {
      setBellShake(true);
      setTimeout(() => setBellShake(false), 600);
    }
    setPrevUnread(unread);
  }, [unread, prevUnread]);

  /* Animate panel open/close */
  useEffect(() => {
    if (showNotif) {
      requestAnimationFrame(() => requestAnimationFrame(() => setPanelVisible(true)));
    } else {
      setPanelVisible(false);
    }
  }, [showNotif]);

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNotifClick = (n) => {
    markOneRead(n._id);
    if (n.link) navigate(n.link);
    setShowNotif(false);
  };

  const togglePanel = () => setShowNotif(v => !v);

  return (
    <header className="h-16 flex items-center justify-between px-4 lg:px-6 bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 sticky top-0 z-30">
      <div className="flex items-center gap-3">
        {/* Hamburger */}
        <button onClick={onMenuClick}
          className="lg:hidden w-9 h-9 flex items-center justify-center rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all active:scale-90">
          <svg className="w-5 h-5 text-gray-600 dark:text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h2>
      </div>

      <div className="flex items-center gap-2">
        {/* Notification bell */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={togglePanel}
            className={`relative w-9 h-9 flex items-center justify-center rounded-xl transition-all duration-200
              ${showNotif ? 'bg-indigo-50 dark:bg-indigo-900/20' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}
              active:scale-90`}
          >
            <svg
              className={`w-5 h-5 transition-colors duration-200 ${showNotif ? 'text-indigo-500' : 'text-gray-600 dark:text-gray-400'}`}
              style={bellShake ? { animation: 'bellShake 0.5s ease' } : {}}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
            </svg>

            {/* Unread badge */}
            {unread > 0 && (
              <span
                className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 grad-bg rounded-full text-white text-[10px] flex items-center justify-center font-bold"
                style={{ animation: 'badgePop 0.4s cubic-bezier(0.34,1.56,0.64,1)' }}
              >
                {unread > 9 ? '9+' : unread}
              </span>
            )}

            {/* Pulse ring when unread */}
            {unread > 0 && (
              <span className="absolute -top-0.5 -right-0.5 w-[18px] h-[18px] rounded-full grad-bg opacity-40"
                style={{ animation: 'pulseRing 1.5s ease-out infinite' }} />
            )}
          </button>

          {/* Notification panel */}
          {showNotif && (
            <div
              style={{
                opacity: panelVisible ? 1 : 0,
                transform: panelVisible ? 'translateY(0) scale(1)' : 'translateY(-12px) scale(0.96)',
                transition: 'opacity 0.25s ease, transform 0.3s cubic-bezier(0.34,1.2,0.64,1)',
                transformOrigin: 'top right',
              }}
              className="absolute right-0 top-12 w-84 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-50"
              style2={{ width: '340px' }}
            >
              {/* Panel header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-gray-900 dark:text-white text-sm">Notifications</span>
                  {unread > 0 && (
                    <span className="px-2 py-0.5 rounded-full text-xs grad-bg text-white font-semibold">
                      {unread} new
                    </span>
                  )}
                </div>
                {unread > 0 && (
                  <button onClick={markAllRead}
                    className="text-xs text-indigo-500 hover:text-indigo-700 dark:hover:text-indigo-300 font-medium transition-colors flex items-center gap-1">
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Mark all read
                  </button>
                )}
              </div>

              {/* Items */}
              <div className="max-h-[360px] overflow-y-auto">
                {notifications.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-3 text-2xl">
                      🔔
                    </div>
                    <p className="text-sm font-medium">All caught up!</p>
                    <p className="text-xs mt-0.5">No notifications yet</p>
                  </div>
                ) : (
                  notifications.map((n, i) => (
                    <NotifItem key={n._id} n={n} index={i} onClick={handleNotifClick} />
                  ))
                )}
              </div>

              {/* Footer */}
              {notifications.length > 0 && (
                <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                  <p className="text-xs text-gray-400 text-center">
                    {notifications.length} notification{notifications.length !== 1 ? 's' : ''} total
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Avatar */}
        <div className="hover:scale-105 transition-transform duration-200 cursor-pointer">
          <Avatar user={user} size="sm" />
        </div>
      </div>

      {/* Keyframe styles */}
      <style>{`
        @keyframes bellShake {
          0%,100% { transform: rotate(0deg); }
          15%      { transform: rotate(15deg); }
          30%      { transform: rotate(-12deg); }
          45%      { transform: rotate(10deg); }
          60%      { transform: rotate(-8deg); }
          75%      { transform: rotate(5deg); }
        }
        @keyframes badgePop {
          0%   { transform: scale(0); opacity: 0; }
          70%  { transform: scale(1.3); }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes pulseRing {
          0%   { transform: scale(1); opacity: 0.5; }
          100% { transform: scale(2.5); opacity: 0; }
        }
        @keyframes fadeSlideIn {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </header>
  );
};

export default Topbar;
