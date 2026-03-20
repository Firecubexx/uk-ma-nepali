import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  FiHeart, FiMessageCircle, FiShare2, FiTrash2,
  FiMoreHorizontal, FiEdit2, FiCheck, FiX,
} from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import Avatar from '../common/Avatar';
import Lightbox from '../common/Lightbox';
import { useAuth } from '../../context/AuthContext';
import { notify } from '../common/NotificationBell';
import api from '../../utils/api';

export default function PostCard({ post, onDelete }) {
  const { user } = useAuth();
  const [likes, setLikes]           = useState(post.likes?.length || 0);
  const [liked, setLiked]           = useState(post.likes?.includes(user?._id));
  const [comments, setComments]     = useState(post.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText]   = useState('');
  const [showMenu, setShowMenu]     = useState(false);
  const [imgIndex, setImgIndex]     = useState(0);
  const [editing, setEditing]       = useState(false);
  const [editText, setEditText]     = useState(post.text || '');
  const [postText, setPostText]     = useState(post.text || '');
  const [lightbox, setLightbox]     = useState(null); // index or null
  const menuRef = useRef();
  const isOwn   = post.author?._id === user?._id;

  // Close menu on outside click
  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLike = async () => {
    try {
      const prev = liked;
      setLiked(!prev);
      setLikes((l) => prev ? l - 1 : l + 1);
      const { data } = await api.post(`/posts/${post._id}/like`);
      setLiked(data.liked);
      setLikes(data.likesCount);
      // Notify post author if someone else liked it
      if (!prev && post.author?._id !== user?._id) {
        notify({ type: 'like', message: `You liked ${post.author?.name}'s post` });
      }
    } catch {
      setLiked(liked); setLikes(likes);
      toast.error('Failed to like');
    }
  };

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    try {
      const { data } = await api.post(`/posts/${post._id}/comment`, { text: commentText });
      setComments((prev) => [...prev, data]);
      setCommentText('');
    } catch { toast.error('Failed to comment'); }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      await api.delete(`/posts/${post._id}/comment/${commentId}`);
      setComments((prev) => prev.filter((c) => c._id !== commentId));
      toast.success('Comment deleted');
    } catch { toast.error('Failed to delete comment'); }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this post?')) return;
    try {
      await api.delete(`/posts/${post._id}`);
      toast.success('Post deleted');
      onDelete?.(post._id);
    } catch { toast.error('Failed to delete'); }
    setShowMenu(false);
  };

  const handleEdit = async () => {
    if (!editText.trim()) return toast.error('Post cannot be empty');
    try {
      await api.put(`/posts/${post._id}`, { text: editText });
      setPostText(editText);
      setEditing(false);
      toast.success('Post updated');
    } catch { toast.error('Failed to update post'); }
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({ title: `${post.author?.name} on UK ma Nepali`, text: postText, url: window.location.href });
    } else {
      navigator.clipboard?.writeText(window.location.href);
      toast.success('Link copied!');
    }
  };

  return (
    <article className="card fade-in overflow-hidden">
      {/* ── Header ────────────────────────────────── */}
      <div className="flex items-start justify-between p-4 pb-3">
        <Link to={`/profile/${post.author?._id}`} className="flex items-center gap-3 hover:opacity-80 transition-opacity min-w-0">
          <Avatar src={post.author?.avatar} name={post.author?.name || '?'} size="md" />
          <div className="min-w-0">
            <p className="font-semibold text-gray-900 dark:text-white text-sm truncate">{post.author?.name}</p>
            <p className="text-xs text-gray-400">
              {post.author?.location && <span className="mr-1">{post.author.location} ·</span>}
              {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
            </p>
          </div>
        </Link>

        {isOwn && (
          <div className="relative shrink-0" ref={menuRef}>
            <button
              onClick={() => setShowMenu((s) => !s)}
              className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 transition-colors"
            >
              <FiMoreHorizontal size={18} />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-10 min-w-[130px] overflow-hidden">
                <button
                  onClick={() => { setEditing(true); setShowMenu(false); }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                >
                  <FiEdit2 size={14} /> Edit post
                </button>
                <button
                  onClick={handleDelete}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  <FiTrash2 size={14} /> Delete
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── Body / Text ───────────────────────────── */}
      {editing ? (
        <div className="px-4 pb-3 space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-800 rounded-xl px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-primary-400 transition-all min-h-[80px]"
            autoFocus
          />
          <div className="flex gap-2 justify-end">
            <button onClick={() => { setEditing(false); setEditText(postText); }} className="btn-secondary py-1.5 px-3 text-sm flex items-center gap-1">
              <FiX size={14} /> Cancel
            </button>
            <button onClick={handleEdit} className="btn-primary py-1.5 px-3 text-sm flex items-center gap-1">
              <FiCheck size={14} /> Save
            </button>
          </div>
        </div>
      ) : (
        postText && (
          <p className="px-4 pb-3 text-gray-800 dark:text-gray-200 text-sm leading-relaxed whitespace-pre-wrap">
            {postText}
          </p>
        )
      )}

      {/* ── Images ────────────────────────────────── */}
      {post.images?.length > 0 && (
        <div className="relative bg-gray-100 dark:bg-gray-800">
          <img
            src={post.images[imgIndex]}
            alt="Post image"
            className="w-full object-cover max-h-[480px] cursor-zoom-in"
            onClick={() => setLightbox(imgIndex)}
          />
          {post.images.length > 1 && (
            <>
              {/* Prev / Next arrows */}
              {imgIndex > 0 && (
                <button
                  onClick={() => setImgIndex((i) => i - 1)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                >‹</button>
              )}
              {imgIndex < post.images.length - 1 && (
                <button
                  onClick={() => setImgIndex((i) => i + 1)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/60 text-white rounded-full w-8 h-8 flex items-center justify-center transition-colors"
                >›</button>
              )}
              {/* Dots */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5">
                {post.images.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setImgIndex(i)}
                    className={`w-2 h-2 rounded-full transition-all ${i === imgIndex ? 'bg-white scale-125' : 'bg-white/50'}`}
                  />
                ))}
              </div>
            </>
          )}
          {/* Image counter badge */}
          {post.images.length > 1 && (
            <span className="absolute top-3 right-3 bg-black/50 text-white text-xs px-2 py-0.5 rounded-full">
              {imgIndex + 1}/{post.images.length}
            </span>
          )}
        </div>
      )}

      {/* ── Action bar ────────────────────────────── */}
      <div className="px-4 py-2 flex items-center gap-1 border-t border-gray-50 dark:border-gray-800">
        <button
          onClick={handleLike}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all active:scale-95 ${
            liked
              ? 'text-red-500 bg-red-50 dark:bg-red-900/20'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <FiHeart size={16} className={liked ? 'fill-current' : ''} />
          <span>{likes > 0 ? likes : ''}</span>
        </button>

        <button
          onClick={() => setShowComments((s) => !s)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium transition-all ${
            showComments
              ? 'text-primary-500 bg-primary-50 dark:bg-primary-900/20'
              : 'text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
        >
          <FiMessageCircle size={16} />
          <span>{comments.length > 0 ? comments.length : ''}</span>
        </button>

        <button
          onClick={handleShare}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all ml-auto"
          title="Share"
        >
          <FiShare2 size={16} />
        </button>
      </div>

      {/* ── Comments ──────────────────────────────── */}
      {showComments && (
        <div className="border-t border-gray-50 dark:border-gray-800 px-4 pt-3 pb-4 space-y-2.5">
          {comments.length === 0 && (
            <p className="text-xs text-gray-400 text-center py-2">No comments yet. Be the first!</p>
          )}

          {comments.map((c, i) => (
            <div key={c._id || i} className="flex gap-2.5 group">
              <Avatar src={c.user?.avatar} name={c.user?.name || '?'} size="xs" />
              <div className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-2xl px-3 py-2">
                <div className="flex items-start justify-between gap-2">
                  <p className="text-xs font-semibold text-gray-700 dark:text-gray-300">{c.user?.name}</p>
                  {(c.user?._id === user?._id || isOwn) && c._id && (
                    <button
                      onClick={() => handleDeleteComment(c._id)}
                      className="text-gray-300 dark:text-gray-600 hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100 shrink-0"
                    >
                      <FiTrash2 size={11} />
                    </button>
                  )}
                </div>
                <p className="text-sm text-gray-800 dark:text-gray-200 mt-0.5">{c.text}</p>
              </div>
            </div>
          ))}

          {/* Comment input */}
          <form onSubmit={handleComment} className="flex gap-2 pt-1">
            <Avatar src={user?.avatar} name={user?.name || '?'} size="xs" />
            <div className="flex-1 flex gap-2">
              <input
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Write a comment..."
                className="flex-1 bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && handleComment(e)}
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="btn-primary py-2 px-3 text-sm disabled:opacity-40"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ── Lightbox ──────────────────────────────── */}
      {lightbox !== null && post.images?.length > 0 && (
        <Lightbox
          images={post.images}
          startIndex={lightbox}
          onClose={() => setLightbox(null)}
        />
      )}
    </article>
  );
}
