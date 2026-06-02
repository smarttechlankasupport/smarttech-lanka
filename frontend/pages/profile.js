/* ============================================
   frontend/pages/profile.js
   Purpose: User profile — orders, addresses,
            wishlist, settings, order history
   ============================================ */
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { FiUser, FiPackage, FiHeart, FiMapPin, FiSettings, FiEdit2, FiLogOut, FiPlus, FiEye } from 'react-icons/fi';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/ui/ProductCard';
import { useAuth }   from '../context/AuthContext';
import { orderAPI, productAPI } from '../lib/api';
import { formatPrice, formatDate, getStatusBadgeClass, imgUrl } from '../lib/utils';

const TABS = [
  { id: 'overview', label: 'Overview',  icon: FiUser },
  { id: 'orders',   label: 'Orders',    icon: FiPackage },
  { id: 'wishlist', label: 'Wishlist',  icon: FiHeart },
  { id: 'settings', label: 'Settings',  icon: FiSettings },
];

export default function ProfilePage() {
  const router    = useRouter();
  const { user, isLoggedIn, logout, updateProfile } = useAuth();
  const [tab,       setTab]       = useState(router.query.tab || 'overview');
  const [orders,    setOrders]    = useState([]);
  const [wishlist,  setWishlist]  = useState([]);
  const [loadingO,  setLoadingO]  = useState(false);
  const [loadingW,  setLoadingW]  = useState(false);
  const [editForm,  setEditForm]  = useState({ name: '', phone: '' });
  const [saving,    setSaving]    = useState(false);

  useEffect(() => { if (!isLoggedIn) { router.replace('/auth/login?redirect=/profile'); } }, [isLoggedIn]);
  useEffect(() => { if (router.query.tab) setTab(router.query.tab); }, [router.query.tab]);
  useEffect(() => { if (user) setEditForm({ name: user.name || '', phone: user.phone || '' }); }, [user]);

  useEffect(() => {
    if (tab === 'orders' && isLoggedIn) {
      setLoadingO(true);
      orderAPI.getMyOrders().then(r => setOrders(r.data.orders || [])).catch(() => {}).finally(() => setLoadingO(false));
    }
    if (tab === 'wishlist' && isLoggedIn && user?.wishlist?.length > 0) {
      setLoadingW(true);
      productAPI.getAll({ ids: user.wishlist }).then(r => setWishlist(r.data.products || [])).catch(() => {}).finally(() => setLoadingW(false));
    }
  }, [tab, isLoggedIn, user]);

  const handleSave = async () => {
    setSaving(true);
    try { await updateProfile(editForm); }
    catch (e) { toast.error(e.message); }
    finally { setSaving(false); }
  };

  if (!isLoggedIn || !user) return null;

  return (
    <Layout>
      <NextSeo title="My Account" />
      <div className="page-container py-10">
        <div className="grid lg:grid-cols-4 gap-8">

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-6 rounded-2xl text-center mb-4">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-white/50 to-gray-300/15 flex items-center justify-center text-2xl font-black text-white mx-auto mb-3 shadow-soft">
                {user.name?.charAt(0).toUpperCase()}
              </div>
              <h3 className="font-bold text-white">{user.name}</h3>
              <p className="text-xs text-gray-500 mt-1">{user.email}</p>
              {user.role === 'admin' && (
                <span className="badge-yellow mt-2 inline-block">⚙️ Administrator</span>
              )}
            </div>

            <div className="card rounded-2xl overflow-hidden">
              {TABS.map(t => (
                <button key={t.id} onClick={() => { setTab(t.id); router.push(`/profile?tab=${t.id}`, undefined, { shallow: true }); }}
                  className={`w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium transition-all text-left border-b border-white/5 last:border-0 ${
                    tab === t.id ? 'bg-white/10 text-white' : 'text-gray-400 hover:bg-white/3 hover:text-white'}`}>
                  <t.icon className="text-base" /> {t.label}
                </button>
              ))}
              <button onClick={logout} className="w-full flex items-center gap-3 px-5 py-3.5 text-sm font-medium text-red-400 hover:bg-red-400/5 transition-all text-left">
                <FiLogOut className="text-base" /> Sign Out
              </button>
            </div>
          </div>

          {/* Main content */}
          <div className="lg:col-span-3">

            {/* Overview tab */}
            {tab === 'overview' && (
              <div className="space-y-6">
                {/* Quick stats */}
                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: 'Total Orders',    value: orders.length || '—' },
                    { label: 'Wishlist Items',  value: user.wishlist?.length || 0 },
                    { label: 'Saved Addresses', value: user.addresses?.length || 0 },
                  ].map(s => (
                    <div key={s.label} className="card p-5 rounded-xl text-center">
                      <div className="font-orbitron font-bold text-2xl text-white">{s.value}</div>
                      <div className="text-xs text-gray-500 mt-1">{s.label}</div>
                    </div>
                  ))}
                </div>

                {/* Recent order preview */}
                <div className="card p-6 rounded-2xl">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white">Recent Orders</h3>
                    <button onClick={() => setTab('orders')} className="text-xs text-white hover:underline">View All →</button>
                  </div>
                  <p className="text-sm text-gray-500">
                    {user.role === 'admin' ? (
                      <Link href="/admin" className="text-white hover:underline">Go to Admin Panel →</Link>
                    ) : 'Visit Orders tab to see your order history.'}
                  </p>
                </div>
              </div>
            )}

            {/* Orders tab */}
            {tab === 'orders' && (
              <div className="card p-6 rounded-2xl">
                <h3 className="font-bold text-white text-lg mb-6">Order History</h3>
                {loadingO ? (
                  <div className="space-y-3">{Array(3).fill(0).map((_,i) => <div key={i} className="h-20 shimmer rounded-xl" />)}</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-12">
                    <FiPackage className="text-5xl text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500">No orders yet</p>
                    <Link href="/shop" className="btn-primary mt-4 px-6 py-2.5 text-sm inline-flex">Start Shopping</Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map(order => (
                      <div key={order._id} className="glass rounded-xl p-4 hover:border-white/10/20 transition-all">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <p className="font-bold text-white font-orbitron text-sm">{order.orderNumber}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{formatDate(order.createdAt)} · {order.items?.length} item(s)</p>
                          </div>
                          <div className="text-right">
                            <p className="font-orbitron font-bold text-white">{formatPrice(order.totalPrice)}</p>
                            <span className={`badge ${getStatusBadgeClass(order.orderStatus)} mt-1`}>{order.orderStatus}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          {order.items?.slice(0, 3).map((item, i) => (
                            <div key={i} className="relative w-10 h-10 rounded-lg overflow-hidden bg-dark flex-shrink-0">
                              <Image src={item.image || '/placeholder.jpg'} alt="" fill className="object-cover" />
                            </div>
                          ))}
                          {order.items?.length > 3 && (
                            <span className="text-xs text-gray-500">+{order.items.length - 3} more</span>
                          )}
                          <Link href={`/orders/${order._id}`} className="ml-auto text-xs text-white flex items-center gap-1 hover:underline">
                            <FiEye /> View Details
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Wishlist tab */}
            {tab === 'wishlist' && (
              <div className="card p-6 rounded-2xl">
                <h3 className="font-bold text-white text-lg mb-6">My Wishlist</h3>
                {user.wishlist?.length === 0 ? (
                  <div className="text-center py-12">
                    <FiHeart className="text-5xl text-gray-700 mx-auto mb-3" />
                    <p className="text-gray-500">Your wishlist is empty</p>
                    <Link href="/shop" className="btn-primary mt-4 px-6 py-2.5 text-sm inline-flex">Browse Products</Link>
                  </div>
                ) : loadingW ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {Array(3).fill(0).map((_,i) => <div key={i} className="h-64 shimmer rounded-xl" />)}
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {wishlist.map(p => <ProductCard key={p._id} product={p} />)}
                  </div>
                )}
              </div>
            )}

            {/* Settings tab */}
            {tab === 'settings' && (
              <div className="card p-6 rounded-2xl space-y-6">
                <h3 className="font-bold text-white text-lg">Account Settings</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="input-label">Full Name</label>
                    <input className="input" value={editForm.name} onChange={e => setEditForm(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="input-label">Phone Number</label>
                    <input className="input" value={editForm.phone} onChange={e => setEditForm(p => ({ ...p, phone: e.target.value }))} />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="input-label">Email Address</label>
                    <input className="input" value={user.email} disabled style={{ opacity: 0.5, cursor: 'not-allowed' }} />
                    <p className="text-xs text-gray-600 mt-1">Email cannot be changed</p>
                  </div>
                </div>
                <button onClick={handleSave} disabled={saving} className="btn-primary px-8 py-3 text-sm gap-2 disabled:opacity-60">
                  {saving ? <><div className="spinner w-4 h-4" /> Saving...</> : <><FiEdit2 /> Save Changes</>}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
