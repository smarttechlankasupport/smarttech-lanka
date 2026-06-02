/* ============================================
   frontend/components/ui/ProductCard.js
   Purpose: Reusable product card with image,
            price, rating, cart & wishlist
   ============================================ */
import Link from 'next/link';
import Image from 'next/image';
import { FiShoppingCart, FiHeart, FiStar, FiMessageCircle } from 'react-icons/fi';
import { useCart }  from '../../context/CartContext';
import { useAuth }  from '../../context/AuthContext';
import { formatPrice, calcDiscount, imgUrl, buildWhatsAppLink } from '../../lib/utils';

export default function ProductCard({ product }) {
  const { addItem } = useCart();
  const { isInWishlist, toggleWishlist, isLoggedIn } = useAuth();
  const inWishlist = isInWishlist(product._id);
  const discount = product.originalPrice ? calcDiscount(product.originalPrice, product.price) : product.discount;
  const mainImage = imgUrl(product.images);
  const waLink = buildWhatsAppLink(product);

  return (
    <div className="card group relative flex flex-col overflow-hidden rounded-[28px] border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-card">
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2">
        {discount > 0 && (
          <span className="badge text-[10px] uppercase tracking-[0.24em]">-{discount}% OFF</span>
        )}
        {product.featured && (
          <span className="badge text-[10px] uppercase tracking-[0.24em]">⭐ Featured</span>
        )}
        {product.stock === 0 && (
          <span className="badge bg-white/5 text-gray-300 text-[10px]">Out of Stock</span>
        )}
      </div>

      <button
        onClick={(e) => { e.preventDefault(); toggleWishlist(product._id); }}
        className={`absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center
          bg-white/10 text-white border border-white/10 shadow-sm transition-all duration-200 hover:bg-white/15 ${inWishlist ? 'ring-1 ring-white/20' : ''}`}>
        <FiHeart className="text-sm" />
      </button>

      <Link href={`/products/${product._id}`} className="block relative h-44 sm:h-48 overflow-hidden bg-[#111111]">
        <Image
          src={mainImage}
          alt={product.name}
          fill
          className="object-cover group-hover:scale-105 transition-transform duration-500"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </Link>

      <div className="p-5 flex flex-col flex-1 gap-3">
        <span className="text-[11px] font-semibold text-gray-400 uppercase tracking-[0.24em]">
          {product.category?.name || product.category}
        </span>

        <Link href={`/products/${product._id}`}>
          <h3 className="text-sm md:text-base font-semibold text-white leading-snug line-clamp-2 hover:text-gray-100 transition-colors">
            {product.name}
          </h3>
        </Link>

        {product.numReviews > 0 && (
          <div className="flex items-center gap-2 text-xs text-gray-400">
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(i => (
                <FiStar key={i} className={`text-[10px] ${i <= Math.round(product.ratings) ? 'text-gray-200' : 'text-gray-700'}`} />
              ))}
            </div>
            <span>({product.numReviews})</span>
          </div>
        )}

        <div className="flex items-baseline gap-3 mt-auto">
          <span className="font-semibold text-white text-base md:text-lg">{formatPrice(product.price)}</span>
          {product.originalPrice > product.price && (
            <span className="text-xs text-gray-500 line-through">{formatPrice(product.originalPrice)}</span>
          )}
        </div>

        <div className="flex items-center gap-2 text-[11px] text-gray-400">
          <div className={`w-1.5 h-1.5 rounded-full ${product.stock > 0 ? 'bg-white/60' : 'bg-white/20'}`} />
          <span>
            {product.stock > 10 ? 'In stock' : product.stock > 0 ? `Only ${product.stock} left` : 'Out of stock'}
          </span>
        </div>

        <div className="flex gap-3 mt-2">
          <button
            onClick={() => addItem(product)}
            disabled={product.stock === 0}
            className="btn-primary flex-1 py-3 text-xs gap-2 disabled:opacity-40 disabled:cursor-not-allowed">
            <FiShoppingCart className="text-base" />
            Add to cart
          </button>
          <a href={waLink} target="_blank" rel="noopener noreferrer"
            className="btn-whatsapp px-3 py-3 text-xs flex items-center justify-center rounded-2xl" title="Order via WhatsApp">
            <FiMessageCircle className="text-base" />
          </a>
        </div>
      </div>
    </div>
  );
}
