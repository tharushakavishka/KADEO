import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Sparkles,
  Search,
  User,
  ShoppingBag,
  Menu,
  X,
  MessageCircle,
  Truck,
  Heart,
  Store,
  ArrowLeft,
} from 'lucide-react';
import { Shop, Category } from '../../types';
import { useCart } from '../../context/CartContext';
import { StorageService } from '../../services/storageService';

interface StorefrontNavbarProps {
  shop: Shop;
  searchQuery?: string;
  onSearchChange?: (val: string) => void;
  categories?: Category[];
}

export const StorefrontNavbar: React.FC<StorefrontNavbarProps> = ({
  shop,
  searchQuery: externalSearchQuery,
  onSearchChange: externalOnSearchChange,
  categories = [],
}) => {
  const { totalItems, setIsCartOpen } = useCart();
  const navigate = useNavigate();
  const location = useLocation();

  const [localSearch, setLocalSearch] = useState('');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isControlledSearch = externalOnSearchChange !== undefined;
  const currentSearchValue = isControlledSearch ? (externalSearchQuery || '') : localSearch;

  const handleSearchChange = (val: string) => {
    if (isControlledSearch) {
      externalOnSearchChange?.(val);
    } else {
      setLocalSearch(val);
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = currentSearchValue.trim();
    if (query) {
      navigate(`/shop/${shop.slug}?q=${encodeURIComponent(query)}#products`);
      setMobileMenuOpen(false);
    }
  };

  const isStorefrontHome = location.pathname === `/shop/${shop.slug}`;

  // WhatsApp concierge link
  const cleanPhone = StorageService.formatWhatsAppNumber(shop.whatsappNumber || '94771234567');
  const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(
    `Hello ${shop.name}! 👋 I am browsing your online store and would like to inquire about products and orders.`
  )}`;

  return (
    <header className="sticky top-0 z-40 bg-[#111827] text-white shadow-md border-b border-white/5 transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
        {/* Brand Logo & Name */}
        <Link
          to={`/shop/${shop.slug}`}
          className="flex items-center gap-3 shrink-0 group py-1"
        >
          {shop.logo ? (
            <img
              src={shop.logo}
              alt={shop.name}
              className="h-10 w-10 rounded-xl object-cover border border-white/10 group-hover:scale-105 transition-transform"
            />
          ) : (
            <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center text-[#10B981] group-hover:bg-[#10B981] group-hover:text-white transition-all">
              <Sparkles className="h-5 w-5" />
            </div>
          )}
          <div>
            <span className="text-lg sm:text-xl font-bold tracking-tight text-white block leading-tight group-hover:text-neutral-100">
              {shop.name}
            </span>
            <span className="text-[10px] tracking-widest uppercase text-neutral-400 font-semibold block">
              {shop.themeId === 'beauty' ? 'BEAUTY & SALON' : 'BOUTIQUE ATELIER'}
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-semibold">
          <Link
            to={`/shop/${shop.slug}`}
            className={`transition-colors py-1 ${
              isStorefrontHome
                ? 'text-white border-b-2 border-[#10B981]'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            Home
          </Link>
          <a
            href={isStorefrontHome ? '#products' : `/shop/${shop.slug}#products`}
            className="text-neutral-300 hover:text-white transition-colors py-1"
          >
            Shop
          </a>
          {categories.length > 0 && (
            <a
              href={isStorefrontHome ? '#categories' : `/shop/${shop.slug}#categories`}
              className="text-neutral-300 hover:text-white transition-colors py-1"
            >
              Categories
            </a>
          )}
          <a
            href={isStorefrontHome ? '#about' : `/shop/${shop.slug}#about`}
            className="text-neutral-300 hover:text-white transition-colors py-1"
          >
            About
          </a>
          <a
            href={isStorefrontHome ? '#contact' : `/shop/${shop.slug}#contact`}
            className="text-neutral-300 hover:text-white transition-colors py-1"
          >
            Contact
          </a>
          <Link
            to={`/track-order?shop=${shop.slug}`}
            className={`transition-colors py-1 inline-flex items-center gap-1.5 ${
              location.pathname === '/track-order'
                ? 'text-[#10B981] font-bold'
                : 'text-neutral-300 hover:text-white'
            }`}
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Track Order</span>
          </Link>
        </nav>

        {/* Right Action Icons & Search */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Desktop Search Input */}
          <form onSubmit={handleSearchSubmit} className="relative hidden sm:block w-44 lg:w-60">
            <input
              type="text"
              value={currentSearchValue}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full bg-white text-neutral-900 text-xs px-4 py-2 pr-9 placeholder:text-neutral-400 focus:outline-none focus:ring-2 focus:ring-[#10B981] shadow-xs transition-all font-medium"
            />
            <button
              type="submit"
              className="absolute right-2.5 top-2.5 text-neutral-400 hover:text-neutral-700"
              title="Search"
            >
              <Search className="h-4 w-4" />
            </button>
          </form>

          {/* WhatsApp Direct Help */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            title="Chat on WhatsApp"
            className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-[#10B981] text-xs font-bold transition-all border border-emerald-500/20"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            <span>Concierge</span>
          </a>

          {/* Seller Portal Link */}
          <Link
            to="/seller/login"
            title="Seller Portal"
            className="p-2 text-neutral-300 hover:text-white transition-colors"
          >
            <User className="h-5 w-5" />
          </Link>

          {/* Cart Bag Icon with Live Badge Counter */}
          <button
            type="button"
            onClick={() => setIsCartOpen(true)}
            className="relative p-2 text-white hover:text-[#10B981] transition-colors cursor-pointer"
            title="View Cart"
          >
            <ShoppingBag className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -top-0.5 -right-0.5 h-4 w-4 rounded-full bg-[#10B981] text-white text-[10px] font-bold flex items-center justify-center shadow-xs anim-fade-in">
                {totalItems}
              </span>
            )}
          </button>

          {/* Return to Marketplace pill link */}
          <Link
            to="/"
            title="Browse Kadeo Marketplace"
            className="hidden xl:inline-flex items-center gap-1 text-[11px] font-semibold text-neutral-400 hover:text-white px-2.5 py-1 rounded-lg border border-neutral-700/60 hover:border-neutral-500 transition-colors"
          >
            <Store className="w-3 h-3 text-[#10B981]" />
            <span>Marketplace</span>
          </Link>

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-300 hover:text-white cursor-pointer"
            aria-label="Toggle mobile menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#161F30] border-t border-neutral-800 px-4 py-4 space-y-3.5 anim-slide-bottom">
          <form onSubmit={handleSearchSubmit} className="relative mb-2">
            <input
              type="text"
              value={currentSearchValue}
              onChange={e => handleSearchChange(e.target.value)}
              placeholder="Search products..."
              className="w-full rounded-full bg-white text-neutral-900 text-xs px-4 py-2 pr-9 font-medium"
            />
            <button type="submit" className="absolute right-3 top-2.5 text-neutral-500">
              <Search className="h-4 w-4" />
            </button>
          </form>

          <Link
            to={`/shop/${shop.slug}`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-white py-1.5 hover:text-[#10B981]"
          >
            Home
          </Link>
          <a
            href={`/shop/${shop.slug}#products`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-neutral-300 hover:text-white py-1.5"
          >
            Shop Collection
          </a>
          <a
            href={`/shop/${shop.slug}#about`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-neutral-300 hover:text-white py-1.5"
          >
            About Boutique
          </a>
          <a
            href={`/shop/${shop.slug}#contact`}
            onClick={() => setMobileMenuOpen(false)}
            className="block text-sm font-semibold text-neutral-300 hover:text-white py-1.5"
          >
            Contact & Location
          </a>
          <Link
            to={`/track-order?shop=${shop.slug}`}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 text-sm font-semibold text-[#10B981] py-1.5"
          >
            <Truck className="w-4 h-4" />
            <span>Track Order</span>
          </Link>

          <div className="pt-3 border-t border-neutral-800 flex items-center justify-between text-xs text-neutral-400">
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 font-bold text-emerald-400 hover:underline"
            >
              <MessageCircle className="w-4 h-4" />
              <span>WhatsApp Store</span>
            </a>
            <Link
              to="/"
              onClick={() => setMobileMenuOpen(false)}
              className="text-neutral-400 hover:text-white flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Marketplace</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};
