import { useState, useEffect, useRef } from 'react';
import { FiBell } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import api from '../../utils/api';

// Tiny client-side event bus so other components can push instant notifications
const listeners = new Set();
export const notify = (notif) => listeners.forEach((fn) => fn(notif));

const ICON = { like: '❤️', comment: '💬', follow: '👤', match: '💘', job: '💼', message: '✉️' };

export default function NotificationBell() {
  const [notifs, setNotifs]   = useState([]);
  const [open, setOpen]       = useState(false);
  const [unread, setUnread]   = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  // Fetch real notifications from server
  const fetchNotifs = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/notifications');
      setNotifs(data);
      setUnread(data.length); // treat all as unread initially
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchNotifs(); }, []);

  // Subscribe to instant client-side notifications (e.g. after liking)
  useEffect(() => {
    const handler = (n) => {
      setNotifs((prev) => [{ ...n, id: Date.now(), createdAt: new Date() }, ...prev].slice(0, 30));
      setUnread((u) => u + 1);
    };
    listeners.add(handler);
    return () => listeners.delete(handler);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleOpen = () => {
    setOpen((o) => !o);
    if (!open) setUnread(0); // mark all read on open
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={handleOpen}
        className="relative p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        title="Notifications"
      >
        <FiBell size={20} className="text-gray-600 dark:text-gray-400" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[17px] h-[17px] flex items-center justify-center px-1">
            {unread > 9 ? '9+' : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden fade-in">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm">Notifications</h3>
            <button
              onClick={fetchNotifs}
              className="text-xs text-primary-500 hover:underline"
            >
              Refresh
            </button>
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto">
            {loading ? (
              <div className="py-8 flex justify-center">
                <div className="w-6 h-6 border-2 border-primary-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifs.length === 0 ? (
              <div className="py-12 text-center">
                <p className="text-3xl mb-2">🔔</p>
                <p className="text-sm text-gray-400">No notifications yet</p>
                <p className="text-xs text-gray-400 mt-1">Interact with the community to get started!</p>
              </div>
            ) : (
              notifs.map((n, i) => (
                <div
                  key={n.id || i}
                  className="flex items-start gap-3 px-4 py-3 border-b border-gray-50 dark:border-gray-800 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  <span className="text-lg mt-0.5 shrink-0">{ICON[n.type] || '🔔'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200 leading-snug">{n.message}</p>
                    {n.excerpt && (
                      <p className="text-xs text-gray-400 mt-0.5 truncate">"{n.excerpt}"</p>
                    )}
                    {n.createdAt && (
                      <p className="text-xs text-gray-400 mt-0.5">
                        {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {notifs.length > 0 && (
            <div className="border-t border-gray-50 dark:border-gray-800 px-4 py-2 text-center">
              <p className="text-xs text-gray-400">{notifs.length} notifications · last 30 days</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
