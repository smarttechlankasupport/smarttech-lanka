/* ============================================
   frontend/pages/admin/categories.js
   Purpose: Category management — add, edit,
            delete, upload category images
   ============================================ */
import { useState, useEffect, useRef } from 'react';
import { useRouter }                   from 'next/router';
import Image                           from 'next/image';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiSave, FiX, FiLayers } from 'react-icons/fi';
import toast                           from 'react-hot-toast';
import AdminLayout                     from '../../components/layout/AdminLayout';
import { categoryAPI }                 from '../../lib/api';
import { useAuth }                     from '../../context/AuthContext';

const EMPTY = { name: '', icon: '📦', description: '', sortOrder: '0' };
const ICON_OPTIONS = ['💡','📷','🔒','🔌','📡','⚙️','🏠','🔔','🌡️','🛡️','🤖','🔦','🌟','📱','⚡'];

export default function AdminCategories() {
  const { isLoggedIn, isAdmin, loading: authLoading } = useAuth();
  const router                                    = useRouter();
  const [categories, setCats]                     = useState([]);
  const [loading,    setLoading]                  = useState(true);
  const [showForm,   setShowForm]= useState(false);
  const [editingId,  setEditId] = useState(null);
  const [form,       setForm]   = useState({ ...EMPTY });
  const [imageFile,  setImageFile]= useState(null);
  const [preview,    setPreview]  = useState('');
  const [saving,     setSaving]   = useState(false);
  const [deleting,   setDeleting] = useState(null);
  const fileRef                   = useRef();
  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }));

  useEffect(() => {
    if (authLoading) return;
    if (!isLoggedIn || !isAdmin) { router.replace('/'); return; }
    fetchCats();
  }, [authLoading, isLoggedIn, isAdmin]);

  const fetchCats = async () => {
    setLoading(true);
    try {
      const res = await categoryAPI.getAll();
      setCats(res.data.categories || []);
    } catch (err) {
      console.error('Failed request:', {
        url: err.config?.url,
        baseURL: err.config?.baseURL,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error('Failed to load categories');
    }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm({ ...EMPTY }); setEditId(null); setImageFile(null); setPreview(''); setShowForm(true);
  };

  const openEdit = (cat) => {
    setForm({ name: cat.name, icon: cat.icon || '📦', description: cat.description || '', sortOrder: cat.sortOrder || '0' });
    setPreview(cat.image?.url || '');
    setImageFile(null);
    setEditId(cat._id);
    setShowForm(true);
  };

  const handleFile = (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setImageFile(f);
    setPreview(URL.createObjectURL(f));
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error('Category name is required'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (imageFile) fd.append('image', imageFile);

      if (editingId) {
        const res = await categoryAPI.update(editingId, fd);
        setCats(prev => prev.map(c => c._id === editingId ? res.data.category : c));
        toast.success('Category updated!');
      } else {
        const res = await categoryAPI.create(fd);
        setCats(prev => [...prev, res.data.category]);
        toast.success('Category created!');
      }
      setShowForm(false);
    } catch (err) {
      if (process.env.NODE_ENV === 'development') {
        console.error('Category save error:', err);
      }
      if (err.message === 'Network Error') {
        toast.error('Network Error — cannot reach API. Is the backend running?');
      } else {
        toast.error(err.message);
      }
    }
    finally { setSaving(false); }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete category "${name}"? Products in this category won't be deleted.`)) return;
    setDeleting(id);
    try {
      await categoryAPI.delete(id);
      setCats(prev => prev.filter(c => c._id !== id));
      toast.success('Category deleted');
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(null); }
  };

  return (
    <AdminLayout title="Categories">
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-white">Categories <span className="text-gray-500 font-normal text-sm">({categories.length})</span></h2>
          <p className="text-xs text-gray-500 mt-0.5">Manage product categories shown in the shop</p>
        </div>
        <button onClick={openAdd} className="btn-primary px-4 py-2.5 text-sm gap-2">
          <FiPlus /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array(6).fill(0).map((_,i) => <div key={i} className="h-32 shimmer rounded-2xl" />)}
        </div>
      ) : categories.length === 0 ? (
        <div className="text-center py-20">
          <FiLayers className="text-6xl text-gray-700 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No categories yet</p>
          <button onClick={openAdd} className="btn-primary px-6 py-3 text-sm">Create First Category</button>
        </div>
      ) : (
        <div className="grid sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {categories.map(cat => (
            <div key={cat._id} className="card p-5 rounded-2xl hover:border-white/10/20 transition-all group">
              <div className="flex items-start justify-between mb-3">
                <div className="text-4xl">{cat.icon}</div>
                <div className="flex gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => openEdit(cat)}
                    className="p-1.5 text-gray-400 hover:text-white border border-white/10 rounded-lg hover:border-white/10 transition-all">
                    <FiEdit2 className="text-xs" />
                  </button>
                  <button onClick={() => handleDelete(cat._id, cat.name)} disabled={deleting === cat._id}
                    className="p-1.5 text-red-400/60 hover:text-red-400 border border-white/10 rounded-lg hover:border-red-400/30 transition-all disabled:opacity-30">
                    {deleting === cat._id ? <div className="spinner w-3 h-3" /> : <FiTrash2 className="text-xs" />}
                  </button>
                </div>
              </div>
              {cat.image?.url && (
                <div className="relative w-full h-20 rounded-lg overflow-hidden mb-3 bg-dark">
                  <Image src={cat.image.url} alt={cat.name} fill className="object-cover" />
                </div>
              )}
              <h3 className="font-bold text-white text-sm">{cat.name}</h3>
              {cat.description && <p className="text-xs text-gray-500 mt-1 line-clamp-2">{cat.description}</p>}
              <div className="flex items-center justify-between mt-2">
                <span className="text-[10px] text-gray-600">Order: {cat.sortOrder}</span>
                <span className={`text-[10px] badge ${cat.isActive !== false ? 'badge-green' : 'badge-red'}`}>
                  {cat.isActive !== false ? 'Active' : 'Hidden'}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Category form modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-2xl overflow-hidden bg-dark-card border border-white/10">
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="font-bold text-white">{editingId ? 'Edit Category' : 'Add Category'}</h3>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-white"><FiX /></button>
            </div>

            <div className="p-6 space-y-4">
              {/* Image upload */}
              <div>
                <label className="input-label">Category Image</label>
                <div className="flex items-center gap-3">
                  {preview ? (
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-dark">
                      <Image src={preview} alt="" fill className="object-cover" />
                    </div>
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-dark border border-white/10 flex items-center justify-center text-3xl flex-shrink-0">
                      {form.icon}
                    </div>
                  )}
                  <button onClick={() => fileRef.current?.click()}
                    className="btn-outline px-4 py-2 text-xs gap-2 flex items-center">
                    <FiUpload className="text-xs" /> Upload Image
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
                </div>
                <p className="text-[10px] text-gray-600 mt-1">Optional. Max 5MB. Auto-resized to 400×400.</p>
              </div>

              {/* Icon picker */}
              <div>
                <label className="input-label">Icon Emoji</label>
                <div className="flex flex-wrap gap-2">
                  {ICON_OPTIONS.map(ic => (
                    <button key={ic} onClick={() => setForm(p => ({ ...p, icon: ic }))}
                      className={`w-9 h-9 rounded-lg text-xl flex items-center justify-center transition-all border ${
                        form.icon === ic ? 'border-white/10 bg-white/10' : 'border-white/10 hover:border-white/25'
                      }`}>
                      {ic}
                    </button>
                  ))}
                  <input value={form.icon} onChange={upd('icon')}
                    className="input w-16 text-center text-xl px-2"
                    placeholder="🔌" maxLength={4} />
                </div>
              </div>

              <div>
                <label className="input-label">Category Name *</label>
                <input className="input" placeholder="Smart Lights" value={form.name} onChange={upd('name')} />
              </div>

              <div>
                <label className="input-label">Description</label>
                <input className="input" placeholder="WiFi-enabled smart lighting systems"
                  value={form.description} onChange={upd('description')} />
              </div>

              <div>
                <label className="input-label">Sort Order (lower = appears first)</label>
                <input className="input" type="number" min="0" placeholder="1"
                  value={form.sortOrder} onChange={upd('sortOrder')} />
              </div>

              <div className="flex gap-3">
                <button onClick={() => setShowForm(false)} className="btn-outline flex-1 py-3 text-sm justify-center">Cancel</button>
                <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3 text-sm justify-center gap-2 disabled:opacity-60">
                  {saving ? <><div className="spinner w-4 h-4" /> Saving...</> : <><FiSave /> {editingId ? 'Update' : 'Create'}</>}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
