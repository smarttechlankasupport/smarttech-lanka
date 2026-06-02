/* ============================================
   frontend/pages/cart.js
   Purpose: Full cart page — items, qty update,
            coupon, summary, checkout CTA
   ============================================ */
import Link from 'next/link';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import { useState } from 'react';
import { FiTrash2, FiMinus, FiPlus, FiArrowRight, FiTag, FiTruck, FiShoppingBag, FiMessageCircle } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Layout from '../components/layout/Layout';
import { useCart } from '../context/CartContext';
import { formatPrice, imgUrl, buildCartWhatsApp } from '../lib/utils';

export default function CartPage() {
  const { items, removeItem, updateQty, applyCoupon, removeCoupon, coupon, couponLoading,
          itemCount, itemsTotal, shipping, discount, totalPrice, freeShipping, clearCart } = useCart();
  const [couponCode, setCouponCode] = useState('');

  const waLink = buildCartWhatsApp(items, totalPrice);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    await applyCoupon(couponCode);
    setCouponCode('');
  };

  return (
    <Layout>
      <NextSeo title="Shopping Cart" />
      <div className="page-container py-10">
        <h1 className="font-orbitron font-bold text-2xl text-white mb-8">
          Shopping <span className="glow-text">Cart</span>
          {itemCount > 0 && <span className="text-base text-gray-500 font-sans font-normal ml-3">({itemCount} items)</span>}
        </h1>

        {items.length === 0 ? (
          /* Empty cart */
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <FiShoppingBag className="text-7xl text-gray-700 mb-6" />
            <h2 className="font-bold text-xl text-white mb-2">Your cart is empty</h2>
            <p className="text-gray-500 mb-8">Looks like you haven't added any smart products yet!</p>
            <Link href="/shop" className="btn-primary px-8 py-3 gap-2">
              <FiShoppingBag /> Browse Products
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2 space-y-3">
              {/* Header row */}
              <div className="hidden sm:grid grid-cols-12 text-xs text-gray-500 uppercase tracking-wider px-4 pb-2 border-b border-white/5">
                <div className="col-span-6">Product</div>
                <div className="col-span-2 text-center">Price</div>
                <div className="col-span-2 text-center">Qty</div>
                <div className="col-span-2 text-right">Total</div>
              </div>

              {items.map(item => (
                <div key={item._id} className="card p-4 rounded-xl grid grid-cols-12 gap-3 items-center">
                  {/* Image + Name */}
                  <div className="col-span-12 sm:col-span-6 flex items-center gap-3">
                    <div className="relative w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 bg-dark">
                      <Image src={item.image || '/placeholder.jpg'} alt={item.name} fill className="object-cover" />
                    </div>
                    <div className="min-w-0">
                      <Link href={`/products/${item._id}`} className="text-sm font-semibold text-white hover:text-white transition-colors line-clamp-2 leading-snug">
                        {item.name}
                      </Link>
                      <p className="text-xs text-gray-500 mt-0.5">{item.category}</p>
                      {/* Mobile price */}
                      <p className="sm:hidden text-xs text-white font-orbitron mt-1">{formatPrice(item.price)}</p>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="hidden sm:flex col-span-2 justify-center">
                    <span className="text-sm font-orbitron text-gray-300">{formatPrice(item.price)}</span>
                  </div>

                  {/* Qty controls */}
                  <div className="col-span-7 sm:col-span-2 flex justify-start sm:justify-center">
                    <div className="flex items-center rounded-lg overflow-hidden border border-white/10 bg-dark-card">
                      <button onClick={() => updateQty(item._id, item.qty - 1)}
                        className="px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
                        <FiMinus className="text-xs" />
                      </button>
                      <span className="px-3 text-sm font-bold text-white min-w-[2rem] text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item._id, item.qty + 1)}
                        disabled={item.qty >= item.stock}
                        className="px-3 py-2 text-gray-400 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-30">
                        <FiPlus className="text-xs" />
                      </button>
                    </div>
                  </div>

                  {/* Total + Delete */}
                  <div className="col-span-5 sm:col-span-2 flex items-center justify-end gap-2">
                    <span className="text-sm font-bold font-orbitron text-white">{formatPrice(item.price * item.qty)}</span>
                    <button onClick={() => removeItem(item._id)}
                      className="p-1.5 text-gray-600 hover:text-red-400 transition-colors rounded-lg hover:bg-red-400/5">
                      <FiTrash2 className="text-sm" />
                    </button>
                  </div>
                </div>
              ))}

              {/* Clear cart */}
              <button onClick={clearCart} className="text-xs text-gray-600 hover:text-red-400 transition-colors flex items-center gap-1 mt-2">
                <FiTrash2 className="text-xs" /> Clear entire cart
              </button>

              {/* Free shipping banner */}
              {!freeShipping && (
                <div className="glass p-4 rounded-xl flex items-center gap-3 border-dashed border-white/10/20">
                  <FiTruck className="text-white flex-shrink-0 text-lg" />
                  <div className="text-sm">
                    <span className="text-white font-semibold">Add {formatPrice(10000 - itemsTotal)} more</span>
                    <span className="text-gray-400"> to get FREE island-wide delivery! 🎉</span>
                  </div>
                </div>
              )}
              {freeShipping && (
                <div className="glass p-4 rounded-xl flex items-center gap-3 border border-green-400/20 bg-green-400/5">
                  <FiTruck className="text-green-400 flex-shrink-0 text-lg" />
                  <p className="text-sm text-green-400 font-semibold">You get FREE island-wide delivery! 🎉</p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="space-y-4">
              <div className="card p-6 rounded-xl space-y-4">
                <h2 className="font-bold text-white text-lg">Order Summary</h2>

                {/* Coupon */}
                <div>
                  <label className="input-label">Coupon Code</label>
                  {coupon ? (
                    <div className="flex items-center justify-between p-3 rounded-lg bg-green-400/10 border border-green-400/25">
                      <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                        <FiTag /> {coupon.code} — {coupon.type === 'percentage' ? `${coupon.value}% off` : `Rs. ${coupon.value} off`}
                      </div>
                      <button onClick={removeCoupon} className="text-red-400 text-xs hover:underline">Remove</button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input className="input py-2.5 text-sm uppercase" placeholder="Enter code"
                        value={couponCode} onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()} />
                      <button onClick={handleApplyCoupon} disabled={couponLoading}
                        className="btn-outline px-4 py-2.5 text-sm flex-shrink-0 disabled:opacity-50">
                        {couponLoading ? '...' : 'Apply'}
                      </button>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-600 mt-1">Try: SMART10, LANKA20, TECH15</p>
                </div>

                {/* Price breakdown */}
                <div className="space-y-2.5 text-sm border-t border-white/5 pt-4">
                  <div className="flex justify-between text-gray-400">
                    <span>Subtotal ({itemCount} items)</span>
                    <span>{formatPrice(itemsTotal)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="flex justify-between text-green-400 font-medium">
                      <span>Coupon Discount</span>
                      <span>− {formatPrice(discount)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-gray-400">
                    <span>Shipping</span>
                    <span className={freeShipping ? 'text-green-400 font-semibold' : ''}>
                      {freeShipping ? 'FREE' : formatPrice(shipping)}
                    </span>
                  </div>
                  <div className="flex justify-between font-bold text-white text-base pt-2 border-t border-white/5">
                    <span>Total</span>
                    <span className="font-orbitron text-white text-lg">{formatPrice(totalPrice)}</span>
                  </div>
                </div>

                {/* CTA buttons */}
                <Link href="/checkout" className="btn-primary w-full py-3.5 justify-center text-sm gap-2">
                  Proceed to Checkout <FiArrowRight />
                </Link>
                <a href={waLink} target="_blank" rel="noopener noreferrer"
                  className="btn-whatsapp w-full py-3.5 justify-center text-sm gap-2 flex items-center">
                  <FaWhatsapp className="text-base" /> Order via WhatsApp
                </a>
                <Link href="/shop" className="block text-center text-xs text-gray-500 hover:text-gray-300 transition-colors mt-1">
                  ← Continue Shopping
                </Link>
              </div>

              {/* Trust badges */}
              <div className="card p-4 rounded-xl space-y-3">
                {[
                  { icon: '🔒', text: 'Secure 256-bit SSL checkout' },
                  { icon: '🚚', text: 'Fast island-wide delivery' },
                  { icon: '↩️',  text: '7-day hassle-free returns' },
                  { icon: '📞', text: '24/7 customer support' },
                ].map(b => (
                  <div key={b.text} className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="text-base">{b.icon}</span> {b.text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
