/* ============================================
   frontend/components/ui/CartDrawer.js
   Purpose: Slide-in cart drawer — items, qty,
            total, checkout + WhatsApp order
   ============================================ */
import Link from 'next/link';
import Image from 'next/image';
import { FiX, FiTrash2, FiMinus, FiPlus, FiShoppingBag, FiMessageCircle } from 'react-icons/fi';
import { useCart } from '../../context/CartContext';
import { formatPrice, imgUrl, buildCartWhatsApp } from '../../lib/utils';

export default function CartDrawer() {
  const { items, isCartOpen, setIsCartOpen, removeItem, updateQty, itemCount, itemsTotal, shipping, totalPrice, freeShipping } = useCart();

  if (!isCartOpen) return null;

  const waLink = buildCartWhatsApp(items, totalPrice);

  return (
    <>
      <div className="fixed inset-0 bg-black/70 z-50 backdrop-blur-sm" onClick={() => setIsCartOpen(false)} />
      <div className="fixed top-0 right-0 h-full w-full sm:w-[28rem] z-50 flex flex-col bg-[#0b0b0b] border-l border-white/10 shadow-card animate-slide-in">

        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <FiShoppingBag className="text-gray-200 text-lg" />
            <div>
              <h2 className="text-lg font-semibold text-white">Cart</h2>
              <p className="text-xs text-gray-400">{itemCount} item{itemCount === 1 ? '' : 's'}</p>
            </div>
          </div>
          <button onClick={() => setIsCartOpen(false)} className="p-2 text-gray-400 hover:text-white rounded-2xl hover:bg-white/5 transition-colors">
            <FiX className="text-xl" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 text-center px-6 py-10 rounded-[28px] bg-white/5 border border-white/10">
              <FiShoppingBag className="text-5xl text-gray-500" />
              <p className="text-white font-semibold">Your cart is empty</p>
              <p className="text-sm text-gray-400">Add some premium smart products to continue.</p>
              <button onClick={() => setIsCartOpen(false)} className="btn-primary px-6 py-3 text-sm">
                Browse Shop
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item._id} className="flex gap-4 p-4 rounded-[28px] bg-white/5 border border-white/10">
                  <div className="relative w-20 h-20 rounded-3xl overflow-hidden bg-[#111111] border border-white/10">
                    <Image src={item.image || '/placeholder.jpg'} alt={item.name} fill className="object-cover" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-white leading-snug line-clamp-2">{item.name}</p>
                    <p className="text-xs text-gray-400 mt-2">{formatPrice(item.price)}</p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div className="flex items-center rounded-2xl border border-white/10 bg-white/5 overflow-hidden">
                        <button onClick={() => updateQty(item._id, item.qty - 1)}
                          className="px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                          <FiMinus className="text-sm" />
                        </button>
                        <span className="text-sm text-white w-10 text-center">{item.qty}</span>
                        <button onClick={() => updateQty(item._id, item.qty + 1)}
                          className="px-3 py-2 text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                          <FiPlus className="text-sm" />
                        </button>
                      </div>
                      <button onClick={() => removeItem(item._id)} className="p-2 text-gray-400 hover:text-white transition-colors rounded-2xl hover:bg-white/10">
                        <FiTrash2 className="text-sm" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {items.length > 0 && (
          <div className="p-6 border-t border-white/10 space-y-4">
            <div className="space-y-3 text-sm text-gray-400">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(itemsTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="text-gray-300">{freeShipping ? 'FREE' : formatPrice(shipping)}</span>
              </div>
              {freeShipping && (
                <p className="text-xs text-gray-400">Free shipping on orders over Rs. 10,000.</p>
              )}
            </div>
            <div className="flex justify-between items-center text-white font-semibold text-base border-t border-white/10 pt-4">
              <span>Total</span>
              <span>{formatPrice(totalPrice)}</span>
            </div>
            <Link href="/checkout" onClick={() => setIsCartOpen(false)} className="btn-primary w-full py-3 text-sm justify-center">
              Proceed to Checkout
            </Link>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp w-full py-3 text-sm justify-center flex items-center gap-2">
              <FiMessageCircle className="text-base" /> Order via WhatsApp
            </a>
            <button onClick={() => setIsCartOpen(false)} className="w-full text-center text-sm text-gray-400 hover:text-white transition-colors py-3 rounded-2xl bg-white/5 border border-white/10">
              Continue Shopping
            </button>
          </div>
        )}
      </div>
    </>
  );
}
