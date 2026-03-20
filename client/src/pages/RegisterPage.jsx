import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';

const UK_CITIES = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Edinburgh', 'Bristol', 'Cardiff', 'Leicester', 'Nottingham', 'Sheffield', 'Liverpool', 'Southampton', 'Reading', 'Coventry', 'Other'];

export default function RegisterPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', location: '', gender: '', age: '' });
  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      login(data.user, data.token);
      toast.success(`Welcome to UK ma Nepali, ${data.user.name}! 🎉`);
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🇳🇵</div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">UK ma Nepali</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Join thousands of Nepalis across the UK</p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold mb-6">Create your account</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Full Name *</label>
              <input type="text" className="input-field" placeholder="Your full name" value={form.name} onChange={set('name')} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input type="email" className="input-field" placeholder="you@example.com" value={form.email} onChange={set('email')} required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password *</label>
              <input type="password" className="input-field" placeholder="Minimum 6 characters" value={form.password} onChange={set('password')} required />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium mb-1">City in UK</label>
                <select className="input-field" value={form.location} onChange={set('location')}>
                  <option value="">Select city</option>
                  {UK_CITIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Gender</label>
                <select className="input-field" value={form.gender} onChange={set('gender')}>
                  <option value="">Select</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                  <option value="other">Other</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Age</label>
              <input type="number" className="input-field" placeholder="Your age" min="18" max="100" value={form.age} onChange={set('age')} />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base mt-2">
              {loading ? 'Creating account...' : 'Join Community 🎉'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
            Already have an account?{' '}
            <Link to="/login" className="text-primary-500 font-semibold hover:underline">Sign in</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
