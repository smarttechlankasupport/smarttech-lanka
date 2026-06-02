/* ============================================
   frontend/context/CartContext.js
   Purpose: Shopping cart state — add, remove,
            update quantity, totals, coupons
   ============================================ */
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { storage } from '../lib/utils';
import { couponAPI } from '../lib/api';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items,          setItems]          = useState([]);
  const [coupon,         setCoupon]         = useState(null);
  const [couponLoading,  setCouponLoading]  = useState(false);
  const [isCartOpen,     setIsCartOpen]     = useState(false);

  // Load cart from localStorage
  useEffect(() => {
    const saved = storage.get('stl_cart');
    if (saved && Array.isArray(saved)) setItems(saved);
    const savedCoupon = storage.get('stl_coupon');
    if (savedCoupon) setCoupon(savedCoupon);
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    storage.set('stl_cart', items);
  }, [items]);

  // ── Actions ──────────────────────────────

  // Add to cart
  const addItem = useCallback((product, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(x => x._id === product._id);
      if (existing) {
        const newQty = Math.min(existing.qty + qty, product.stock || 99);
        toast.success(`${product.name} qty updated!`);
        return prev.map(x => x._id === product._id ? { ...x, qty: newQty } : x);
      }
      toast.success(`${product.name} added to cart! 🛒`);
      return [...prev, {
        _id:      product._id,
        name:     product.name,
        price:    product.price,
        image:    product.images?.[0]?.url || '',
        stock:    product.stock,
        category: product.category?.name || '',
        qty,
      }];
    });
    setIsCartOpen(true);
  }, []);

  // Remove from cart
  const removeItem = useCallback((id) => {
    setItems(prev => prev.filter(x => x._id !== id));
    toast.success('Item removed');
  }, []);

  // Update quantity
  const updateQty = useCallback((id, qty) => {
    if (qty <= 0) { removeItem(id); return; }
    setItems(prev => prev.map(x => x._id === id ? { ...x, qty: Math.min(qty, x.stock || 99) } : x));
  }, [removeItem]);

  // Clear cart
  const clearCart = useCallback(() => {
    setItems([]);
    setCoupon(null);
    storage.remove('stl_cart');
    storage.remove('stl_coupon');
  }, []);

  // ── Computed values ──────────────────────

  const itemCount   = items.reduce((s, i) => s + i.qty, 0);
  const itemsTotal  = items.reduce((s, i) => s + i.price * i.qty, 0);
  const shipping    = itemsTotal === 0 ? 0 : itemsTotal >= 10000 ? 0 : 350;
  const discount    = coupon ? (coupon.discountAmount || 0) : 0;
  const totalPrice  = itemsTotal + shipping - discount;
  const freeShipping = itemsTotal >= 10000;

  // Apply coupon
  const applyCoupon = useCallback(async (code) => {
    if (!code?.trim()) return;
    setCouponLoading(true);
    try {
      const res = await couponAPI.validate({ code, orderAmount: itemsTotal });
      const c   = res.data.coupon;
      setCoupon(c);
      storage.set('stl_coupon', c);
      toast.success(`Coupon applied! ${c.type === 'percentage' ? `${c.value}%` : `Rs. ${c.value}`} off 🎉`);
    } catch (err) {
      toast.error(err.message);
      setCoupon(null);
      storage.remove('stl_coupon');
    } finally {
      setCouponLoading(false);
    }
  }, [itemsTotal]);

  const removeCoupon = useCallback(() => {
    setCoupon(null);
    storage.remove('stl_coupon');
    toast.success('Coupon removed');
  }, []);

  return (
    <CartContext.Provider value={{
      items, coupon, couponLoading, isCartOpen, setIsCartOpen,
      addItem, removeItem, updateQty, clearCart, applyCoupon, removeCoupon,
      itemCount, itemsTotal, shipping, discount, totalPrice, freeShipping,
    }}>
      {children}
    </CartContext.Provider>
  );
}

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
};

export default CartContext;
