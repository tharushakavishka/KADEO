import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  X,
  Home,
  ShoppingBag,
  Grid,
  Package,
  Heart,
  User,
  HelpCircle,
  Settings,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ArrowRight,
  Store,
  LogIn,
} from 'lucide-react';
import { KadeoLogo } from '../common/KadeoLogo';
import { StorageService } from '../../services/storageService';
import { useAuth } from '../../context/AuthContext';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState(() => StorageService.getCategories());
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const handleUpdate = () => setCategories(StorageService.getCategories());
    window.addEventListener('storage', handleUpdate);
    window.addEventListener('kadeo_categories_updated', handleUpdate);
    return () => {
      window.removeEventListener('storage', handleUpdate);
      window.removeEventListener('kadeo_categories_updated', handleUpdate);
    };
  }, []);

  if (!isOpen) return null;

  const handleNav = (path: string) => {
    onClose();
    navigate(path);
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden lg:hidden"
      role="dialog"
      aria-modal="true"
    >
      {/* Dark backdrop */}
      <div
        className="fixed inset-0 bg-black/75 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Drawer content: Modern dark drawer with clean layout */}
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-[300px] sm:w-[340px] bg-[#0C1017] text-white flex flex-col justify-between p-5 sm:p-6 shadow-2xl border-r border-white/10 overflow-y-auto">
          {/* Top: Logo & Close Button */}
          <div>
            <div className="flex items-center justify-between pb-5 border-b border-white/10">
              <KadeoLogo theme="dark" showSubtitle={false} size="sm" />
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Quick Seller Actions at the Top for Mobile Users */}
            {!currentUser && (
              <div className="mt-4 p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-2">
                <div className="flex items-center gap-1.5 text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
                  <Sparkles className="h-3 w-3" />
                  <span>Seller Portal</span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    onClick={() => handleNav('/seller/register')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-[#00B074] hover:bg-[#009E67] text-white text-xs font-bold shadow-xs active:scale-95 transition-all text-center"
                  >
                    <Store className="h-3.5 w-3.5" />
                    <span>Create Shop</span>
                  </button>
                  <button
                    onClick={() => handleNav('/seller/login')}
                    className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/15 active:scale-95 transition-all text-center"
                  >
                    <LogIn className="h-3.5 w-3.5" />
                    <span>Log In</span>
                  </button>
                </div>
              </div>
            )}

            {/* Customer Navigation list */}
            <nav className="mt-4 space-y-1">
              <button
                onClick={() => handleNav('/')}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-neutral-200 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <Home className="h-4.5 w-4.5 text-neutral-400" />
                <span>Home</span>
              </button>

              <button
                onClick={() => handleNav('/search')}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-neutral-200 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <ShoppingBag className="h-4.5 w-4.5 text-neutral-400" />
                <span>Shop Marketplace</span>
              </button>

              {/* Collapsible Categories */}
              <div>
                <button
                  type="button"
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-neutral-200 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <Grid className="h-4.5 w-4.5 text-neutral-400" />
                    <span>Categories</span>
                  </div>
                  {categoriesOpen ? (
                    <ChevronUp className="h-4 w-4 text-neutral-400" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-neutral-400" />
                  )}
                </button>

                {categoriesOpen && (
                  <div className="pl-11 pr-2 py-1.5 space-y-1">
                    {categories.map(cat => (
                      <button
                        key={cat.slug}
                        onClick={() => handleNav(`/search?category=${cat.slug}`)}
                        className="w-full text-left py-1.5 text-xs text-neutral-400 hover:text-[#00B074] transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNav('/track-order')}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-neutral-200 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <Package className="h-4.5 w-4.5 text-neutral-400" />
                <span>Track Orders</span>
              </button>

              <button
                onClick={() => handleNav('/account')}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-neutral-200 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <User className="h-4.5 w-4.5 text-neutral-400" />
                <span>{currentUser ? 'My Account' : 'Buyer Profile'}</span>
              </button>

              <button
                onClick={() => handleNav('/#about')}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-xs sm:text-sm font-semibold text-neutral-200 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <HelpCircle className="h-4.5 w-4.5 text-neutral-400" />
                <span>About & Help</span>
              </button>
            </nav>
          </div>

          {/* Bottom Card: Sell on Kadeo */}
          <div className="mt-6 space-y-4">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-950/70 to-neutral-900 border border-emerald-500/25 p-4 space-y-2.5">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold tracking-wide">0% Commission Forever</span>
              </div>
              <p className="text-[11px] text-neutral-300 leading-relaxed">
                Launch your own branded e-commerce shop with direct WhatsApp order checkout.
              </p>
              <Link
                to="/seller/register"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#00B074] hover:bg-[#009E67] text-white py-2.5 px-3.5 text-xs font-bold transition-all shadow-md active:scale-98"
              >
                <span>Launch Your Store Free</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Version & Info */}
            <div className="flex items-center justify-between text-neutral-500 text-[11px] pt-2 border-t border-white/10">
              <span>Sri Lankan Artisan Network</span>
              <span className="font-mono">v1.2</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
