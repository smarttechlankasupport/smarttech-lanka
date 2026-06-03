import { useState } from 'react';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import { FiMail, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { authAPI, BASE_URL } from '../../lib/api';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email.trim()) { toast.error('Enter your email address'); return; }
    setSending(true);
    const baseUrl = process.env.NEXT_PUBLIC_API_URL?.trim() || BASE_URL || 'https://smarttech-lanka-api.onrender.com/api';
    const finalUrl = `${baseUrl.replace(/\/+$/, '')}/auth/forgot-password`;
    console.log('Forgot password API base:', baseUrl);
    console.log('Forgot password endpoint:', finalUrl);
    try {
      const res = await authAPI.forgotPassword({ email });
      toast.success(res.data.message || 'Reset link sent if the email exists.');
      setEmail('');
    } catch (err) {
      console.error('Forgot password error:', {
        message: err.message,
        status: err.response?.status,
        data: err.response?.data,
        url: err.config?.url,
        baseURL: err.config?.baseURL,
      });
      const message = err?.response?.data?.message || err?.message || 'Failed to send reset email';
      toast.error(message);
    } finally {
      setSending(false);
    }
  };

  return (
    <>
      <NextSeo title="Forgot Password" />
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
            <p className="text-gray-500 text-sm mt-2">Enter your email to receive a password reset link.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input
                  className="input pl-10"
                  type="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email"
                />
              </div>
            </div>
            <button type="submit" disabled={sending} className="btn-primary w-full py-3.5 text-sm justify-center disabled:opacity-60">
              {sending ? 'Sending reset link...' : 'Send reset link'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Remembered your password?{' '}
            <Link href="/auth/login" className="text-white font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </>
  );
}
