import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiEye, FiHeart, FiArrowLeft, FiClock } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { SpinnerPage } from '../components/common/UI';
import Avatar from '../components/common/Avatar';
import { useAuth } from '../context/AuthContext';
import { usePageTitle } from '../hooks/usePageTitle';
import api from '../utils/api';

export default function BlogDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [blog, setBlog]       = useState(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked]     = useState(false);
  const [likes, setLikes]     = useState(0);

  // Dynamic title based on loaded blog
  usePageTitle(blog?.title ? blog.title.slice(0, 40) : 'Blog');

  useEffect(() => {
    api.get(`/blogs/${id}`)
      .then(({ data }) => {
        setBlog(data);
        setLikes(data.likes?.length || 0);
        setLiked(data.likes?.includes(user?._id));
      })
      .catch(() => toast.error('Blog not found'))
      .finally(() => setLoading(false));
  }, [id]);

  const handleLike = async () => {
    try {
      const { data } = await api.post(`/blogs/${id}/like`);
      setLiked(data.liked);
      setLikes(data.likesCount);
    } catch { toast.error('Failed to like'); }
  };

  if (loading) return <SpinnerPage />;
  if (!blog)   return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">🏔️</p>
      <p className="text-gray-500">Blog not found</p>
      <Link to="/blogs" className="btn-primary mt-4 inline-block">Back to blogs</Link>
    </div>
  );

  return (
    <div className="space-y-4">
      <Link to="/blogs" className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-primary-500 transition-colors">
        <FiArrowLeft size={16} /> Back to Blogs
      </Link>

      <article className="card overflow-hidden">
        {blog.coverImage && (
          <div className="h-56 sm:h-72 overflow-hidden">
            <img src={blog.coverImage} alt={blog.title} className="w-full h-full object-cover" />
          </div>
        )}

        <div className="p-5 sm:p-6">
          {/* Category tag */}
          <div className="mb-3">
            <span className="tag capitalize">{blog.category?.replace('-', ' ')}</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900 dark:text-white leading-snug mb-4">
            {blog.title}
          </h1>

          {/* Author + meta */}
          <div className="flex items-center justify-between flex-wrap gap-3 pb-5 mb-5 border-b border-gray-100 dark:border-gray-800">
            <Link to={`/profile/${blog.author?._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <Avatar src={blog.author?.avatar} name={blog.author?.name || '?'} size="md" />
              <div>
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{blog.author?.name}</p>
                <p className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                  <FiClock size={11} />
                  {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}
                </p>
              </div>
            </Link>

            <div className="flex items-center gap-4 text-sm text-gray-400">
              <span className="flex items-center gap-1.5"><FiEye size={14} /> {blog.views} views</span>
              <button
                onClick={handleLike}
                className={`flex items-center gap-1.5 transition-colors font-medium ${
                  liked ? 'text-red-500' : 'hover:text-red-400'
                }`}
              >
                <FiHeart size={14} className={liked ? 'fill-current' : ''} />
                {likes} {likes === 1 ? 'like' : 'likes'}
              </button>
            </div>
          </div>

          {/* Blog content — render paragraphs */}
          <div className="prose dark:prose-invert max-w-none">
            {blog.content.split('\n').map((para, i) =>
              para.trim()
                ? <p key={i} className="mb-4 text-gray-700 dark:text-gray-300 leading-relaxed">{para}</p>
                : <div key={i} className="mb-2" />
            )}
          </div>

          {/* Tags */}
          {blog.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
              {blog.tags.map((tag) => (
                <span key={tag} className="tag">#{tag}</span>
              ))}
            </div>
          )}

          {/* Bottom like button */}
          <div className="mt-6 pt-5 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
            <button
              onClick={handleLike}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all ${
                liked
                  ? 'bg-red-50 dark:bg-red-900/20 text-red-500'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-500'
              }`}
            >
              <FiHeart size={16} className={liked ? 'fill-current' : ''} />
              {liked ? 'Liked' : 'Like this article'}
            </button>

            <Link to={`/profile/${blog.author?._id}`} className="text-sm text-primary-500 hover:underline font-medium">
              More by {blog.author?.name?.split(' ')[0]} →
            </Link>
          </div>
        </div>
      </article>
    </div>
  );
}
