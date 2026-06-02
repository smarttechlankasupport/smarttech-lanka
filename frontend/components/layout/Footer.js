/* ============================================
   frontend/components/layout/Footer.js
   Purpose: Site footer with links, contact,
            social media, WhatsApp CTA
   ============================================ */
import Link from 'next/link';
import { FiZap, FiPhone, FiMail, FiMapPin, FiFacebook, FiInstagram, FiYoutube } from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';

export default function Footer() {
  const year    = new Date().getFullYear();
  const waLink  = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '94717336524'}`;

  const links = {
    Products: [
      { label: 'Smart Lights',   href: '/shop?category=smart-lights' },
      { label: 'CCTV Systems',   href: '/shop?category=cctv' },
      { label: 'Smart Locks',    href: '/shop?category=smart-locks' },
      { label: 'Smart Switches', href: '/shop?category=smart-switches' },
      { label: 'Sensors',        href: '/shop?category=sensors' },
    ],
    Services: [
      { label: 'Smart Home Setup',    href: '/services' },
      { label: 'CCTV Installation',   href: '/services' },
      { label: 'Home Automation',     href: '/services' },
      { label: 'Electrical Repair',   href: '/services' },
      { label: 'Consultation',        href: '/services' },
    ],
    Company: [
      { label: 'About Us',       href: '/about' },
      { label: 'Contact',        href: '/contact' },
      { label: 'Privacy Policy', href: '/privacy' },
      { label: 'Terms of Use',   href: '/terms' },
    ],
  };

  return (
    <footer className="bg-dark-nav text-gray-300 border-t border-white/10">
      <div className="page-container py-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white/5 border-b border-white/10">
        <div>
          <p className="font-semibold text-white">Need help choosing? Chat with us! 💬</p>
          <p className="text-sm text-gray-400">Our team is available 8AM–8PM daily</p>
        </div>
        <a href={waLink} target="_blank" rel="noopener noreferrer" className="btn-whatsapp px-6 py-3 flex-shrink-0">
          <FaWhatsapp className="text-xl" /> Chat on WhatsApp
        </a>
      </div>

      <div className="page-container py-14">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 lg:col-span-2">
            <Link href="/" className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-3xl bg-white/10 flex items-center justify-center border border-white/10">
                <FiZap className="text-white text-lg" />
              </div>
              <div>
                <div className="font-orbitron font-black text-base text-white">Smart  Tech</div>
                <div className="text-[10px] text-gray-400 tracking-[3px] uppercase">Smart Tech, Smart Life</div>
              </div>
            </Link>
            <p className="text-sm text-gray-400 leading-relaxed mb-5 max-w-xs">
              Sri Lanka's premier smart home technology company. Professional installation, premium products, island-wide service.
            </p>
            <div className="flex flex-col gap-3 text-sm text-gray-400">
              <a href="tel:+94717336524" className="flex items-center gap-2 hover:text-white transition-colors">
                <FiPhone className="text-gray-400 flex-shrink-0" /> +94 71 733 6524
              </a>
              <a href="mailto:smarttechee2026@gmail.com" className="flex items-center gap-2 hover:text-white transition-colors">
                <FiMail className="text-gray-400 flex-shrink-0" /> smarttechee2026@gmail.com
              </a>
              <div className="flex items-start gap-2">
                <FiMapPin className="text-gray-400 flex-shrink-0 mt-0.5" /> No 160, 1st floor, Wilgoda Road, Kurunegala
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              {[
                { Icon: FiFacebook,  href: '#', label: 'Facebook' },
                { Icon: FiInstagram, href: '#', label: 'Instagram' },
                { Icon: FiYoutube,   href: '#', label: 'YouTube' },
                { Icon: FaWhatsapp,  href: waLink, label: 'WhatsApp' },
              ].map(({ Icon, href, label }) => (
                <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                  aria-label={label}
                  className="w-9 h-9 rounded-2xl bg-dark-card border border-white/10 flex items-center justify-center text-gray-400 hover:text-white hover:border-white/20 transition-all">
                  <Icon />
                </a>
              ))}
            </div>
          </div>

          {Object.entries(links).map(([title, items]) => (
            <div key={title}>
              <h4 className="font-semibold text-white text-sm mb-4">{title}</h4>
              <ul className="space-y-3">
                {items.map(item => (
                  <li key={item.label}>
                    <Link href={item.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>© {year} Smart  Tech. All rights reserved.</p>
          <p className="flex items-center gap-1 text-gray-400">Made with <span className="text-white">❤️</span> in Sri Lanka 🇱🇰</p>
        </div>
      </div>
    </footer>
  );
}
