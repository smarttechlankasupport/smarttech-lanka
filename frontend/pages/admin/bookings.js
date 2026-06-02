/* ============================================
   frontend/pages/admin/bookings.js
   Purpose: Admin service booking management —
            view, update, assign technician
   ============================================ */
import { useState, useEffect } from 'react';
import { useRouter }           from 'next/router';
import { FiSearch, FiCalendar, FiRefreshCw, FiChevronDown, FiTool } from 'react-icons/fi';
import toast                   from 'react-hot-toast';
import AdminLayout             from '../../components/layout/AdminLayout';
import { bookingAPI }          from '../../lib/api';
import { useAuth }             from '../../context/AuthContext';
import { formatDate, getStatusBadgeClass } from '../../lib/utils';

const BOOKING_STATUSES = ['pending', 'confirmed', 'in-progress', 'completed', 'cancelled'];

export default function AdminBookings() {
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
  const router                                    = useRouter();
  const [bookings,  setBookings]  = useState([]);
  const [total,     setTotal]     = useState(0);
  const [loading,   setLoading]   = useState(true);
  const [statusFilter, setStatusFilter] = useState(router.query.status || '');
  const [page,      setPage]      = useState(1);
  const [selected,  setSelected]  = useState(null);
  const [techForm,  setTechForm]  = useState({ technicianName: '', technicianPhone: '', estimatedCost: '', adminNotes: '' });
  const [saving,    setSaving]    = useState(false);
  const [updating,  setUpdating]  = useState(null);

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || !isAdmin) { router.replace('/'); return; }
    fetchBookings();
  }, [page, statusFilter, isLoggedIn, isAdmin, authLoading]);

  useEffect(() => {
    if (selected) {
      setTechForm({
        technicianName:  selected.technicianName  || '',
        technicianPhone: selected.technicianPhone || '',
        estimatedCost:   selected.estimatedCost   || '',
        adminNotes:      selected.adminNotes      || '',
      });
    }
  }, [selected]);

  const fetchBookings = async () => {
    setLoading(true);
    try {
      const res = await bookingAPI.getAll({ page, limit: 20, status: statusFilter });
      setBookings(res.data.bookings || []);
      setTotal(res.data.total || 0);
    } catch { toast.error('Failed to load bookings'); }
    finally { setLoading(false); }
  };

  const updateStatus = async (id, status) => {
    setUpdating(id);
    try {
      await bookingAPI.update(id, { status });
      setBookings(prev => prev.map(b => b._id === id ? { ...b, status } : b));
      if (selected?._id === id) setSelected(p => ({ ...p, status }));
      toast.success(`Booking → ${status}`);
    } catch (err) { toast.error(err.message); }
    finally { setUpdating(null); }
  };

  const saveTechInfo = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await bookingAPI.update(selected._id, techForm);
      setBookings(prev => prev.map(b => b._id === selected._id ? { ...b, ...techForm } : b));
      setSelected(p => ({ ...p, ...techForm }));
      toast.success('Technician info saved!');
    } catch (err) { toast.error(err.message); }
    finally { setSaving(false); }
  };

  return (
    <AdminLayout title="Service Bookings">
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-white">Service Bookings <span className="text-gray-500 font-normal text-sm">({total})</span></h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage installation and repair appointments</p>
        </div>
        <button onClick={fetchBookings} className="btn-outline px-3 py-2 text-xs gap-1.5">
          <FiRefreshCw className="text-xs" /> Refresh
        </button>
      </div>

      {/* Status chips */}
      <div className="flex gap-2 mb-5 overflow-x-auto pb-1">
        {[{ val: '', label: 'All' }, ...BOOKING_STATUSES.map(s => ({ val: s, label: s }))].map(opt => (
          <button
            key={opt.val}
            onClick={() => { setStatusFilter(opt.val); setPage(1); }}
            className={`flex-shrink-0 px-3 py-1 rounded-full text-xs font-bold capitalize border transition-all ${
              statusFilter === opt.val
                ? 'bg-white/10 text-white border-white/10'
                : 'text-gray-500 border-white/10 hover:border-white/20'
            }`}
          >
            {opt.label || 'All'}
          </button>
        ))}
      </div>

      <div className="card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-1 p-4">
            {Array(5).fill(0).map((_,i) => <div key={i} className="h-16 shimmer rounded-lg" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-16">
            <FiCalendar className="text-5xl text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">No bookings found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Booking #</th>
                  <th>Customer</th>
                  <th>Service</th>
                  <th>Date / Time</th>
                  <th>City</th>
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Update</th>
                  <th>Manage</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map(b => (
                  <tr key={b._id}>
                    <td><span className="font-mono text-white text-xs font-bold">{b.bookingNumber}</span></td>
                    <td>
                      <div className="min-w-[120px]">
                        <p className="font-medium text-white text-xs">{b.name}</p>
                        <p className="text-gray-500 text-[10px]">{b.phone}</p>
                      </div>
                    </td>
                    <td className="text-xs text-gray-300 max-w-[130px]">
                      <p className="truncate">{b.service}</p>
                    </td>
                    <td className="text-xs text-gray-400 whitespace-nowrap">
                      <p>{formatDate(b.date)}</p>
                      <p className="text-gray-600">{b.timeSlot}</p>
                    </td>
                    <td className="text-xs text-gray-400">{b.city}</td>
                    <td>
                      <span className={`badge text-[10px] ${b.priority === 'urgent' ? 'badge-red' : ''}`}>
                        {b.priority}
                      </span>
                    </td>
                    <td>
                      <span className={`badge text-[10px] ${getStatusBadgeClass(b.status)}`}>{b.status}</span>
                    </td>
                    <td>
                      <div className="relative">
                        <select
                          value={b.status}
                          disabled={updating === b._id}
                          onChange={e => updateStatus(b._id, e.target.value)}
                          className="text-xs bg-dark-card border border-white/10 text-gray-300 rounded-lg px-2 py-1.5 pr-6 appearance-none focus:border-white/20 outline-none disabled:opacity-40 cursor-pointer"
                          style={{ fontFamily: 'inherit' }}
                        >
                          {BOOKING_STATUSES.map(s => <option key={s} value={s} className="capitalize">{s}</option>)}
                        </select>
                        <FiChevronDown className="absolute right-1.5 top-1/2 -translate-y-1/2 text-gray-500 text-xs pointer-events-none" />
                      </div>
                    </td>
                    <td>
                      <button
                        onClick={() => setSelected(b)}
                        className="p-1.5 text-gray-400 hover:text-white border border-white/10 rounded-lg hover:border-white/10 transition-all"
                        title="Assign technician"
                      >
                        <FiTool className="text-xs" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking detail / assign technician panel */}
      {selected && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="w-full max-w-sm h-full overflow-y-auto p-5 space-y-4 bg-dark-card border-l border-white/10"
            onClick={e => e.stopPropagation()}>

            <div className="flex items-center justify-between">
              <h3 className="font-orbitron font-bold text-white text-sm">{selected.bookingNumber}</h3>
              <button onClick={() => setSelected(null)} className="text-gray-400 hover:text-white text-xl leading-none">×</button>
            </div>

            <div className="card p-4 rounded-xl space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Customer</span>
                <span className="text-white font-medium">{selected.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Phone</span>
                <span className="text-white">{selected.phone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Service</span>
                <span className="text-white">{selected.service}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date</span>
                <span className="text-white">{formatDate(selected.date)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Time</span>
                <span className="text-white">{selected.timeSlot}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Address</span>
                <span className="text-white text-right max-w-[160px]">{selected.address}, {selected.city}</span>
              </div>
              {selected.notes && (
                <div>
                  <p className="text-gray-500 text-xs mb-0.5">Notes</p>
                  <p className="text-gray-300 text-xs">{selected.notes}</p>
                </div>
              )}
            </div>

            {/* Assign technician */}
            <div className="card p-4 rounded-xl space-y-3">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider">Assign Technician</p>
              <div>
                <label className="input-label">Technician Name</label>
                <input className="input text-sm py-2" value={techForm.technicianName}
                  onChange={e => setTechForm(p => ({ ...p, technicianName: e.target.value }))}
                  placeholder="Ruwan Bandara" />
              </div>
              <div>
                <label className="input-label">Technician Phone</label>
                <input className="input text-sm py-2" value={techForm.technicianPhone}
                  onChange={e => setTechForm(p => ({ ...p, technicianPhone: e.target.value }))}
                  placeholder="077 xxx xxxx" />
              </div>
              <div>
                <label className="input-label">Estimated Cost (Rs.)</label>
                <input className="input text-sm py-2" type="number" value={techForm.estimatedCost}
                  onChange={e => setTechForm(p => ({ ...p, estimatedCost: e.target.value }))}
                  placeholder="5000" />
              </div>
              <div>
                <label className="input-label">Internal Notes</label>
                <textarea className="input text-sm py-2 resize-none" rows={2} value={techForm.adminNotes}
                  onChange={e => setTechForm(p => ({ ...p, adminNotes: e.target.value }))}
                  placeholder="e.g. 3BHK, need 8-port switch..." />
              </div>
              <button onClick={saveTechInfo} disabled={saving} className="btn-primary w-full py-2.5 text-xs justify-center gap-2 disabled:opacity-60">
                {saving ? <><div className="spinner w-3 h-3" /> Saving...</> : 'Save & Assign'}
              </button>
            </div>

            {/* Quick status update */}
            <div className="card p-4 rounded-xl">
              <p className="text-xs text-gray-500 uppercase font-bold tracking-wider mb-2">Update Status</p>
              <div className="grid grid-cols-2 gap-2">
                {BOOKING_STATUSES.map(s => (
                  <button key={s} onClick={() => updateStatus(selected._id, s)}
                    disabled={selected.status === s || !!updating}
                    className={`py-2 rounded-lg text-[10px] font-bold capitalize transition-all border disabled:opacity-40 ${
                      selected.status === s
                        ? 'border-white/10 bg-white/10 text-white'
                        : 'border-white/10 text-gray-400 hover:border-white/25'
                    }`}>
                    {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
