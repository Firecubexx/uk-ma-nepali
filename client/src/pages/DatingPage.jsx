import { usePageTitle } from '../hooks/usePageTitle';
import { useState, useEffect } from 'react';
import { FiHeart, FiX, FiMessageSquare, FiSettings } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { SpinnerPage, EmptyState, Modal } from '../components/common/UI';
import Avatar from '../components/common/Avatar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import { resolveMediaUrl } from '../utils/helpers';

function MatchPopup({ match, onClose, onMessage }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="card p-8 text-center max-w-sm w-full mx-4 match-pop">
        <div className="text-5xl mb-4">🎉</div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-1">It's a Match!</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6">You and {match.name} liked each other</p>
        <Avatar src={match.avatar} name={match.name} size="2xl" className="mx-auto mb-6" />
        <div className="flex gap-3">
          <button onClick={onClose} className="btn-secondary flex-1">Keep Swiping</button>
          <button onClick={() => onMessage(match._id)} className="btn-primary flex-1 flex items-center justify-center gap-2">
            <FiMessageSquare size={16} /> Message
          </button>
        </div>
      </div>
    </div>
  );
}

function SwipeCard({ profile, onSwipe }) {
  const [swipeDir, setSwipeDir] = useState(null);

  const handleSwipe = (dir) => {
    setSwipeDir(dir);
    setTimeout(() => onSwipe(profile._id, dir), 350);
  };

  return (
    <div className={`relative w-full max-w-sm mx-auto ${swipeDir === 'right' ? 'swipe-right' : swipeDir === 'left' ? 'swipe-left' : ''}`}>
      <div className="card overflow-hidden shadow-xl">
        {/* Profile photo */}
        <div className="relative h-96 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-gray-800 dark:to-gray-700">
          {profile.avatar ? (
            <img src={resolveMediaUrl(profile.avatar)} alt={profile.name} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Avatar src={profile.avatar} name={profile.name} size="2xl" />
            </div>
          )}
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          {/* Info overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h3 className="text-white text-2xl font-bold">
              {profile.name}{profile.age ? `, ${profile.age}` : ''}
            </h3>
            {profile.location && (
              <p className="text-white/80 text-sm mt-0.5">📍 {profile.location}</p>
            )}
            {profile.occupation && (
              <p className="text-white/70 text-sm">💼 {profile.occupation}</p>
            )}
          </div>
        </div>

        {/* Bio */}
        <div className="p-5">
          {profile.bio && <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">{profile.bio}</p>}
          {profile.hometown && (
            <p className="text-xs text-gray-400">🏔️ From {profile.hometown}, Nepal</p>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-center gap-6 pb-6">
          <button
            onClick={() => handleSwipe('left')}
            className="w-14 h-14 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-200 dark:border-gray-600 flex items-center justify-center text-gray-400 hover:border-red-400 hover:text-red-400 hover:scale-110 transition-all shadow-lg"
          >
            <FiX size={26} />
          </button>
          <button
            onClick={() => handleSwipe('right')}
            className="w-16 h-16 rounded-full bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center text-white hover:scale-110 transition-all shadow-lg shadow-primary-200 dark:shadow-primary-900/30"
          >
            <FiHeart size={28} className="fill-current" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function DatingPage() {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  usePageTitle('Dating');
  const [profiles, setProfiles]   = useState([]);
  const [matches, setMatches]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [currentMatch, setCurrentMatch] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [tab, setTab] = useState('discover');
  const [settings, setSettings] = useState({
    datingActive: user?.datingActive || false,
    interestedIn: user?.interestedIn || 'both',
  });

  useEffect(() => {
    if (!user?.datingActive) { setLoading(false); return; }
    const fetchData = async () => {
      try {
        const [profRes, matchRes] = await Promise.all([
          api.get('/dating/profiles'),
          api.get('/dating/matches'),
        ]);
        setProfiles(profRes.data);
        setMatches(matchRes.data);
      } catch {}
      finally { setLoading(false); }
    };
    fetchData();
  }, [user?.datingActive]);

  const handleSwipe = async (profileId, direction) => {
    setProfiles((prev) => prev.filter((p) => p._id !== profileId));
    try {
      const { data } = await api.post('/dating/swipe', { targetId: profileId, direction });
      if (data.matched) {
        const matchedProfile = profiles.find((p) => p._id === profileId);
        setCurrentMatch(matchedProfile);
        setMatches((prev) => [...prev, matchedProfile]);
      }
    } catch { toast.error('Failed to swipe'); }
  };

  const saveSettings = async () => {
    try {
      const { data } = await api.put('/users/profile', settings);
      updateUser(data);
      setShowSettings(false);
      toast.success('Settings saved!');
      if (settings.datingActive) window.location.reload();
    } catch { toast.error('Failed to save'); }
  };

  if (loading) return <SpinnerPage />;

  // Not activated dating profile
  if (!user?.datingActive) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center px-4">
        <div className="text-6xl mb-4">💘</div>
        <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white mb-2">Nepali Dating</h2>
        <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-xs">
          Find your perfect partner in the UK Nepali community. Enable dating to get started.
        </p>
        <button
          onClick={() => setShowSettings(true)}
          className="btn-primary flex items-center gap-2"
        >
          <FiHeart size={18} /> Enable Dating Profile
        </button>

        <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Dating Settings">
          <div className="space-y-4">
            <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
              <span className="font-medium">Enable dating profile</span>
              <input type="checkbox" checked={settings.datingActive} onChange={(e) => setSettings({ ...settings, datingActive: e.target.checked })} className="w-5 h-5 accent-primary-500" />
            </label>
            <div>
              <label className="block text-sm font-medium mb-1">Interested in</label>
              <select className="input-field" value={settings.interestedIn} onChange={(e) => setSettings({ ...settings, interestedIn: e.target.value })}>
                <option value="male">Men</option>
                <option value="female">Women</option>
                <option value="both">Everyone</option>
              </select>
            </div>
            <button onClick={saveSettings} className="btn-primary w-full">Save & Continue</button>
          </div>
        </Modal>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Dating 💘</h1>
        <button onClick={() => setShowSettings(true)} className="btn-secondary flex items-center gap-2 text-sm">
          <FiSettings size={16} /> Settings
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {['discover', 'matches'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${
              tab === t ? 'bg-white dark:bg-gray-700 text-primary-500 shadow-sm' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {t} {t === 'matches' && matches.length > 0 && <span className="ml-1 bg-primary-500 text-white text-xs rounded-full px-1.5">{matches.length}</span>}
          </button>
        ))}
      </div>

      {/* Discover tab */}
      {tab === 'discover' && (
        profiles.length === 0 ? (
          <EmptyState icon="🏔️" title="No more profiles" description="You've seen everyone! Check back later." />
        ) : (
          <SwipeCard profile={profiles[0]} onSwipe={handleSwipe} />
        )
      )}

      {/* Matches tab */}
      {tab === 'matches' && (
        matches.length === 0 ? (
          <EmptyState icon="💫" title="No matches yet" description="Keep swiping to find your match!" />
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {matches.map((match) => (
              <button
                key={match._id}
                onClick={() => navigate(`/chat/${match._id}`)}
                className="card p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow"
              >
                <Avatar src={match.avatar} name={match.name} size="lg" />
                <p className="font-semibold text-sm text-gray-900 dark:text-white">{match.name}</p>
                {match.location && <p className="text-xs text-gray-400">📍 {match.location}</p>}
                <span className="tag text-xs">💬 Message</span>
              </button>
            ))}
          </div>
        )
      )}

      {/* Match popup */}
      {currentMatch && (
        <MatchPopup
          match={currentMatch}
          onClose={() => setCurrentMatch(null)}
          onMessage={(id) => { setCurrentMatch(null); navigate(`/chat/${id}`); }}
        />
      )}

      {/* Settings modal */}
      <Modal open={showSettings} onClose={() => setShowSettings(false)} title="Dating Settings">
        <div className="space-y-4">
          <label className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800">
            <span className="font-medium">Dating profile active</span>
            <input type="checkbox" checked={settings.datingActive} onChange={(e) => setSettings({ ...settings, datingActive: e.target.checked })} className="w-5 h-5 accent-primary-500" />
          </label>
          <div>
            <label className="block text-sm font-medium mb-1">Interested in</label>
            <select className="input-field" value={settings.interestedIn} onChange={(e) => setSettings({ ...settings, interestedIn: e.target.value })}>
              <option value="male">Men</option>
              <option value="female">Women</option>
              <option value="both">Everyone</option>
            </select>
          </div>
          <button onClick={saveSettings} className="btn-primary w-full">Save Settings</button>
        </div>
      </Modal>
    </div>
  );
}
