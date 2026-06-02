/* ============================================
   frontend/pages/shop.js
   Purpose: Product listing — search, filter by
            category/price/rating, sort, paginate
   ============================================ */
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import { NextSeo } from 'next-seo';
import { FiFilter, FiGrid, FiList, FiX, FiChevronDown, FiSearch } from 'react-icons/fi';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/ui/ProductCard';
import { productAPI, categoryAPI } from '../lib/api';
import { debounce } from '../lib/utils';

const SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest First' },
  { value: 'popular',    label: 'Most Popular' },
  { value: 'rating',     label: 'Top Rated' },
  { value: 'price-asc',  label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
];

export default function ShopPage({ initialProducts, initialTotal, categories }) {
  const router = useRouter();
  const { keyword: qKeyword, category: qCat, sort: qSort } = router.query;

  const [products,     setProducts]     = useState(initialProducts || []);
  const [total,        setTotal]        = useState(initialTotal || 0);
  const [loading,      setLoading]      = useState(false);
  const [page,         setPage]         = useState(1);
  const [pages,        setPages]        = useState(1);
  const [filterOpen,   setFilterOpen]   = useState(false);
  const [viewMode,     setViewMode]     = useState('grid');

  // Filter state
  const [keyword,      setKeyword]      = useState(qKeyword || '');
  const [category,     setCategory]     = useState(qCat || '');
  const [sort,         setSort]         = useState(qSort || 'newest');
  const [minPrice,     setMinPrice]     = useState('');
  const [maxPrice,     setMaxPrice]     = useState('');
  const [ratingFilter, setRatingFilter] = useState('');

  const fetchProducts = useCallback(async (params = {}) => {
    setLoading(true);
    try {
      const res = await productAPI.getAll({
        keyword, category, sort, minPrice, maxPrice, rating: ratingFilter, page, limit: 12,
        ...params,
      });
      setProducts(res.data.products);
      setTotal(res.data.total);
      setPages(res.data.pages);
    } catch { setProducts([]); }
    finally { setLoading(false); }
  }, [keyword, category, sort, minPrice, maxPrice, ratingFilter, page]);

  useEffect(() => { fetchProducts(); }, [sort, category, page]);

  const debouncedSearch = useCallback(debounce(() => { setPage(1); fetchProducts({ page: 1 }); }, 500), [fetchProducts]);

  const handleKeyword = (v) => { setKeyword(v); debouncedSearch(); };

  const handleFilter = () => { setPage(1); fetchProducts({ page: 1 }); setFilterOpen(false); };
  const clearFilters = () => {
    setKeyword(''); setCategory(''); setSort('newest');
    setMinPrice(''); setMaxPrice(''); setRatingFilter('');
    setPage(1);
    fetchProducts({ keyword: '', category: '', sort: 'newest', minPrice: '', maxPrice: '', rating: '', page: 1 });
  };

  const hasFilters = keyword || category || minPrice || maxPrice || ratingFilter || sort !== 'newest';

  return (
    <Layout>
      <NextSeo title="Shop Smart Home Products" description="Browse 200+ smart home products — lights, CCTV, locks, switches, sensors & more." />

      <div className="page-container py-8">
        {/* Page header */}
        <div className="mb-6">
          <h1 className="font-orbitron font-bold text-2xl text-white mb-1">
            Smart Home <span className="glow-text">Products</span>
          </h1>
          <p className="text-sm text-gray-500">{total} products found</p>
        </div>

        {/* Top bar */}
        <div className="flex flex-wrap gap-3 mb-6 items-center">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
            <input className="input pl-9 py-2.5 text-sm" placeholder="Search products..."
              value={keyword} onChange={e => handleKeyword(e.target.value)} />
          </div>

          {/* Sort */}
          <div className="relative">
            <select value={sort} onChange={e => { setSort(e.target.value); setPage(1); }}
              className="input py-2.5 pr-8 text-sm appearance-none cursor-pointer min-w-[160px]">
              {SORT_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <FiChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none text-sm" />
          </div>

          {/* Filter button */}
          <button onClick={() => setFilterOpen(!filterOpen)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all border ${
              hasFilters ? 'bg-white/10 text-white border-white/10' : 'text-gray-400 border-white/10 hover:border-white/20'}`}>
            <FiFilter /> Filters {hasFilters && <span className="badge py-0 text-[9px] px-1.5">Active</span>}
          </button>

          {/* View mode */}
          <div className="flex rounded-lg overflow-hidden border border-white/10">
            {[{ mode: 'grid', Icon: FiGrid }, { mode: 'list', Icon: FiList }].map(({ mode, Icon }) => (
              <button key={mode} onClick={() => setViewMode(mode)}
                className={`p-2.5 text-sm transition-colors ${viewMode === mode ? 'bg-white/10 text-white' : 'text-gray-500 hover:text-white'}`}>
                <Icon />
              </button>
            ))}
          </div>
        </div>

        {/* Filter panel */}
        {filterOpen && (
          <div className="glass p-5 rounded-xl mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="input-label">Category</label>
              <select className="input py-2 text-sm" value={category} onChange={e => setCategory(e.target.value)}>
                <option value="">All Categories</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="input-label">Min Price (Rs.)</label>
              <input type="number" className="input py-2 text-sm" placeholder="0"
                value={minPrice} onChange={e => setMinPrice(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Max Price (Rs.)</label>
              <input type="number" className="input py-2 text-sm" placeholder="100000"
                value={maxPrice} onChange={e => setMaxPrice(e.target.value)} />
            </div>
            <div>
              <label className="input-label">Min Rating</label>
              <select className="input py-2 text-sm" value={ratingFilter} onChange={e => setRatingFilter(e.target.value)}>
                <option value="">Any Rating</option>
                {[4, 3, 2, 1].map(r => <option key={r} value={r}>{r}★ & above</option>)}
              </select>
            </div>
            <div className="col-span-2 md:col-span-4 flex gap-3">
              <button onClick={handleFilter} className="btn-primary px-5 py-2 text-sm">Apply Filters</button>
              {hasFilters && (
                <button onClick={clearFilters} className="btn-outline px-5 py-2 text-sm gap-2 text-gray-400">
                  <FiX className="text-xs" /> Clear All
                </button>
              )}
            </div>
          </div>
        )}

        {/* Category chips */}
        <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
          <button onClick={() => { setCategory(''); setPage(1); }}
            className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border ${
              !category ? 'bg-white/10 text-white border-white/10' : 'text-gray-500 border-white/10 hover:border-white/20'}`}>
            All
          </button>
          {categories.map(c => (
            <button key={c._id} onClick={() => { setCategory(c._id); setPage(1); }}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-xs font-bold transition-all border flex items-center gap-1.5 ${
                category === c._id ? 'bg-white/10 text-white border-white/10' : 'text-gray-500 border-white/10 hover:border-white/20'}`}>
              <span>{c.icon}</span> {c.name}
            </button>
          ))}
        </div>

        {/* Products grid */}
        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array(8).fill(0).map((_, i) => (
              <div key={i} className="rounded-xl h-72 shimmer" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">🔍</div>
            <p className="text-gray-400 font-medium mb-2">No products found</p>
            <p className="text-sm text-gray-600 mb-5">Try different search terms or filters</p>
            <button onClick={clearFilters} className="btn-outline px-6 py-2.5 text-sm">Clear Filters</button>
          </div>
        ) : (
          <>
            <div className={viewMode === 'grid'
              ? 'grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5'
              : 'flex flex-col gap-3'}>
              {products.map(p => <ProductCard key={p._id} product={p} />)}
            </div>

            {/* Pagination */}
            {pages > 1 && (
              <div className="flex justify-center gap-2 mt-10">
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${
                      p === page ? 'bg-white/10 text-white border border-white/10' : 'text-gray-500 border border-white/10 hover:border-white/20'}`}>
                    {p}
                  </button>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ query }) {
  try {
    const [prodRes, catRes] = await Promise.all([
      productAPI.getAll({ ...query, limit: 12, page: 1 }),
      categoryAPI.getAll(),
    ]);
    return {
      props: {
        initialProducts: prodRes.data?.products || [],
        initialTotal:    prodRes.data?.total    || 0,
        categories:      catRes.data?.categories || [],
      },
    };
  } catch {
    return { props: { initialProducts: [], initialTotal: 0, categories: [] } };
  }
}
