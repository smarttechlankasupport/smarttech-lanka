/* ============================================
   frontend/pages/admin/products.js
   Purpose: Full product management — add, edit,
            delete, image upload, price change,
            stock update — NO coding needed
   ============================================ */
import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX, FiUpload, FiSave, FiPackage, FiToggleLeft, FiToggleRight } from 'react-icons/fi';
import toast from 'react-hot-toast';
import AdminLayout from '../../components/layout/AdminLayout';
import { productAPI, categoryAPI } from '../../lib/api';
import { formatPrice, imgUrl } from '../../lib/utils';

const EMPTY_FORM = { name: '', description: '', shortDesc: '', category: '', price: '', originalPrice: '', stock: '', brand: 'Smart  Tech', warranty: '', featured: false, badge: '', specs: '', tags: '' };

export default function AdminProducts() {
  const [products,   setProducts]   = useState([]);
  const [categories, setCategories] = useState([]);
  const [total,      setTotal]      = useState(0);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [catFilter,  setCatFilter]  = useState('');
  const [page,       setPage]       = useState(1);
  const [pages,      setPages]      = useState(1);
  const [showModal,  setShowModal]  = useState(false);
  const [editingId,  setEditingId]  = useState(null);
  const [form,       setForm]       = useState(EMPTY_FORM);
  const [images,     setImages]     = useState([]);
  const [previewUrls,setPreviewUrls]= useState([]);
  const [saving,     setSaving]     = useState(false);
  const [deleting,   setDeleting]   = useState(null);
  const fileRef                      = useRef();

  useEffect(() => { fetchAll(); }, [page, search, catFilter]);
  useEffect(() => {
    categoryAPI.getAll().then(r => setCategories(r.data.categories || [])).catch(() => {});
  }, []);

  const fetchAll = async () => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({ keyword: search, category: catFilter, page, limit: 15 });
      setProducts(res.data.products || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch (err) {
      console.error('Failed request:', {
        url: err.config?.url,
        baseURL: err.config?.baseURL,
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });
      toast.error('Failed to load products');
    }
    finally { setLoading(false); }
  };

  const openAdd = () => {
    setForm(EMPTY_FORM); setImages([]); setPreviewUrls([]); setEditingId(null); setShowModal(true);
  };

  const openEdit = (p) => {
    setForm({
      name: p.name, description: p.description, shortDesc: p.shortDesc || '',
      category: p.category?._id || '', price: p.price, originalPrice: p.originalPrice || '',
      stock: p.stock, brand: p.brand || 'Smart  Tech', warranty: p.warranty || '',
      featured: p.featured || false,
      specs: p.specs?.map(s => `${s.key}: ${s.value}`).join('\n') || '',
      tags:  p.tags?.join(', ') || '',
    });
    setPreviewUrls(p.images?.map(i => i.url) || []);
    setImages([]);
    setEditingId(p._id);
    setShowModal(true);
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    setImages(files);
    setPreviewUrls(files.map(f => URL.createObjectURL(f)));
  };

  const handleSave = async () => {
    if (!form.name || !form.price || !form.stock || !form.category) {
      toast.error('Fill: name, price, stock, category'); return;
    }
    setSaving(true);
    try {
      // Build and validate specs: each non-empty line must contain 'Key: Value'
      let parsedSpecs = [];
      if (form.specs && form.specs.trim()) {
        const lines = form.specs.split('\n').map(l => l.trim());
        for (const line of lines) {
          if (!line) continue; // skip empty lines
          const [key, ...rest] = line.split(':');
          const value = rest.join(':').trim();
          const k = key?.trim();
          if (!k) { toast.error('Specification key cannot be empty'); setSaving(false); return; }
          if (!value) { toast.error('Specification value cannot be empty'); setSaving(false); return; }
          parsedSpecs.push({ key: k, value });
        }
      }

      // Log exact specs payload before sending
      if (process.env.NODE_ENV === 'development') {
        try { console.debug('[admin] specs payload ->', JSON.stringify(parsedSpecs)); } catch (_) {}
      }

      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (k === 'specs') fd.append('specs', JSON.stringify(parsedSpecs));
        else if (k === 'tags') fd.append('tags', JSON.stringify(v.split(',').map(t => t.trim()).filter(Boolean)));
        else fd.append(k, v);
      });
      images.forEach(f => fd.append('images', f));

      if (editingId) {
        await productAPI.update(editingId, fd);
        toast.success('Product updated! ✅');
      } else {
        await productAPI.create(fd);
        toast.success('Product created! 🎉');
      }
      setShowModal(false);
      fetchAll();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeleting(id);
    try {
      await productAPI.delete(id);
      toast.success('Product deleted');
      fetchAll();
    } catch (err) { toast.error(err.message); }
    finally { setDeleting(null); }
  };

  const toggleFeatured = async (p) => {
    try {
      const fd = new FormData();
      fd.append('featured', String(!p.featured));
      await productAPI.update(p._id, fd);
      setProducts(prev => prev.map(x => x._id === p._id ? { ...x, featured: !x.featured } : x));
      toast.success(`${!p.featured ? 'Featured' : 'Unfeatured'}!`);
    } catch {}
  };

  return (
    <AdminLayout title="Product Management">
      {/* Header */}
      <div className="flex flex-wrap gap-3 items-center justify-between mb-6">
        <div>
          <h2 className="font-bold text-white">Products <span className="text-gray-500 font-normal text-sm">({total})</span></h2>
          <p className="text-xs text-gray-500 mt-0.5">Add, edit, or delete products without any coding</p>
        </div>
        <button onClick={openAdd} className="btn-primary px-4 py-2.5 text-sm gap-2">
          <FiPlus /> Add New Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
          <input className="input pl-9 py-2.5 text-sm" placeholder="Search products..."
            value={search} onChange={e => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <select className="input py-2.5 text-sm w-44" value={catFilter} onChange={e => { setCatFilter(e.target.value); setPage(1); }}>
          <option value="">All Categories</option>
          {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="card rounded-2xl overflow-hidden">
        {loading ? (
          <div className="space-y-1 p-4">{Array(5).fill(0).map((_,i) => <div key={i} className="h-16 shimmer rounded-lg" />)}</div>
        ) : products.length === 0 ? (
          <div className="text-center py-16">
            <FiPackage className="text-5xl text-gray-700 mx-auto mb-3" />
            <p className="text-gray-500">No products found</p>
            <button onClick={openAdd} className="btn-primary mt-4 px-6 py-2.5 text-sm">Add First Product</button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Product</th><th>Category</th><th>Price</th><th>Stock</th>
                  <th>Rating</th><th>Featured</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map(p => (
                  <tr key={p._id}>
                    <td>
                      <div className="flex items-center gap-3 min-w-[200px]">
                        <div className="relative w-10 h-10 rounded-lg overflow-hidden flex-shrink-0 bg-dark">
                          <Image src={imgUrl(p.images)} alt={p.name} fill className="object-cover" />
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm line-clamp-1">{p.name}</p>
                          <p className="text-[10px] text-gray-500">{p.sku || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="text-xs text-gray-400">{p.category?.name}</td>
                    <td>
                      <div>
                        <p className="font-orbitron text-xs text-white font-bold">{formatPrice(p.price)}</p>
                        {p.originalPrice > p.price && (
                          <p className="text-[10px] text-gray-600 line-through">{formatPrice(p.originalPrice)}</p>
                        )}
                      </div>
                    </td>
                    <td>
                      <span className={`badge text-[10px] ${p.stock === 0 ? 'badge-red' : p.stock <= 5 ? 'badge-yellow' : 'badge-green'}`}>
                        {p.stock === 0 ? 'Out' : p.stock}
                      </span>
                    </td>
                    <td className="text-xs text-yellow-400">★ {p.ratings || 0} ({p.numReviews || 0})</td>
                    <td>
                      <button onClick={() => toggleFeatured(p)} className={`text-xl transition-colors ${p.featured ? 'text-white' : 'text-gray-400'}`}>
                        {p.featured ? <FiToggleRight /> : <FiToggleLeft />}
                      </button>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(p)} className="btn-outline px-2.5 py-1.5 text-xs gap-1">
                          <FiEdit2 className="text-xs" />
                        </button>
                        <button onClick={() => handleDelete(p._id, p.name)} disabled={deleting === p._id}
                          className="btn-danger px-2.5 py-1.5 text-xs gap-1 disabled:opacity-40">
                          {deleting === p._id ? <div className="spinner w-3 h-3" /> : <FiTrash2 className="text-xs" />}
                        </button>
                      </div>
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
            {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${p === page ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 border border-white/10 hover:border-white/20'}`}>
                {p}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/70 backdrop-blur-sm overflow-y-auto py-6 px-4">
          <div className="w-full max-w-2xl rounded-2xl overflow-hidden bg-dark-card border border-white/10 mt-8">
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="font-bold text-white">{editingId ? 'Edit Product' : 'Add New Product'}</h3>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white p-1"><FiX /></button>
            </div>

            <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Image upload */}
              <div>
                <label className="input-label">Product Images</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {previewUrls.map((url, i) => (
                    <div key={i} className="relative w-16 h-16 rounded-lg overflow-hidden bg-dark">
                      <Image src={url} alt="" fill className="object-cover" />
                    </div>
                  ))}
                  <button onClick={() => fileRef.current?.click()}
                    className="w-16 h-16 rounded-lg border-2 border-dashed border-white/20 flex flex-col items-center justify-center text-gray-500 hover:border-white/10/50 hover:text-white transition-all text-xs gap-1">
                    <FiUpload /> <span>Upload</span>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileChange} />
                </div>
                <p className="text-xs text-gray-600">Drag & drop or click to upload. Max 5 images, 5MB each. Auto-optimised.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="input-label">Product Name *</label>
                  <input className="input" placeholder="SmartGlow Pro LED Strip 5M" value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Category *</label>
                  <select className="input" value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value }))}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="input-label">Brand</label>
                  <input className="input" placeholder="Smart  Tech" value={form.brand} onChange={e => setForm(p => ({ ...p, brand: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Selling Price (Rs.) *</label>
                  <input className="input" type="number" placeholder="4500" value={form.price} onChange={e => setForm(p => ({ ...p, price: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Original Price (Rs.) — for discount badge</label>
                  <input className="input" type="number" placeholder="6000" value={form.originalPrice} onChange={e => setForm(p => ({ ...p, originalPrice: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Stock Quantity *</label>
                  <input className="input" type="number" placeholder="50" value={form.stock} onChange={e => setForm(p => ({ ...p, stock: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Warranty</label>
                  <input className="input" placeholder="1 Year Manufacturer Warranty" value={form.warranty} onChange={e => setForm(p => ({ ...p, warranty: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Short Description (max 300 chars)</label>
                  <input className="input" placeholder="Brief product summary for cards" value={form.shortDesc} onChange={e => setForm(p => ({ ...p, shortDesc: e.target.value }))} />
                </div>
                <div>
                  <label className="input-label">Tags (comma separated)</label>
                  <input className="input" placeholder="wifi, smart, rgb, alexa" value={form.tags} onChange={e => setForm(p => ({ ...p, tags: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="input-label">Full Description *</label>
                  <textarea className="input resize-none" rows={3} placeholder="Detailed product description..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div className="sm:col-span-2">
                  <label className="input-label">Specifications (one per line: Key: Value)</label>
                  <textarea className="input resize-none font-mono text-xs" rows={4}
                    placeholder={"Connectivity: WiFi 2.4GHz\nLength: 5 meters\nColors: 16 Million\nPower: 12W"}
                    value={form.specs} onChange={e => setForm(p => ({ ...p, specs: e.target.value }))} />
                </div>
                <div className="flex items-center gap-3">
                  <input type="checkbox" id="featured" checked={form.featured} onChange={e => setForm(p => ({ ...p, featured: e.target.checked }))} className="w-4 h-4" />
                  <label htmlFor="featured" className="text-sm text-gray-300 cursor-pointer">Show as Featured product on homepage</label>
                </div>
              </div>
            </div>

            <div className="flex gap-3 px-6 py-4 border-t border-white/5">
              <button onClick={() => setShowModal(false)} className="btn-outline flex-1 py-3 text-sm justify-center">Cancel</button>
              <button onClick={handleSave} disabled={saving} className="btn-primary flex-1 py-3 text-sm justify-center gap-2 disabled:opacity-60">
                {saving ? <><div className="spinner w-4 h-4" /> Saving...</> : <><FiSave /> {editingId ? 'Save Changes' : 'Add Product'}</>}
              </button>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}
