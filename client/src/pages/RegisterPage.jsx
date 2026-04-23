import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

const UK_CITIES = [
  'London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow',
  'Edinburgh', 'Bristol', 'Cardiff', 'Leicester', 'Nottingham',
  'Sheffield', 'Liverpool', 'Southampton', 'Reading', 'Coventry', 'Other'
];

export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    location: '',
    gender: '',
    age: ''
  });

  const [loading, setLoading] = useState(false);

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();

    console.log("🔥 SUBMIT CLICKED");

    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);

    try {
      const res = await api.post('/auth/register', form);
      const data = res.data;

      console.log("✅ RESPONSE:", data);

      toast.success('OTP sent to your email 📩');

      navigate('/verify-otp', {
        state: { email: form.email }
      });

    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 via-white to-blue-50 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 p-4">
      <div className="w-full max-w-md">

        <div className="text-center mb-8">
          <div className="text-6xl mb-3">🇳🇵</div>
          <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">
            UK ma Nepali
          </h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            Join thousands of Nepalis across the UK
          </p>
        </div>

        <div className="card p-8">
          <h2 className="text-xl font-bold mb-6">Create your account</h2>

          <form onSubmit={handleSubmit} className="space-y-4">

            <input
              type="text"
              className="input-field"
              placeholder="Full Name"
              value={form.name}
              onChange={set('name')}
              required
            />

            <input
              type="email"
              className="input-field"
              placeholder="Email"
              value={form.email}
              onChange={set('email')}
              required
            />

            <input
              type="password"
              className="input-field"
              placeholder="Password"
              value={form.password}
              onChange={set('password')}
              required
            />

            <select
              className="input-field"
              value={form.location}
              onChange={set('location')}
            >
              <option value="">Select City</option>
              {UK_CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <select
              className="input-field"
              value={form.gender}
              onChange={set('gender')}
            >
              <option value="">Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>

            <input
              type="number"
              className="input-field"
              placeholder="Age"
              value={form.age}
              onChange={set('age')}
            />

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full"
            >
              {loading ? 'Creating...' : 'Register'}
            </button>

          </form>

          <div className="mt-4 text-center">
            <Link to="/login">Already have account? Login</Link>
          </div>

        </div>
      </div>
    </div>
  );
}