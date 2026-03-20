import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiSearch, FiX } from 'react-icons/fi';
import Avatar from './Avatar';
import { useDebounce } from '../../hooks/useApi';
import api from '../../utils/api';

export default function GlobalSearch() {
  const [query, setQuery]   = useState('');
  const [results, setResults] = useState({ users: [], jobs: [], blogs: [] });
  const [open, setOpen]     = useState(false);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef();
  const containerRef = useRef();
  const debounced = useDebounce(query, 350);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Search when debounced query changes
  useEffect(() => {
    if (!debounced.trim()) { setResults({ users: [], jobs: [], blogs: [] }); setOpen(false); return; }
    const search = async () => {
      setLoading(true);
      try {
        const [usersRes, jobsRes, blogsRes] = await Promise.all([
          api.get(`/users/search/query?q=${debounced}`),
          api.get(`/jobs?search=${debounced}`),
          api.get(`/blogs?search=${debounced}`),
        ]);
        setResults({ users: usersRes.data.slice(0, 3), jobs: jobsRes.data.slice(0, 3), blogs: blogsRes.data.slice(0, 3) });
        setOpen(true);
      } catch {}
      finally { setLoading(false); }
    };
    search();
  }, [debounced]);

  const clear = () => { setQuery(''); setOpen(false); };
  const hasResults = results.users.length + results.jobs.length + results.blogs.length > 0;

  return (
    <div ref={containerRef} className="relative w-full max-w-sm">
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => debounced && setOpen(true)}
          placeholder="Search people, jobs, blogs..."
          className="w-full pl-9 pr-8 py-2.5 rounded-xl bg-gray-100 dark:bg-gray-800 text-sm outline-none focus:ring-2 focus:ring-primary-400 transition-all text-gray-800 dark:text-gray-200 placeholder-gray-400"
        />
        {query && (
          <button onClick={clear} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
            <FiX size={14} />
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-gray-900 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden">
          {loading && (
            <div className="p-4 text-center text-sm text-gray-400">Searching...</div>
          )}

          {!loading && !hasResults && debounced && (
            <div className="p-6 text-center text-sm text-gray-400">
              No results for "{debounced}"
            </div>
          )}

          {!loading && hasResults && (
            <>
              {/* Users */}
              {results.users.length > 0 && (
                <div>
                  <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">People</p>
                  {results.users.map((u) => (
                    <Link key={u._id} to={`/profile/${u._id}`} onClick={clear}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <Avatar src={u.avatar} name={u.name} size="sm" />
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{u.name}</p>
                        <p className="text-xs text-gray-400">{u.location || 'UK'}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Jobs */}
              {results.jobs.length > 0 && (
                <div className="border-t border-gray-50 dark:border-gray-800">
                  <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Jobs</p>
                  {results.jobs.map((j) => (
                    <Link key={j._id} to="/jobs" onClick={clear}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-8 h-8 bg-primary-100 dark:bg-primary-900/30 rounded-lg flex items-center justify-center text-sm">💼</div>
                      <div>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">{j.title}</p>
                        <p className="text-xs text-gray-400">{j.company} · {j.location}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              {/* Blogs */}
              {results.blogs.length > 0 && (
                <div className="border-t border-gray-50 dark:border-gray-800">
                  <p className="px-4 pt-3 pb-1 text-xs font-bold text-gray-400 uppercase tracking-wider">Blogs</p>
                  {results.blogs.map((b) => (
                    <Link key={b._id} to={`/blogs/${b._id}`} onClick={clear}
                      className="flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center text-sm">✍️</div>
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{b.title}</p>
                        <p className="text-xs text-gray-400 capitalize">{b.category?.replace('-', ' ')}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}

              <div className="border-t border-gray-50 dark:border-gray-800 p-2">
                <button onClick={clear} className="w-full text-xs text-center text-primary-500 hover:underline py-1">
                  View all results for "{debounced}"
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
}
