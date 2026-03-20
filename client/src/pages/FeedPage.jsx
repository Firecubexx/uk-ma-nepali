import { usePageTitle } from '../hooks/usePageTitle';
import { useState, useEffect, useRef, useCallback } from 'react';
import { SpinnerPage, EmptyState, Spinner } from '../components/common/UI';
import CreatePost from '../components/feed/CreatePost';
import PostCard from '../components/feed/PostCard';
import StoriesBar from '../components/stories/StoriesBar';
import api from '../utils/api';

export default function FeedPage() {
  usePageTitle('Home');
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage]           = useState(1);
  const [hasMore, setHasMore]     = useState(true);
  const loaderRef = useRef(null);

  const fetchPosts = useCallback(async (p = 1) => {
    if (p === 1) setLoading(true); else setLoadingMore(true);
    try {
      const { data } = await api.get(`/posts?page=${p}`);
      setPosts((prev) => p === 1 ? data : [...prev, ...data]);
      setHasMore(data.length === 10);
    } catch {}
    finally { setLoading(false); setLoadingMore(false); }
  }, []);

  useEffect(() => { fetchPosts(1); }, []);

  // Intersection observer for infinite scroll
  useEffect(() => {
    const el = loaderRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          const next = page + 1;
          setPage(next);
          fetchPosts(next);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, page, fetchPosts]);

  const handleCreated = (post) => setPosts((prev) => [post, ...prev]);
  const handleDelete  = (id)   => setPosts((prev) => prev.filter((p) => p._id !== id));

  if (loading) return <SpinnerPage />;

  return (
    <div className="space-y-4">
      <StoriesBar />
      <CreatePost onCreated={handleCreated} />

      {posts.length === 0 ? (
        <EmptyState
          icon="🏔️"
          title="No posts yet"
          description="Be the first to share something with the community!"
        />
      ) : (
        <>
          {posts.map((post) => (
            <PostCard key={post._id} post={post} onDelete={handleDelete} />
          ))}

          {/* Infinite scroll sentinel */}
          <div ref={loaderRef} className="flex justify-center py-4">
            {loadingMore && <Spinner size="sm" />}
            {!hasMore && posts.length > 0 && (
              <p className="text-sm text-gray-400">You're all caught up! 🎉</p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
