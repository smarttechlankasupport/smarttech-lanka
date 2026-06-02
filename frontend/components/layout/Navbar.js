/* ============================================
   frontend/components/layout/Navbar.js
   Purpose: Fixed top navigation bar — logo,
            links, cart, wishlist, user menu
   ============================================ */
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { FiShoppingCart, FiHeart, FiUser, FiMenu, FiX, FiSearch, FiLogOut, FiSettings, FiPackage, FiZap } from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import CartDrawer from '../ui/CartDrawer';
import SearchModal from '../ui/SearchModal';

export default function Navbar() {
  const router              = useRouter();
  const { user, isLoggedIn, isAdmin, logout } = useAuth();
  const { itemCount, setIsCartOpen }          = useCart();
  const [scrolled,    setScrolled]    = useState(false);
  const [mobileOpen,  setMobileOpen]  = useState(false);
  const [userMenu,    setUserMenu]    = useState(false);
  const [searchOpen,  setSearchOpen]  = useState(false);
  const userMenuRef                   = useRef(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close user menu on outside click
  useEffect(() => {
    const handler = (e) => { if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setUserMenu(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [router.pathname]);

  const navLinks = [
    { href: '/',          label: 'Home' },
    { href: '/shop',      label: 'Shop' },
    { href: '/services',  label: 'Services' },
    { href: '/about',     label: 'About' },
    { href: '/contact',   label: 'Contact' },
  ];

  const isActive = (href) => href === '/' ? router.pathname === '/' : router.pathname.startsWith(href);

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled ? 'bg-dark-nav/95 backdrop-blur-xl shadow-lg border-b border-white/10' : 'bg-transparent'
      }`}>
        <div className="page-container">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 flex-shrink-0">
              <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center border border-white/10">
                <FiZap className="text-white text-lg" />
              </div>
              <div className="leading-none">
                <div className="font-orbitron font-black text-sm text-white tracking-wide">Smart  Tech</div>
                <div className="text-[10px] text-gray-400 tracking-[3px] uppercase">Smart Tech, Smart Life</div>
              </div>
            </Link>

            {/* Desktop nav links */}
            <div className="hidden lg:flex items-center gap-1">
              {navLinks.map(l => (
                <Link key={l.href} href={l.href} className={`nav-link px-4 py-2 rounded-2xl transition-all ${
                  isActive(l.href) ? 'text-white bg-white/10' : 'hover:bg-white/5'
                }`}>
                  {l.label}
                </Link>
              ))}
            </div>

            {/* Right actions */}
            <div className="flex items-center gap-2">
              <button onClick={() => setSearchOpen(true)} className="p-2 text-gray-300 hover:text-white transition-colors rounded-2xl hover:bg-white/5">
                <FiSearch className="text-xl" />
              </button>

              {isLoggedIn && (
                <Link href="/profile?tab=wishlist" className="p-2 text-gray-300 hover:text-white transition-colors rounded-2xl hover:bg-white/5">
                  <FiHeart className="text-xl" />
                </Link>
              )}

              <button onClick={() => setIsCartOpen(true)} className="relative p-2 text-gray-300 hover:text-white transition-colors rounded-2xl hover:bg-white/5">
                <FiShoppingCart className="text-xl" />
                {itemCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-white/15 text-white text-[10px] font-black rounded-full flex items-center justify-center">
                    {itemCount > 9 ? '9+' : itemCount}
                  </span>
                )}
              </button>

              {isLoggedIn ? (
                <div ref={userMenuRef} className="relative">
                  <button onClick={() => setUserMenu(!userMenu)}
                    className="flex items-center gap-2 pl-2 pr-3 py-1.5 rounded-2xl bg-dark-card border border-white/10 hover:border-white/20 transition-all text-sm">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center font-bold text-sm text-white">
                      {user?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden sm:block text-gray-300 max-w-[90px] truncate">{user?.name?.split(' ')[0]}</span>
                  </button>
                  {userMenu && (
                    <div className="absolute right-0 mt-2 w-52 card border border-white/10 rounded-[24px] overflow-hidden shadow-card">
                      <div className="px-4 py-3 border-b border-white/10">
                        <p className="font-semibold text-sm truncate">{user?.name}</p>
                        <p className="text-xs text-gray-500 truncate">{user?.email}</p>
                      </div>
                      <div className="py-1">
                        <Link href="/profile" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                          <FiUser className="text-white" /> My Profile
                        </Link>
                        <Link href="/profile?tab=orders" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                          <FiPackage className="text-white" /> My Orders
                        </Link>
                        {isAdmin && (
                          <Link href="/admin" className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                            <FiSettings /> Admin Panel
                          </Link>
                        )}
                        <button onClick={logout} className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-300 hover:bg-white/5 hover:text-white transition-colors">
                          <FiLogOut /> Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <Link href="/auth/login" className="btn-primary px-4 py-2 text-sm hidden sm:inline-flex">
                  Login
                </Link>
              )}

              <button onClick={() => setMobileOpen(!mobileOpen)} className="lg:hidden p-2 text-gray-300 hover:text-white">
                {mobileOpen ? <FiX className="text-xl" /> : <FiMenu className="text-xl" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden bg-dark-nav/98 backdrop-blur-xl border-t border-white/5 px-4 pb-4">
            {navLinks.map(l => (
              <Link key={l.href} href={l.href} className={`block py-3 text-sm font-medium border-b border-white/5 ${
                isActive(l.href) ? 'text-white bg-white/10' : 'text-gray-400'
              }`}>
                {l.label}
              </Link>
            ))}
            {!isLoggedIn && (
              <div className="flex gap-3 mt-4">
                <Link href="/auth/login"  className="btn-outline flex-1 justify-center py-2.5 text-sm">Login</Link>
                <Link href="/auth/signup" className="btn-primary flex-1 justify-center py-2.5 text-sm">Sign Up</Link>
              </div>
            )}
          </div>
        )}
      </nav>

      <CartDrawer />
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  );
}
