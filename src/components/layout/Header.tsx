import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  ShoppingBag,
  Menu,
  Heart,
  ArrowRight,
  LogIn,
  Store,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { KadeoLogo } from '../common/KadeoLogo';
import { MobileDrawer } from './MobileDrawer';

export const Header: React.FC = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Shop', path: '/shop/ceylon-linen' },
    { name: 'Categories', path: '/categories' },
    { name: 'About', path: '/#about' },
    { name: 'Contact', path: '/#contact' },
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (path.startsWith('/#')) {
      const sectionId = path.substring(2);
      if (location.pathname === '/') {
        e.preventDefault();
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#E5E7EB] transition-all">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-2 sm:gap-4">
          {/* Left: Kadeo Logo (Single clean responsive logo) */}
          <Link
            to="/"
            className="flex items-center gap-2 group shrink-0 transition-opacity hover:opacity-90 py-1"
          >
            <KadeoLogo size="md" showSubtitle={false} />
          </Link>

          {/* Center: Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6 lg:gap-8">
            {navLinks.map(link => {
              const isHome = link.path === '/' && location.pathname === '/';
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  onClick={e => handleNavClick(e, link.path)}
                  className={`text-[13px] font-semibold transition-all relative py-1.5 ${
                    isHome
                      ? 'text-[#00B074] font-bold after:content-[""] after:absolute after:bottom-0 after:left-1/2 after:-translate-x-1/2 after:w-6 after:h-[2.5px] after:bg-[#00B074] after:rounded-full'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Right Actions: Log In & Create Shop Buttons + Wishlist + Cart + Mobile Menu */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {currentUser ? (
              <Link
                to={currentUser.role === 'seller' ? '/seller/dashboard' : '/account'}
                className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full bg-[#00B074] hover:bg-[#009E67] text-white text-xs sm:text-sm font-bold shadow-xs transition-all active:scale-95"
              >
                <span>Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2.5">
                {/* Log in Button */}
                <Link
                  to="/seller/login"
                  className="inline-flex items-center gap-1 px-2.5 sm:px-4 py-1.5 sm:py-2 rounded-full text-[11px] sm:text-xs md:text-sm font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100/80 border border-slate-200/80 transition-all cursor-pointer active:scale-95 shrink-0"
                >
                  <LogIn className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-slate-500" />
                  <span>Log in</span>
                </Link>

                {/* Create Shop Button */}
                <Link
                  to="/seller/register"
                  className="inline-flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-4 md:px-5 py-1.5 sm:py-2 rounded-full bg-[#00B074] hover:bg-[#009E67] text-white text-[11px] sm:text-xs md:text-sm font-bold shadow-sm shadow-[#00B074]/25 hover:shadow-md hover:shadow-[#00B074]/30 transition-all active:scale-95 cursor-pointer shrink-0"
                >
                  <Store className="h-3 w-3 sm:h-3.5 sm:w-3.5 hidden xs:inline" />
                  <span>Create Shop</span>
                  <ArrowRight className="h-3 w-3 sm:h-3.5 sm:w-3.5 hidden sm:inline" />
                </Link>
              </div>
            )}

            {/* Wishlist Heart Icon (hidden on small mobile to save header space) */}
            <Link
              to="/account"
              title="Wishlist"
              className="p-2 text-slate-700 hover:text-slate-950 transition-colors rounded-full hover:bg-slate-100 cursor-pointer hidden md:inline-flex"
            >
              <Heart className="h-5 w-5 stroke-[1.8]" />
            </Link>

            {/* Shopping Bag / Cart Button with green badge */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open shopping cart with ${totalItems} items`}
              className="relative p-2 text-slate-700 hover:text-slate-950 transition-colors rounded-full hover:bg-slate-100 cursor-pointer shrink-0"
            >
              <ShoppingBag className="h-5 w-5 stroke-[1.8]" />
              <span className="absolute top-1 right-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#00B074] px-1 text-[9px] font-extrabold text-white shadow-2xs ring-2 ring-white">
                {totalItems > 0 ? (totalItems > 99 ? '99+' : totalItems) : 3}
              </span>
            </button>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 text-slate-700 hover:text-slate-950 transition-colors rounded-full hover:bg-slate-100 cursor-pointer shrink-0"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Drawer */}
      <MobileDrawer isOpen={mobileMenuOpen} onClose={() => setMobileMenuOpen(false)} />
    </>
  );
};
