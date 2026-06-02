/* ============================================
   frontend/pages/admin/index.js
   Purpose: Admin dashboard — revenue charts,
            stats, recent orders, low stock
   ============================================ */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FiTrendingUp, FiShoppingBag, FiUsers, FiPackage, FiAlertTriangle, FiArrowRight, FiRefreshCw } from 'react-icons/fi';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import AdminLayout from '../../components/layout/AdminLayout';
import { adminAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';
import { formatPrice, formatDate, getStatusBadgeClass } from '../../lib/utils';

const COLORS = ['#f8f8f8','#d9d9d9','#c8c8c8','#b8b8b8','#a8a8a8','#999999'];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass px-3 py-2 rounded-lg text-xs">
      <p className="text-gray-400 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-bold">
          {p.name === 'revenue' ? formatPrice(p.value) : p.value} {p.name !== 'revenue' && p.name}
        </p>
      ))}
    </div>
  );
};

export default function AdminDashboard() {
  const { user, isLoggedIn, isAdmin } = useAuth();
  const router   = useRouter();
  const [data,   setData]    = useState(null);
  const [loading,setLoading] = useState(true);

  useEffect(() => {
    if (!isLoggedIn) { router.replace('/auth/login'); return; }
    if (!isAdmin)    { router.replace('/'); return; }
    fetchStats();
  }, [isLoggedIn, isAdmin]);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await adminAPI.getStats();
      setData(res.data);
    } catch {}
    finally { setLoading(false); }
  };

  const STAT_CARDS = data ? [
    { label: 'Total Revenue',   value: formatPrice(data.stats.totalRevenue),   icon: FiTrendingUp, color: '#f8f8f8',  change: '+18%',  bg: 'rgba(255,255,255,0.05)' },
    { label: 'Total Orders',    value: data.stats.totalOrders,                  icon: FiShoppingBag,color: '#f8f8f8',  change: '+12%',  bg: 'rgba(255,255,255,0.05)' },
    { label: 'Customers',       value: data.stats.totalCustomers,               icon: FiUsers,       color: '#f8f8f8',  change: '+8%',   bg: 'rgba(255,255,255,0.05)' },
    { label: 'Products Active', value: data.stats.totalProducts,                icon: FiPackage,     color: '#f8f8f8',  change: 'Total', bg: 'rgba(255,255,255,0.05)' },
  ] : [];

  if (loading) return (
    <AdminLayout title="Dashboard">
      <div className="flex items-center justify-center h-64">
        <div className="spinner w-8 h-8" />
      </div>
    </AdminLayout>
  );

  return (
    <AdminLayout title="Dashboard">
      {/* Header row */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="text-gray-400 text-sm">Welcome back, <span className="text-white font-semibold">{user?.name}</span></p>
          <p className="text-xs text-gray-600 mt-0.5">Here's what's happening with your store today.</p>
        </div>
        <button onClick={fetchStats} className="btn-outline px-3 py-2 text-xs gap-1.5">
          <FiRefreshCw className="text-xs" /> Refresh
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {STAT_CARDS.map(s => (
          <div key={s.label} className="stat-card bg-white/5">
            <div className="flex items-start justify-between mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/10 text-white">
                <s.icon className="text-lg" />
              </div>
              <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white/10 text-gray-200">{s.change}</span>
            </div>
            <div className="font-orbitron font-black text-2xl mb-1 text-white">{s.value}</div>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Alert badges */}
      {(data?.stats.pendingOrders > 0 || data?.stats.pendingBookings > 0) && (
        <div className="flex flex-wrap gap-3 mb-6">
          {data.stats.pendingOrders > 0 && (
            <Link href="/admin/orders?status=pending"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 transition-colors">
              <FiAlertTriangle className="text-white" /> {data.stats.pendingOrders} Pending Orders
            </Link>
          )}
          {data.stats.pendingBookings > 0 && (
            <Link href="/admin/bookings?status=pending"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-white/5 border border-white/10 text-gray-200 hover:bg-white/10 transition-colors">
              <FiAlertTriangle className="text-white" /> {data.stats.pendingBookings} Pending Bookings
            </Link>
          )}
        </div>
      )}

      {/* Charts */}
      <div className="grid lg:grid-cols-3 gap-5 mb-6">
        {/* Revenue chart */}
        <div className="lg:col-span-2 card p-5 rounded-2xl">
          <h3 className="font-bold text-white text-sm mb-4">Revenue Overview (Last 6 months)</h3>
          {data?.revenueByMonth?.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <AreaChart data={data.revenueByMonth.map(d => ({ ...d, month: `${d._id?.month}/${d._id?.year?.toString().slice(-2)}` }))}>
                <defs>
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%"  stopColor="#f8f8f8" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f8f8f8" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="month"   tick={{ fill: '#b8b8b8', fontSize: 11 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: '#b8b8b8', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={v => `${v/1000}K`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" name="revenue" stroke="#f8f8f8" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          ) : <div className="h-52 shimmer rounded-xl" />}
        </div>

        {/* Pie chart */}
        <div className="card p-5 rounded-2xl">
          <h3 className="font-bold text-white text-sm mb-4">Orders by Status</h3>
          {data?.ordersByStatus?.length > 0 ? (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie data={data.ordersByStatus.map(d => ({ name: d._id, value: d.count }))}
                    cx="50%" cy="50%" innerRadius={45} outerRadius={70} paddingAngle={3} dataKey="value">
                    {data.ordersByStatus.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-1.5 mt-2">
                {data.ordersByStatus.map((s, i) => (
                  <div key={s._id} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                      <span className="text-gray-400 capitalize">{s._id}</span>
                    </div>
                    <span className="font-bold text-white">{s.count}</span>
                  </div>
                ))}
              </div>
            </>
          ) : <div className="h-40 shimmer rounded-xl" />}
        </div>
      </div>

      {/* Bottom row */}
      <div className="grid lg:grid-cols-2 gap-5">
        {/* Recent orders */}
        <div className="card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="font-bold text-white text-sm">Recent Orders</h3>
            <Link href="/admin/orders" className="text-xs text-white flex items-center gap-1 hover:underline">
              View All <FiArrowRight className="text-xs" />
            </Link>
          </div>
          <table className="data-table">
            <thead><tr><th>Order</th><th>Customer</th><th>Total</th><th>Status</th></tr></thead>
            <tbody>
              {(data?.recentOrders || []).map(o => (
                <tr key={o._id}>
                  <td><Link href={`/admin/orders`} className="text-white font-mono text-xs hover:underline">{o.orderNumber}</Link></td>
                  <td className="text-sm">{o.user?.name || o.guestName || 'Guest'}</td>
                  <td className="font-orbitron text-xs text-white">{formatPrice(o.totalPrice)}</td>
                  <td><span className={`badge ${getStatusBadgeClass(o.orderStatus)} text-[10px]`}>{o.orderStatus}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Low stock */}
        <div className="card rounded-2xl overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-white/5">
            <h3 className="font-bold text-white text-sm flex items-center gap-2">
              <FiAlertTriangle className="text-yellow-400 text-sm" /> Low Stock Alert
            </h3>
            <Link href="/admin/products" className="text-xs text-white flex items-center gap-1 hover:underline">
              Manage <FiArrowRight className="text-xs" />
            </Link>
          </div>
          {(data?.lowStockProducts || []).length === 0 ? (
            <div className="px-5 py-8 text-center text-sm text-gray-500">✅ All products well stocked</div>
          ) : (
            <table className="data-table">
              <thead><tr><th>Product</th><th>Stock</th><th>Action</th></tr></thead>
              <tbody>
                {(data?.lowStockProducts || []).map(p => (
                  <tr key={p._id}>
                    <td className="text-sm text-white max-w-[160px] truncate">{p.name}</td>
                    <td>
                      <span className={`badge ${p.stock === 0 ? 'badge-red' : 'badge-yellow'} text-[10px]`}>
                        {p.stock === 0 ? 'OUT' : `${p.stock} left`}
                      </span>
                    </td>
                    <td>
                      <Link href={`/admin/products`} className="text-xs text-white hover:underline">Restock</Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
