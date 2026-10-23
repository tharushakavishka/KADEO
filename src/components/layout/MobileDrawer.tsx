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
} from 'lucide-react';
import { KadeoLogo } from '../common/KadeoLogo';
import { StorageService } from '../../services/storageService';

interface MobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileDrawer: React.FC<MobileDrawerProps> = ({ isOpen, onClose }) => {
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [categories, setCategories] = useState(() => StorageService.getCategories());
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

      {/* Drawer content matching Screen 8: Dark theme side menu */}
      <div className="fixed inset-y-0 left-0 max-w-full flex">
        <div className="w-[320px] sm:w-[350px] bg-[#0C1017] text-white flex flex-col justify-between p-6 shadow-2xl border-r border-white/10 overflow-y-auto">
          {/* Top: Logo & Close Button */}
          <div>
            <div className="flex items-center justify-between pb-6 border-b border-white/10">
              <KadeoLogo theme="dark" showSubtitle={true} size="md" />
              <button
                type="button"
                onClick={onClose}
                className="p-2 rounded-full text-neutral-400 hover:text-white hover:bg-white/10 transition-colors"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Nav list */}
            <nav className="mt-6 space-y-1">
              <button
                onClick={() => handleNav('/')}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <Home className="h-5 w-5 text-neutral-400" />
                <span>Home</span>
              </button>

              <button
                onClick={() => handleNav('/search')}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <ShoppingBag className="h-5 w-5 text-neutral-400" />
                <span>Shop</span>
              </button>

              {/* Collapsible Categories */}
              <div>
                <button
                  type="button"
                  onClick={() => setCategoriesOpen(!categoriesOpen)}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:text-white hover:bg-white/5 transition-colors text-left"
                >
                  <div className="flex items-center gap-3.5">
                    <Grid className="h-5 w-5 text-neutral-400" />
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
                        className="w-full text-left py-1.5 text-xs text-neutral-400 hover:text-[#10B981] transition-colors"
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <button
                onClick={() => handleNav('/track-order')}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <Package className="h-5 w-5 text-neutral-400" />
                <span>My Orders</span>
              </button>

              <button
                onClick={() => handleNav('/search?tab=wishlist')}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <Heart className="h-5 w-5 text-neutral-400" />
                <span>Wishlist</span>
              </button>

              <button
                onClick={() => handleNav('/account')}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <User className="h-5 w-5 text-neutral-400" />
                <span>Account</span>
              </button>

              <button
                onClick={() => handleNav('/search?tab=about')}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <HelpCircle className="h-5 w-5 text-neutral-400" />
                <span>Help & Support</span>
              </button>

              <button
                onClick={() => handleNav('/seller/settings')}
                className="w-full flex items-center gap-3.5 px-3 py-2.5 rounded-xl text-sm font-semibold text-neutral-200 hover:text-white hover:bg-white/5 transition-colors text-left"
              >
                <Settings className="h-5 w-5 text-neutral-400" />
                <span>Settings</span>
              </button>
            </nav>
          </div>

          {/* Bottom Card: Grow Your Business - Become a Seller */}
          <div className="mt-8 space-y-5">
            <div className="rounded-2xl bg-gradient-to-br from-emerald-950/70 to-neutral-900 border border-emerald-500/25 p-4 space-y-3">
              <div className="flex items-center gap-2 text-emerald-400">
                <Sparkles className="h-4 w-4" />
                <span className="text-xs font-bold tracking-wide">Grow Your Business</span>
              </div>
              <p className="text-xs text-neutral-300 leading-relaxed">
                Start your own online store with Kadeo. Reach customers island-wide with zero setup hassle.
              </p>
              <Link
                to="/seller/register"
                onClick={onClose}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#10B981] hover:bg-[#059669] text-white py-2.5 px-4 text-xs font-bold transition-all shadow-md active:scale-98"
              >
                <span>Become a Seller</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            {/* Social Icons & Version */}
            <div className="flex items-center justify-between text-neutral-400 text-xs pt-3 border-t border-white/10">
              <div className="flex items-center gap-3">
                <span className="hover:text-white cursor-pointer font-bold text-xs">FB</span>
                <span className="hover:text-white cursor-pointer font-bold text-xs">IG</span>
                <span className="hover:text-white cursor-pointer font-bold text-xs">TT</span>
                <span className="hover:text-white cursor-pointer font-bold text-xs">YT</span>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono">v1.0.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
