/* ============================================
   frontend/pages/products/[id].js
   Purpose: Product detail — images, specs,
            qty selector, reviews, WhatsApp CTA
   ============================================ */
import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import { FiShoppingCart, FiHeart, FiStar, FiMessageCircle, FiChevronRight, FiShield, FiTruck, FiRefreshCw, FiCheck } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Layout from '../../components/layout/Layout';
import { productAPI } from '../../lib/api';
import { useCart }  from '../../context/CartContext';
import { useAuth }  from '../../context/AuthContext';
import { formatPrice, calcDiscount, imgUrl, buildWhatsAppLink, clamp } from '../../lib/utils';

export default function ProductPage({ product, related }) {
  const { addItem }                              = useCart();
  const { isInWishlist, toggleWishlist }         = useAuth();
  const [qty,        setQty]        = useState(1);
  const [activeImg,  setActiveImg]  = useState(0);
  const [activeTab,  setActiveTab]  = useState('description');

  if (!product) return <div className="min-h-screen flex items-center justify-center text-gray-500">Product not found</div>;

  const discount   = calcDiscount(product.originalPrice, product.price);
  const inWishlist = isInWishlist(product._id);
  const waLink     = buildWhatsAppLink(product, qty);
  const inStock    = product.stock > 0;

  return (
    <Layout>
      <NextSeo title={product.name} description={product.shortDesc || product.description?.slice(0, 160)} />

      <div className="page-container py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-gray-500 mb-6">
          <Link href="/" className="hover:text-white">Home</Link>
          <FiChevronRight />
          <Link href="/shop" className="hover:text-white">Shop</Link>
          <FiChevronRight />
          <Link href={`/shop?category=${product.category?._id}`} className="hover:text-white">
            {product.category?.name}
          </Link>
          <FiChevronRight />
          <span className="text-gray-400 truncate max-w-[150px]">{product.name}</span>
        </nav>

        {/* Main product section */}
        <div className="grid lg:grid-cols-2 gap-10 mb-12">
          {/* Images */}
          <div className="space-y-3">
            <div className="relative aspect-square rounded-2xl overflow-hidden bg-gradient-to-br from-white/5 to-dark-card">
              <Image src={imgUrl(product.images, activeImg)} alt={product.name} fill className="object-cover" priority />
              {discount > 0 && (
                <span className="absolute top-4 left-4 badge-red text-sm px-3 py-1">-{discount}% OFF</span>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-1">
                {product.images.map((img, i) => (
                  <button key={i} onClick={() => setActiveImg(i)}
                    className={`relative w-16 h-16 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                      activeImg === i ? 'border-white/10' : 'border-white/10 hover:border-white/30'}`}>
                    <Image src={img.url} alt="" fill className="object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product info */}
          <div className="space-y-5">
            <div>
              <Link href={`/shop?category=${product.category?._id}`} className="badge text-xs mb-2 inline-block">
                {product.category?.icon} {product.category?.name}
              </Link>
              <h1 className="font-bold text-white text-2xl lg:text-3xl leading-tight">{product.name}</h1>
            </div>

            {/* Rating */}
            {product.numReviews > 0 && (
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  {[1,2,3,4,5].map(i => (
                    <FiStar key={i} className={`text-sm ${i <= Math.round(product.ratings) ? 'text-yellow-400 fill-current' : 'text-gray-600'}`} />
                  ))}
                </div>
                <span className="text-sm text-gray-400">{product.ratings} ({product.numReviews} reviews)</span>
              </div>
            )}

            {/* Price */}
            <div className="flex items-baseline gap-3">
              <span className="font-orbitron font-black text-3xl text-white">{formatPrice(product.price)}</span>
              {product.originalPrice > product.price && (
                <span className="text-gray-500 text-lg line-through">{formatPrice(product.originalPrice)}</span>
              )}
            </div>

            <p className="text-sm text-gray-400 leading-relaxed">{product.shortDesc || product.description?.slice(0, 200)}</p>

            {/* Stock */}
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${inStock ? 'bg-white/30 animate-pulse' : 'bg-gray-700'}`} />
              <span className={`text-sm font-medium ${inStock ? 'text-gray-300' : 'text-gray-500'}`}>
                {inStock ? `In Stock (${product.stock} available)` : 'Out of Stock'}
              </span>
            </div>

            {/* Qty + Actions */}
            <div className="space-y-3">
              <div className="flex items-center gap-4">
                <div className="flex items-center rounded-xl overflow-hidden border border-white/15 bg-dark-card">
                  <button onClick={() => setQty(clamp(qty - 1, 1, product.stock))}
                    className="px-4 py-3 text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-lg font-bold">−</button>
                  <span className="px-5 font-bold text-white text-base">{qty}</span>
                  <button onClick={() => setQty(clamp(qty + 1, 1, product.stock))}
                    className="px-4 py-3 text-gray-400 hover:text-white hover:bg-white/10 transition-colors text-lg font-bold">+</button>
                </div>
                <span className="text-sm text-gray-600">Max: {product.stock}</span>
              </div>

              <div className="flex gap-3">
                <button onClick={() => addItem(product, qty)} disabled={!inStock}
                  className="btn-primary flex-1 py-3.5 gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
                  <FiShoppingCart /> Add to Cart
                </button>
                <button onClick={() => toggleWishlist(product._id)}
                  className={`p-3.5 rounded-xl border-2 transition-all ${inWishlist ? 'bg-white/10 border-white/15 text-white' : 'border-white/15 text-gray-400 hover:border-white/25 hover:text-white'}`}>
                  <FiHeart className={inWishlist ? 'fill-current' : ''} />
                </button>
              </div>

              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full py-3.5 justify-center gap-2">
                <FaWhatsapp className="text-lg" /> Order via WhatsApp
              </a>
            </div>

            {/* Trust badges */}
            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-white/5">
              {[
                { icon: FiShield, text: 'Secure Payment' },
                { icon: FiTruck,  text: 'Island Delivery' },
                { icon: FiRefreshCw, text: '7-Day Return' },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex flex-col items-center gap-1 text-center">
                  <Icon className="text-white text-lg" />
                  <span className="text-xs text-gray-500">{text}</span>
                </div>
              ))}
            </div>

            {/* Warranty */}
            {product.warranty && (
              <div className="flex items-center gap-2 text-sm text-white bg-white/5 border border-white/10 rounded-lg px-4 py-2.5">
                <FiCheck /> {product.warranty}
              </div>
            )}
          </div>
        </div>

        {/* Tabs — Description / Specs */}
        <div className="mb-8">
          <div className="flex gap-1 border-b border-white/5 mb-6">
            {['description', 'specs', 'reviews'].map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-5 py-3 text-sm font-semibold capitalize transition-all border-b-2 -mb-px ${
                  activeTab === tab ? 'text-white border-white/10' : 'text-gray-500 border-transparent hover:text-white'}`}>
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'description' && (
            <div className="prose prose-invert max-w-none text-sm text-gray-400 leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.description?.replace(/\n/g, '<br/>') }} />
          )}
          {activeTab === 'specs' && (
            <div className="grid sm:grid-cols-2 gap-3 max-w-lg">
              {product.specs?.length > 0 ? product.specs.map(s => (
                <div key={s.key} className="flex justify-between gap-4 glass px-4 py-3 rounded-lg text-sm">
                  <span className="text-gray-500 font-medium">{s.key}</span>
                  <span className="text-white font-semibold text-right">{s.value}</span>
                </div>
              )) : <p className="text-gray-600 text-sm">No specifications listed.</p>}
            </div>
          )}
          {activeTab === 'reviews' && (
            <div className="text-gray-500 text-sm">
              {product.numReviews === 0 ? 'No reviews yet. Be the first!' : `${product.numReviews} customer reviews`}
            </div>
          )}
        </div>

        {/* Related products */}
        {related?.length > 0 && (
          <div>
            <h2 className="font-orbitron font-bold text-lg text-white mb-5">Related <span className="glow-text">Products</span></h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {related.slice(0, 4).map(p => (
                <Link key={p._id} href={`/products/${p._id}`} className="card p-3 hover:border-white/10/20 transition-all">
                  <div className="relative h-24 rounded-lg overflow-hidden mb-2 bg-dark">
                    <Image src={imgUrl(p.images)} alt={p.name} fill className="object-cover" />
                  </div>
                  <p className="text-xs font-semibold text-white line-clamp-2">{p.name}</p>
                  <p className="text-xs text-white font-orbitron mt-1">{formatPrice(p.price)}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getServerSideProps({ params }) {
  try {
    const [prodRes, relatedRes] = await Promise.all([
      productAPI.getById(params.id),
      productAPI.getAll({ limit: 4 }),
    ]);
    return {
      props: {
        product: prodRes.data?.product || null,
        related: relatedRes.data?.products?.filter(p => p._id !== params.id) || [],
      },
    };
  } catch {
    return { props: { product: null, related: [] } };
  }
}
