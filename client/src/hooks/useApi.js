import { useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

/**
 * useApi — generic data-fetching hook
 * Usage:
 *   const { data, loading, error, refetch } = useApi('/posts');
 */
export function useApi(url, options = {}) {
  const [data, setData]     = useState(options.initialData ?? null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState(null);

  const fetch = useCallback(async () => {
    if (!url) { setLoading(false); return; }
    setLoading(true);
    setError(null);
    try {
      const res = await api.get(url);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }, [url]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

/**
 * useInfiniteScroll — append items as user scrolls
 * Usage:
 *   const { items, loading, hasMore, loaderRef } = useInfiniteScroll('/posts', 10);
 */
export function useInfiniteScroll(url, limit = 10) {
  const [items, setItems]   = useState([]);
  const [page, setPage]     = useState(1);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(true);
  const loaderRef           = useState(null);

  const loadPage = useCallback(async (p) => {
    setLoading(true);
    try {
      const { data } = await api.get(`${url}?page=${p}&limit=${limit}`);
      setItems((prev) => (p === 1 ? data : [...prev, ...data]));
      setHasMore(data.length === limit);
    } catch {}
    finally { setLoading(false); }
  }, [url, limit]);

  useEffect(() => { loadPage(1); }, [url]);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    loadPage(next);
  };

  const prepend = (item) => setItems((prev) => [item, ...prev]);
  const remove  = (id)   => setItems((prev) => prev.filter((i) => i._id !== id));

  return { items, loading, hasMore, loadMore, prepend, remove };
}

/**
 * useDebounce — debounce a value
 */
export function useDebounce(value, delay = 400) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/**
 * useLocalStorage — synced localStorage state
 */
export function useLocalStorage(key, defaultValue) {
  const [value, setValue] = useState(() => {
    try { return JSON.parse(localStorage.getItem(key)) ?? defaultValue; }
    catch { return defaultValue; }
  });

  const set = (v) => {
    setValue(v);
    localStorage.setItem(key, JSON.stringify(v));
  };

  return [value, set];
}
