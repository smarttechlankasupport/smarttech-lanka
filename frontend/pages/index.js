/* ============================================
   frontend/pages/index.js
   Purpose: Home page — hero, services, featured
            products, stats, about CTA
   ============================================ */
import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { NextSeo } from 'next-seo';
import { FiArrowRight, FiZap, FiShield, FiWifi, FiPhone, FiTool, FiStar, FiMapPin } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Layout from '../components/layout/Layout';
import ProductCard from '../components/ui/ProductCard';
import { productAPI, categoryAPI } from '../lib/api';
import { formatPrice } from '../lib/utils';

const SERVICES = [
  { icon: '🏠', title: 'Smart Home Setup',    desc: 'Full home automation from scratch', color: '#f8f8f8' },
  { icon: '📷', title: 'CCTV Installation',   desc: 'HD security with remote monitoring', color: '#f8f8f8' },
  { icon: '💡', title: 'Smart Lighting',       desc: 'Energy-efficient automated systems', color: '#f8f8f8' },
  { icon: '🔒', title: 'Smart Locks',          desc: 'Biometric & app-controlled security', color: '#f8f8f8' },
  { icon: '⚡', title: 'Electrical Repairs',  desc: 'Professional electrical services', color: '#f8f8f8' },
  { icon: '🔧', title: 'Home Automation',      desc: 'Seamless device integration', color: '#f8f8f8' },
];

const STATS = [
  { num: '5,000+', label: 'Happy Customers' },
  { num: '1,200+', label: 'Projects Done' },
  { num: '200+',   label: 'Products' },
  { num: '24/7',   label: 'Support' },
];

export default function HomePage({ featured, categories }) {
  const waLink = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94717336524'}`;
  const shopLocationUrl =
    process.env.NEXT_PUBLIC_SHOP_LOCATION_URL ||
    'https://www.google.com/maps/search/?api=1&query=Smart+Tech+Lanka';
  const [count, setCount] = useState({ customers: 0, projects: 0 });

  // Debug shop location URL in browser console
  useEffect(() => {
    console.log('Shop Location URL:', shopLocationUrl);
  }, [shopLocationUrl]);

  // Count-up animation
  useEffect(() => {
    const t = setInterval(() => {
      setCount(p => ({
        customers: Math.min(p.customers + 100, 5000),
        projects:  Math.min(p.projects  + 30,  1200),
      }));
    }, 20);
    return () => clearInterval(t);
  }, []);

  return (
    <Layout>
      <NextSeo title="Smart Living Made Easy" description="Sri Lanka's #1 smart home solutions. Shop smart lights, CCTV, locks, automation & book professional installation." />

      {/* ── HERO ─────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden circuit-bg">
        {/* Background glows */}
        <div className="glow-blob w-96 h-96 bg-white/10 top-1/4 left-1/4 opacity-[0.06]" />
        <div className="glow-blob w-80 h-80 bg-gray-900 bottom-1/4 right-1/4 opacity-[0.08]" />

        <div className="page-container py-20 text-center relative z-10">
          {/* Tag */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full mb-6 text-sm font-semibold text-white"
            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            Sri Lanka&apos;s #1 Smart Home Solutions
          </div>

          {/* Headline */}
          <h1 className="font-orbitron font-black text-white mb-4 leading-tight"
            style={{ fontSize: 'clamp(2.2rem, 6vw, 4.5rem)' }}>
            Smart Living<br />
            <span className="glow-text">Made Easy</span>
          </h1>

          <p className="text-gray-400 max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
            Transform your home with cutting-edge technology. Professional installation, premium products, and unmatched service across Sri Lanka.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-4 mb-16">
            <Link href="/services" className="btn-outline px-8 py-3.5 text-base gap-2">
              <FiTool /> Book Service
            </Link>
            <Link href="/shop" className="btn-primary px-8 py-3.5 text-base gap-2">
              <FiZap /> Shop Products
            </Link>
            <a href={shopLocationUrl} target="_blank" rel="noopener noreferrer" className="btn-outline px-8 py-3.5 text-base gap-2">
              <FiMapPin /> Track Shop Location
            </a>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-8 py-3.5 text-base gap-2">
              <FaWhatsapp className="text-lg" /> WhatsApp
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-2xl mx-auto">
            {STATS.map(({ num, label }) => (
              <div key={label} className="glass p-5 rounded-xl text-center">
                <div className="font-orbitron font-black text-2xl glow-text">{num}</div>
                <div className="text-xs text-gray-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CATEGORIES ───────────────────────────── */}
      {categories?.length > 0 && (
        <section className="py-16 bg-dark-card">
          <div className="page-container">
            <div className="text-center mb-10">
              <span className="badge mb-3">Categories</span>
              <h2 className="section-title">Browse by <span className="glow-text">Category</span></h2>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
              {categories.map(cat => (
                <Link key={cat._id} href={`/shop?category=${cat._id}`}
                  className="glass p-4 rounded-xl text-center hover:border-white/10 transition-all hover:-translate-y-1 cursor-pointer">
                  <div className="text-3xl mb-2">{cat.icon}</div>
                  <p className="text-xs font-semibold text-gray-300">{cat.name}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── FEATURED PRODUCTS ────────────────────── */}
      {featured?.length > 0 && (
        <section className="py-16">
          <div className="page-container">
            <div className="flex items-end justify-between mb-8">
              <div>
                <span className="badge mb-2">Hot Products</span>
                <h2 className="section-title">Featured <span className="glow-text">Products</span></h2>
              </div>
              <Link href="/shop" className="btn-outline px-4 py-2 text-sm gap-2 hidden sm:flex">
                View All <FiArrowRight />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 lg:gap-5">
              {featured.slice(0, 8).map(p => <ProductCard key={p._id} product={p} />)}
            </div>
            <div className="text-center mt-8 sm:hidden">
              <Link href="/shop" className="btn-outline px-6 py-2.5 text-sm gap-2">
                View All Products <FiArrowRight />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* ── SERVICES ─────────────────────────────── */}
      <section className="py-16 bg-dark-card">
        <div className="page-container">
            <div className="text-center mb-10">
            <span className="badge mb-3">Services</span>
            <h2 className="section-title">What We <span className="glow-text">Offer</span></h2>
            <p className="text-gray-500 max-w-md mx-auto mt-2 text-sm">Professional smart home & electrical services across all Sri Lanka</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {SERVICES.map(({ icon, title, desc, color }) => (
              <Link key={title} href="/services"
                className="glass p-6 rounded-xl hover:border-white/10/20 transition-all hover:-translate-y-1 group cursor-pointer">
                <div className="text-3xl mb-4">{icon}</div>
                <h3 className="font-bold text-white mb-2 group-hover:text-white transition-colors">{title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed mb-4">{desc}</p>
                <span className="text-xs font-bold flex items-center gap-1 text-white">
                  Book Now <FiArrowRight className="text-xs" />
                </span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/services" className="btn-primary px-8 py-3.5 gap-2">
              <FiTool /> Book a Service
            </Link>
          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ────────────────────────── */}
      <section className="py-16">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge mb-4">Why Smart  Tech?</span>
              <h2 className="section-title mb-5">Your Trusted Smart <span className="glow-text">Home Partner</span></h2>
              <p className="text-gray-400 leading-relaxed mb-8">
                We&apos;ve been transforming Sri Lankan homes for 5+ years with premium smart technology and expert installation services.
              </p>
              {[
                { icon: FiShield, title: 'Certified Technicians',  desc: '50+ trained & certified installation experts island-wide' },
                { icon: FiWifi,   title: 'Top Brands Only',        desc: 'We source from trusted global smart home brands' },
                { icon: FiPhone,  title: '24/7 After-Sales Support',desc: 'Dedicated support team — call, WhatsApp, or email' },
                { icon: FiStar,   title: '5-Star Rated Service',    desc: 'Over 5,000 happy customers across Sri Lanka' },
              ].map(({ icon: Icon, title, desc }) => (
                <div key={title} className="flex gap-4 mb-5">
                  <div className="w-10 h-10 rounded-lg bg-white/10 border border-white/10/20 flex items-center justify-center flex-shrink-0">
                    <Icon className="text-white" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-sm mb-1">{title}</h4>
                    <p className="text-xs text-gray-500 leading-relaxed">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            {/* CTA card */}
            <div className="glass p-8 rounded-2xl text-center"
              style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.02))' }}>
              <div className="text-5xl mb-4">⚡</div>
              <h3 className="font-orbitron font-bold text-xl text-white mb-3">Ready to Go Smart?</h3>
              <p className="text-gray-400 text-sm leading-relaxed mb-6">
                Get a free consultation for your smart home project. Our experts will design the perfect setup for your budget.
              </p>
              <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-8 py-3.5 gap-2 inline-flex mb-3">
                <FaWhatsapp className="text-lg" /> Free Consultation
              </a>
              <p className="text-xs text-gray-600">Response within 30 minutes!</p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

export async function getServerSideProps() {
  try {
    const [featuredRes, catRes] = await Promise.all([
      productAPI.getAll({ featured: true, limit: 8 }),
      categoryAPI.getAll(),
    ]);
    return {
      props: {
        featured:   featuredRes.data?.products   || [],
        categories: catRes.data?.categories || [],
      },
    };
  } catch {
    return { props: { featured: [], categories: [] } };
  }
}
