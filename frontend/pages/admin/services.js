/* ============================================
   frontend/pages/admin/services.js
   Purpose: Service management — add, edit,
            delete, manage prices and status
   ============================================ */
import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { FiPlus, FiEdit2, FiTrash2, FiSave, FiX, FiCheck, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { serviceAPI } from '../../lib/api';
import { useAuth } from '../../context/AuthContext';

const EMPTY = {
  title: '',
  description: '',
  price: '',
  priceLabel: '',
  duration: '',
  icon: '⚙️',
  category: '',
  isActive: true,
  sortOrder: '0',
};

const ICON_OPTIONS = ['🏠','📷','💡','🔒','🤖','⚡','🛡️','📋','🔧','🌟','📱','💻','🔌','📡','🎯'];

export default function AdminServices() {
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
  const router = useRouter();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditId] = useState(null);
  const [form, setForm] = useState({ ...EMPTY });
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || !isAdmin) { router.replace('/'); return; }
    fetchServices();
  }, [authLoading, isLoggedIn, isAdmin]);

  const fetchServices = async () => {
    setLoading(true);
    try {
      const res = await serviceAPI.getAll();
      // For admin, get all services including inactive ones
      // This would require a separate admin endpoint, but for now use the public one
      setServices(res.data.services || []);
    } catch (err) {
      console.error('Failed request:', {
        url: err.config?.url,
        baseURL: err.config?.baseURL,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error('Failed to load services');
    } finally {
      setLoading(false);
    }
  };

  const openAdd = () => {
    setForm({ ...EMPTY });
    setEditId(null);
    setShowForm(true);
  };

  const openEdit = (service) => {
    setForm({
      title: service.title,
      description: service.description || '',
      price: service.price || '',
      priceLabel: service.priceLabel || '',
      duration: service.duration || '',
      icon: service.icon || '⚙️',
      category: service.category || '',
      isActive: service.isActive !== undefined ? service.isActive : true,
      sortOrder: service.sortOrder || '0',
    });
    setEditId(service._id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) {
      toast.error('Service title is required');
      return;
    }

    const priceIsFree = form.priceLabel?.toUpperCase() === 'FREE';
    if (!priceIsFree && !form.price && form.price !== 0) {
      toast.error('Price is required unless priceLabel is "FREE"');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim(),
        price: form.price ? parseFloat(form.price) : 0,
        priceLabel: form.priceLabel.trim(),
        duration: form.duration.trim(),
        icon: form.icon,
        category: form.category.trim(),
        isActive: form.isActive,
        sortOrder: parseInt(form.sortOrder) || 0,
      };

      if (editingId) {
        const res = await serviceAPI.update(editingId, payload);
        setServices(prev => prev.map(s => s._id === editingId ? res.data.service : s));
        toast.success('Service updated!');
      } else {
        const res = await serviceAPI.create(payload);
        setServices(prev => [...prev, res.data.service]);
        toast.success('Service created!');
      }
      setShowForm(false);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Service save error:', err);
      }
      if (err.message === 'Network Error') {
        toast.error('Network Error — cannot reach API. Is the backend running?');
      } else {
        toast.error(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!confirm(`Delete service "${title}"?`)) return;
    setDeleting(id);
    try {
      await serviceAPI.delete(id);
      setServices(prev => prev.filter(s => s._id !== id));
      toast.success('Service deleted!');
    } catch (err) {
      toast.error(err.message);
    } finally {
      setDeleting(null);
    }
  };

  const handleToggleActive = async (service) => {
    try {
      const res = await serviceAPI.update(service._id, { isActive: !service.isActive });
      setServices(prev => prev.map(s => s._id === service._id ? res.data.service : s));
      toast.success(service.isActive ? 'Service deactivated' : 'Service activated');
    } catch (err) {
      toast.error(err.message);
    }
  };

  if (authLoading || loading) {
    return (
      <AdminLayout title="Services">
        <div className="flex items-center justify-center min-h-96">
          <p className="text-gray-400">Loading services...</p>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Services">
      <div className="mb-6 flex items-center justify-between">
        <p className="text-gray-400">{services.length} service{services.length !== 1 ? 's' : ''}</p>
        <button onClick={openAdd} className="btn-primary px-4 py-2 text-sm flex items-center gap-2">
          <FiPlus /> Add Service
        </button>
      </div>

      {/* Services Table */}
      {services.length === 0 ? (
        <div className="glass p-8 rounded-xl text-center">
          <p className="text-gray-400">No services yet. Click "Add Service" to create one.</p>
        </div>
      ) : (
        <div className="glass rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-white/5 border-b border-white/10">
                <tr>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Icon</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Title</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Price Label</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Duration</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Status</th>
                  <th className="px-6 py-3 text-left text-gray-300 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {services.map(service => (
                  <tr key={service._id} className="hover:bg-white/[0.02] transition">
                    <td className="px-6 py-4 text-2xl">{service.icon}</td>
                    <td className="px-6 py-4">
                      <div className="text-white font-semibold">{service.title}</div>
                      <div className="text-xs text-gray-500">{service.category || '—'}</div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">
                      {service.priceLabel || (service.price ? `Rs. ${service.price.toLocaleString()}` : '—')}
                    </td>
                    <td className="px-6 py-4 text-gray-400">{service.duration || '—'}</td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(service)}
                        className={`p-2 rounded-lg transition ${
                          service.isActive
                            ? 'bg-green-400/20 text-green-400 hover:bg-green-400/30'
                            : 'bg-gray-500/20 text-gray-500 hover:bg-gray-500/30'
                        }`}
                        title={service.isActive ? 'Click to deactivate' : 'Click to activate'}
                      >
                        {service.isActive ? <FiToggleRight size={18} /> : <FiToggleLeft size={18} />}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => openEdit(service)}
                          className="p-2 rounded-lg bg-blue-400/20 text-blue-400 hover:bg-blue-400/30 transition"
                          title="Edit"
                        >
                          <FiEdit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(service._id, service.title)}
                          disabled={deleting === service._id}
                          className="p-2 rounded-lg bg-red-400/20 text-red-400 hover:bg-red-400/30 transition disabled:opacity-50"
                          title="Delete"
                        >
                          <FiTrash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="glass max-w-2xl w-full p-6 rounded-xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-white font-bold text-xl">
                {editingId ? 'Edit Service' : 'Add New Service'}
              </h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white">
                <FiX size={24} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Title */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-semibold">Title *</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={upd('title')}
                  placeholder="e.g. Smart Home Setup"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/20 focus:outline-none"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-semibold">Description</label>
                <textarea
                  value={form.description}
                  onChange={upd('description')}
                  placeholder="Service description..."
                  rows={3}
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/20 focus:outline-none"
                />
              </div>

              {/* Price & Price Label */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-semibold">Price (Rs.)</label>
                  <input
                    type="number"
                    value={form.price}
                    onChange={upd('price')}
                    placeholder="0"
                    min="0"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/20 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-semibold">Price Label</label>
                  <input
                    type="text"
                    value={form.priceLabel}
                    onChange={upd('priceLabel')}
                    placeholder="e.g. From Rs. 15,000 or FREE"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/20 focus:outline-none"
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave price empty if label is "FREE"</p>
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-semibold">Duration</label>
                <input
                  type="text"
                  value={form.duration}
                  onChange={upd('duration')}
                  placeholder="e.g. 1–2 days or 4–8 hours"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/20 focus:outline-none"
                />
              </div>

              {/* Icon & Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-semibold">Icon</label>
                  <select
                    value={form.icon}
                    onChange={upd('icon')}
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white focus:border-white/20 focus:outline-none"
                  >
                    {ICON_OPTIONS.map(icon => (
                      <option key={icon} value={icon}>{icon}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-2 font-semibold">Category</label>
                  <input
                    type="text"
                    value={form.category}
                    onChange={upd('category')}
                    placeholder="e.g. Installation"
                    className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/20 focus:outline-none"
                  />
                </div>
              </div>

              {/* Sort Order */}
              <div>
                <label className="block text-sm text-gray-300 mb-2 font-semibold">Sort Order</label>
                <input
                  type="number"
                  value={form.sortOrder}
                  onChange={upd('sortOrder')}
                  placeholder="0"
                  className="w-full px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white placeholder-gray-500 focus:border-white/20 focus:outline-none"
                />
                <p className="text-xs text-gray-500 mt-1">Lower numbers appear first</p>
              </div>

              {/* Active/Inactive */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={e => setForm(p => ({ ...p, isActive: e.target.checked }))}
                    className="w-4 h-4 rounded bg-white/10 border border-white/20 cursor-pointer"
                  />
                  <span className="text-sm text-gray-300 font-semibold">Active (Visible on website)</span>
                </label>
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 mt-8">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 btn-primary py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave size={16} /> {saving ? 'Saving...' : editingId ? 'Update' : 'Create'}
              </button>
              <button
                onClick={() => setShowForm(false)}
                disabled={saving}
                className="flex-1 btn-outline py-2.5 text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiX size={16} /> Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
