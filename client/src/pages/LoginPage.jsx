import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      login(data.user, data.token);
      toast.success(`Welcome back, ${data.user.name}! 🎉`);
      navigate('/');
    } catch (err) {
  const msg = err.response?.data?.message;

  if (msg === 'Please verify OTP first') {
    toast.error('Please verify OTP first');

    // 🔥 Redirect to OTP page
    navigate('/verify-otp', {
      state: { email: form.email }
    });

  } else {
    toast.error(msg || 'Login failed');
  }
}
   finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🇳🇵</div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">UK ma Nepali</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your community in the United Kingdom</p>
        </div>

        {/* Card */}
        <div className="card p-8">
          <h2 className="text-xl font-bold mb-6">Welcome back 👋</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label>
              <input
                type="password"
                className="input-field"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-500 font-semibold hover:underline">
              Join the community
            </Link>
          </div>
        </div>

        {/* Nepal flag colours strip */}
        <div className="mt-6 flex rounded-xl overflow-hidden h-1.5">
          <div className="flex-1 bg-nepal-red" />
          <div className="flex-1 bg-nepal-blue" />
        </div>
      </div>
    </div>
  );
}
