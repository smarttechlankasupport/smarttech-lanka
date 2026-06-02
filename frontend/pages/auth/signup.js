/* ============================================
   frontend/pages/auth/signup.js
   Purpose: Register page — name, email, phone,
            password confirmation, JWT auth
   ============================================ */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { FiUser, FiMail, FiPhone, FiLock, FiEye, FiEyeOff, FiZap, FiCheck } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { useAuth } from '../../context/AuthContext';

export default function SignupPage() {
  const router = useRouter();
  const { register, isLoggedIn } = useAuth();
  const [form,     setForm]     = useState({ name: '', email: '', phone: '', password: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading,  setLoading]  = useState(false);
  const upd = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => { if (isLoggedIn) router.replace('/'); }, [isLoggedIn]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { toast.error('Fill all required fields'); return; }
    if (form.password.length < 6) { toast.error('Password must be at least 6 characters'); return; }
    if (form.password !== form.confirm) { toast.error("Passwords don't match"); return; }
    setLoading(true);
    try {
      const result = await register({ name: form.name, email: form.email, phone: form.phone, password: form.password });
      if (process.env.NODE_ENV === 'development') {
        console.debug('[signup] register result', result);
      }
      router.replace('/');
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[signup] registration error', err);
      }
      const message = err?.response?.data?.message || err?.message || 'Registration failed. Please try again.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = (p) => {
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s++;
    if (/[A-Z]/.test(p)) s++;
    if (/[0-9]/.test(p)) s++;
    if (/[^A-Za-z0-9]/.test(p)) s++;
    return s;
  };
  const strength      = passwordStrength(form.password);
  const strengthColor = ['', '#b8b8b8', '#d9d9d9', '#e5e5e5', '#f8f8f8'][strength] || '';
  const strengthLabel = ['', 'Weak', 'Fair', 'Good', 'Strong'][strength] || '';

  return (
    <>
      <NextSeo title="Create Account" />
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
            <p className="text-gray-500 text-sm mt-2">Create your free account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {[
              { key: 'name',  label: 'Full Name *',    icon: FiUser,  placeholder: 'Kamal Perera',    type: 'text' },
              { key: 'email', label: 'Email Address *', icon: FiMail,  placeholder: 'you@email.com',   type: 'email' },
              { key: 'phone', label: 'Phone Number',   icon: FiPhone, placeholder: '077 123 4567',    type: 'tel' },
            ].map(f => (
              <div key={f.key}>
                <label className="input-label">{f.label}</label>
                <div className="relative">
                  <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                  <input className="input pl-10" type={f.type} placeholder={f.placeholder}
                    value={form[f.key]} onChange={upd(f.key)} />
                </div>
              </div>
            ))}

            <div>
              <label className="input-label">Password *</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input className="input pl-10 pr-10" type={showPass ? 'text' : 'password'} placeholder="Min. 6 characters"
                  value={form.password} onChange={upd('password')} />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300">
                  {showPass ? <FiEyeOff className="text-sm" /> : <FiEye className="text-sm" />}
                </button>
              </div>
              {form.password && (
                <div className="mt-1.5 flex items-center gap-2">
                  <div className="flex gap-1 flex-1">
                    {[1,2,3,4].map(i => (
                      <div key={i} className="h-1 flex-1 rounded-full transition-all"
                        style={{ background: i <= strength ? strengthColor : '#2f2f2f' }} />
                    ))}
                  </div>
                  <span className="text-xs font-medium" style={{ color: strengthColor }}>{strengthLabel}</span>
                </div>
              )}
            </div>

            <div>
              <label className="input-label">Confirm Password *</label>
              <div className="relative">
                <FiLock className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                <input className="input pl-10 pr-10" type="password" placeholder="Re-enter password"
                  value={form.confirm} onChange={upd('confirm')} />
                {form.confirm && form.password === form.confirm && (
                  <FiCheck className="absolute right-3 top-1/2 -translate-y-1/2 text-green-400" />
                )}
              </div>
            </div>

            <p className="text-xs text-gray-500">
              By creating an account you agree to our{' '}
              <Link href="/terms" className="text-white hover:underline">Terms</Link> &{' '}
              <Link href="/privacy" className="text-white hover:underline">Privacy Policy</Link>.
            </p>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 text-sm justify-center disabled:opacity-60">
              {loading ? <><div className="spinner w-4 h-4" /> Creating account...</> : 'Create Account'}
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
