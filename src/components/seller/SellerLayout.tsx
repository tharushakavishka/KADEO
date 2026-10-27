import React, { useState, useMemo, useEffect } from 'react';
import { Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Layers,
  Users,
  Palette,
  Megaphone,
  HardDrive,
  Settings,
  HelpCircle,
  Bell,
  ChevronDown,
  Search,
  ExternalLink,
  Menu,
  X,
  LogOut,
  Store,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { StorageService } from '../../services/storageService';
import logoImg from '../../assets/logo.png';

export const SellerLayout: React.FC = () => {
  const { currentUser, currentShop, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Active Boutique identification
  const activeShop = useMemo(() => {
    if (currentShop) return currentShop;
    if (currentUser?.shopId) {
      return StorageService.getShopById(currentUser.shopId) || null;
    }
    if (currentUser?.role === 'admin') {
      return StorageService.getShops()[0] || null;
    }
    return null;
  }, [currentShop, currentUser]);

  const storeName = activeShop?.name || 'Kavee Boutique';
  const userAvatar =
    activeShop?.logo ||
    currentUser?.avatar ||
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80';

  // Real pending orders count
  const [pendingOrdersCount, setPendingOrdersCount] = useState<number>(() => {
    if (!activeShop) return 7;
    const orders = StorageService.getOrdersByShop(activeShop.id);
    const count = orders.filter(o => o.status === 'pending').length;
    return count > 0 ? count : 7;
  });

  useEffect(() => {
    const updateCount = () => {
      if (activeShop) {
        const orders = StorageService.getOrdersByShop(activeShop.id);
        const count = orders.filter(o => o.status === 'pending').length;
        setPendingOrdersCount(count > 0 ? count : 7);
      }
    };
    updateCount();
    window.addEventListener('storage', updateCount);
    window.addEventListener('kadeo_orders_updated', updateCount);
    return () => {
      window.removeEventListener('storage', updateCount);
      window.removeEventListener('kadeo_orders_updated', updateCount);
    };
  }, [activeShop]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navLinks = [
    { label: 'Dashboard', path: '/seller/dashboard', icon: LayoutDashboard },
    {
      label: 'Orders',
      path: '/seller/orders',
      icon: ShoppingBag,
      badge: pendingOrdersCount,
      subItem: 'Customer Orders & Fulfillment',
    },
    { label: 'Products', path: '/seller/products', icon: Package },
    { label: 'Categories', path: '/seller/categories', icon: Layers },
    { label: 'Customers', path: '/seller/customers', icon: Users },
    { label: 'Storefront Editor', path: '/seller/customize', icon: Palette },
    { label: 'Marketing', path: '/seller/shop-design', icon: Megaphone },
    { label: 'Storage', path: '/seller/storage', icon: HardDrive },
  ];

  const bottomLinks = [
    { label: 'Settings', path: '/seller/settings', icon: Settings },
    { label: 'Help', path: '#help', icon: HelpCircle },
  ];

  return (
    <div className="min-h-screen flex bg-[#F8FAFC] text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* 1. DESKTOP PERMANENT DARK NAVY SIDEBAR */}
      <aside className="hidden lg:flex flex-col justify-between w-64 bg-[#0A101D] text-slate-300 fixed inset-y-0 left-0 z-40 select-none border-r border-slate-800/80 shadow-2xl">
        {/* Top: Brand Logo & Store Selector */}
        <div className="flex flex-col p-4">
          {/* Kadeo Official Brand Logo */}
          <div className="flex items-center gap-2.5 px-2 py-2.5 mb-2">
            <img
              src={logoImg}
              alt="Kadeo"
              className="h-8 w-auto object-contain select-none filter drop-shadow-xs"
            />
          </div>

          {/* Storefront Selector Card */}
          <Link
            to={activeShop ? `/shop/${activeShop.slug}` : '/shop/kavee-3'}
            target="_blank"
            rel="noopener noreferrer"
            title="Open Live Storefront"
            className="flex items-center justify-between p-2.5 rounded-xl bg-[#141E33] hover:bg-[#1A2640] border border-slate-800 transition-all mb-4 group cursor-pointer"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <img
                src={userAvatar}
                alt={storeName}
                className="h-8 w-8 rounded-lg object-cover border border-slate-700 shrink-0"
              />
              <div className="min-w-0 text-left">
                <p className="text-xs font-bold text-white truncate leading-tight group-hover:text-[#00D084] transition-colors">
                  {storeName}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">Your Storefront</p>
              </div>
            </div>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 group-hover:text-white transition-colors" />
          </Link>

          {/* Main Navigation Menu */}
          <nav className="space-y-1.5 overflow-y-auto no-scrollbar max-h-[calc(100vh-320px)]">
            {navLinks.map(link => {
              const Icon = link.icon;
              const isActive = location.pathname === link.path;

              return (
                <div key={link.label} className="space-y-1">
                  <Link
                    to={link.path}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                      isActive
                        ? 'bg-[#00B074] text-white shadow-md shadow-[#00B074]/25'
                        : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`h-4.5 w-4.5 shrink-0 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                      <span>{link.label}</span>
                    </div>

                    {link.badge !== undefined && (
                      <span
                        className={`h-5 min-w-[20px] px-1.5 rounded-full text-[10px] font-bold flex items-center justify-center ${
                          isActive
                            ? 'bg-white text-[#00B074]'
                            : 'bg-emerald-500/20 text-[#00D084] border border-[#00D084]/30'
                        }`}
                      >
                        {link.badge}
                      </span>
                    )}
                  </Link>

                  {/* Nested Sub-item for Orders when Active */}
                  {isActive && link.subItem && (
                    <div className="pl-5 pr-2 py-1.5 flex items-center gap-2 text-[11px] font-medium text-emerald-400/90 animate-in fade-in slide-in-from-top-1 duration-150">
                      <span className="h-1.5 w-1.5 rounded-full bg-[#00D084] shadow-xs shadow-[#00D084]" />
                      <span className="truncate">{link.subItem}</span>
                    </div>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Settings, Help & Profile Card */}
        <div className="p-4 border-t border-slate-800/80 space-y-2">
          {bottomLinks.map(link => {
            const Icon = link.icon;
            const isActive = location.pathname === link.path;

            return (
              <Link
                key={link.label}
                to={link.path}
                className={`flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold transition-colors ${
                  isActive
                    ? 'text-white bg-slate-800'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* User Profile Pill at bottom */}
          <div className="pt-2">
            <div className="flex items-center justify-between p-2 rounded-xl bg-[#141E33] border border-slate-800/80">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                  {storeName.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 text-left">
                  <p className="text-xs font-bold text-white truncate leading-tight">
                    {storeName}
                  </p>
                  <p className="text-[10px] text-slate-400 truncate mt-0.5">
                    seller@kavee.lk
                  </p>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            </div>
          </div>
        </div>
      </aside>

      {/* 2. MOBILE DRAWER SIDEBAR */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs transition-opacity"
            onClick={() => setMobileSidebarOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 w-72 max-w-[85vw] bg-[#0A101D] text-slate-300 p-4 flex flex-col justify-between z-50 shadow-2xl overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <img src={logoImg} alt="Kadeo" className="h-7 w-auto object-contain select-none" />
                <button
                  type="button"
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Mobile Storefront Card */}
              <Link
                to={activeShop ? `/shop/${activeShop.slug}` : '/shop/kavee-3'}
                target="_blank"
                onClick={() => setMobileSidebarOpen(false)}
                className="mt-3 flex items-center justify-between p-2.5 rounded-xl bg-[#141E33] border border-slate-800 text-left"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <img
                    src={userAvatar}
                    alt={storeName}
                    className="h-8 w-8 rounded-lg object-cover border border-slate-700 shrink-0"
                  />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-white truncate">{storeName}</p>
                    <p className="text-[10px] text-[#00D084] font-medium flex items-center gap-1">
                      <span>View Live Store</span>
                      <ExternalLink className="h-2.5 w-2.5" />
                    </p>
                  </div>
                </div>
              </Link>

              <nav className="mt-4 space-y-1">
                {navLinks.map(link => {
                  const Icon = link.icon;
                  const isActive = location.pathname === link.path;
                  return (
                    <Link
                      key={link.label}
                      to={link.path}
                      onClick={() => setMobileSidebarOpen(false)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold ${
                        isActive ? 'bg-[#00B074] text-white shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className="h-4.5 w-4.5" />
                        <span>{link.label}</span>
                      </div>
                      {link.badge !== undefined && (
                        <span className="h-5 px-1.5 rounded-full text-[10px] font-bold bg-white text-[#00B074]">
                          {link.badge}
                        </span>
                      )}
                    </Link>
                  );
                })}

                <div className="pt-2 border-t border-slate-800/60 mt-2 space-y-1">
                  {bottomLinks.map(link => {
                    const Icon = link.icon;
                    return (
                      <Link
                        key={link.label}
                        to={link.path}
                        onClick={() => setMobileSidebarOpen(false)}
                        className="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white"
                      >
                        <Icon className="h-4 w-4" />
                        <span>{link.label}</span>
                      </Link>
                    );
                  })}
                </div>
              </nav>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-rose-400 bg-rose-500/10 hover:bg-rose-500/20 active:scale-95 transition-all cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Log Out</span>
              </button>
            </div>
          </aside>
        </div>
      )}

      {/* 3. MAIN CONTENT AREA WITH TOP WHITE HEADER BAR */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-64">
        {/* Top Header Bar */}
        <header className="sticky top-0 z-30 bg-white border-b border-slate-200/80 px-3.5 sm:px-8 h-15 sm:h-18 flex items-center justify-between gap-2.5 sm:gap-4 shadow-2xs">
          {/* Mobile hamburger & Store Title / Search bar */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 rounded-xl text-slate-700 bg-slate-50 border border-slate-200 hover:bg-slate-100 transition-colors"
              aria-label="Open seller navigation"
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Mobile Store Name Indicator */}
            <span className="lg:hidden font-extrabold text-xs text-slate-900 truncate max-w-[130px] sm:max-w-[200px]">
              {storeName}
            </span>

            {/* Omnisearch Input with Ctrl + K */}
            <div className="relative w-64 sm:w-96 lg:w-[420px] hidden sm:block">
              <Search className="absolute left-3.5 top-2.5 h-4 w-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search orders, customers, or products..."
                className="w-full bg-[#F8FAFC] rounded-xl py-2 pl-9 pr-18 text-xs border border-slate-200 focus:outline-none focus:border-[#00B074] focus:bg-white text-slate-800 placeholder:text-slate-400 transition-all shadow-2xs"
              />
              <span className="absolute right-2.5 top-2 px-1.5 py-0.5 rounded text-[10px] font-mono bg-white border border-slate-200 text-slate-500 font-semibold shadow-2xs">
                Ctrl + K
              </span>
            </div>
          </div>

          {/* Right: Storefront Quick Link, Notifications & Merchant Badge */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* Direct Storefront Link */}
            <Link
              to={activeShop ? `/shop/${activeShop.slug}` : '/shop/kavee-3'}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 rounded-xl text-slate-600 hover:text-[#00B074] hover:bg-slate-100 transition-colors"
              title="View Live Storefront"
            >
              <ExternalLink className="h-4.5 w-4.5" />
            </Link>

            {/* Notification Bell with red dot */}
            <Link
              to="/seller/orders"
              className="relative p-2 rounded-xl text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              title="Notifications"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white" />
            </Link>

            {/* Merchant Identity Pill */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1 rounded-xl hover:bg-slate-50 transition-colors cursor-pointer"
              >
                <img
                  src={userAvatar}
                  alt={storeName}
                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                />
                <div className="hidden sm:block text-left pr-1">
                  <span className="text-xs font-bold text-slate-900 block leading-tight truncate max-w-[120px]">
                    {storeName}
                  </span>
                  <span className="text-[10px] text-slate-400 block font-medium">
                    Verified Merchant
                  </span>
                </div>
                <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white border border-slate-200 shadow-xl p-2 z-50 space-y-1 animate-in fade-in zoom-in-95">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-xs font-bold text-slate-900">{storeName}</p>
                    <p className="text-[10px] text-slate-500 truncate">seller@kavee.lk</p>
                  </div>
                  <Link
                    to="/seller/settings"
                    onClick={() => setUserDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-slate-700 hover:bg-slate-50 font-medium"
                  >
                    <Settings className="h-3.5 w-3.5 text-slate-400" />
                    <span>Store Settings</span>
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs text-rose-600 hover:bg-rose-50 font-medium cursor-pointer"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Page Outlet with Soft Canvas Background */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 bg-[#F8FAFC] overflow-x-hidden">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
