import { useState, useEffect, useRef } from 'react';
import { FiPlus, FiX } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

// Individual story viewer modal
function StoryViewer({ stories, startIndex, onClose }) {
  const [current, setCurrent] = useState(startIndex);
  const story = stories[current];
  const timeoutRef = useRef();

  useEffect(() => {
    // Auto-advance after 5 seconds
    api.post(`/stories/${story._id}/view`).catch(() => {});
    timeoutRef.current = setTimeout(() => {
      if (current < stories.length - 1) setCurrent((c) => c + 1);
      else onClose();
    }, 5000);
    return () => clearTimeout(timeoutRef.current);
  }, [current]);

  if (!story) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
      <button onClick={onClose} className="absolute top-4 right-4 text-white z-10 p-2">
        <FiX size={24} />
      </button>

      {/* Progress bars */}
      <div className="absolute top-0 left-0 right-0 flex gap-1 p-3 z-10">
        {stories.map((_, i) => (
          <div key={i} className="flex-1 h-0.5 bg-white/30 rounded-full overflow-hidden">
            <div
              className={`h-full bg-white rounded-full ${i === current ? 'animate-[progress_5s_linear]' : i < current ? 'w-full' : 'w-0'}`}
              style={i === current ? { animation: 'progress 5s linear forwards' } : {}}
            />
          </div>
        ))}
      </div>

      {/* Story author */}
      <div className="absolute top-8 left-4 flex items-center gap-2 z-10">
        <Avatar src={story.author?.avatar} name={story.author?.name || '?'} size="sm" />
        <div>
          <p className="text-white font-semibold text-sm">{story.author?.name}</p>
          <p className="text-white/70 text-xs">{story.author?.location}</p>
        </div>
      </div>

      {/* Story content */}
      <div className="w-full max-w-sm h-screen flex items-center justify-center relative">
        {story.media ? (
          <img src={story.media} alt="Story" className="w-full h-full object-cover" />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center p-8"
            style={{ backgroundColor: story.backgroundColor || '#FF6B35' }}
          >
            <p className="text-white text-2xl font-bold text-center leading-relaxed">{story.text}</p>
          </div>
        )}
        {story.text && story.media && (
          <div className="absolute bottom-16 left-0 right-0 px-6">
            <p className="text-white text-lg font-semibold text-center drop-shadow-lg">{story.text}</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 w-12 h-1/2"
        onClick={() => current > 0 && setCurrent((c) => c - 1)}
      />
      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 w-12 h-1/2"
        onClick={() => current < stories.length - 1 ? setCurrent((c) => c + 1) : onClose()}
      />
    </div>
  );
}

export default function StoriesBar() {
  const { user } = useAuth();
  const [stories, setStories]   = useState([]);
  const [viewing, setViewing]   = useState(null);
  const [creating, setCreating] = useState(false);
  const [storyText, setStoryText] = useState('');
  const [bgColor, setBgColor]   = useState('#FF6B35');
  const [file, setFile]         = useState(null);
  const fileRef = useRef();

  useEffect(() => {
    api.get('/stories').then(({ data }) => setStories(data)).catch(() => {});
  }, []);

  const handleCreate = async () => {
    if (!storyText.trim() && !file) { toast.error('Add text or image'); return; }
    try {
      const fd = new FormData();
      if (storyText) fd.append('text', storyText);
      fd.append('backgroundColor', bgColor);
      if (file) fd.append('media', file);
      const { data } = await api.post('/stories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setStories((prev) => [data, ...prev]);
      setCreating(false);
      setStoryText('');
      setFile(null);
      toast.success('Story added!');
    } catch { toast.error('Failed to add story'); }
  };

  const colors = ['#FF6B35', '#DC143C', '#003893', '#10B981', '#8B5CF6', '#F59E0B', '#EC4899', '#1a1a2e'];

  return (
    <>
      <div className="card p-4">
        <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-hide">
          {/* Add story button */}
          <button
            onClick={() => setCreating(true)}
            className="flex flex-col items-center gap-1.5 shrink-0"
          >
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white shadow-lg shadow-primary-200 dark:shadow-primary-900/30">
              <FiPlus size={24} />
            </div>
            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Your story</span>
          </button>

          {/* Story avatars */}
          {stories.map((story, i) => (
            <button
              key={story._id}
              onClick={() => setViewing(i)}
              className="flex flex-col items-center gap-1.5 shrink-0"
            >
              <div className="p-0.5 rounded-2xl story-ring">
                <div className="p-0.5 bg-white dark:bg-gray-900 rounded-[14px]">
                  <Avatar src={story.author?.avatar} name={story.author?.name || '?'} size="md" className="rounded-xl" />
                </div>
              </div>
              <span className="text-xs font-medium text-gray-600 dark:text-gray-400 max-w-[60px] truncate">
                {story.author?._id === user?._id ? 'You' : story.author?.name?.split(' ')[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Story viewer */}
      {viewing !== null && (
        <StoryViewer stories={stories} startIndex={viewing} onClose={() => setViewing(null)} />
      )}

      {/* Create story modal */}
      {creating && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="card w-full max-w-sm p-6 fade-in">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-lg">Add a Story</h3>
              <button onClick={() => setCreating(false)} className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800"><FiX /></button>
            </div>

            {/* Preview */}
            <div
              className="w-full aspect-[9/16] max-h-48 rounded-2xl flex items-center justify-center mb-4 relative overflow-hidden"
              style={{ backgroundColor: file ? '#000' : bgColor }}
            >
              {file ? (
                <img src={URL.createObjectURL(file)} alt="" className="w-full h-full object-cover" />
              ) : (
                <p className="text-white font-bold text-lg text-center px-4">{storyText || 'Your story preview'}</p>
              )}
            </div>

            <textarea
              value={storyText}
              onChange={(e) => setStoryText(e.target.value)}
              placeholder="What's your story?"
              className="input-field resize-none mb-3 h-20 text-sm"
            />

            {/* Colour picker */}
            <div className="flex gap-2 mb-3 flex-wrap">
              {colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setBgColor(c)}
                  className={`w-7 h-7 rounded-lg transition-transform ${bgColor === c ? 'scale-125 ring-2 ring-offset-2 ring-gray-400' : ''}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>

            <div className="flex gap-2">
              <button onClick={() => fileRef.current.click()} className="btn-secondary flex-1 text-sm">
                📷 Photo
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => setFile(e.target.files[0])} />
              <button onClick={handleCreate} className="btn-primary flex-1 text-sm">Share Story</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
