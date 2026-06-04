/* ============================================
   frontend/pages/admin/customers.js
   Purpose: Customer management — list, search,
            view orders, ban/activate accounts
   ============================================ */
import { useState, useEffect } from 'react';
import { useRouter }           from 'next/router';
import { FiSearch, FiUser, FiShield, FiUserX, FiUserCheck, FiMail, FiPhone, FiRefreshCw } from 'react-icons/fi';
import toast                   from 'react-hot-toast';
import AdminLayout             from '../../components/layout/AdminLayout';
import { userAPI }             from '../../lib/api';
import { useAuth }             from '../../context/AuthContext';
import { formatDate, formatPrice } from '../../lib/utils';

export default function AdminCustomers() {
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
  const router                                    = useRouter();
  const [customers, setCustomers] = useState([]);
  const [total,     setTotal]     = useState(0);
  const [pages,     setPages]     = useState(1);
  const [page,      setPage]      = useState(1);
  const [loading,   setLoading]   = useState(true);
  const [search,    setSearch]    = useState('');
  const [roleFilter,setRoleFilter]= useState('customer');
  const [selected,  setSelected]  = useState(null);
  const [updating,  setUpdating]  = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || !isAdmin) { router.replace('/'); return; }
    fetchCustomers();
  }, [page, roleFilter, isLoggedIn, isAdmin, authLoading]);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await userAPI.getAll({ page, limit: 20, search, role: roleFilter });
      setCustomers(res.data.users  || []);
      setTotal(res.data.total      || 0);
      setPages(res.data.pages      || 1);
    } catch (err) {
      console.error('Failed request:', {
        url: err.config?.url,
        baseURL: err.config?.baseURL,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error('Failed to load customers');
    }
    finally { setLoading(false); }
  };

  const toggleActive = async (user) => {
    setUpdating(user._id);
    try {
      await userAPI.update(user._id, { isActive: !user.isActive });
      setCustomers(prev => prev.map(u => u._id === user._id ? { ...u, isActive: !u.isActive } : u));
      if (selected?._id === user._id) setSelected(p => ({ ...p, isActive: !p.isActive }));
      toast.success(user.isActive ? 'Account deactivated' : 'Account activated');
    } catch (err) { toast.error(err.message); }
    finally { setUpdating(null); }
  };

  const makeAdmin = async (user) => {
    if (!confirm(`Make ${user.name} an Admin? They will have full access.`)) return;
    setUpdating(user._id);
    try {
      await userAPI.update(user._id, { role: 'admin' });
      setCustomers(prev => prev.map(u => u._id === user._id ? { ...u, role: 'admin' } : u));
      toast.success(`${user.name} is now an Admin`);
    } catch (err) { toast.error(err.message); }
    finally { setUpdating(null); }
  };

  return (
    <AdminLayout title="Customer Management">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-white">Customers <span className="text-gray-500 font-normal text-sm">({total})</span></h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage user accounts, roles and access</p>
        </div>
        <button onClick={fetchCustomers} className="btn-outline px-3 py-2 text-xs gap-1.5">
          <FiRefreshCw className="text-xs" /> Refresh
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input
            className="input pl-9 py-2.5 text-sm"
            placeholder="Search name or email..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && fetchCustomers()}
          />
        </div>
        <select
          className="input py-2.5 text-sm w-40"
          value={roleFilter}
          onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
        >
          <option value="">All Users</option>
          <option value="customer">Customers</option>
          <option value="admin">Admins</option>
        </select>
        <button onClick={fetchCustomers} className="btn-primary px-4 py-2.5 text-sm">Search</button>
      </div>

      {/* Table */}
      <div className="card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-1 p-4">
            {Array(6).fill(0).map((_, i) => <div key={i} className="h-16 shimmer rounded-lg" />)}
          </div>
        ) : customers.length === 0 ? (
          <div className="text-center py-16">
            <FiUser className="text-5xl text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No customers found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Joined</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map(u => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-3 min-w-[180px]">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm flex-shrink-0"
                          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.08), rgba(255,255,255,0.04))', color: '#f8f8f8', border: '1px solid rgba(255,255,255,0.08)' }}>
                          {u.name?.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{u.name}</p>
                          <p className="text-[10px] text-gray-500 truncate max-w-[140px]">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-gray-400">{u.phone || '—'}</td>
                    <td>
                      <span className={`badge text-[10px] ${u.role === 'admin' ? 'badge-yellow' : ''}`}>
                        {u.role}
                      </span>
                    </td>
                    <td className="text-xs text-gray-400 whitespace-nowrap">{formatDate(u.createdAt)}</td>
                    <td>
                      <span className={`badge text-[10px] ${u.isActive !== false ? 'badge-green' : 'badge-red'}`}>
                        {u.isActive !== false ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => setSelected(u)}
                          className="p-1.5 text-xs text-gray-400 hover:text-white border border-white/10 rounded-lg hover:border-white/10 transition-all"
                          title="View details"
                        >
                          <FiUser className="text-xs" />
                        </button>
                        <button
                          onClick={() => toggleActive(u)}
                          disabled={updating === u._id}
                          className={`p-1.5 text-xs border rounded-lg transition-all disabled:opacity-40 ${
                            u.isActive !== false
                              ? 'text-red-400 border-red-400/20 hover:bg-red-400/5'
                              : 'text-green-400 border-green-400/20 hover:bg-green-400/5'
                          }`}
                          title={u.isActive !== false ? 'Deactivate' : 'Activate'}
                        >
                          {u.isActive !== false ? <FiUserX className="text-xs" /> : <FiUserCheck className="text-xs" />}
                        </button>
                        {u.role !== 'admin' && (
                          <button
                            onClick={() => makeAdmin(u)}
                            disabled={updating === u._id}
                            className="p-1.5 text-xs text-yellow-400 border border-yellow-400/20 rounded-lg hover:bg-yellow-400/5 transition-all disabled:opacity-40"
                            title="Make Admin"
                          >
                            <FiShield className="text-xs" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {pages > 1 && (
          <div className="flex justify-center gap-2 p-4 border-t border-white/5">
            <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 disabled:opacity-30">← Prev</button>
            <span className="px-4 py-1.5 text-xs text-gray-400">Page {page} / {pages}</span>
            <button disabled={page === pages} onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded-lg text-xs border border-white/10 text-gray-400 disabled:opacity-30">Next →</button>
          </div>
        )}
      </div>

      {/* Customer detail panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="w-full max-w-sm h-full overflow-y-auto p-5 space-y-4 bg-dark-card border-l border-white/10"
            onClick={e => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-white">Customer Profile</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
            </div>

            <div className="text-center py-4">
              <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl mx-auto mb-3 bg-white/10 border border-white/10 text-white">
                {selected.name?.charAt(0).toUpperCase()}
              </div>
              <p className="font-bold text-white">{selected.name}</p>
              <span className={`badge text-[10px] mt-1 ${selected.role === 'admin' ? 'badge-yellow' : ''}`}>{selected.role}</span>
            </div>

            <div className="card p-4 rounded-xl space-y-3 text-sm">
              {[
                { icon: FiMail,  label: 'Email', value: selected.email },
                { icon: FiPhone, label: 'Phone', value: selected.phone || 'Not provided' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="flex items-center gap-3">
                  <Icon className="text-white flex-shrink-0" />
                  <div>
                    <p className="text-[10px] text-gray-500">{label}</p>
                    <p className="text-white">{value}</p>
                  </div>
                </div>
              ))}
              <div className="flex items-center gap-3">
                <FiUser className="text-white flex-shrink-0" />
                <div>
                  <p className="text-[10px] text-gray-500">Joined</p>
                  <p className="text-white">{formatDate(selected.createdAt)}</p>
                </div>
              </div>
            </div>

            <div className="card p-4 rounded-xl">
              <p className="text-xs text-gray-500 mb-2">Account Status</p>
              <div className="flex gap-3">
                <button
                  onClick={() => toggleActive(selected)}
                  disabled={updating === selected._id}
                  className={`flex-1 py-2.5 text-xs font-bold rounded-xl transition-all border disabled:opacity-40 ${
                    selected.isActive !== false
                      ? 'btn-danger justify-center flex items-center gap-1.5'
                      : 'btn-success justify-center flex items-center gap-1.5'
                  }`}
                >
                  {selected.isActive !== false ? (<><FiUserX /> Deactivate</>) : (<><FiUserCheck /> Activate</>)}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
