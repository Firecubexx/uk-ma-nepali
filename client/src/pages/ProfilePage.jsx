import { usePageTitle } from '../hooks/usePageTitle';
import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiEdit2, FiMapPin, FiBriefcase, FiMessageSquare, FiUserPlus, FiUserCheck, FiCamera, FiUserX, FiShare2 } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { SpinnerPage, Modal } from '../components/common/UI';
import PostCard from '../components/feed/PostCard';
import Avatar from '../components/common/Avatar';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const UK_CITIES = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Edinburgh', 'Bristol', 'Cardiff', 'Leicester', 'Nottingham', 'Sheffield', 'Liverpool', 'Southampton', 'Reading', 'Coventry', 'Other'];

export default function ProfilePage() {
  const { id } = useParams();
  const { user, updateUser } = useAuth();
  usePageTitle('Profile');
  const [profile, setProfile]     = useState(null);
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
  const [following, setFollowing] = useState(false);
  const [blocked,   setBlocked]   = useState(false);
  const [showEdit, setShowEdit]   = useState(false);
  const [form, setForm] = useState({});
  const [tab, setTab]   = useState('posts');
  const avatarRef = useRef();

  const profileId = id || user?._id;
  const isOwn = profileId === user?._id;

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [profRes, postsRes] = await Promise.all([
          api.get(`/users/${profileId}`),
          api.get(`/posts/user/${profileId}`),
        ]);
        setProfile(profRes.data);
        setPosts(postsRes.data);
        setFollowing(profRes.data.followers?.some((f) => f._id === user?._id || f === user?._id));
        setForm({
          name: profRes.data.name,
          bio: profRes.data.bio,
          location: profRes.data.location,
          hometown: profRes.data.hometown,
          occupation: profRes.data.occupation,
          gender: profRes.data.gender,
          age: profRes.data.age,
        });
      } catch { toast.error('Failed to load profile'); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [profileId]);

  const handleFollow = async () => {
    try {
      const { data } = await api.post(`/users/${profileId}/follow`);
      setFollowing(data.following);
      setProfile((prev) => ({
        ...prev,
        followers: data.following
          ? [...(prev.followers || []), user]
          : (prev.followers || []).filter((f) => f._id !== user?._id),
      }));
    } catch { toast.error('Failed to follow'); }
  };

  const handleBlock = () => {
    if (!window.confirm(blocked ? 'Unblock this user?' : 'Block this user?')) return;
    setBlocked((b) => !b);
    toast.success(blocked ? 'User unblocked' : 'User blocked');
  };

  const handleShareProfile = () => {
    const url = `${window.location.origin}/profile/${profileId}`;
    navigator.clipboard?.writeText(url);
    toast.success('Profile link copied!');
  };

  const handleSaveProfile = async () => {
    try {
      const { data } = await api.put('/users/profile', form);
      setProfile(data);
      updateUser(data);
      setShowEdit(false);
      toast.success('Profile updated!');
    } catch { toast.error('Failed to update'); }
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('avatar', file);
    try {
      const { data } = await api.post('/users/avatar', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setProfile((prev) => ({ ...prev, avatar: data.avatar }));
      updateUser(data.user);
      toast.success('Avatar updated!');
    } catch { toast.error('Failed to update avatar'); }
  };

  if (loading) return <SpinnerPage />;
  if (!profile) return <div className="text-center py-20 text-gray-500">User not found</div>;

  return (
    <div className="space-y-4">
      {/* Profile card */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
          {/* Avatar with upload */}
          <div className="relative">
            <Avatar src={profile.avatar} name={profile.name} size="2xl" />
            {isOwn && (
              <>
                <button
                  onClick={() => avatarRef.current.click()}
                  className="absolute bottom-1 right-1 bg-primary-500 text-white rounded-full p-1.5 shadow-md hover:bg-primary-600 transition-colors"
                >
                  <FiCamera size={14} />
                </button>
                <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
              </>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 text-center sm:text-left">
            <h2 className="text-2xl font-extrabold text-gray-900 dark:text-white">{profile.name}</h2>
            {profile.bio && <p className="text-gray-500 dark:text-gray-400 mt-1 text-sm leading-relaxed">{profile.bio}</p>}

            <div className="flex flex-wrap justify-center sm:justify-start gap-3 mt-2 text-sm text-gray-500 dark:text-gray-400">
              {profile.location && <span className="flex items-center gap-1"><FiMapPin size={13} /> {profile.location}, UK</span>}
              {profile.hometown && <span className="flex items-center gap-1">🏔️ {profile.hometown}</span>}
              {profile.occupation && <span className="flex items-center gap-1"><FiBriefcase size={13} /> {profile.occupation}</span>}
              {profile.age && <span>🎂 {profile.age} years</span>}
            </div>

            {/* Stats */}
            <div className="flex justify-center sm:justify-start gap-6 mt-4">
              <div className="text-center">
                <p className="font-bold text-gray-900 dark:text-white">{posts.length}</p>
                <p className="text-xs text-gray-400">Posts</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900 dark:text-white">{profile.followers?.length || 0}</p>
                <p className="text-xs text-gray-400">Followers</p>
              </div>
              <div className="text-center">
                <p className="font-bold text-gray-900 dark:text-white">{profile.following?.length || 0}</p>
                <p className="text-xs text-gray-400">Following</p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-2">
            {isOwn ? (
              <button onClick={() => setShowEdit(true)} className="btn-secondary flex items-center gap-2 text-sm">
                <FiEdit2 size={15} /> Edit Profile
              </button>
            ) : (
              <>
                <button onClick={handleFollow} className={`flex items-center gap-2 text-sm ${following ? 'btn-secondary' : 'btn-primary'}`}>
                  {following ? <><FiUserCheck size={15} /> Following</> : <><FiUserPlus size={15} /> Follow</>}
                </button>
                <Link to={`/chat/${profileId}`} className="btn-secondary flex items-center gap-2 text-sm">
                  <FiMessageSquare size={15} /> Message
                </Link>
                <button onClick={handleShareProfile} className="btn-secondary p-2" title="Share profile">
                  <FiShare2 size={15} />
                </button>
                <button
                  onClick={handleBlock}
                  className={`p-2 rounded-xl border-2 transition-all ${blocked ? 'border-red-400 text-red-400 bg-red-50 dark:bg-red-900/20' : 'border-gray-200 dark:border-gray-700 text-gray-400 hover:border-red-300 hover:text-red-400'}`}
                  title={blocked ? 'Unblock user' : 'Block user'}
                >
                  <FiUserX size={15} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-xl">
        {['posts', 'about'].map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all capitalize ${tab === t ? 'bg-white dark:bg-gray-700 text-primary-500 shadow-sm' : 'text-gray-500 dark:text-gray-400'}`}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Posts tab */}
      {tab === 'posts' && (
        posts.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <p className="text-4xl mb-2">📭</p>
            <p>{isOwn ? "You haven't posted anything yet." : "No posts yet."}</p>
          </div>
        ) : (
          posts.map((post) => <PostCard key={post._id} post={post} onDelete={(id) => setPosts((prev) => prev.filter((p) => p._id !== id))} />)
        )
      )}

      {/* About tab */}
      {tab === 'about' && (
        <div className="card p-5 space-y-4">
          <h3 className="font-bold text-gray-900 dark:text-white">About {isOwn ? 'Me' : profile.name}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {[
              { label: '📍 City in UK',     value: profile.location },
              { label: '🏔️ Hometown',       value: profile.hometown },
              { label: '💼 Occupation',     value: profile.occupation },
              { label: '🎂 Age',            value: profile.age ? `${profile.age} years old` : null },
              { label: '⚧ Gender',         value: profile.gender },
              { label: '📅 Joined',         value: profile.createdAt ? new Date(profile.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : null },
            ].map(({ label, value }) => value ? (
              <div key={label} className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
                <p className="text-xs text-gray-400 mb-0.5">{label}</p>
                <p className="font-medium text-gray-800 dark:text-gray-200 capitalize">{value}</p>
              </div>
            ) : null)}
          </div>
          {profile.bio && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-3">
              <p className="text-xs text-gray-400 mb-1">📝 Bio</p>
              <p className="text-gray-700 dark:text-gray-300 text-sm leading-relaxed">{profile.bio}</p>
            </div>
          )}
        </div>
      )}

      {/* Edit profile modal */}
      <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Edit Profile">
        <div className="space-y-3">
          <input className="input-field" placeholder="Full name" value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <textarea className="input-field resize-none h-24 text-sm" placeholder="Bio (max 300 characters)" value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} maxLength={300} />
          <div className="grid grid-cols-2 gap-3">
            <select className="input-field" value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })}>
              <option value="">City in UK</option>
              {UK_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
            <input className="input-field" placeholder="Hometown in Nepal" value={form.hometown || ''} onChange={(e) => setForm({ ...form, hometown: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" placeholder="Occupation" value={form.occupation || ''} onChange={(e) => setForm({ ...form, occupation: e.target.value })} />
            <input type="number" className="input-field" placeholder="Age" value={form.age || ''} onChange={(e) => setForm({ ...form, age: e.target.value })} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <select className="input-field" value={form.gender || ''} onChange={(e) => setForm({ ...form, gender: e.target.value })}>
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <button onClick={handleSaveProfile} className="btn-primary w-full">Save Changes</button>
        </div>
      </Modal>
    </div>
  );
}
