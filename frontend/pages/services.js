/* ============================================
   frontend/pages/services.js
   Purpose: Service booking page — choose
            service, pick date/time, submit form
   ============================================ */
import { useState, useEffect } from 'react';
import { NextSeo } from 'next-seo';
import { FiCheck, FiCalendar, FiClock, FiMapPin, FiPhone, FiUser, FiMail, FiMessageSquare } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';
import { bookingAPI, serviceAPI } from '../lib/api';
import { useAuth } from '../context/AuthContext';
import { SERVICE_TYPES, TIME_SLOTS, SL_DISTRICTS } from '../lib/utils';

const tomorrow = () => { const d = new Date(); d.setDate(d.getDate() + 1); return d.toISOString().split('T')[0]; };

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [servicesLoading, setServicesLoading] = useState(true);
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [bookingRef, setBookingRef] = useState('');
  const [form, setForm] = useState({
    name:     user?.name  || '',
    email:    user?.email || '',
    phone:    user?.phone || '',
    service:  '',
    date:     tomorrow(),
    timeSlot: TIME_SLOTS[0],
    address:  '',
    city:     '',
    district: '',
    notes:    '',
    priority: 'normal',
  });
  const upd = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  // Fetch services from database
  useEffect(() => {
    const fetchServices = async () => {
      setServicesLoading(true);
      try {
        const res = await serviceAPI.getAll();
        setServices(res.data.services || []);
      } catch (err) {
        console.error('Failed to fetch services:', err);
        toast.error('Failed to load services');
        setServices([]);
      } finally {
        setServicesLoading(false);
      }
    };
    fetchServices();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.service || !form.date || !form.address || !form.city) {
      toast.error('Please fill all required fields'); return;
    }
    setLoading(true);
    try {
      const res = await bookingAPI.create(form);
      setBookingRef(res.data.booking.bookingNumber);
      setSubmitted(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const waLink = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94717336524'}?text=${encodeURIComponent(`Hi! I want to book a ${form.service || 'service'} on ${form.date}.`)}`;

  if (submitted) return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="glass max-w-md w-full p-10 rounded-2xl text-center">
          <div className="w-20 h-20 rounded-full bg-green-400/15 border-2 border-green-400/40 flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-green-400 text-3xl" />
          </div>
          <h2 className="font-orbitron font-bold text-2xl text-white mb-2">Booking Confirmed! 🎉</h2>
          <p className="font-bold text-white font-orbitron text-lg mb-4">{bookingRef}</p>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Thank you! Our team will contact you within <strong className="text-white">2 hours</strong> to confirm your <strong className="text-white">{form.service}</strong> appointment on <strong className="text-white">{form.date}</strong>.
          </p>
          <div className="flex gap-3">
            <button onClick={() => { setSubmitted(false); setForm(p => ({ ...p, service: '', notes: '', date: tomorrow() })); }}
              className="btn-outline flex-1 py-3 text-sm justify-center">Book Another</button>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp flex-1 py-3 text-sm justify-center flex items-center gap-2">
              <FaWhatsapp /> WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );

  if (submitted) return (
    <Layout>
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="glass max-w-md w-full p-10 rounded-2xl text-center">
          <div className="w-20 h-20 rounded-full bg-green-400/15 border-2 border-green-400/40 flex items-center justify-center mx-auto mb-6">
            <FiCheck className="text-green-400 text-3xl" />
          </div>
          <h2 className="font-orbitron font-bold text-2xl text-white mb-2">Booking Confirmed! 🎉</h2>
          <p className="font-bold text-white font-orbitron text-lg mb-4">{bookingRef}</p>
          <p className="text-gray-400 text-sm leading-relaxed mb-8">
            Thank you! Our team will contact you within <strong className="text-white">2 hours</strong> to confirm your <strong className="text-white">{form.service}</strong> appointment on <strong className="text-white">{form.date}</strong>.
          </p>
          <div className="flex gap-3">
            <button onClick={() => { setSubmitted(false); setForm(p => ({ ...p, service: '', notes: '', date: tomorrow() })); }}
              className="btn-outline flex-1 py-3 text-sm justify-center">Book Another</button>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp flex-1 py-3 text-sm justify-center flex items-center gap-2">
              <FaWhatsapp /> WhatsApp Us
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );

  return (
    <Layout>
      <NextSeo title="Book a Service" description="Book smart home installation, CCTV setup, electrical repairs & more across Sri Lanka." />

      {/* Hero */}
      <div className="py-14 text-center circuit-bg border-b border-white/5">
        <div className="page-container">
          <span className="badge mb-4 inline-block">Professional Services</span>
          <h1 className="section-title mb-3">Book a <span className="glow-text">Service</span></h1>
          <p className="text-gray-500 max-w-md mx-auto text-sm">Expert installation & repair across all Sri Lanka. Licensed technicians, guaranteed quality.</p>
        </div>
      </div>

      <div className="page-container py-12">
        {/* Service cards */}
        <h2 className="font-bold text-white text-lg mb-5">Our Services</h2>
        {servicesLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 animate-pulse">
                <div className="text-2xl mb-2">⏳</div>
                <div className="h-3 bg-white/10 rounded mb-2 w-2/3" />
                <div className="h-2 bg-white/10 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : services.length === 0 ? (
          <div className="card p-8 rounded-xl text-center mb-12">
            <p className="text-gray-400">No services available right now.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-12">
            {services.map(s => (
              <button key={s._id} onClick={() => setForm(p => ({ ...p, service: s.title }))}
                className={`p-4 rounded-xl text-left transition-all border-2 ${
                  form.service === s.title ? 'border-white/10 bg-white/10' : 'border-white/5 card hover:border-white/15'}`}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <p className="text-xs font-bold text-white leading-snug mb-1">{s.title}</p>
                <p className="text-[10px] font-semibold text-white">{s.priceLabel || (s.price ? `Rs. ${s.price.toLocaleString()}` : '—')}</p>
                <p className="text-[10px] text-gray-600">{s.duration || '—'}</p>
              </button>
            ))}
          </div>
        )}

        {/* Booking form */}
        <div className="grid lg:grid-cols-3 gap-8">
          <form onSubmit={handleSubmit} className="lg:col-span-2">
            <div className="card p-6 rounded-2xl space-y-5">
              <h2 className="font-bold text-white text-lg">Booking Details</h2>

              <div className="grid sm:grid-cols-2 gap-4">
                {[
                  { key: 'name',  label: 'Full Name *',    icon: FiUser,  placeholder: 'Kamal Perera',   type: 'text'  },
                  { key: 'phone', label: 'Phone Number *', icon: FiPhone, placeholder: '077 123 4567',   type: 'tel'   },
                  { key: 'email', label: 'Email Address',  icon: FiMail,  placeholder: 'you@email.com',  type: 'email' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="input-label">{f.label}</label>
                    <div className="relative">
                      <f.icon className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-500 text-sm" />
                      <input className="input pl-10" type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={upd(f.key)} />
                    </div>
                  </div>
                ))}

                <div>
                  <label className="input-label">Service Type *</label>
                  <select className="input" value={form.service} onChange={upd('service')} required>
                    <option value="">Select service</option>
                    {services.map(s => <option key={s._id} value={s.title}>{s.title}</option>)}
                  </select>
                </div>

                <div>
                  <label className="input-label flex items-center gap-1.5"><FiCalendar className="text-white" /> Preferred Date *</label>
                  <input className="input" type="date" value={form.date} onChange={upd('date')} min={tomorrow()} />
                </div>

                <div>
                  <label className="input-label flex items-center gap-1.5"><FiClock className="text-white" /> Time Slot *</label>
                  <select className="input" value={form.timeSlot} onChange={upd('timeSlot')}>
                    {TIME_SLOTS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>

                <div>
                  <label className="input-label">Priority</label>
                  <select className="input" value={form.priority} onChange={upd('priority')}>
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent (+Rs. 500)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="input-label flex items-center gap-1.5"><FiMapPin className="text-white" /> Delivery Address *</label>
                  <input className="input" placeholder="No. 123, Galle Road..." value={form.address} onChange={upd('address')} />
                </div>

                <div>
                  <label className="input-label">City *</label>
                  <input className="input" placeholder="Colombo" value={form.city} onChange={upd('city')} />
                </div>
                <div>
                  <label className="input-label">District</label>
                  <select className="input" value={form.district} onChange={upd('district')}>
                    <option value="">Select district</option>
                    {SL_DISTRICTS.map(d => <option key={d}>{d}</option>)}
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="input-label flex items-center gap-1.5"><FiMessageSquare className="text-white" /> Additional Notes</label>
                  <textarea className="input resize-none" rows={3}
                    placeholder="Describe your requirements, number of cameras needed, house size, etc."
                    value={form.notes} onChange={upd('notes')} />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button type="submit" disabled={loading} className="btn-primary px-8 py-3.5 text-sm gap-2 disabled:opacity-60">
                  {loading ? <><div className="spinner w-4 h-4" /> Booking...</> : <><FiCalendar /> Confirm Booking</>}
                </button>
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-6 py-3.5 text-sm flex items-center gap-2">
                  <FaWhatsapp /> WhatsApp Instead
                </a>
              </div>
            </div>
          </form>

          {/* Info sidebar */}
          <div className="space-y-4">
            <div className="card p-5 rounded-2xl space-y-4">
              <h3 className="font-bold text-white text-sm">Why Choose Us?</h3>
              {[
                { icon: '🏆', text: 'Certified & experienced technicians' },
                { icon: '🛡️', text: '90-day workmanship warranty' },
                { icon: '📍', text: 'Island-wide service coverage' },
                { icon: '⚡', text: 'Same-day emergency service' },
                { icon: '💰', text: 'Transparent fixed pricing' },
                { icon: '📱', text: 'Real-time updates via WhatsApp' },
              ].map(b => (
                <div key={b.text} className="flex items-start gap-3 text-sm text-gray-400">
                  <span className="text-base flex-shrink-0">{b.icon}</span> {b.text}
                </div>
              ))}
            </div>
            <div className="glass p-5 rounded-2xl border-green-400/20 bg-green-400/5">
              <p className="text-sm font-bold text-green-400 mb-2">Free Consultation</p>
              <p className="text-xs text-gray-400 mb-3">Not sure what you need? Chat with our experts for free!</p>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp py-2.5 text-xs w-full justify-center flex items-center gap-2">
                <FaWhatsapp /> Chat Now
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
