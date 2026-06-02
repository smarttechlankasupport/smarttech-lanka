/* ============================================
   frontend/pages/contact.js
   Purpose: Contact page — form, map embed,
            phone / WhatsApp / email CTAs
   ============================================ */
import { useState } from 'react';
import { NextSeo } from 'next-seo';
import { FiPhone, FiMail, FiMapPin, FiClock, FiSend, FiCheck } from 'react-icons/fi';
import { FaWhatsapp, FaFacebook, FaInstagram } from 'react-icons/fa';
import toast from 'react-hot-toast';
import Layout from '../components/layout/Layout';

export default function ContactPage() {
  const [form, setForm]     = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [sent, setSent]     = useState(false);
  const [loading, setLoading] = useState(false);
  const upd = k => e => setForm(p => ({ ...p, [k]: e.target.value }));
  const waLink = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94717336524'}`;

  const handleSubmit = async e => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) { toast.error('Please fill all required fields'); return; }
    setLoading(true);
    // Simulate sending (integrate email service like Resend/Nodemailer on backend)
    await new Promise(r => setTimeout(r, 1500));
    setSent(true);
    setLoading(false);
    toast.success('Message sent! We\'ll reply within 24 hours.');
  };

  const contacts = [
    { icon: FiPhone,   label: 'Phone',    value: '+94 71 733 6524',             href: 'tel:+94717336524' },
    { icon: FaWhatsapp,label: 'WhatsApp', value: '+94 71 733 6524',             href: waLink },
    { icon: FiMail,    label: 'Email',    value: 'smarttechee2026@gmail.com',    href: 'mailto:smarttechee2026@gmail.com' },
    { icon: FiMapPin,  label: 'Location', value: 'No 160, 1st floor, Wilgoda Road, Kurunegala', href: 'https://maps.google.com' },
    { icon: FiClock,   label: 'Hours',    value: 'Mon–Sat: 8AM–8PM',            href: null },
  ];

  return (
    <Layout>
      <NextSeo title="Contact Us" description="Get in touch with Smart  Tech. Call, WhatsApp, or email us." />

      <div className="py-14 text-center circuit-bg border-b border-white/5">
        <div className="page-container">
          <span className="badge mb-4 inline-block">Get In Touch</span>
          <h1 className="section-title mb-3">Contact <span className="glow-text">Us</span></h1>
          <p className="text-gray-500 max-w-md mx-auto text-sm">Have a question? We'd love to hear from you. We reply within 24 hours.</p>
        </div>
      </div>

      <div className="page-container py-12">
        <div className="grid lg:grid-cols-3 gap-10">

          {/* Contact info */}
          <div className="space-y-5">
            <h2 className="font-bold text-white text-lg mb-6">Contact Information</h2>
            {contacts.map(c => (
              <div key={c.label} className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 bg-white/10 border border-white/10 text-white">
                  <c.icon className="text-white" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{c.label}</p>
                  {c.href ? (
                    <a href={c.href} target={c.href.startsWith('http') ? '_blank' : '_self'} rel="noopener noreferrer"
                      className="text-sm text-white hover:text-white transition-colors font-medium">{c.value}</a>
                  ) : (
                    <p className="text-sm text-white font-medium">{c.value}</p>
                  )}
                </div>
              </div>
            ))}

            <div className="pt-4 border-t border-white/5">
              <p className="text-xs text-gray-500 mb-3">Follow Us</p>
              <div className="flex gap-3">
                {[
                  { Icon: FaFacebook,  href: '#' },
                  { Icon: FaInstagram, href: '#' },
                  { Icon: FaWhatsapp,  href: waLink },
                ].map(({ Icon, href }, i) => (
                  <a key={i} href={href} target="_blank" rel="noopener noreferrer"
                    className="w-9 h-9 rounded-xl card flex items-center justify-center transition-all hover:scale-110">
                    <Icon className="text-white" />
                  </a>
                ))}
              </div>
            </div>

            {/* Quick WhatsApp CTA */}
            <a href={waLink} target="_blank" rel="noopener noreferrer"
              className="btn-whatsapp w-full py-3.5 justify-center flex items-center gap-2 text-sm mt-4">
              <FaWhatsapp className="text-base" /> Chat on WhatsApp Now
            </a>
          </div>

          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="card p-8 rounded-2xl">
              {sent ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 rounded-full bg-green-400/15 border-2 border-green-400/40 flex items-center justify-center mx-auto mb-4">
                    <FiCheck className="text-green-400 text-2xl" />
                  </div>
                  <h3 className="font-bold text-white text-lg mb-2">Message Sent!</h3>
                  <p className="text-gray-400 text-sm">We'll get back to you within 24 hours.</p>
                  <button onClick={() => { setSent(false); setForm({ name:'',email:'',phone:'',subject:'',message:'' }); }}
                    className="btn-outline mt-6 px-6 py-2.5 text-sm">Send Another Message</button>
                </div>
              ) : (
                <>
                  <h2 className="font-bold text-white text-lg mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit} className="grid sm:grid-cols-2 gap-4">
                    {[
                      { key: 'name',    label: 'Full Name *',   placeholder: 'Kamal Perera',      type: 'text',  span: 1 },
                      { key: 'email',   label: 'Email *',       placeholder: 'you@email.com',     type: 'email', span: 1 },
                      { key: 'phone',   label: 'Phone',         placeholder: '077 123 4567',      type: 'tel',   span: 1 },
                      { key: 'subject', label: 'Subject',       placeholder: 'How can we help?',  type: 'text',  span: 1 },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="input-label">{f.label}</label>
                        <input className="input" type={f.type} placeholder={f.placeholder} value={form[f.key]} onChange={upd(f.key)} />
                      </div>
                    ))}
                    <div className="sm:col-span-2">
                      <label className="input-label">Message *</label>
                      <textarea className="input resize-none" rows={5} placeholder="Tell us about your project or question..."
                        value={form.message} onChange={upd('message')} />
                    </div>
                    <div className="sm:col-span-2">
                      <button type="submit" disabled={loading} className="btn-primary px-8 py-3.5 text-sm gap-2 disabled:opacity-60">
                        {loading ? <><div className="spinner w-4 h-4" /> Sending...</> : <><FiSend /> Send Message</>}
                      </button>
                    </div>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
