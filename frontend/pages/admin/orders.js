/* ============================================
   frontend/pages/admin/orders.js
   Purpose: Admin order management — view all,
            update status, filter, search
   ============================================ */
import { useState, useEffect } from 'react';
import { useRouter }           from 'next/router';
import { FiSearch, FiEye, FiChevronDown, FiPackage, FiRefreshCw } from 'react-icons/fi';
import toast                   from 'react-hot-toast';
import AdminLayout             from '../../components/layout/AdminLayout';
import { orderAPI }            from '../../lib/api';
import { useAuth }             from '../../context/AuthContext';
import { formatPrice, formatDate, getStatusBadgeClass } from '../../lib/utils';

const STATUS_OPTIONS = ['', 'pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];
const EDITABLE_STATUSES = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders() {
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
  const router                                    = useRouter();
  const [orders,    setOrders]  = useState([]);
  const [total,     setTotal]   = useState(0);
  const [pages,     setPages]   = useState(1);
  const [page,      setPage]    = useState(1);
  const [loading,   setLoading] = useState(true);
  const [search,    setSearch]  = useState('');
  const [statusFilter, setStatusFilter] = useState(router.query.status || '');
  const [detailOrder,  setDetailOrder]  = useState(null);
  const [updating,     setUpdating]     = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || !isAdmin) { router.replace('/'); return; }
    fetchOrders();
  }, [page, statusFilter, isLoggedIn, isAdmin, authLoading]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await orderAPI.getAll({ page, limit: 20, status: statusFilter, search });
      setOrders(res.data.orders || []);
      setTotal(res.data.total  || 0);
      setPages(res.data.pages  || 1);
    } catch { toast.error('Failed to load orders'); }
    finally { setLoading(false); }
  };

  const handleSearch = () => { setPage(1); fetchOrders(); };

  const updateStatus = async (orderId, newStatus, extra = {}) => {
    setUpdating(orderId);
    try {
      await orderAPI.updateStatus(orderId, { orderStatus: newStatus, ...extra });
      setOrders(prev =>
        prev.map(o => o._id === orderId ? { ...o, orderStatus: newStatus, ...extra } : o)
      );
      if (detailOrder?._id === orderId) setDetailOrder(p => ({ ...p, orderStatus: newStatus }));
      toast.success(`Order status → ${newStatus}`);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setUpdating(null);
    }
  };

  return (
    <AdminLayout title="Orders Management">

      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-white">All Orders <span className="text-gray-500 font-normal text-sm">({total})</span></h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage customer orders and update delivery status</p>
        </div>
        <button onClick={fetchOrders} className="btn-outline px-3 py-2 text-xs gap-1.5">
          <FiRefreshCw className="text-xs" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input
            className="input pl-9 py-2.5 text-sm"
            placeholder="Search by order # or customer..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
          />
        </div>
        <select
          className="input py-2.5 text-sm w-44"
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Statuses</option>
          {STATUS_OPTIONS.filter(Boolean).map(s => (
            <option key={s} value={s} className="capitalize">{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <button onClick={handleSearch} className="btn-primary px-4 py-2.5 text-sm">Search</button>
      </div>

      {/* Status filter chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[{ val: '', label: 'All' }, ...EDITABLE_STATUSES.map(s => ({ val: s, label: s }))].map(opt => (
          <button
            key={opt.val}
            onClick={() => { setStatusFilter(opt.val); setPage(1); }}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold transition-all border capitalize ${
              statusFilter === opt.val
                ? 'bg-white/10 text-white border-white/10'
                : 'text-gray-500 border-white/10 hover:border-white/20'
            }`}
          >
            {opt.label || 'All'}
          </button>
        ))}
      </div>

      {/* Orders table */}
      <div className="card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-1 p-4">
            {Array(6).fill(0).map((_, i) => <div key={i} className="h-16 shimmer rounded-lg" />)}
          </div>
        ) : orders.length === 0 ? (
          <div className="text-center py-16">
            <FiPackage className="text-5xl text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No orders found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Customer</th>
                  <th>Date</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Update</th>
                  <th>View</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order._id}>
                    <td>
                      <span className="font-mono text-white text-xs font-bold">{order.orderNumber}</span>
                    </td>
                    <td>
                      <div className="min-w-[130px]">
                        <p className="font-medium text-white text-xs">{order.user?.name || order.guestName || 'Guest'}</p>
                        <p className="text-gray-500 text-[10px] truncate max-w-[130px]">{order.user?.email || order.guestEmail}</p>
                      </div>
                    </td>
                    <td className="text-xs text-gray-400 whitespace-nowrap">{formatDate(order.createdAt)}</td>
                    <td className="text-xs text-center">{order.items?.length}</td>
                    <td className="font-orbitron text-xs text-white whitespace-nowrap">{formatPrice(order.totalPrice)}</td>
                    <td>
                      <span className={`badge text-[10px] ${
                        order.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'
                      }`}>{order.paymentStatus}</span>
                    </td>
                    <td>
                      <span className={`badge text-[10px] ${getStatusBadgeClass(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    {/* Inline status update */}
                    <td>
                      <div className="relative">
                        <select
                          value={order.orderStatus}
                          disabled={updating === order._id}
                          onChange={e => updateStatus(order._id, e.target.value)}
                          className="text-xs bg-dark-card border border-white/10 text-gray-300 rounded-lg px-2 py-1.5 cursor-pointer pr-6 appearance-none focus:border-white/20 outline-none disabled:opacity-40"
                          style={{ fontFamily: 'inherit' }}
                        >
                          {EDITABLE_STATUSES.map(s => (
                            <option key={s} value={s} className="capitalize">{s}</option>
                          ))}
                        </select>
                        <FiChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none" />
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => setDetailOrder(order)}
                        className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/10"
                        title="View details"
                      >
                        <FiEye className="text-sm" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-white/5">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 disabled:opacity-30 hover:border-white/20">← Prev</button>
            <span className="px-4 py-1.5 text-xs text-gray-400">Page {page} / {pages}</span>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 disabled:opacity-30 hover:border-white/20">Next →</button>
          </div>
        )}
      </div>

      {/* Order detail side panel */}
      {detailOrder && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setDetailOrder(null)}>
          <div className="w-full max-w-md h-full overflow-y-auto p-5 space-y-4 bg-dark-card border-l border-white/10"
            onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between">
              <h3 className="font-orbitron font-bold text-white">{detailOrder.orderNumber}</h3>
              <button onClick={() => setDetailOrder(null)} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
            </div>

            <div className="flex gap-2 flex-wrap">
              <span className={`badge text-xs ${getStatusBadgeClass(detailOrder.orderStatus)}`}>{detailOrder.orderStatus}</span>
              <span className={`badge text-xs ${detailOrder.paymentStatus === 'paid' ? 'badge-green' : 'badge-yellow'}`}>{detailOrder.paymentStatus}</span>
            </div>

            {/* Items */}
            <div className="card p-4 rounded-xl space-y-2">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Items</p>
              {detailOrder.items?.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-gray-300 truncate flex-1">{item.name} ×{item.qty}</span>
                  <span className="text-white font-orbitron text-xs ml-2">{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between pt-2 border-t border-white/5 font-bold text-white text-sm">
                <span>Total</span>
                <span className="font-orbitron text-white">{formatPrice(detailOrder.totalPrice)}</span>
              </div>
            </div>

            {/* Delivery */}
            <div className="card p-4 rounded-xl text-sm space-y-1">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Delivery</p>
              <p className="text-white">{detailOrder.shippingAddress?.line1}</p>
              <p className="text-gray-400">{detailOrder.shippingAddress?.city}, {detailOrder.shippingAddress?.district}</p>
              <p className="text-white">{detailOrder.shippingAddress?.phone}</p>
            </div>

            {/* Status change */}
            <div className="card p-4 rounded-xl">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-3">Update Status</p>
              <div className="grid grid-cols-2 gap-2">
                {EDITABLE_STATUSES.map(s => (
                  <button
                    key={s}
                    onClick={() => updateStatus(detailOrder._id, s)}
                    disabled={detailOrder.orderStatus === s || !!updating}
                    className={`py-2 px-3 rounded-lg text-xs font-bold capitalize transition-all border disabled:opacity-40 ${
                      detailOrder.orderStatus === s
                        ? 'border-white/10 bg-white/10 text-white'
                        : 'border-white/10 text-gray-400 hover:border-white/25'
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>

            {detailOrder.notes && (
              <div className="card p-4 rounded-xl text-sm">
                <p className="text-xs text-gray-500 mb-1">Customer Notes</p>
                <p className="text-gray-300">{detailOrder.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
