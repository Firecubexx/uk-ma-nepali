import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Avatar from './Avatar';
import { useAuth } from '../../context/AuthContext';
import api from '../../utils/api';

export default function SuggestedUsers() {
  const { user } = useAuth();
  const [suggested, setSuggested] = useState([]);
  const [followed, setFollowed]   = useState(new Set());

  useEffect(() => {
    // Fetch recently joined users as suggestions
    api.get('/users/search/query?q=')
      .then(({ data }) => setSuggested(data.slice(0, 5)))
      .catch(() => {});
  }, []);

  const handleFollow = async (id) => {
    try {
      await api.post(`/users/${id}/follow`);
      setFollowed((prev) => new Set([...prev, id]));
      toast.success('Following!');
    } catch { toast.error('Failed to follow'); }
  };

  if (suggested.length === 0) return null;

  return (
    <div className="card p-4">
      <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-3">
        🇳🇵 People you may know
      </h3>
      <div className="space-y-3">
        {suggested.map((u) => (
          <div key={u._id} className="flex items-center gap-3">
            <Link to={`/profile/${u._id}`}>
              <Avatar src={u.avatar} name={u.name} size="sm" />
            </Link>
            <div className="flex-1 min-w-0">
              <Link to={`/profile/${u._id}`} className="text-sm font-medium text-gray-900 dark:text-white hover:text-primary-500 transition-colors truncate block">
                {u.name}
              </Link>
              <p className="text-xs text-gray-400 truncate">{u.location || 'UK'}</p>
            </div>
            {!followed.has(u._id) ? (
              <button
                onClick={() => handleFollow(u._id)}
                className="text-xs font-semibold text-primary-500 hover:text-primary-600 transition-colors shrink-0"
              >
                Follow
              </button>
            ) : (
              <span className="text-xs text-gray-400">Following</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
