/* ============================================
   frontend/components/ui/SearchModal.js
   Purpose: Full-screen search modal with live
            product search results
   ============================================ */
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { FiSearch, FiX, FiArrowRight } from 'react-icons/fi';
import { productAPI } from '../../lib/api';
import { formatPrice, imgUrl, debounce } from '../../lib/utils';

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef(null);

  useEffect(() => {
    if (open) {
      setQuery('');
      setResults([]);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, onClose]);

  const search = debounce(async (q) => {
    if (!q.trim() || q.length < 2) { setResults([]); setLoading(false); return; }
    setLoading(true);
    try {
      const res = await productAPI.getAll({ keyword: q, limit: 8 });
      setResults(res.data.products || []);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, 400);

  const handleChange = (e) => { setQuery(e.target.value); setLoading(true); search(e.target.value); };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-16 px-4 bg-black/80 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="relative">
          <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
          <input
            ref={inputRef}
            value={query}
            onChange={handleChange}
            placeholder="Search products, categories..."
            className="w-full pl-12 pr-12 py-4 text-lg rounded-[28px] text-white placeholder-gray-500 font-inter bg-[#111111] border border-white/10 shadow-soft"
          />
          <button onClick={onClose} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors">
            <FiX className="text-lg" />
          </button>
        </div>

        {(results.length > 0 || loading || query.length > 1) && (
          <div className="mt-4 rounded-[28px] overflow-hidden bg-[#111111] border border-white/10 shadow-card">
            {loading ? (
              <div className="flex items-center justify-center py-8 gap-3 text-gray-400">
                <div className="spinner w-5 h-5" />
                <span className="text-sm">Searching...</span>
              </div>
            ) : results.length === 0 ? (
              <div className="py-10 text-center text-gray-500 text-sm">No products found for "{query}"</div>
            ) : (
              <>
                <div className="px-4 py-3 border-b border-white/10">
                  <span className="text-xs text-gray-400">{results.length} results</span>
                </div>
                {results.map((p) => (
                  <Link key={p._id} href={`/products/${p._id}`} onClick={onClose}
                    className="flex items-center gap-4 px-4 py-4 hover:bg-white/5 transition-colors border-b border-white/10 last:border-0">
                    <div className="relative w-14 h-14 rounded-3xl overflow-hidden bg-[#111111] border border-white/10">
                      <Image src={imgUrl(p.images)} alt={p.name} fill className="object-cover" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{p.name}</p>
                      <p className="text-xs text-gray-400 truncate">{p.category?.name}</p>
                    </div>
                    <span className="text-sm text-gray-200 flex-shrink-0">{formatPrice(p.price)}</span>
                    <FiArrowRight className="text-gray-400 flex-shrink-0" />
                  </Link>
                ))}
                <Link href={`/shop?keyword=${encodeURIComponent(query)}`} onClick={onClose}
                  className="flex items-center justify-center gap-2 py-4 text-sm text-white hover:bg-white/10 transition-colors">
                  See all results for "{query}" <FiArrowRight />
                </Link>
              </>
            )}
          </div>
        )}
        <p className="text-center text-xs text-gray-500 mt-3">Press ESC to close</p>
      </div>
    </div>
  );
}
