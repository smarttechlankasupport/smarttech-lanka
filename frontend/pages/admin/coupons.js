/* ============================================
   frontend/pages/admin/coupons.js
   Purpose: Coupon / discount code management —
            create, toggle active, delete
   ============================================ */
import { useState, useEffect } from 'react';
import { useRouter }           from 'next/router';
import { FiPlus, FiTrash2, FiTag, FiToggleLeft, FiToggleRight, FiX } from 'react-icons/fi';
import toast                   from 'react-hot-toast';
import AdminLayout             from '../../components/layout/AdminLayout';
import { couponAPI }           from '../../lib/api';
import { useAuth }             from '../../context/AuthContext';
import { formatDate, formatPrice } from '../../lib/utils';

const EMPTY = {
  code: '', type: 'percentage', value: '', minOrderAmount: '',
  maxDiscount: '', usageLimit: '100', expiresAt: '', description: '',
};

const todayPlus = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export default function AdminCoupons() {
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
  const router                                    = useRouter();
  const [coupons,  setCoupons]  = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form,     setForm]     = useState({ ...EMPTY, expiresAt: todayPlus(30) });
  const [saving,   setSaving]   = useState(false);
  const [deleting, setDeleting] = useState(null);
  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || !isAdmin) { router.replace('/'); return; }
    fetchCoupons();
  }, [isLoggedIn, isAdmin, authLoading]);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await couponAPI.getAll();
      setCoupons(res.data.coupons || []);
    } catch { toast.error('Failed to load coupons'); }
    finally { setLoading(false); }
  };

  const handleCreate = async () => {
    if (!form.code || !form.value || !form.expiresAt) {
      toast.error('Fill: code, value, expiry date'); return;
    }
    setSaving(true);
    try {
      const res = await couponAPI.create({
        ...form,
        code:           form.code.toUpperCase(),
        value:          Number(form.value),
        minOrderAmount: Number(form.minOrderAmount) || 0,
        maxDiscount:    form.maxDiscount ? Number(form.maxDiscount) : undefined,
        usageLimit:     Number(form.usageLimit) || 100,
      });
      setCoupons(prev => [res.data.coupon, ...prev]);
      setShowForm(false);
      setForm({ ...EMPTY, expiresAt: todayPlus(30) });
      toast.success('Coupon created! 🎉');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  const toggleActive = async (coupon) => {
    try {
      await couponAPI.update(coupon._id, { isActive: !coupon.isActive });
      setCoupons(prev => prev.map(c => c._id === coupon._id ? { ...c, isActive: !c.isActive } : c));
      toast.success(coupon.isActive ? 'Coupon disabled' : 'Coupon enabled');
    } catch (err) { toast.error(err.message); }
  };

  const handleDelete = async (id, code) => {
    if (!confirm(`Delete coupon "${code}"?`)) return;
    setDeleting(id);
    try {
      await couponAPI.delete(id);
      setCoupons(prev => prev.filter(c => c._id !== id));
      toast.success('Coupon deleted');
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(null); }
  };

  const isExpired = (expiresAt) => new Date(expiresAt) < new Date();

  return (
    <AdminLayout title="Coupons & Discounts">
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-white">Coupons <span className="text-gray-500 font-normal text-sm">({coupons.length})</span></h2>
          <p className="text-xs text-gray-500 mt-0.5">Create and manage discount coupon codes</p>
        </div>
        <button onClick={() => setShowForm(true)} className="btn-primary px-4 py-2.5 text-sm gap-2">
          <FiPlus /> Create Coupon
        </button>
      </div>

      {/* Coupon cards grid */}
      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array(4).fill(0).map((_,i) => <div key={i} className="h-36 shimmer rounded-2xl" />)}
        </div>
      ) : coupons.length === 0 ? (
        <div className="text-center py-20">
          <FiTag className="text-6xl text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No coupons yet</p>
          <button onClick={() => setShowForm(true)} className="btn-primary px-6 py-3 text-sm">Create First Coupon</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {coupons.map(c => {
            const expired = isExpired(c.expiresAt);
            const usePct  = c.usageLimit > 0 ? Math.round((c.usedCount / c.usageLimit) * 100) : 0;
            return (
              <div key={c._id} className={`card p-5 rounded-2xl relative overflow-hidden transition-all ${
                !c.isActive || expired ? 'opacity-50' : 'hover:border-white/10'
              }`}>
                {/* Background accent */}
                <div className="absolute top-0 right-0 w-24 h-24 opacity-5"
                  style={{ background: 'radial-gradient(circle, #f8f8f8, transparent)', transform: 'translate(30%, -30%)' }} />

                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-orbitron font-black text-white text-lg tracking-widest">{c.code}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{c.description || 'No description'}</p>
                  </div>
                  <div className="flex gap-1.5 items-center">
                    <button onClick={() => toggleActive(c)}
                      className={`text-2xl transition-colors ${c.isActive && !expired ? 'text-white' : 'text-gray-700'}`}>
                      {c.isActive ? <FiToggleRight /> : <FiToggleLeft />}
                    </button>
                    <button onClick={() => handleDelete(c._id, c.code)} disabled={deleting === c._id}
                      className="p-1 text-red-400/50 hover:text-red-400 transition-colors disabled:opacity-30">
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>

                {/* Discount value */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-orbitron font-black text-3xl text-white">
                    {c.type === 'percentage' ? `${c.value}%` : `Rs.${c.value}`}
                  </span>
                  <span className="text-xs text-gray-500">
                    {c.type === 'percentage' ? 'discount' : 'flat off'}
                    {c.maxDiscount ? ` (max ${formatPrice(c.maxDiscount)})` : ''}
                  </span>
                </div>

                {/* Details */}
                <div className="space-y-1 text-xs text-gray-500 mb-3">
                  {c.minOrderAmount > 0 && <p>Min order: {formatPrice(c.minOrderAmount)}</p>}
                  <p>Expires: <span className={expired ? 'text-red-400 font-semibold' : 'text-gray-400'}>{formatDate(c.expiresAt)}</span></p>
                </div>

                {/* Usage bar */}
                <div>
                  <div className="flex justify-between text-[10px] text-gray-500 mb-1">
                    <span>Used: {c.usedCount} / {c.usageLimit}</span>
                    <span>{usePct}%</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/8 overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${usePct}%`, background: '#f8f8f8' }} />
                  </div>
                </div>

                {/* Status chips */}
                <div className="flex gap-1.5 mt-3">
                  {expired      && <span className="badge-red text-[9px] px-1.5 py-0.5">Expired</span>}
                  {!c.isActive  && !expired && <span className="badge text-[9px] px-1.5 py-0.5 bg-gray-700/50 text-gray-400">Disabled</span>}
                  {c.isActive && !expired && <span className="badge-green text-[9px] px-1.5 py-0.5">Active</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create coupon modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl overflow-hidden bg-dark-card border border-white/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="font-bold text-white flex items-center gap-2"><FiTag className="text-white" /> Create Coupon</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><FiX /></button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="input-label">Coupon Code *</label>
                  <input className="input uppercase text-base font-bold tracking-widest" placeholder="SMART10"
                    value={form.code} onChange={e => setForm(p => ({ ...p, code: e.target.value.toUpperCase() }))} />
                </div>
                <div>
                  <label className="input-label">Type</label>
                  <select className="input" value={form.type} onChange={upd('type')}>
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed">Fixed Amount (Rs.)</option>
                  </select>
                </div>
                <div>
                  <label className="input-label">Discount Value *</label>
                  <input className="input" type="number" min="1"
                    placeholder={form.type === 'percentage' ? '10 (= 10%)' : '500 (= Rs. 500)'}
                    value={form.value} onChange={upd('value')} />
                </div>
                <div>
                  <label className="input-label">Max Discount (Rs.) — optional</label>
                  <input className="input" type="number" placeholder="e.g. 2000"
                    value={form.maxDiscount} onChange={upd('maxDiscount')} />
                </div>
                <div>
                  <label className="input-label">Min Order Amount (Rs.)</label>
                  <input className="input" type="number" placeholder="0 = no minimum"
                    value={form.minOrderAmount} onChange={upd('minOrderAmount')} />
                </div>
                <div>
                  <label className="input-label">Total Usage Limit</label>
                  <input className="input" type="number" min="1"
                    placeholder="100" value={form.usageLimit} onChange={upd('usageLimit')} />
                </div>
                <div>
                  <label className="input-label">Expiry Date *</label>
                  <input className="input" type="date" value={form.expiresAt}
                    min={new Date().toISOString().split('T')[0]} onChange={upd('expiresAt')} />
                </div>
                <div>
                  <label className="input-label">Description</label>
                  <input className="input" placeholder="New year promo, etc." value={form.description} onChange={upd('description')} />
                </div>
              </div>

              {/* Preview */}
              {form.code && form.value && (
                <div className="glass p-3 rounded-xl text-center">
                  <p className="text-xs text-gray-500 mb-1">Preview</p>
                  <p className="font-orbitron font-black text-white text-xl tracking-widest">{form.code}</p>
                  <p className="text-sm text-gray-400">
                    {form.type === 'percentage' ? `${form.value}% off` : `Rs. ${form.value} off`}
                    {form.minOrderAmount > 0 ? ` on orders over ${formatPrice(Number(form.minOrderAmount))}` : ''}
                  </p>
                </div>
              )}

              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="btn-outline flex-1 py-3 text-sm justify-center">Cancel</button>
                <button onClick={handleCreate} disabled={saving} className="btn-primary flex-1 py-3 text-sm justify-center gap-2 disabled:opacity-60">
                  {saving ? <><div className="spinner w-4 h-4" /> Creating...</> : <><FiTag /> Create Coupon</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
