import { usePageTitle } from '../hooks/usePageTitle';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiEye, FiHeart, FiClock, FiPlus, FiSearch } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { SpinnerPage, EmptyState, Modal } from '../components/common/UI';
import Avatar from '../components/common/Avatar';
import api from '../utils/api';
import { resolveMediaUrl } from '../utils/helpers';

const CATEGORIES = ['all', 'life-in-uk', 'culture', 'travel', 'food', 'career', 'education', 'news', 'health'];

function BlogCard({ blog }) {
  return (
    <Link to={`/blogs/${blog._id}`} className="card overflow-hidden hover:shadow-md transition-shadow fade-in block group">
      {blog.coverImage && (
        <div className="h-44 overflow-hidden">
          <img src={resolveMediaUrl(blog.coverImage)} alt={blog.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
        </div>
      )}
      <div className="p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="tag capitalize text-xs">{blog.category?.replace('-', ' ')}</span>
        </div>
        <h3 className="font-bold text-gray-900 dark:text-white text-base leading-snug mb-1 group-hover:text-primary-500 transition-colors">{blog.title}</h3>
        <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-3">{blog.excerpt}</p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Avatar src={blog.author?.avatar} name={blog.author?.name || '?'} size="xs" />
            <span className="text-xs text-gray-500">{blog.author?.name}</span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-400">
            <span className="flex items-center gap-1"><FiEye size={12} /> {blog.views}</span>
            <span className="flex items-center gap-1"><FiHeart size={12} /> {blog.likes?.length || 0}</span>
            <span className="flex items-center gap-1"><FiClock size={12} /> {formatDistanceToNow(new Date(blog.createdAt), { addSuffix: true })}</span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function BlogsPage() {
  usePageTitle('Blogs');
  const [blogs, setBlogs]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [category, setCategory] = useState('');
  const [search, setSearch]     = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ title: '', content: '', category: 'life-in-uk', tags: '', excerpt: '' });
  const [coverFile, setCoverFile] = useState(null);

  const fetchBlogs = async () => {
    try {
      const params = new URLSearchParams();
      if (category && category !== 'all') params.append('category', category);
      if (search) params.append('search', search);
      const { data } = await api.get(`/blogs?${params}`);
      setBlogs(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBlogs(); }, [category, search]);

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (coverFile) fd.append('coverImage', coverFile);
      const { data } = await api.post('/blogs', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setBlogs((prev) => [data, ...prev]);
      setShowModal(false);
      setForm({ title: '', content: '', category: 'life-in-uk', tags: '', excerpt: '' });
      toast.success('Blog published!');
    } catch { toast.error('Failed to publish'); }
  };

  if (loading) return <SpinnerPage />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Blogs ✍️</h1>
          <p className="text-sm text-gray-500 mt-0.5">Stories from Nepalis across the UK</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Write Blog
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
        <input type="text" placeholder="Search blogs..." className="input-field pl-10" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {CATEGORIES.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c === 'all' ? '' : c)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all capitalize ${
              (c === 'all' && !category) || category === c
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
            }`}
          >
            {c.replace('-', ' ')}
          </button>
        ))}
      </div>

      {/* Blogs grid */}
      {blogs.length === 0 ? (
        <EmptyState icon="✍️" title="No blogs yet" description="Share your story with the community!" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {blogs.map((blog) => <BlogCard key={blog._id} blog={blog} />)}
        </div>
      )}

      {/* Write blog modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Write a Blog Post">
        <form onSubmit={handlePost} className="space-y-3">
          <input className="input-field" placeholder="Blog title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <select className="input-field" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
              {CATEGORIES.filter((c) => c !== 'all').map((c) => (
                <option key={c} value={c} className="capitalize">{c.replace('-', ' ')}</option>
              ))}
            </select>
            <input className="input-field" placeholder="Tags (comma separated)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          </div>
          <input className="input-field" placeholder="Short excerpt (optional)" value={form.excerpt} onChange={(e) => setForm({ ...form, excerpt: e.target.value })} />
          <textarea className="input-field resize-none h-40 text-sm" placeholder="Write your blog content here... *" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} required />
          <div>
            <p className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Cover image (optional)</p>
            <input type="file" accept="image/*" className="text-sm text-gray-500" onChange={(e) => setCoverFile(e.target.files[0])} />
          </div>
          <button type="submit" className="btn-primary w-full">Publish Blog 🚀</button>
        </form>
      </Modal>
    </div>
  );
}
