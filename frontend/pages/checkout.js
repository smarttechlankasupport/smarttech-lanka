/* ============================================
   frontend/pages/checkout.js
   Purpose: Multi-step checkout — delivery info,
            payment method, order summary, confirm
   ============================================ */
import { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import { FiCheck, FiChevronRight, FiMapPin, FiCreditCard, FiTruck, FiShield } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import { useCart }  from '../context/CartContext';
import { useAuth }  from '../context/AuthContext';
import { orderAPI } from '../lib/api';
import { formatPrice, imgUrl, SL_DISTRICTS } from '../lib/utils';

const STEPS = ['Delivery', 'Payment', 'Review'];
const PAYMENT_METHODS = [
  { id: 'cod',           label: 'Cash on Delivery',   icon: '💵', desc: 'Pay when you receive' },
  { id: 'bank_transfer', label: 'Bank Transfer',       icon: '🏦', desc: 'Transfer before delivery' },
  { id: 'whatsapp',      label: 'WhatsApp Order',      icon: '💬', desc: 'Confirm via WhatsApp' },
];

export default function CheckoutPage() {
  const router   = useRouter();
  const { user, isLoggedIn } = useAuth();
  const { items, totalPrice, itemsTotal, shipping, discount, coupon, clearCart } = useCart();
  const [step,       setStep]       = useState(0);
  const [placing,    setPlacing]    = useState(false);
  const [orderId,    setOrderId]    = useState(null);
  const [delivery,   setDelivery]   = useState({
    line1: '', city: '', district: '', phone: user?.phone || '',
    name:  user?.name || '', email: user?.email || '',
  });
  const [payMethod, setPayMethod] = useState('cod');

  const updateDelivery = (k, v) => setDelivery(p => ({ ...p, [k]: v }));

  const validateDelivery = () => {
    if (!delivery.name.trim())  { toast.error('Name is required'); return false; }
    if (!delivery.email.trim()) { toast.error('Email is required'); return false; }
    if (!delivery.phone.trim()) { toast.error('Phone is required'); return false; }
    if (!delivery.line1.trim()) { toast.error('Address is required'); return false; }
    if (!delivery.city.trim())  { toast.error('City is required'); return false; }
    return true;
  };

  const goNext = () => {
    if (step === 0 && !validateDelivery()) return;
    setStep(s => Math.min(s + 1, 2));
  };

  const placeOrder = async () => {
    if (items.length === 0) { toast.error('Cart is empty'); return; }
    setPlacing(true);
    try {
      const res = await orderAPI.create({
        items:           items.map(i => ({ product: i._id, qty: i.qty })),
        shippingAddress: { line1: delivery.line1, city: delivery.city, district: delivery.district, phone: delivery.phone },
        paymentMethod:   payMethod,
        couponCode:      coupon?.code,
        guestName:       !isLoggedIn ? delivery.name  : undefined,
        guestEmail:      !isLoggedIn ? delivery.email : undefined,
        guestPhone:      !isLoggedIn ? delivery.phone : undefined,
      });
      setOrderId(res.data.order.orderNumber);
      clearCart();
      setStep(3); // success
    } catch (err) {
      toast.error(err.message);
    } finally {
      setPlacing(false);
    }
  };

  // Order Success Screen
  if (step === 3) {
    return (
      <Layout>
        <div className="min-h-[70vh] flex items-center justify-center px-4">
          <div className="glass max-w-md w-full p-10 rounded-2xl text-center">
            <div className="w-20 h-20 rounded-full bg-green-400/15 border-2 border-green-400/40 flex items-center justify-center mx-auto mb-6">
              <FiCheck className="text-green-400 text-3xl" />
            </div>
            <h2 className="font-orbitron font-bold text-2xl text-white mb-2">Order Placed! 🎉</h2>
            <p className="text-white font-bold text-lg font-orbitron mb-4">{orderId}</p>
            <p className="text-gray-400 text-sm leading-relaxed mb-8">
              Thank you for your order! We'll confirm via SMS/WhatsApp within 30 minutes. Our team will contact you shortly.
            </p>
            <div className="flex gap-3">
              <Link href={isLoggedIn ? '/profile?tab=orders' : '/'} className="btn-outline flex-1 py-3 text-sm justify-center">
                {isLoggedIn ? 'View Orders' : 'Back Home'}
              </Link>
              <Link href="/shop" className="btn-primary flex-1 py-3 text-sm justify-center">Shop More</Link>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <NextSeo title="Checkout" />
      <div className="page-container py-10 max-w-5xl">
        <h1 className="font-orbitron font-bold text-2xl text-white mb-8">Checkout</h1>

        {/* Stepper */}
        <div className="flex items-center mb-10">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center">
              <div className={`flex items-center gap-2 text-sm font-semibold transition-colors ${i <= step ? 'text-white' : 'text-gray-600'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${
                  i < step  ? 'bg-white/10 border-white/10 text-dark' :
                  i === step ? 'border-white/10 text-white' : 'border-gray-700 text-gray-600'}`}>
                  {i < step ? <FiCheck /> : i + 1}
                </div>
                <span className="hidden sm:block">{s}</span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`h-px flex-1 mx-3 sm:mx-4 transition-colors ${i < step ? 'bg-white/10' : 'bg-white/10'}`} style={{ minWidth: 30 }} />
              )}
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Step content */}
          <div className="lg:col-span-2">

            {/* Step 0: Delivery */}
            {step === 0 && (
              <div className="card p-6 rounded-2xl space-y-5">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <FiMapPin className="text-white" /> Delivery Details
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {[
                    { key: 'name',  label: 'Full Name *',    placeholder: 'Kamal Perera',        type: 'text' },
                    { key: 'email', label: 'Email *',        placeholder: 'kamal@email.com',     type: 'email' },
                    { key: 'phone', label: 'Phone Number *', placeholder: '077 123 4567',        type: 'tel' },
                    { key: 'city',  label: 'City *',         placeholder: 'Colombo',             type: 'text' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="input-label">{f.label}</label>
                      <input className="input" type={f.type} placeholder={f.placeholder}
                        value={delivery[f.key]} onChange={e => updateDelivery(f.key, e.target.value)} />
                    </div>
                  ))}
                  <div className="sm:col-span-2">
                    <label className="input-label">Delivery Address *</label>
                    <input className="input" placeholder="No. 123, Galle Road, Colombo 03"
                      value={delivery.line1} onChange={e => updateDelivery('line1', e.target.value)} />
                  </div>
                  <div>
                    <label className="input-label">District</label>
                    <select className="input" value={delivery.district} onChange={e => updateDelivery('district', e.target.value)}>
                      <option value="">Select district</option>
                      {SL_DISTRICTS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            )}

            {/* Step 1: Payment */}
            {step === 1 && (
              <div className="card p-6 rounded-2xl space-y-4">
                <h2 className="font-bold text-white flex items-center gap-2">
                  <FiCreditCard className="text-white" /> Payment Method
                </h2>
                {PAYMENT_METHODS.map(pm => (
                  <button key={pm.id} onClick={() => setPayMethod(pm.id)}
                    className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left ${
                      payMethod === pm.id ? 'border-white/10 bg-white/10' : 'border-white/10 hover:border-white/25'}`}>
                    <span className="text-2xl">{pm.icon}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-white text-sm">{pm.label}</p>
                      <p className="text-xs text-gray-500">{pm.desc}</p>
                    </div>
                    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all ${
                      payMethod === pm.id ? 'border-white/10 bg-white/10' : 'border-gray-600'}`}>
                      {payMethod === pm.id && <FiCheck className="text-dark text-xs" />}
                    </div>
                  </button>
                ))}
                {payMethod === 'bank_transfer' && (
                  <div className="glass p-4 rounded-xl text-sm space-y-1">
                    <p className="font-semibold text-white">Bank Transfer Details:</p>
                    <p className="text-gray-400">Bank: Commercial Bank of Ceylon</p>
                    <p className="text-gray-400">Account: Smart  Tech (Pvt) Ltd</p>
                    <p className="text-gray-400">Account No: 1234567890</p>
                    <p className="text-gray-400">Branch: Colombo 03</p>
                    <p className="text-xs text-gray-600 mt-2">Send receipt to WhatsApp after transfer.</p>
                  </div>
                )}
              </div>
            )}

            {/* Step 2: Review */}
            {step === 2 && (
              <div className="card p-6 rounded-2xl space-y-5">
                <h2 className="font-bold text-white">Review Your Order</h2>
                <div className="glass p-4 rounded-xl space-y-1 text-sm">
                  <p className="font-semibold text-white mb-2">Delivery To:</p>
                  <p className="text-gray-400">{delivery.name} — {delivery.phone}</p>
                  <p className="text-gray-400">{delivery.line1}, {delivery.city}{delivery.district ? `, ${delivery.district}` : ''}</p>
                  <p className="text-gray-400">{delivery.email}</p>
                </div>
                <div className="glass p-4 rounded-xl text-sm">
                  <p className="font-semibold text-white mb-2">Payment: <span className="text-white">
                    {PAYMENT_METHODS.find(p => p.id === payMethod)?.label}
                  </span></p>
                </div>
                <div className="space-y-3">
                  {items.map(item => (
                    <div key={item._id} className="flex gap-3 items-center">
                      <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-dark">
                        <Image src={item.image || '/placeholder.jpg'} alt={item.name} fill className="object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-white truncate">{item.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.qty}</p>
                      </div>
                      <span className="text-sm font-orbitron text-white">{formatPrice(item.price * item.qty)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Nav buttons */}
            <div className="flex gap-3 mt-6">
              {step > 0 && (
                <button onClick={() => setStep(s => s - 1)} className="btn-outline px-6 py-3 text-sm">
                  ← Back
                </button>
              )}
              {step < 2 ? (
                <button onClick={goNext} className="btn-primary px-8 py-3 text-sm gap-2">
                  Continue <FiChevronRight />
                </button>
              ) : (
                <button onClick={placeOrder} disabled={placing} className="btn-primary px-8 py-3 text-sm gap-2 flex-1 justify-center disabled:opacity-60">
                  {placing ? <><div className="spinner w-4 h-4" /> Placing Order...</> : <><FiCheck /> Place Order</>}
                </button>
              )}
            </div>
          </div>

          {/* Summary sidebar */}
          <div>
            <div className="card p-5 rounded-2xl sticky top-24">
              <h3 className="font-bold text-white mb-4 text-sm uppercase tracking-wider">Order Summary</h3>
              <div className="space-y-2 max-h-52 overflow-y-auto mb-4">
                {items.map(item => (
                  <div key={item._id} className="flex justify-between text-xs gap-2">
                    <span className="text-gray-400 truncate">{item.name} ×{item.qty}</span>
                    <span className="text-white flex-shrink-0">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-white/5 pt-3 space-y-2 text-sm">
                <div className="flex justify-between text-gray-400">
                  <span>Subtotal</span><span>{formatPrice(itemsTotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-green-400">
                    <span>Discount</span><span>−{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-gray-400">
                  <span>Shipping</span>
                  <span className={shipping === 0 ? 'text-green-400' : ''}>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span>
                </div>
                <div className="flex justify-between font-bold text-white pt-2 border-t border-white/5">
                  <span>Total</span>
                  <span className="font-orbitron text-white text-base">{formatPrice(totalPrice)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 mt-4 pt-3 border-t border-white/5 text-xs text-gray-500">
                <FiShield className="text-white" /> SSL Secured Checkout
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
