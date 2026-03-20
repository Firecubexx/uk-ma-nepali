import { usePageTitle } from '../hooks/usePageTitle';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiLock, FiTrash2, FiShield, FiBell, FiMoon, FiSun } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import api from '../utils/api';

function Section({ title, icon: Icon, children }) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-gray-100 dark:border-gray-800">
        <Icon size={18} className="text-primary-500" />
        <h2 className="font-bold text-gray-900 dark:text-white">{title}</h2>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function SettingsPage() {
  usePageTitle('Settings');
  const { user, logout } = useAuth();
  const { dark, toggle } = useTheme();
  const navigate = useNavigate();
  const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
  const [pwLoading, setPwLoading] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (pwForm.newPassword !== pwForm.confirm) return toast.error('Passwords do not match');
    if (pwForm.newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    setPwLoading(true);
    try {
      await api.put('/users/password', {
        currentPassword: pwForm.currentPassword,
        newPassword: pwForm.newPassword,
      });
      toast.success('Password updated!');
      setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update password');
    } finally { setPwLoading(false); }
  };

  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      'Are you SURE you want to delete your account? This cannot be undone.\n\nType "DELETE" to confirm.'
    );
    if (!confirmed) return;
    try {
      await api.delete('/users/account');
      toast.success('Account deleted');
      logout();
      navigate('/login');
    } catch { toast.error('Failed to delete account'); }
  };

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Settings ⚙️</h1>
        <p className="text-sm text-gray-500 mt-0.5">Manage your account preferences</p>
      </div>

      {/* Appearance */}
      <Section title="Appearance" icon={dark ? FiMoon : FiSun}>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium text-gray-900 dark:text-white">Dark Mode</p>
            <p className="text-sm text-gray-500">Switch between light and dark theme</p>
          </div>
          <button
            onClick={toggle}
            className={`relative w-12 h-6 rounded-full transition-colors ${dark ? 'bg-primary-500' : 'bg-gray-200 dark:bg-gray-700'}`}
          >
            <span
              className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${dark ? 'translate-x-6' : ''}`}
            />
          </button>
        </div>
      </Section>

      {/* Change password */}
      <Section title="Change Password" icon={FiLock}>
        <form onSubmit={handlePasswordChange} className="space-y-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Current password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Enter current password"
              value={pwForm.currentPassword}
              onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">New password</label>
            <input
              type="password"
              className="input-field"
              placeholder="At least 6 characters"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Confirm new password</label>
            <input
              type="password"
              className="input-field"
              placeholder="Repeat new password"
              value={pwForm.confirm}
              onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })}
              required
            />
          </div>
          <button type="submit" disabled={pwLoading} className="btn-primary">
            {pwLoading ? 'Updating...' : 'Update Password'}
          </button>
        </form>
      </Section>

      {/* Privacy */}
      <Section title="Privacy & Safety" icon={FiShield}>
        <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
          <p>• Your posts are visible to all registered members of UK ma Nepali.</p>
          <p>• Your profile information is visible to all registered members.</p>
          <p>• To block a user, visit their profile page and use the options menu.</p>
          <p>• To report content, please email: <a href="mailto:support@ukmanepali.com" className="text-primary-500 hover:underline">support@ukmanepali.com</a></p>
        </div>
      </Section>

      {/* Account info */}
      <Section title="Account" icon={FiShield}>
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Email</span>
            <span className="font-medium text-gray-900 dark:text-white">{user?.email}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gray-500">Member since</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' }) : 'N/A'}
            </span>
          </div>
        </div>
      </Section>

      {/* Danger zone */}
      <Section title="Danger Zone" icon={FiTrash2}>
        <div className="space-y-3">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Deleting your account is permanent and cannot be undone. All your posts, messages, and data will be removed.
          </p>
          <button
            onClick={handleDeleteAccount}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 border-red-200 dark:border-red-900 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 font-semibold text-sm transition-all"
          >
            <FiTrash2 size={16} />
            Delete My Account
          </button>
        </div>
      </Section>
    </div>
  );
}
