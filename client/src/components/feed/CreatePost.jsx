import { useState, useRef } from 'react';
import { FiImage, FiX, FiMapPin } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

const MAX_CHARS = 2000;

export default function CreatePost({ onCreated }) {
  const { user }  = useAuth();
  const [text, setText]       = useState('');
  const [images, setImages]   = useState([]);
  const [previews, setPreviews] = useState([]);
  const [loading, setLoading] = useState(false);
  const [focused, setFocused] = useState(false);
  const fileRef = useRef();

  const handleFiles = (e) => {
    const files = Array.from(e.target.files);
    if (files.length + images.length > 5) { toast.error('Maximum 5 images per post'); return; }
    const oversized = files.filter((f) => f.size > 5 * 1024 * 1024);
    if (oversized.length) { toast.error('Each image must be under 5 MB'); return; }
    setImages((prev) => [...prev, ...files]);
    setPreviews((prev) => [...prev, ...files.map((f) => URL.createObjectURL(f))]);
    // Reset the input so the same file can be re-selected
    e.target.value = '';
  };

  const removeImage = (i) => {
    URL.revokeObjectURL(previews[i]);
    setImages((prev) => prev.filter((_, idx) => idx !== i));
    setPreviews((prev) => prev.filter((_, idx) => idx !== i));
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    if (!text.trim() && images.length === 0) { toast.error('Write something or add a photo'); return; }
    if (text.length > MAX_CHARS) { toast.error(`Post is too long (max ${MAX_CHARS} characters)`); return; }

    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('text', text.trim());
      images.forEach((img) => fd.append('images', img));

      const { data } = await api.post('/posts', fd, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      onCreated?.(data);
      setText('');
      previews.forEach((p) => URL.revokeObjectURL(p));
      setImages([]);
      setPreviews([]);
      setFocused(false);
      toast.success('Post shared! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to share post');
    } finally { setLoading(false); }
  };

  const charsLeft  = MAX_CHARS - text.length;
  const charsWarn  = charsLeft < 100;
  const charsDanger = charsLeft < 20;

  return (
    <div className={`card p-4 transition-shadow ${focused ? 'shadow-md ring-1 ring-primary-200 dark:ring-primary-800' : ''}`}>
      <div className="flex gap-3">
        <Avatar src={user?.avatar} name={user?.name || '?'} size="md" />

        <div className="flex-1 min-w-0">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onFocus={() => setFocused(true)}
            placeholder={`What's on your mind, ${user?.name?.split(' ')[0]}? 🇳🇵`}
            className="w-full bg-gray-50 dark:bg-gray-800 rounded-2xl px-4 py-3 text-sm resize-none outline-none focus:ring-2 focus:ring-primary-300 dark:focus:ring-primary-700 transition-all placeholder:text-gray-400"
            style={{ minHeight: focused ? '100px' : '52px' }}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) handleSubmit();
            }}
          />

          {/* Character counter */}
          {focused && text.length > MAX_CHARS - 200 && (
            <div className={`text-right text-xs mt-1 font-medium ${charsDanger ? 'text-red-500' : charsWarn ? 'text-amber-500' : 'text-gray-400'}`}>
              {charsLeft} characters remaining
            </div>
          )}

          {/* Image previews */}
          {previews.length > 0 && (
            <div className={`grid gap-2 mt-2 ${previews.length === 1 ? 'grid-cols-1' : previews.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
              {previews.map((src, i) => (
                <div key={i} className="relative group aspect-square">
                  <img src={src} alt="" className="w-full h-full object-cover rounded-xl" />
                  <button
                    type="button"
                    onClick={() => removeImage(i)}
                    className="absolute top-1.5 right-1.5 bg-black/60 hover:bg-black/80 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <FiX size={12} />
                  </button>
                </div>
              ))}
              {previews.length < 5 && (
                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  className="aspect-square border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-xl flex flex-col items-center justify-center text-gray-400 hover:border-primary-400 hover:text-primary-400 transition-colors"
                >
                  <FiImage size={20} />
                  <span className="text-xs mt-1">Add more</span>
                </button>
              )}
            </div>
          )}

          {/* Action bar */}
          {(focused || text || images.length > 0) && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => fileRef.current.click()}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm text-gray-500 dark:text-gray-400 hover:text-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/20 font-medium transition-colors"
                  title="Add photos"
                >
                  <FiImage size={17} />
                  <span className="hidden sm:inline">Photo</span>
                </button>
                <input
                  ref={fileRef}
                  type="file"
                  multiple
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  className="hidden"
                  onChange={handleFiles}
                />
              </div>

              <div className="flex items-center gap-2">
                {focused && (
                  <button
                    type="button"
                    onClick={() => { setFocused(false); setText(''); setImages([]); previews.forEach((p) => URL.revokeObjectURL(p)); setPreviews([]); }}
                    className="btn-secondary text-sm py-2 px-3"
                  >
                    Cancel
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={loading || (!text.trim() && images.length === 0) || charsDanger}
                  className="btn-primary text-sm py-2 px-4 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      Sharing...
                    </span>
                  ) : 'Share'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
