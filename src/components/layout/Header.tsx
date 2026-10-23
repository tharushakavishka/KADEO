import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  ShoppingBag,
  Search,
  Menu,
  ArrowRight,
  Store,
  Sparkles,
} from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { KadeoLogo } from '../common/KadeoLogo';
import { MobileDrawer } from './MobileDrawer';

export const Header: React.FC = () => {
  const { totalItems, setIsCartOpen } = useCart();
  const { currentUser } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const location = useLocation();
  const navigate = useNavigate();

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/?q=${encodeURIComponent(searchQuery.trim())}`);
      const el = document.getElementById('featured-products');
      if (el) el.scrollIntoView({ behavior: 'smooth' });
      setMobileSearchOpen(false);
    }
  };

  const navLinks = [
    { name: 'Benefits', path: '/#benefits' },
    { name: 'How It Works', path: '/#how-it-works' },
    { name: 'Features', path: '/#features' },
    { name: 'Pricing', path: '/#pricing' },
    { name: 'FAQ', path: '/#faq' },
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
      <header className="sticky top-0 z-40 w-full bg-white/85 backdrop-blur-xl border-b border-neutral-200/70 shadow-[0_2px_12px_-4px_rgba(0,0,0,0.04)] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-[72px] flex items-center justify-between gap-3 sm:gap-6">
          {/* Left: Kadeo Logo */}
          <Link
            to="/"
            className="flex items-center gap-2 group shrink-0 transition-opacity hover:opacity-90 py-1"
          >
            <KadeoLogo size="md" showSubtitle={false} />
          </Link>

          {/* Center: Desktop Navigation Pills */}
          <nav className="hidden lg:flex items-center gap-1.5 p-1 rounded-full bg-neutral-100/60 border border-neutral-200/50">
            {navLinks.map(link => (
              <Link
                key={link.name}
                to={link.path}
                onClick={e => handleNavClick(e, link.path)}
                className="px-3.5 py-1.5 text-[13px] font-semibold text-neutral-600 hover:text-neutral-900 rounded-full hover:bg-white hover:shadow-2xs transition-all duration-180"
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* Right Actions: Search, Portal CTA, Cart & Mobile Menu */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Desktop Modern Rounded Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="relative hidden md:flex items-center w-52 lg:w-64"
            >
              <div className="relative w-full">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Search products, brands..."
                  className="w-full bg-neutral-100/70 hover:bg-neutral-100/90 focus:bg-white rounded-full h-9 pl-9 pr-9 text-xs border border-neutral-200/70 focus:border-[#10B981] focus:ring-2 focus:ring-[#10B981]/15 focus:outline-none transition-all text-neutral-900 placeholder:text-neutral-400 font-medium"
                />
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-400 pointer-events-none" />
                <kbd className="hidden lg:inline-flex absolute right-2.5 top-2 items-center justify-center h-5 px-1.5 text-[10px] font-semibold text-neutral-400 bg-neutral-200/60 rounded border border-neutral-300/40 select-none pointer-events-none">
                  /
                </kbd>
              </div>
            </form>

            {/* Mobile Search Toggle Icon */}
            <button
              type="button"
              onClick={() => setMobileSearchOpen(!mobileSearchOpen)}
              aria-label="Search"
              className="md:hidden p-2 text-neutral-600 hover:text-neutral-900 transition-colors rounded-full hover:bg-neutral-100/80 cursor-pointer"
            >
              <Search className="h-5 w-5" />
            </button>

            {/* Seller Portal Quick Actions */}
            {currentUser ? (
              <Link
                to="/seller/dashboard"
                className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold transition-all shadow-2xs hover:shadow-xs active:scale-95"
              >
                <Store className="h-3.5 w-3.5 text-emerald-400" />
                <span>Dashboard</span>
              </Link>
            ) : (
              <div className="hidden sm:flex items-center gap-2">
                <Link
                  to="/seller/login"
                  className="px-3.5 py-1.5 text-xs font-semibold text-neutral-700 hover:text-neutral-950 rounded-full hover:bg-neutral-100/80 transition-colors"
                >
                  Seller Login
                </Link>
                <Link
                  to="/seller/register"
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#10B981] hover:bg-[#059669] text-white text-xs font-bold transition-all shadow-[0_2px_8px_rgba(16,185,129,0.22)] hover:shadow-[0_4px_14px_rgba(16,185,129,0.32)] active:scale-95 group cursor-pointer"
                >
                  <span>Open Free Shop</span>
                  <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-0.5 transition-transform" />
                </Link>
              </div>
            )}

            {/* Shopping Bag / Cart Button */}
            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              aria-label={`Open shopping cart with ${totalItems} items`}
              className="relative p-2.5 text-neutral-700 hover:text-neutral-950 transition-colors rounded-full hover:bg-neutral-100/80 cursor-pointer"
            >
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute top-1 right-0.5 inline-flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#10B981] px-1 text-[9px] font-extrabold text-white shadow-2xs ring-2 ring-white">
                  {totalItems > 99 ? '99+' : totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button -> Triggers Dark Aesthetic Drawer */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 text-neutral-700 hover:text-neutral-950 transition-colors rounded-full hover:bg-neutral-100/80 cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Search Input */}
        {mobileSearchOpen && (
          <div className="md:hidden border-t border-neutral-200/60 bg-white/95 backdrop-blur-md px-4 py-3 anim-fade-in shadow-xs">
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                autoFocus
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search products, brands, categories..."
                className="w-full bg-neutral-100 rounded-full h-10 pl-9 pr-10 text-xs border border-neutral-200/80 focus:border-[#10B981] focus:bg-white focus:outline-none transition-all text-neutral-900 font-medium"
              />
              <Search className="absolute left-3 top-3 h-4 w-4 text-neutral-400 pointer-events-none" />
              <button
                type="submit"
                className="absolute right-3 top-2.5 text-xs font-bold text-[#10B981] hover:text-[#059669] cursor-pointer"
              >
                Go
              </button>
            </form>
          </div>
        )}
      </header>

      {/* Screen 8: Dark Side Menu Drawer */}
      <MobileDrawer
        isOpen={mobileMenuOpen}
        onClose={() => setMobileMenuOpen(false)}
      />
    </>
  );
};
