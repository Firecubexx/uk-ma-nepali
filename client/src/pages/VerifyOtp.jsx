import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import api from '../utils/api';
import { clearOtpSession, readOtpSession, saveOtpSession } from '../utils/otpSession';

export default function VerifyOtpPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const otpSession = readOtpSession();

  const email = location.state?.email || otpSession.email;

  const [otp, setOtp] = useState('');
  const [devOtp, setDevOtp] = useState(location.state?.devOtp || otpSession.devOtp || '');
  const [loading, setLoading] = useState(false);
  const [timer, setTimer] = useState(30);

  useEffect(() => {
    if (timer === 0) return;

    const interval = setInterval(() => {
      setTimer((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (!email) {
      navigate('/register');
      return;
    }

    saveOtpSession(email, devOtp);
  }, [email, devOtp, navigate]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api.post('/auth/verify-otp', { email, otp });
      clearOtpSession();
      toast.success('Account verified');

      setTimeout(() => {
        navigate('/login');
      }, 1000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      const { data } = await api.post('/auth/resend-otp', { email });

      if (data.devOtp) {
        setDevOtp(data.devOtp);
        toast.success(`Dev OTP: ${data.devOtp}`, { duration: 8000 });
      } else {
        setDevOtp('');
        toast.success('OTP resent');
      }

      setTimer(30);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to resend OTP');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="card p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Verify OTP</h2>

        {email && (
          <p className="mb-3 text-sm text-gray-500">
            Code sent for <strong>{email}</strong>
          </p>
        )}

        {devOtp && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
            Email delivery failed. Use this OTP for now: <strong>{devOtp}</strong>
          </div>
        )}

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
