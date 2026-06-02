/* ============================================
   frontend/pages/about.js
   Purpose: About page — company story, team,
            achievements, why choose us
   ============================================ */
import Link from 'next/link';
import { NextSeo } from 'next-seo';
import { FiZap, FiShield, FiUsers, FiAward, FiMapPin, FiPhone } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import Layout from '../components/layout/Layout';

const STATS   = [
  { num: '2020',   label: 'Founded',           icon: '🏢' },
  { num: '5,000+', label: 'Happy Customers',    icon: '😊' },
  { num: '1,200+', label: 'Projects Completed', icon: '✅' },
  { num: '25+',    label: 'Districts Covered',  icon: '📍' },
];

const TEAM    = [
  { name: 'Chanaka Perera',  role: 'CEO & Founder',          emoji: '👨‍💼', desc: '10+ years in smart tech' },
  { name: 'Amali Silva',     role: 'Head of Installation',   emoji: '👩‍🔧', desc: 'Certified Smart Home Expert' },
  { name: 'Ruwan Fernando',  role: 'Lead Technician',        emoji: '👨‍🔬', desc: 'CCTV & Security Specialist' },
  { name: 'Dilini Rajapaksa',role: 'Customer Success',       emoji: '👩‍💻', desc: 'Always here to help you' },
];

const VALUES  = [
  { icon: FiZap,    title: 'Innovation First',   desc: 'We always bring the latest smart home technology to Sri Lanka.',      color: '#f8f8f8' },
  { icon: FiShield, title: 'Quality Guaranteed', desc: '90-day workmanship warranty on every installation we perform.',       color: '#f8f8f8' },
  { icon: FiUsers,  title: 'Customer-Centric',   desc: 'Our team is available 7 days a week for support and follow-ups.',     color: '#f8f8f8' },
  { icon: FiAward,  title: 'Award-Winning',       desc: 'Recognised as Best Smart Home Provider Sri Lanka 2024.',             color: '#f8f8f8' },
];

export default function AboutPage() {
  const waLink = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94717336524'}`;

  return (
    <Layout>
      <NextSeo
        title="About Us"
        description="Smart  Tech — Sri Lanka's leading smart home solutions company since 2020. 5,000+ happy customers island-wide."
      />

      {/* Hero */}
      <section className="py-20 text-center circuit-bg border-b border-white/5 relative overflow-hidden">
        <div className="glow-blob w-96 h-96 bg-white/10 top-0 left-1/4 opacity-[0.05]" />
        <div className="page-container relative z-10">
          <span className="badge mb-4 inline-block">Our Story</span>
          <h1 className="section-title mb-4" style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
            Sri Lanka's Trusted<br /><span className="glow-text">Smart Home Company</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Since 2020, Smart  Tech has been transforming homes and businesses across the island
            with cutting-edge automation, security, and lighting solutions — making smart living
            accessible to every Sri Lankan family.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="py-14 bg-dark-card">
        <div className="page-container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {STATS.map(s => (
              <div key={s.label} className="card p-6 rounded-2xl text-center hover:border-white/10/20 transition-all">
                <div className="text-4xl mb-3">{s.icon}</div>
                <div className="font-orbitron font-black text-2xl glow-text mb-1">{s.num}</div>
                <div className="text-xs text-gray-500 font-medium">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-16">
        <div className="page-container">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <span className="badge mb-4 inline-block">Our Mission</span>
              <h2 className="font-orbitron font-bold text-white text-3xl mb-5 leading-snug">
                Making Smart Living <span className="glow-text">Accessible</span> to All
              </h2>
              <p className="text-gray-400 leading-relaxed mb-4">
                We started Smart  Tech with one goal — to bring world-class smart home technology
                to every Sri Lankan family at an affordable price, backed by exceptional local support.
              </p>
              <p className="text-gray-400 leading-relaxed mb-6">
                Our team of 50+ certified technicians covers all 25 districts. We source only from
                trusted global brands, and every installation comes with a 90-day warranty.
              </p>
              <div className="flex flex-wrap gap-3">
                <Link href="/services"  className="btn-primary px-6 py-3 text-sm gap-2">Book a Service</Link>
                <Link href="/shop"      className="btn-outline px-6 py-3 text-sm gap-2">Shop Products</Link>
              </div>
            </div>

            {/* Timeline */}
            <div className="space-y-4">
              {[
                { year: '2020', event: 'Founded in Colombo with 3 technicians' },
                { year: '2021', event: 'Expanded to 5 major cities island-wide' },
                { year: '2022', event: 'Launched online store — 100+ products' },
                { year: '2023', event: '2,500+ homes transformed, 25 districts' },
                { year: '2024', event: 'Best Smart Home Provider Sri Lanka Award 🏆' },
                { year: '2025', event: '5,000+ happy customers & growing!' },
              ].map((item, i) => (
                <div key={item.year} className="flex gap-4 items-start">
                  <div className="flex flex-col items-center gap-1 flex-shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10/25 flex items-center justify-center">
                      <span className="font-orbitron font-bold text-[10px] text-white">{item.year}</span>
                    </div>
                    {i < 5 && <div className="w-px h-4 bg-white/8" />}
                  </div>
                  <p className="text-sm text-gray-400 leading-relaxed pt-2.5">{item.event}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Vision & Mission */}
      <section className="py-16">
        <div className="page-container">
          <div className="text-center mb-10">
            <span className="badge mb-3 inline-block">Our Vision & Mission</span>
            <h2 className="font-orbitron font-bold text-white text-2xl">Our Vision & Mission</h2>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="card p-6 rounded-2xl transition-none hover:border-white/10">
              <h3 className="font-bold text-white text-xl mb-3">Vision</h3>
              <p className="text-gray-400 leading-relaxed">
                Sri Lanka’s most trusted and innovative electrical engineering solutions provider,
                empowering homes and businesses through smart, safe, and sustainable technologies.
              </p>
            </div>
            <div className="card p-6 rounded-2xl transition-none hover:border-white/10">
              <h3 className="font-bold text-white text-xl mb-3">Mission</h3>
              <p className="text-gray-400 leading-relaxed">
                To deliver high-quality electrical, solar, and smart home solutions with professionalism,
                innovation, and customer satisfaction, while ensuring safety, reliability, and energy
                efficiency in every project.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-16 bg-dark-card">
        <div className="page-container">
            <div className="text-center mb-10">
            <span className="badge mb-3 inline-block">Our Values</span>
            <h2 className="font-orbitron font-bold text-white text-2xl">Why 5,000+ Customers <span className="glow-text">Trust Us</span></h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {VALUES.map(v => (
              <div key={v.title} className="card p-6 rounded-2xl text-center hover:border-white/10/20 transition-all">
                <div className="w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 bg-white/10 border border-white/10">
                  <v.icon className="text-white text-xl" />
                </div>
                <h3 className="font-bold text-white text-sm mb-2">{v.title}</h3>
                <p className="text-xs text-gray-500 leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-16">
        <div className="page-container">
          <div className="text-center mb-10">
            <span className="badge mb-3 inline-block">Meet the Team</span>
            <h2 className="font-orbitron font-bold text-white text-2xl">The People Behind <span className="glow-text">Smart  Tech</span></h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {TEAM.map(m => (
              <div key={m.name} className="card p-6 rounded-2xl text-center hover:border-white/10/20 transition-all">
                <div className="text-5xl mb-3">{m.emoji}</div>
                <h3 className="font-bold text-white text-sm mb-1">{m.name}</h3>
                <p className="text-xs text-white font-semibold mb-2">{m.role}</p>
                <p className="text-xs text-gray-500">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 bg-dark-card">
        <div className="page-container text-center">
          <h2 className="font-orbitron font-bold text-white text-2xl mb-4">
            Ready to Go <span className="glow-text">Smart?</span>
          </h2>
          <p className="text-gray-400 mb-8 max-w-md mx-auto text-sm leading-relaxed">
            Get a free consultation for your smart home project. We'll design the perfect setup for your budget.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link href="/services" className="btn-primary px-8 py-3.5 gap-2">Book Free Consultation</Link>
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-8 py-3.5 gap-2 flex items-center">
              <FaWhatsapp className="text-lg" /> Chat on WhatsApp
            </a>
          </div>
        </div>
      </section>
    </Layout>
  );
}
