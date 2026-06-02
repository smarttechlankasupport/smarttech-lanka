import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import { FiLock, FiZap, FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI } from '../../../lib/api';

export default function ResetPasswordPage() {
  const router = useRouter();
  const { token } = router.query;
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!password || !confirm) { toast.error('Fill both password fields'); return; }
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (!token) { toast.error('Reset token is missing'); return; }

    setSubmitting(true);
    try {
      await authAPI.resetPassword({ token, password });
      toast.success('Password reset successful. Please login.');
      router.replace('/auth/login');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <NextSeo title="Reset Password" />
      <div className="min-h-screen flex items-center justify-center px-4 py-10 bg-dark circuit-bg">
        <div className="glow-blob w-80 h-80 bg-gray-900 bottom-1/4 right-1/4 opacity-[0.05]" />
        <div className="glass w-full max-w-md p-8 rounded-2xl relative z-10">
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/50 to-gray-300/15 flex items-center justify-center shadow-soft">
                <FiZap className="text-white text-xl" />
              </div>
              <div className="font-orbitron font-black text-lg text-white">Smart  Tech</div>
            </Link>
            <p className="text-gray-500 text-sm mt-2">Set a new password for your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">New Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  className="input pl-10 pr-10"
                  type={showPass ? 'text' : 'password'}
                  placeholder="New password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
            </div>

            <div>
              <label className="input-label">Confirm Password</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  className="input pl-10"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                />
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 text-sm justify-center disabled:opacity-60">
              {submitting ? 'Resetting password...' : 'Reset password'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link href="/auth/login" className="text-white font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
