/* ============================================
   frontend/pages/auth/login.js
   Purpose: Login page — email/password form,
            JWT auth, redirect after login
   ============================================ */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { FiMail, FiLock, FiEye, FiEyeOff, FiZap } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoggedIn } = useAuth();
  const [form,     setForm]     = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);

  useEffect(() => { if (isLoggedIn) router.replace(router.query.redirect || '/'); }, [isLoggedIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { toast.error('Please fill all fields'); return; }
    setLoading(true);
    try {
      const data = await login(form);
      router.replace(router.query.redirect || (data.user.role === 'admin' ? '/admin' : '/'));
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NextSeo title="Login" />
      <div className="min-h-screen flex items-center justify-center px-4 bg-dark circuit-bg">
        <div className="glow-blob w-80 h-80 bg-white/10 top-1/4 left-1/4 opacity-[0.05]" />

        <div className="glass w-full max-w-md p-8 rounded-2xl relative z-10">
          {/* Logo */}
          <div className="text-center mb-8">
            <Link href="/" className="inline-flex flex-col items-center gap-2">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/50 to-gray-300/15 flex items-center justify-center shadow-soft">
                <FiZap className="text-white text-xl" />
              </div>
              <div className="font-orbitron font-black text-lg text-white">Smart  Tech</div>
            </Link>
            <p className="text-gray-500 text-sm mt-2">Welcome back! Sign in to your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="input-label">Email Address</label>
              <div className="relative">
                <FiMail className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input className="input pl-10" type="email" placeholder="you@email.com"
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} autoComplete="email" />
              </div>
            </div>
            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="input-label mb-0">Password</label>
                <Link href="/auth/forgot-password" className="text-xs text-white hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input className="input pl-10 pr-10" type={showPass ? 'text' : 'password'} placeholder="••••••••"
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} autoComplete="current-password" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm mt-2 justify-center disabled:opacity-60">
              {loading ? <><div className="spinner w-4 h-4" /> Signing in...</> : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Don&apos;t have an account?{' '}
            <Link href="/auth/signup" className="text-white font-semibold hover:underline">Create one free</Link>
          </p>
        </div>
      </div>
    </>
  );
}
