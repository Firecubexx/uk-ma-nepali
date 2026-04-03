import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email;

  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  // ⏳ Countdown
  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  // ❗ If no email, redirect
  useEffect(() => {
    if (!email) {
      navigate('/register');
    }
  }, [email, navigate]);

  // 🔐 Verify OTP
  const handleVerify = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await api.post('/auth/verify-otp', { email, otp });

      toast.success('Account verified 🎉');

      // 🔄 Redirect after success
      setTimeout(() => {
        navigate('/login');
      }, 1000);

    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  // 🔁 Resend OTP
  const handleResend = async () => {
    try {
      await api.post('/auth/resend-otp', { email });

      toast.success('OTP resent 📩');
      setTimer(30); // reset timer

    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Verify OTP</h2>

        <form onSubmit={handleVerify} className="space-y-4">
          <input
            type="text"
            className="input-field"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            required
          />

          <button
            type="submit"
            className="btn-primary w-full"
            disabled={loading}
          >
            {loading ? 'Verifying...' : 'Verify'}
          </button>
        </form>

        {/* ⏳ Timer + Resend */}
        <div className="mt-4 text-center">
          {timer > 0 ? (
            <p className="text-gray-500">
              Resend OTP in {timer}s
            </p>
          ) : (
            <button
              onClick={handleResend}
              className="text-primary-600 font-semibold"
            >
              Resend OTP
            </button>
          )}
        </div>
      </div>
    </div>
  );
}