/* ============================================
   frontend/pages/orders/[id].js
   Purpose: Order detail page — items, status
            timeline, delivery info, tracking
   ============================================ */
import { useEffect, useState } from 'react';
import { useRouter }           from 'next/router';
import Link                    from 'next/link';
import Image                   from 'next/image';
import { NextSeo }             from 'next-seo';
import { FiArrowLeft, FiPackage, FiTruck, FiCheck, FiClock, FiXCircle, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp }          from 'react-icons/fa';
import Layout                  from '../../components/layout/Layout';
import { orderAPI }            from '../../lib/api';
import { useAuth }             from '../../context/AuthContext';
import { formatPrice, formatDateTime, getStatusBadgeClass } from '../../lib/utils';

const STATUS_STEPS = ['pending', 'confirmed', 'processing', 'shipped', 'delivered'];

const STATUS_ICONS = {
  pending:    FiClock,
  confirmed:  FiCheck,
  processing: FiPackage,
  shipped:    FiTruck,
  delivered:  FiCheck,
  cancelled:  FiXCircle,
};

export default function OrderDetailPage() {
  const router              = useRouter();
  const { id }              = router.query;
  const { isLoggedIn }      = useAuth();
  const [order,  setOrder]  = useState(null);
  const [loading,setLoading]= useState(true);
  const [error,  setError]  = useState('');

  useEffect(() => {
    if (!isLoggedIn) { router.replace('/auth/login'); return; }
    if (!id) return;
    orderAPI.getById(id)
      .then(r  => setOrder(r.data.order))
      .catch(e => setError(e.message))
      .finally(()=> setLoading(false));
  }, [id, isLoggedIn]);

  const currentStep = STATUS_STEPS.indexOf(order?.orderStatus);
  const waMsg = order
    ? encodeURIComponent(`Hi! I need help with my order *${order.orderNumber}*. Status: ${order.orderStatus}`)
    : '';
  const waLink = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94717336524'}?text=${waMsg}`;

  if (loading) return (
    <Layout>
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="spinner w-8 h-8" />
      </div>
    </Layout>
  );

  if (error || !order) return (
    <Layout>
      <div className="page-container py-20 text-center">
        <FiPackage className="text-6xl text-gray-700 mx-auto mb-4" />
        <h2 className="font-bold text-white text-xl mb-2">Order not found</h2>
        <p className="text-gray-500 mb-6">{error || 'This order does not exist or you are not authorised.'}</p>
        <Link href="/profile?tab=orders" className="btn-primary px-6 py-3 text-sm">← My Orders</Link>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <NextSeo title={`Order ${order.orderNumber}`} />
      <div className="page-container py-10 max-w-4xl">

        {/* Back + header */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
          <div>
            <Link href="/profile?tab=orders" className="text-xs text-gray-500 hover:text-white flex items-center gap-1 mb-2">
              <FiArrowLeft className="text-xs" /> Back to Orders
            </Link>
            <h1 className="font-orbitron font-bold text-xl text-white">
              Order <span className="glow-text">{order.orderNumber}</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1">Placed on {formatDateTime(order.createdAt)}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className={`badge ${getStatusBadgeClass(order.orderStatus)} text-xs px-3 py-1.5`}>
              {order.orderStatus.toUpperCase()}
            </span>
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="btn-whatsapp px-4 py-2 text-xs flex items-center gap-1.5">
              <FaWhatsapp /> Support
            </a>
          </div>
        </div>

        {/* Status timeline */}
        {order.orderStatus !== 'cancelled' && (
          <div className="card p-6 rounded-2xl mb-6">
            <h3 className="font-bold text-white text-sm mb-5">Order Progress</h3>
            <div className="flex items-center">
              {STATUS_STEPS.map((s, i) => {
                const Icon    = STATUS_ICONS[s] || FiCheck;
                const done    = i <= currentStep;
                const current = i === currentStep;
                return (
                  <div key={s} className="flex items-center flex-1 last:flex-none">
                    <div className="flex flex-col items-center gap-1.5">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all ${
                        done
                          ? 'bg-white/10 border-white/10 text-dark'
                          : 'border-gray-700 text-gray-600'
                        } ${current ? 'ring-2 ring-white/20 ring-offset-2 ring-offset-dark-card' : ''}`}>
                        <Icon className="text-sm" />
                      </div>
                      <span className={`text-[9px] font-semibold uppercase tracking-wide text-center leading-tight max-w-[56px] ${done ? 'text-white' : 'text-gray-600'}`}>
                        {s}
                      </span>
                    </div>
                    {i < STATUS_STEPS.length - 1 && (
                      <div className={`flex-1 h-0.5 mx-1 mb-5 transition-all ${i < currentStep ? 'bg-white/10' : 'bg-gray-800'}`} />
                    )}
                  </div>
                );
              })}
            </div>
            {order.trackingNumber && (
              <div className="mt-4 pt-4 border-t border-white/5 text-sm">
                <span className="text-gray-500">Tracking Number: </span>
                <span className="text-white font-mono font-bold">{order.trackingNumber}</span>
              </div>
            )}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-5">
          {/* Items */}
          <div className="card p-5 rounded-2xl">
            <h3 className="font-bold text-white text-sm mb-4">
              Items Ordered ({order.items?.length})
            </h3>
            <div className="space-y-3">
              {order.items?.map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-lg overflow-hidden flex-shrink-0 bg-dark-card">
                    <Image
                      src={item.image || 'https://via.placeholder.com/48x48/121212/f8f8f8?text=STL'}
                      alt={item.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{item.name}</p>
                    <p className="text-xs text-gray-500">Qty: {item.qty} × {formatPrice(item.price)}</p>
                  </div>
                  <span className="text-sm font-orbitron text-white flex-shrink-0">
                    {formatPrice(item.price * item.qty)}
                  </span>
                </div>
              ))}
            </div>

            {/* Price breakdown */}
            <div className="mt-4 pt-4 border-t border-white/5 space-y-2 text-sm">
              <div className="flex justify-between text-gray-400">
                <span>Items Total</span><span>{formatPrice(order.itemsPrice)}</span>
              </div>
              {order.discountAmount > 0 && (
                <div className="flex justify-between text-green-400">
                  <span>Discount {order.couponCode && `(${order.couponCode})`}</span>
                  <span>− {formatPrice(order.discountAmount)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-400">
                <span>Shipping</span>
                <span>{order.shippingPrice === 0 ? <span className="text-green-400">FREE</span> : formatPrice(order.shippingPrice)}</span>
              </div>
              <div className="flex justify-between font-bold text-white pt-1.5 border-t border-white/5 text-base">
                <span>Total Paid</span>
                <span className="font-orbitron text-white">{formatPrice(order.totalPrice)}</span>
              </div>
            </div>
          </div>

          {/* Delivery + Payment */}
          <div className="space-y-4">
            <div className="card p-5 rounded-2xl">
              <h3 className="font-bold text-white text-sm mb-3 flex items-center gap-2">
                <FiMapPin className="text-white" /> Delivery Address
              </h3>
              <div className="text-sm text-gray-400 space-y-0.5">
                <p className="text-white font-medium">{order.user?.name || order.guestName}</p>
                <p>{order.shippingAddress?.line1}</p>
                <p>{order.shippingAddress?.city}{order.shippingAddress?.district ? `, ${order.shippingAddress.district}` : ''}</p>
                <p className="text-white">{order.shippingAddress?.phone}</p>
              </div>
            </div>

            <div className="card p-5 rounded-2xl">
              <h3 className="font-bold text-white text-sm mb-3">Payment</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Method</span>
                  <span className="text-white capitalize">{order.paymentMethod?.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Status</span>
                  <span className={`font-semibold ${order.paymentStatus === 'paid' ? 'text-green-400' : 'text-yellow-400'}`}>
                    {order.paymentStatus?.toUpperCase()}
                  </span>
                </div>
                {order.deliveredAt && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Delivered</span>
                    <span className="text-green-400">{formatDateTime(order.deliveredAt)}</span>
                  </div>
                )}
              </div>
            </div>

            {order.cancelReason && (
              <div className="glass p-4 rounded-xl border-red-400/20 bg-red-400/5 text-sm">
                <p className="text-red-400 font-semibold mb-1">Order Cancelled</p>
                <p className="text-gray-400">{order.cancelReason}</p>
              </div>
            )}

            {order.notes && (
              <div className="card p-4 rounded-xl text-sm">
                <p className="text-gray-500 text-xs mb-1 uppercase tracking-wide">Order Notes</p>
                <p className="text-gray-300">{order.notes}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
}
